import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable'
import fs from 'fs/promises'
import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'
import auth from '@/lib/google-auth'
import resend from '@/lib/resend'
import { DateTime } from 'luxon';
import { servicesData } from '@/data/services' 
import { getBarberById } from '@/data/barbers'

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

  // Get service duration from services data - FIXED to get barber-specific duration
  const serviceData = servicesData.find(s => s.name === service);
  if (!serviceData) {
    return res.status(400).json({ error: 'Invalid service selected' });
  }
  
  // Get the specific barber's duration for this service
  const barberData = serviceData.barbers.find(b => b.barberId === barber);
  if (!barberData) {
    return res.status(400).json({ error: 'Invalid barber selected for this service' });
  }
  
  const serviceDurationMinutes = barberData.duration; // Use barber-specific duration
  console.log(`📅 Service "${service}" with ${barber} duration: ${serviceDurationMinutes} minutes`);

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

      // FIXED: Handle the new response format from availability API
      const availableSlots: Array<{
        slot: string;
        barbers: Array<{ name: string; duration: number }> | string[]; // Handle both formats
        serviceDuration: number;
      }> = availabilityData.availableSlots || []
      
      console.log('📊 availableSlots.length:', availableSlots.length)

      availableSlots.forEach(s => {
        console.log('Slot:', s.slot, 'Barbers:', s.barbers);
        
        // Handle both old format (string[]) and new format (object[])
        const barberNames = Array.isArray(s.barbers) && s.barbers.length > 0
          ? typeof s.barbers[0] === 'string' 
            ? s.barbers as string[]
            : (s.barbers as Array<{ name: string; duration: number }>).map(b => b.name)
          : [];
          
        console.log('Matches Barber?', barberNames.includes(barber));
        console.log('Matches Time?', DateTime.fromISO(s.slot).toMillis() === userDateTime.toMillis());
      });

      const isAvailable = availableSlots.some((slotObj) => {
        console.log('🔍 Checking slot:', slotObj.slot)
        console.log('🔍 Slot barbers:', slotObj.barbers)
        console.log('🔍 Looking for barber ID:', barber)

        if (!slotObj?.slot || !Array.isArray(slotObj.barbers)) return false
        
        // Check if barbers array contains objects with barberId
        const barberIds = slotObj.barbers.length > 0 && typeof slotObj.barbers[0] === 'object'
          ? (slotObj.barbers as Array<{ barberId: string; name: string; duration: number }>).map(b => b.barberId)
          : slotObj.barbers as string[]; // Fallback for string array
        
        const timeMatches = DateTime.fromISO(slotObj.slot).toMillis() === userDateTime.toMillis()
        const barberMatches = barberIds.includes(barber)
        
        console.log('⏰ Time matches:', timeMatches)
        console.log('👨‍💼 Barber matches:', barberMatches, `(looking for ${barber} in ${barberIds})`)
        
        return timeMatches && barberMatches
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

    // Get barber info from ID in barbers.ts
    let barberInfo;
    try {
      barberInfo = getBarberById(barber);
    } catch {
      return res.status(400).json({ error: 'Invalid barber ID' });
    }

    //const barberName = barberInfo.name;
    const calendarId = barberInfo.calendarId || 'primary';

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

    // For email, you'll need to add an email field to your barber data, or use a mapping with IDs:
    const barberEmails: Record<string, string> = {
      'jj': 'anthonytij3@gmail.com',
      'los': 'luis@barbershop.com',
      'nelson': 'nelson@barbershop.com',
    }

    const barberEmail = barberEmails[barber] || 'fallback@barbershop.com'

    // Get barber's price for this service
    const servicePrice = barberData.price;

    // Send client confirmation email with duration info
    await resend.emails.send({
      from: 'Faded Headquarters <onboarding@resend.dev>',
      to: email,
      subject: 'Your Appointment is Confirmed',
      html: `
        <h2>Hi ${name}, your booking is confirmed!</h2>
        <p>Thanks for booking a <strong>${service}</strong> with <strong>${barber}</strong>.</p>
        <p><strong>When:</strong> ${formattedTime} - ${formattedEndTime}</p>
        <p><strong>Duration:</strong> ${serviceDurationMinutes} minutes</p>
        <p><strong>Price:</strong> $${servicePrice}</p>
        <p>You can <a href="https://fhq-two.vercel.app/manage-booking?bookingId=${bookingId}">reschedule or cancel your appointment here</a>.</p>
        <p>This link is private and allows you to manage your booking. Please don't share it.</p>
      `,
    })

    // Send barber notification email (with optional attachment and duration info)
    await resend.emails.send({
      from: 'Faded Headquarters <onboarding@resend.dev>',
      to: barberEmail,
      subject: `New Booking for ${barber}`,
      html: `
        <h2>New Appointment Booked</h2>
        <p><strong>Client:</strong> ${name}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>When:</strong> ${formattedTime} - ${formattedEndTime}</p>
        <p><strong>Duration:</strong> ${serviceDurationMinutes} minutes</p>
        <p><strong>Price:</strong> $${servicePrice}</p>
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