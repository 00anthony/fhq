// src/pages/api/calendar/cleanup.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import { PrismaClient } from '@prisma/client'
import auth from '@/lib/google-auth'
import { servicesData } from '@/data/services'
import { DateTime } from 'luxon'

const prisma = new PrismaClient()

interface CleanupResult {
  bookingId: string
  service: string
  duration: number
  appointmentTime: string
  success: boolean
  error?: string
}

/**
 * Deletes a Google Calendar event and updates the booking record
 */
async function deleteCalendarEvent(
  eventId: string, 
  calendarId: string, 
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const calendar = google.calendar({ version: 'v3', auth })
    
    // Delete the event from Google Calendar
    await calendar.events.delete({
      calendarId,
      eventId,
    })

    // Update the booking record to mark event as deleted
    await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        eventDeleted: true,
        deletedAt: new Date()
      }
    })

    console.log(`✅ Successfully deleted calendar event ${eventId} for booking ${bookingId}`)
    return { success: true }
  } catch (error) {
    console.error(`❌ Failed to delete calendar event ${eventId}:`, error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Main cleanup function with service-specific buffer times
 */
async function performCleanup(): Promise<CleanupResult[]> {
  const now = DateTime.now().toUTC()
  
  // Find bookings that are completed but events not yet deleted
  const completedBookings = await prisma.booking.findMany({
    where: {
      eventDeleted: false, // Event hasn't been deleted yet
      datetime: {
        lt: now.toJSDate() // Only get past appointments
      }
    },
    orderBy: {
      datetime: 'asc' // Process oldest first
    }
  })

  console.log(`🧹 Found ${completedBookings.length} past appointments to check for cleanup`)

  const results: CleanupResult[] = []
  
  for (const booking of completedBookings) {
    if (!booking.eventId || !booking.calendarId) {
      console.log(`⚠️ Skipping booking ${booking.id} - missing eventId or calendarId`)
      continue
    }

    // Get service duration (use stored duration first, then fallback to services data)
    let serviceDuration = booking.serviceDuration
    if (!serviceDuration) {
      const serviceData = servicesData.find(s => s.name === booking.service)
      serviceDuration = serviceData?.duration || 30
    }
    
    // Calculate when appointment actually ended + buffer time
    const appointmentStart = DateTime.fromJSDate(booking.datetime, { zone: 'utc' })
    const appointmentEnd = appointmentStart.plus({ minutes: serviceDuration })
    const cleanupTime = appointmentEnd.plus({ minutes: 15 }) // 15min buffer after service ends
    
    const result: CleanupResult = {
      bookingId: booking.id,
      service: booking.service,
      duration: serviceDuration,
      appointmentTime: appointmentStart.toISO() || '',
      success: false
    }
    
    // Check if it's time to clean up this appointment
    if (now >= cleanupTime) {
      console.log(`🗑️ Cleaning up ${booking.service} appointment (${serviceDuration}min) from ${appointmentStart.toLocaleString()}`)
      
      const deleteResult = await deleteCalendarEvent(
        booking.eventId, 
        booking.calendarId, 
        booking.id
      )
      
      result.success = deleteResult.success
      if (!deleteResult.success) {
        result.error = deleteResult.error
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))
    } else {
      // Not yet time to clean up
      const minutesRemaining = cleanupTime.diff(now, 'minutes').minutes
      console.log(`⏳ Appointment ${booking.id} needs ${Math.ceil(minutesRemaining)} more minutes before cleanup`)
      continue // Don't add to results if we didn't attempt cleanup
    }
    
    results.push(result)
  }

  return results
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Authentication check
  const authHeader = req.headers.authorization
  const cronSecret = req.headers['x-vercel-cron-signature'] // Vercel cron signature
  const apiKey = process.env.CLEANUP_API_KEY

  // Allow requests from Vercel cron or with valid API key
  if (!cronSecret && (!authHeader || authHeader !== `Bearer ${apiKey}`)) {
    console.log('❌ Unauthorized cleanup attempt')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  console.log('🚀 Starting calendar cleanup process...')
  const startTime = Date.now()

  try {
    const results = await performCleanup()
    const endTime = Date.now()
    const duration = endTime - startTime

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    console.log(`✅ Cleanup completed in ${duration}ms`)
    console.log(`📊 Results: ${successCount} successful, ${errorCount} errors`)

    return res.status(200).json({
      success: true,
      summary: {
        total: results.length,
        successful: successCount,
        errors: errorCount,
        duration: `${duration}ms`
      },
      results: results.map(r => ({
        bookingId: r.bookingId,
        service: r.service,
        success: r.success,
        error: r.error
      }))
    })
  } catch (error) {
    console.error('❌ Cleanup process failed:', error)
    return res.status(500).json({ 
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await prisma.$disconnect()
  }
}