import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import auth from '@/lib/google-auth'
import resend from '@/lib/resend'
import { DateTime } from 'luxon'
import { servicesData } from '@/data/services' // Import services data

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // Parse JSON body
    const { bookingId, newDatetime, timeZone }: { bookingId: string; newDatetime: string; timeZone: string } =
      await req.json()

    if (!bookingId || !newDatetime || !timeZone) {
      return NextResponse.json({ error: 'Missing bookingId, newDatetime, or timeZone' }, { status: 400 })
    }

    // 1. Convert ISO to Luxon DateTime in UTC
    const dt = DateTime.fromISO(newDatetime, { zone: 'utc' });
    if (!dt.isValid) {
      return NextResponse.json({ error: 'Invalid datetime format' }, { status: 400 });
    }
    const now = DateTime.utc();
    const twoWeeksFromNow = now.plus({ weeks: 2 });

    if (dt < now) {
      return NextResponse.json({ error: 'Cannot reschedule to a past date/time' }, { status: 400 });
    }
    if (dt > twoWeeksFromNow) {
      return NextResponse.json({ error: 'Cannot reschedule more than two weeks in advance' }, { status: 400 });
    }

    // Find booking
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // FIXED: Get barber-specific service duration
    let serviceDurationMinutes = booking.serviceDuration // Use stored duration first
    if (!serviceDurationMinutes) {
      // Fallback to looking up barber-specific duration from services data
      const serviceData = servicesData.find(s => s.name === booking.service)
      const barberData = serviceData?.barbers.find(b => b.barberId === booking.barber)
      serviceDurationMinutes = barberData?.duration || 30 // Use barber-specific duration with fallback
    }

    console.log(`📅 Rescheduling ${booking.service} with ${booking.barber} (${serviceDurationMinutes} minutes)`);

    // 2. Format for email using client's original time zone
    const formattedTime = dt.setZone(timeZone).toLocaleString(DateTime.DATETIME_MED)
    const formattedEndTime = dt.setZone(timeZone).plus({ minutes: serviceDurationMinutes }).toLocaleString(DateTime.TIME_SIMPLE)

    // Get all active bookings for this barber on the same day
    const appointmentEnd = dt.plus({ minutes: serviceDurationMinutes })

    const existingBookings = await prisma.booking.findMany({
      where: {
        barber: booking.barber,
        id: { not: bookingId },
        eventDeleted: { not: true },
        datetime: {
          gte: dt.startOf('day').toJSDate(), // Same day
          lt: dt.endOf('day').toJSDate()
        }
      }
    })

    // Check each booking for overlap
    const hasConflict = existingBookings.some(existingBooking => {
      const existingStart = DateTime.fromJSDate(existingBooking.datetime, { zone: 'utc' })
      const existingDuration = existingBooking.serviceDuration || 30 // Fallback to 30 min
      const existingEnd = existingStart.plus({ minutes: existingDuration })
      
      // Check if appointments overlap
      // New starts before existing ends AND new ends after existing starts
      const overlaps = dt < existingEnd && appointmentEnd > existingStart
      
      if (overlaps) {
        console.log('Conflict found:', {
          existing: `${existingStart.toISO()} - ${existingEnd.toISO()}`,
          new: `${dt.toISO()} - ${appointmentEnd.toISO()}`
        })
      }
      
      return overlaps
    })

    if (hasConflict) {
      return NextResponse.json({ error: 'That time slot conflicts with an existing appointment' }, { status: 409 })
    }

    // Update Google Calendar event with correct duration
    const calendar = google.calendar({ version: 'v3', auth })
    const eventEndTime = dt.plus({ minutes: serviceDurationMinutes }).toISO()
    
    await calendar.events.patch({
      calendarId: booking.calendarId,
      eventId: booking.eventId,
      requestBody: {
        summary: `${booking.service} with ${booking.barber}`, // Update summary for clarity
        description: `Name: ${booking.name}\nPhone: ${booking.phone}\nDuration: ${serviceDurationMinutes} minutes\n\n${booking.comments || ''}`,
        start: { dateTime: newDatetime, timeZone },
        end: { dateTime: eventEndTime, timeZone },
      },
    })

    // 3. Update DB with UTC datetime, timeZone, and ensure serviceDuration is stored
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        datetime: dt.toJSDate(), // stored in UTC
        timeZone, // store original client time zone
        serviceDuration: serviceDurationMinutes, // ensure duration is stored for future reference
      },
    })

    // Barber email map
    const barberEmails: Record<string, string> = {
      Jay: 'anthonytij3@gmail.com',
      Luis: 'luis@barbershop.com',
      //Los: 'los@barbershop.com',
    }
    const barberEmail = barberEmails[booking.barber] || 'fallback@barbershop.com'

    // Get barber's price for this service
    const serviceData = servicesData.find(s => s.name === booking.service)
    const barberData = serviceData?.barbers.find(b => b.barberId === booking.barber)
    const servicePrice = barberData?.price || 'N/A'

    // Client email
    try {
      await resend.emails.send({
        from: 'Barbershop <onboarding@resend.dev>',
        to: booking.email,
        subject: 'Your Appointment Has Been Rescheduled',
        html: `
          <h2>Hi ${booking.name},</h2>
          <p>Your appointment for <strong>${booking.service}</strong> with <strong>${booking.barber}</strong> has been rescheduled to:</p>
          <p><strong>${formattedTime} - ${formattedEndTime}</strong></p>
          <p><strong>Duration:</strong> ${serviceDurationMinutes} minutes</p>
          <p><strong>Price:</strong> $${servicePrice}</p>
          <p>If you need to make more changes, you can always return to your booking link.</p>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send client rescheduling email:', emailError)
    }

    // Barber email
    try {
      await resend.emails.send({
        from: 'Barbershop <onboarding@resend.dev>',
        to: barberEmail,
        subject: 'Appointment Rescheduled',
        html: `
          <h2>Booking Rescheduled</h2>
          <p><strong>Client:</strong> ${booking.name}</p>
          <p><strong>Service:</strong> ${booking.service}</p>
          <p><strong>New Time:</strong> ${formattedTime} - ${formattedEndTime}</p>
          <p><strong>Duration:</strong> ${serviceDurationMinutes} minutes</p>
          <p><strong>Price:</strong> $${servicePrice}</p>
          <p><strong>Phone:</strong> ${booking.phone}</p>
          <p>Please update your schedule accordingly.</p>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send barber rescheduling email:', emailError)
    }

    return NextResponse.json({ 
      success: true,
      serviceDuration: serviceDurationMinutes 
    })
  } catch (error) {
    console.error('Reschedule error:', error)
    return NextResponse.json({ error: 'Failed to reschedule booking' }, { status: 500 })
  }
}