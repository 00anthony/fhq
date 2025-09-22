// src/lib/calendar-cleanup.ts
import { google } from 'googleapis'
import { PrismaClient } from '@prisma/client'
import auth from '@/lib/google-auth'
import { DateTime } from 'luxon'

const prisma = new PrismaClient()

interface CleanupConfig {
  bufferMinutes: number // How long after appointment end to wait before deletion
}

const defaultConfig: CleanupConfig = {
  bufferMinutes: 15 // Default 15 minutes after appointment ends
}

/**
 * Deletes a Google Calendar event and updates the booking record
 */
export async function deleteCalendarEvent(
  eventId: string, 
  calendarId: string, 
  bookingId: string
): Promise<boolean> {
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
        eventDeleted: true, // You'll need to add this field to your Booking model
        deletedAt: new Date()
      }
    })

    console.log(`✅ Successfully deleted calendar event ${eventId} for booking ${bookingId}`)
    return true
  } catch (error) {
    console.error(`❌ Failed to delete calendar event ${eventId}:`, error)
    return false
  }
}

/**
 * Finds and deletes completed appointments
 */
export async function cleanupCompletedAppointments(config: CleanupConfig = defaultConfig) {
  try {
    const now = DateTime.now().toUTC()
    
    // Find bookings that are completed but events not yet deleted
    const completedBookings = await prisma.booking.findMany({
      where: {
        eventDeleted: { not: true }, // Event hasn't been deleted yet
        datetime: {
          lt: now.minus({ minutes: config.bufferMinutes }).toJSDate() // Appointment ended + buffer time ago
        }
      }
    })

    console.log(`🧹 Found ${completedBookings.length} completed appointments to clean up`)

    const results = []
    for (const booking of completedBookings) {
      if (!booking.eventId || !booking.calendarId) {
        console.log(`⚠️ Skipping booking ${booking.id} - missing eventId or calendarId`)
        continue
      }

      const success = await deleteCalendarEvent(
        booking.eventId, 
        booking.calendarId, 
        booking.id
      )
      
      results.push({ bookingId: booking.id, success })
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return results
  } catch (error) {
    console.error('❌ Error in cleanup process:', error)
    throw error
  }
}

/**
 * Cleanup with service-specific buffer times - FIXED for barber-specific durations
 */
export async function cleanupWithServiceBuffers() {
  try {
    const now = DateTime.now().toUTC()
    
    // Get all completed bookings with their service info
    const completedBookings = await prisma.booking.findMany({
      where: {
        eventDeleted: { not: true },
        datetime: {
          lt: now.toJSDate() // Only get past appointments
        }
      }
    })

    console.log(`🧹 Checking ${completedBookings.length} past appointments for cleanup`)

    // Import your services data to get durations
    const { servicesData } = await import('@/data/services')
    
    const results = []
    for (const booking of completedBookings) {
      if (!booking.eventId || !booking.calendarId || !booking.service || !booking.barber) {
        console.log(`⚠️ Skipping booking ${booking.id} - missing required data`)
        continue
      }

      // FIXED: Get barber-specific service duration
      const serviceData = servicesData.find(s => s.name === booking.service)
      if (!serviceData) {
        console.log(`⚠️ Service ${booking.service} not found in services data`)
        continue
      }

      // Get the specific barber's duration for this service
      const barberData = serviceData.barbers.find(b => b.barberId === booking.barber)
      if (!barberData) {
        console.log(`⚠️ Barber ${booking.barber} not found for service ${booking.service}`)
        continue
      }

      
      // Option 1: Use stored serviceDuration from booking if available (recommended)
      const serviceDuration = booking.serviceDuration || barberData.duration
      
      // Calculate when appointment actually ended + buffer
      const appointmentStart = DateTime.fromJSDate(booking.datetime, { zone: 'utc' })
      const appointmentEnd = appointmentStart.plus({ minutes: serviceDuration })
      const cleanupTime = appointmentEnd.plus({ minutes: 15 }) // 15min buffer after service ends
      
      // Check if it's time to clean up this appointment
      if (now >= cleanupTime) {
        console.log(`🗑️ Cleaning up ${booking.service} appointment with ${booking.barber} (${serviceDuration}min) from ${appointmentStart.toLocaleString()}`)
        
        const success = await deleteCalendarEvent(
          booking.eventId, 
          booking.calendarId, 
          booking.id
        )
        
        results.push({ 
          bookingId: booking.id, 
          service: booking.service,
          barber: booking.barber,
          duration: serviceDuration,
          success 
        })
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
      } else {
        console.log(`⏳ Appointment ${booking.id} still in progress or within buffer period`)
      }
    }

    console.log(`✅ Cleanup completed. Processed ${results.length} appointments`)
    return results
  } catch (error) {
    console.error('❌ Error in service-specific cleanup:', error)
    throw error
  }
}

// API endpoint version
// src/pages/api/calendar/cleanup.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Simple authentication - you might want to add API key validation
  const authHeader = req.headers.authorization
  if (!authHeader || authHeader !== `Bearer ${process.env.CLEANUP_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const results = await cleanupWithServiceBuffers()
    
    return res.status(200).json({
      success: true,
      cleaned: results.length,
      results
    })
  } catch (error) {
    console.error('Cleanup API error:', error)
    return res.status(500).json({ error: 'Cleanup failed' })
  }
}

// Cron job setup example for Vercel
// vercel.json
/*
{
  "crons": [
    {
      "path": "/api/calendar/cleanup",
      "schedule": "0 * * * *"
    }
  ]
}
*/