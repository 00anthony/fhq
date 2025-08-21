import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma'; 
import resend from '@/lib/resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Support both GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Enhanced authentication - supports both your existing method and Vercel cron
  const secretFromQuery = req.query.secret as string;
  const authHeader = req.headers.authorization;
  const cronSecret = req.headers['x-vercel-cron-signature']; // Vercel cron signature
  const reminderSecret = process.env.REMINDER_SECRET;

  const isAuthenticated = 
    cronSecret || // Vercel cron job (automatic)
    secretFromQuery === reminderSecret || // Your existing query param method
    authHeader === `Bearer ${reminderSecret}`; // Bearer token method

  if (!isAuthenticated) {
    console.log('[REMINDER] Invalid secret: ', secretFromQuery?.slice(0, 3) + '***');
    return res.status(403).json({ message: 'Forbidden' });
  }

  console.log('[REMINDER] Reminder check triggered at', new Date().toISOString());

  try {
    const now = new Date();
    // Changed: Use 24-hour reminder window instead of 30 minutes
    // This is better for appointment reminders (day-before notification)
    const reminderStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000); // 23.5 hours from now
    const reminderEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);   // 24.5 hours from now

    console.log(`[REMINDER] Checking for bookings between ${reminderStart.toISOString()} and ${reminderEnd.toISOString()}`);

    // Find bookings that need 24-hour reminders
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        datetime: {
          gte: reminderStart,
          lte: reminderEnd,
        },
        reminderSent: false,
      },
      orderBy: {
        datetime: 'asc'
      }
    });

    console.log(`[REMINDER] Found ${upcomingBookings.length} bookings needing reminders`);

    let successCount = 0;
    let errorCount = 0;

    // Send emails with enhanced error handling
    for (const booking of upcomingBookings) {
      try {
        // Your existing date formatting (keeping it because it works well!)
        const appointmentDate = new Date(booking.datetime);
        const formattedDateTime = appointmentDate.toLocaleString('en-US', {
          timeZone: booking.timeZone || 'America/Chicago', // Use stored timezone or fallback
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        console.log(`[REMINDER] Sending reminder to ${booking.email} for appointment at ${formattedDateTime}`);

        // Enhanced email content
        await resend.emails.send({
          from: 'Barbershop <onboarding@resend.dev>',
          to: booking.email,
          subject: `Reminder: Your ${booking.service} appointment tomorrow`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2>Hi ${booking.name}!</h2>
              <p>This is a friendly reminder about your upcoming appointment.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>📅 Appointment Details</h3>
                <p><strong>Service:</strong> ${booking.service}</p>
                <p><strong>Barber:</strong> ${booking.barber}</p>
                <p><strong>Date & Time:</strong> ${formattedDateTime}</p>
              </div>

              <p>We look forward to seeing you tomorrow!</p>
              
              <p><small>Need to reschedule? <a href="https://fhq-two.vercel.app/manage-booking?bookingId=${booking.id}">Click here to manage your booking</a></small></p>
            </div>
          `,
        });

        // Update booking to mark reminder as sent
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        });

        console.log(`[REMINDER] ✅ Sent reminder and marked reminderSent = true for booking ID ${booking.id}`);
        successCount++;

        // Rate limiting - small delay between emails
        if (upcomingBookings.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

      } catch (error) {
        console.error(`[REMINDER] ❌ Failed to send reminder for booking ${booking.id}:`, error);
        errorCount++;
      }
    }

    const totalProcessed = successCount + errorCount;
    console.log(`[REMINDER] Process complete: ${successCount} sent, ${errorCount} errors`);

    res.status(200).json({ 
      message: `Processed ${totalProcessed} reminders: ${successCount} sent, ${errorCount} errors.`,
      summary: {
        total: totalProcessed,
        successful: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('[REMINDER] Error in reminder process:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
}