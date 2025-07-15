import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable'
import fs from 'fs/promises'
import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'
import auth from '@/lib/google-auth'
import resend from '@/lib/resend'

// Disable the default body parser so we can handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper: Get a string from formidable field
const getField = (field: string | string[] | undefined): string =>
  Array.isArray(field) ? field[0] : field ?? ''

// Parse form data using formidable
function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  const form = new IncomingForm({ keepExtensions: true })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { fields, files } = await parseForm(req)

  // Safely extract fields
  const name = getField(fields.name)
  const email = getField(fields.email)
  const phone = getField(fields.phone)
  const comments = getField(fields.comments)
  const datetime = getField(fields.datetime)
  const service = getField(fields.service)
  const barber = getField(fields.barber)

  const bookingId = uuidv4()
  const prisma = new PrismaClient()

  // ✅ TEMP DEBUG LOG — Safe to include
  console.log('DB URL starts with:', process.env.DATABASE_URL?.slice(0, 20))

  if (!datetime || !name || !email || !service || !barber) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  // Handle uploaded file (optional)
  let attachment = null
  const file = files.upload
  const uploadedFile = Array.isArray(file) ? file[0] : file

  if (uploadedFile?.filepath) {
    const fileBuffer = await fs.readFile(uploadedFile.filepath)
    attachment = {
      filename: uploadedFile.originalFilename || 'attachment',
      content: fileBuffer.toString('base64'),
    }
  }

  const calendar = google.calendar({ version: 'v3', auth })

  try {
    const barberCalendars: Record<string, string> = {
      Jay: 'anthonytij3@gmail.com', // Example/test calendar
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
      },
    })

    const barberEmails: Record<string, string> = {
      Jay: 'anthonytij3@gmail.com',
      Luis: 'luis@barbershop.com',
      Los: 'los@barbershop.com',
    }

    const barberEmail = barberEmails[barber] || 'fallback@barbershop.com'

    const formattedTime = new Date(datetime).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    })

    // Send client confirmation email
    await resend.emails.send({
      from: 'Barbershop <onboarding@resend.dev>',
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

    // Send barber notification email (with optional attachment)
    await resend.emails.send({
      from: 'Barbershop <onboarding@resend.dev>',
      to: barberEmail,
      subject: `New Booking for ${barber}`,
      html: `
        <h2>New Appointment Booked</h2>
        <p><strong>Client:</strong> ${name}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>When:</strong> ${formattedTime}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Notes:</strong> ${comments || 'None'}</p>
      `,
      attachments: attachment ? [attachment] : [],
    })

    if (!event.data.id) throw new Error('Google Calendar did not return an event ID')

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

    return res.status(200).json({ success: true, eventId: event.data.id, bookingId })
  } catch (error) {
    console.error('Booking error:', error)
    return res.status(500).json({ error: 'Failed to book appointment' })
  }
}
