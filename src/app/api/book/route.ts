import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import auth from '@/lib/google-auth'
import resend from '@/lib/resend'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, phone, comments, datetime, service, barber } = body
  const bookingId = uuidv4()
  const prisma = new PrismaClient()

  if (!datetime || !name || !email || !service || !barber) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const calendar = google.calendar({ version: 'v3', auth })

  try {
    const barberCalendars: Record<string, string> = {
      Jay: 'anthonytij3@gmail.com', //test calenderID
      Luis: 'luisbarber@gmail.com',
      Los: 'losbarber@gmail.com',
    }
    const calendarId = barberCalendars[barber] || 'primary'

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${service} with ${barber}`,
        description: `Name: ${name}\nPhone: ${phone}\n\n${comments}`,
        start: { dateTime: datetime },
        end: {
          dateTime: new Date(new Date(datetime).getTime() + 30 * 60 * 1000).toISOString(),
        },
        //attendees: [{ email }], <-- Required domain-wide delegation
      },
    })

    const barberEmails: Record<string, string> = {
      Jay: 'anthonytij3@gmail.com', //test email
      Luis: 'luis@barbershop.com',
      Los: 'los@barbershop.com',
    }

    const barberEmail = barberEmails[barber] || 'fallback@barbershop.com'


    // ✉️ Send email to client and barber
    const formattedTime = new Date(datetime).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    })

    //client email
    await resend.emails.send({
      from: 'Barbershop <onboarding@resend.dev>', //use company name & email here
      to: email,
      subject: 'Your Appointment is Confirmed',
      html: `
        <h2>Hi ${name}, your booking is confirmed!</h2>
        <p>Thanks for booking a <strong>${service}</strong> with <strong>${barber}</strong>.</p>
        <p><strong>When:</strong> ${formattedTime}</p>
        <p>You can <a href="https://fhq-two.vercel.app/manage-booking?id=${bookingId}">reschedule or cancel your appointment here</a>.</p>
        <p>This link is private and allows you to manage your booking. Please don’t share it.</p>
      `,
    })

    //barber email
    await resend.emails.send({
      from: 'Barbershop <onboarding@resend.dev>',
      to: barberEmail, // Replace with actual barber email logic if dynamic
      subject: `New Booking for ${barber}`,
      html: `
        <h2>New Appointment Booked</h2>
        <p><strong>Client:</strong> ${name}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>When:</strong> ${formattedTime}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Notes:</strong> ${comments || 'None'}</p>
      `,
    })

    if (!event.data.id) {
      throw new Error('Google Calendar did not return an event ID')
    }

    await prisma.booking.create({
      data: {
        id: bookingId,
        eventId: event.data.id, 
        calendarId,
        barber,
        name,
        email,
        phone,
        comments,
        service,
        datetime: new Date(datetime),
      },
    })

    return NextResponse.json({ success: true, eventId: event.data.id, bookingId })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 })
  }
}
