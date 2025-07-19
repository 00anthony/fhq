import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma'; 
import resend from '@/lib/resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   // Verify secret
  const secret = req.query.secret;
  if (secret !== process.env.REMINDER_SECRET) {
    console.log('[REMINDER] Invalid secret: ', secret?.slice(0, 3) + '***');
    return res.status(403).json({ message: 'Forbidden' });
  }

  console.log('[REMINDER] Reminder check triggered at', new Date().toISOString());

  try {
    // Only allow GET (or POST if you prefer)
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    const now = new Date();
    const reminderTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    console.log(`[REMINDER] Checking for bookings between ${now.toISOString()} and ${reminderTime.toISOString()}`);

    // Find all bookings that start between now and the next 30 mins and haven't had a reminder sent yet
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        datetime: {
          gte: now,
          lte: reminderTime,
        },
        reminderSent: false, // Add this boolean field in your DB (optional)
      },
    });

    console.log(`[REMINDER] Found ${upcomingBookings.length} bookings needing reminders`);

    // Send emails
    for (const booking of upcomingBookings) {
      console.log(`[REMINDER] Sending reminder to ${booking.email} for appointment at ${booking.datetime}`);
      await resend.emails.send({
        from: 'Barbershop <onboarding@resend.dev>',
        to: booking.email,
        subject: 'Appointment Reminder',
        html: `<p>Hello ${booking.name},</p>
               <p>This is a reminder that your appointment is in 30 minutes.</p>
               <p>See you soon!</p>`,
      });

      // Update booking to mark reminder as sent
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSent: true },
      });
      console.log(`[REMINDER] Marked reminderSent = true for booking ID ${booking.id}`);
    }

    console.log('[REMINDER] Reminder process complete');
    res.status(200).json({ message: `Sent ${upcomingBookings.length} reminders.` });
  } catch (error) {
    console.error('[REMINDER] Error sending reminders:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
}
