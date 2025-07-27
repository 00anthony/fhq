import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import auth from '@/lib/google-auth'
import resend from '@/lib/resend'
import { DateTime } from 'luxon'

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

    // 2. Format for email using client's original time zone
    const formattedTime = dt.setZone(timeZone).toLocaleString(DateTime.DATETIME_MED)

    // Find booking
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Update Google Calendar event
    const calendar = google.calendar({ version: 'v3', auth })
    await calendar.events.patch({
      calendarId: booking.calendarId,
      eventId: booking.eventId,
      requestBody: {
        start: { dateTime: newDatetime },
        end: {
          dateTime: new Date(new Date(newDatetime).getTime() + 30 * 60 * 1000).toISOString(),
        },
      },
    })

    // 3. Update DB with UTC datetime and timeZone
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        datetime: dt.toJSDate(), // stored in UTC
        timeZone, // store original client time zone
      },
    })

    // Barber email map
    const barberEmails: Record<string, string> = {
      Jay: 'anthonytij3@gmail.com',
      Luis: 'luis@barbershop.com',
      //Los: 'los@barbershop.com',
    }
    const barberEmail = barberEmails[booking.barber] || 'fallback@barbershop.com'

    // Client email
    await resend.emails.send({
      from: 'Barbershop <onboarding@resend.dev>',
      to: booking.email,
      subject: 'Your Appointment Has Been Rescheduled',
      html: `
        <h2>Hi ${booking.name},</h2>
        <p>Your appointment for <strong>${booking.service}</strong> with <strong>${booking.barber}</strong> has been rescheduled to:</p>
        <p><strong>${formattedTime}</strong></p>
        <p>If you need to make more changes, you can always return to your booking link.</p>
      `,
    })

    // Barber email
    await resend.emails.send({
      from: 'Barbershop <onboarding@resend.dev>',
      to: barberEmail,
      subject: 'Appointment Rescheduled',
      html: `
        <h2>Booking Rescheduled</h2>
        <p><strong>Client:</strong> ${booking.name}</p>
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>New Time:</strong> ${formattedTime}</p>
        <p>Please update your schedule accordingly.</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reschedule error:', error)
    return NextResponse.json({ error: 'Failed to reschedule booking' }, { status: 500 })
  }
}
