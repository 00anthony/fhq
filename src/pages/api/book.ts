import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable'
import fs from 'fs/promises'
import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'
import auth from '@/lib/google-auth'
import resend from '@/lib/resend'
import { DateTime } from 'luxon';
import { servicesData } from '@/data/services' // Import services data

// Disable Next.js default body parser to handle FormData
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
  const timeZone = getField(fields.timeZone);

  const bookingId = uuidv4()
  const prisma = new PrismaClient()

  if (!datetime || !name || !email || !service || !barber) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  // Get service duration from services data
  const serviceData = servicesData.find(s => s.name === service);
  if (!serviceData) {
    return res.status(400).json({ error: 'Invalid service selected' });
  }
  
  const serviceDurationMinutes = serviceData.duration || 30; // fallback to 30 minutes
  console.log(`📅 Service "${service}" duration: ${serviceDurationMinutes} minutes`);

  // Handle uploaded file (optional)
  let attachment = null;
  const file = files.upload;
  const uploadedFile = Array.isArray(file) ? file[0] : file;

  if (uploadedFile?.filepath) {
    const fileBuffer = await fs.readFile(uploadedFile.filepath);
    attachment = {
      filename: uploadedFile.originalFilename || 'attachment',
      content: fileBuffer.toString('base64'),
    };
  }
  
  try {
    // ✅ Convert user's datetime (local) → UTC using Luxon
    const userDateTime = DateTime.fromISO(datetime, { zone: timeZone });
    if (!userDateTime.isValid) {
      throw new Error('Invalid datetime or timezone');
    }
    // ✅ Check for past time booking
    if (userDateTime < DateTime.now().setZone(timeZone)) {
      return res.status(400).json({ error: 'Cannot book a past time' })
    }
    // ✅ Validate against available slots
    try {
      const startOfDay = userDateTime.startOf('day').toUTC().toISO();
      const endOfDay = userDateTime.endOf('day').toUTC().toISO();

      console.log('🕒 Booking DateTime (local):', datetime);
      console.log('🕒 Booking DateTime (UTC):', userDateTime.toUTC().toISO());
      console.log('📆 Start of Day UTC:', startOfDay);
      console.log('📆 End of Day UTC:', endOfDay);

      // Call availability logic or endpoint
      const response = await fetch(
        `${req.headers.origin}/api/calendar/availability?start=${startOfDay}&end=${endOfDay}&bookingId=${bookingId || ''}&barber=${encodeURIComponent(barber)}&service=${encodeURIComponent(service)}`
      );

      console.log('📡 Booking API availability fetch params:', {
        start: startOfDay,
        end: endOfDay,
        barber,
        service,
        bookingId
      });

      console.log('📅 Fetching availability from:', `${req.headers.origin}/api/calendar/availability?start=${startOfDay}&end=${endOfDay}&bookingId=${bookingId || ''}&barber=${encodeURIComponent(barber)}&service=${encodeURIComponent(service)}`)

      const availabilityData = await response.json();
      console.log('📬 availabilityData:', availabilityData);

      const availableSlots: { slot: string; barbers: string[] }[] = availabilityData.availableSlots || []
      console.log('📊 availableSlots.length:', availableSlots.length)

      availableSlots.forEach(s => {
        console.log('Slot:', s.slot, 'Barbers:', s.barbers);
        console.log('Matches Barber?', s.barbers.includes(barber));
        console.log('Matches Time?', DateTime.fromISO(s.slot).toMillis() === userDateTime.toMillis());
      });

      const isAvailable = availableSlots.some((slotObj) => {
        console.log('🔍 Checking against slots:', availableSlots.length)
        console.log('⏰ Selected:', userDateTime.toISO(), userDateTime.toMillis())

        if (!slotObj?.slot || !Array.isArray(slotObj.barbers)) return false
        return (
          slotObj.barbers.includes(barber) &&
          DateTime.fromISO(slotObj.slot).toMillis() === userDateTime.toMillis()
        )
      })

      console.log('🔍 Available slots:', availableSlots)
      console.log('⏰ Selected:', userDateTime.toUTC().toISO())

      if (!isAvailable) {
        return res.status(400).json({ error: 'Selected time is no longer available.' });
      }
    } catch (err) {
      console.error('Failed to validate available slots:', err);
      return res.status(500).json({ error: 'Failed to validate available slots' });
    }

    const utcDateTime = userDateTime.toUTC();
    const eventStart = utcDateTime.toISO();
    // ✅ Use actual service duration with buffer time
    const bufferMinutes = 0; 
    const eventEnd = utcDateTime.plus({ minutes: serviceDurationMinutes + bufferMinutes }).toISO();

    console.log(`📅 Creating calendar event from ${eventStart} to ${eventEnd} (${serviceDurationMinutes} minutes)`);

    // ✅ Setup Google Calendar
    const calendar = google.calendar({ version: 'v3', auth });

    const barberCalendars: Record<string, string> = {
      Jay: 'anthonytij3@gmail.com',
      Luis: 'luisbarber@gmail.com',
      //Los: 'losbarber@gmail.com',
    };

    const calendarId = barberCalendars[barber] || 'primary'

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${service} with ${barber}`,
        description: `Name: ${name}\nPhone: ${phone}\nDuration: ${serviceDurationMinutes} minutes\n\n${comments}`,
        start: { dateTime: eventStart, timeZone },
        end: { dateTime: eventEnd, timeZone },
      },
    });

    if (!event.data.id) throw new Error('Google Calendar did not return an event ID');

    // ✅ Format email time in user's timezone
    const formattedTime = userDateTime.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);
    const formattedEndTime = userDateTime.plus({ minutes: serviceDurationMinutes }).toLocaleString(DateTime.TIME_SIMPLE);

    // ✅ Barber email map
    const barberEmails: Record<string, string> = {
      Jay: 'anthonytij3@gmail.com',
      Luis: 'luis@barbershop.com',
      //Los: 'los@barbershop.com',
    }

    const barberEmail = barberEmails[barber] || 'fallback@barbershop.com'

    // Send client confirmation email with duration info
    await resend.emails.send({
      from: 'Barbershop <onboarding@resend.dev>',
      to: email,
      subject: 'Your Appointment is Confirmed',
      html: `
        <h2>Hi ${name}, your booking is confirmed!</h2>
        <p>Thanks for booking a <strong>${service}</strong> with <strong>${barber}</strong>.</p>
        <p><strong>When:</strong> ${formattedTime} - ${formattedEndTime}</p>
        <p><strong>Duration:</strong> ${serviceDurationMinutes} minutes</p>
        <p>You can <a href="https://fhq-two.vercel.app/manage-booking?bookingId=${bookingId}">reschedule or cancel your appointment here</a>.</p>
        <p>This link is private and allows you to manage your booking. Please don't share it.</p>
      `,
    })

    // Send barber notification email (with optional attachment and duration info)
    await resend.emails.send({
      from: 'Barbershop <onboarding@resend.dev>',
      to: barberEmail,
      subject: `New Booking for ${barber}`,
      html: `
        <h2>New Appointment Booked</h2>
        <p><strong>Client:</strong> ${name}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>When:</strong> ${formattedTime} - ${formattedEndTime}</p>
        <p><strong>Duration:</strong> ${serviceDurationMinutes} minutes</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Notes:</strong> ${comments || 'None'}</p>
      `,
      attachments: attachment ? [attachment] : [],
    })

    // ✅ Save booking in DB (UTC datetime + user timezone + service duration)
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
        serviceDuration: serviceDurationMinutes,
        datetime: utcDateTime.toJSDate(), // Store in UTC
        timeZone, // New field
        // Consider adding serviceDuration field to your Booking model
        // serviceDuration: serviceDurationMinutes,
      },
    });

    return res.status(200).json({ 
      success: true, 
      eventId: event.data.id, 
      bookingId,
      serviceDuration: serviceDurationMinutes // Include in response
    })
  } catch (error) {
    console.error('Booking error:', error)
    return res.status(500).json({ error: 'Failed to book appointment' })
  }
}