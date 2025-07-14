//Rescheduling logic + email
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import auth from '@/lib/google-auth'
import resend from '@/lib/resend'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { bookingId, newDatetime } = await req.json()

  if (!bookingId || !newDatetime) {
    return NextResponse.json({ error: 'Missing bookingId or newDatetime' }, { status: 400 })
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

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

    await prisma.booking.update({
      where: { id: bookingId },
      data: { datetime: new Date(newDatetime) },
    })

    const formattedTime = new Date(newDatetime).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    })

    const barberEmails: Record<string, string> = {
      Jay: 'anthonytij3@gmail.com',
      Luis: 'luis@barbershop.com',
      Los: 'los@barbershop.com',
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
