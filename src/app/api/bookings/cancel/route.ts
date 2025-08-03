//cancelation logic + email
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import auth from '@/lib/google-auth'
import resend from '@/lib/resend'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { bookingId } = await req.json()

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const calendar = google.calendar({ version: 'v3', auth })

    await calendar.events.delete({
      calendarId: booking.calendarId,
      eventId: booking.eventId,
    })

    await prisma.booking.delete({ where: { id: bookingId } })

    const formattedTime = new Date(booking.datetime).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    })

    const barberEmails: Record<string, string> = {
      Jay: 'anthonytij3@gmail.com',
      Luis: 'luis@barbershop.com',
      //Los: 'los@barbershop.com',
    }

    const barberEmail = barberEmails[booking.barber] || 'fallback@barbershop.com'

    // Client email
    try {
      await resend.emails.send({
        from: 'Barbershop <onboarding@resend.dev>',
        to: booking.email,
        subject: 'Your Appointment Has Been Canceled',
        html: `
          <h2>Hi ${booking.name},</h2>
          <p>Your appointment for <strong>${booking.service}</strong> with <strong>${booking.barber}</strong> on <strong>${formattedTime}</strong> has been canceled.</p>
          <p>If this was a mistake, feel free to book again anytime.</p>
        `,
      })
    } catch (e) {
      console.error('Failed to send client cancellation email: ', e)
    }

    // Barber email
    try {
      await resend.emails.send({
        from: 'Barbershop <onboarding@resend.dev>',
        to: barberEmail,
        subject: 'Appointment Canceled',
        html: `
          <h2>Appointment Canceled</h2>
          <p><strong>Client:</strong> ${booking.name}</p>
          <p><strong>Service:</strong> ${booking.service}</p>
          <p><strong>When:</strong> ${formattedTime}</p>
          <p>This booking has been canceled by the client.</p>
        `,
      })
    } catch (e) {
      console.error('Failed to send barber cancellation email:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel error:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
