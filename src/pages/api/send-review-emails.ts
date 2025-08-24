import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Security: Only allow requests with the correct secret
const REVIEW_SECRET = process.env.REVIEW_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify the request is from our GitHub Action
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${REVIEW_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Calculate the time range for appointments that ended 24 hours ago
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);

    // Find completed appointments from ~24 hours ago that haven't been deleted
    const completedBookings = await prisma.booking.findMany({
      where: {
        eventDeleted: false,
        // Calculate end time: appointment datetime + service duration
        datetime: {
          gte: twentyFiveHoursAgo,
          lte: twentyFourHoursAgo,
        },
        // Make sure we haven't already sent a review email
        // We'll add this field to track review emails sent
        reviewEmailSent: false,
      },
      // Add a custom where clause to check if appointment + duration is in our target range
      orderBy: {
        datetime: 'asc'
      }
    });

    const emailResults = [];
    const errors = [];

    for (const booking of completedBookings) {
      try {
        // Calculate actual appointment end time
        const appointmentEndTime = new Date(
          booking.datetime.getTime() + (booking.serviceDuration || 60) * 60 * 1000
        );

        // Double-check this appointment actually ended in our target timeframe
        if (appointmentEndTime < twentyFiveHoursAgo || appointmentEndTime > twentyFourHoursAgo) {
          continue;
        }

        // Send review request email
        const emailResult = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
          to: booking.email,
          subject: `How was your appointment with ${booking.barber}?`,
          html: generateReviewEmailHTML(booking),
        });

        // Update the booking to mark review email as sent
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reviewEmailSent: true }
        });

        emailResults.push({
          bookingId: booking.id,
          email: booking.email,
          emailId: emailResult.data?.id,
          status: 'sent'
        });

        console.log(`Review email sent to ${booking.email} for booking ${booking.id}`);

      } catch (error) {
        console.error(`Failed to send review email for booking ${booking.id}:`, error);
        errors.push({
          bookingId: booking.id,
          email: booking.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Return summary
    res.status(200).json({
      message: 'Review email job completed',
      processed: completedBookings.length,
      sent: emailResults.length,
      errors: errors.length,
      results: emailResults,
      errorDetails: errors
    });

  } catch (error) {
    console.error('Error in send-review-emails:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

interface BookingData {
  id: string;
  name: string;
  email: string;
  barber: string;
  service: string;
  datetime: Date;
  serviceDuration: number | null;
}

function generateReviewEmailHTML(booking: BookingData): string {
  const googleReviewUrl = "https://www.google.com/search?q=your+business+name+reviews"; // Replace with actual Google Business URL
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>How was your appointment?</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: #2c3e50; margin-bottom: 20px;">Hi ${booking.name}! 👋</h1>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for choosing ${booking.barber} for your ${booking.service} appointment yesterday.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 30px;">
          We'd love to hear about your experience! Your feedback helps us provide the best service possible.
        </p>
        
        <div style="margin: 30px 0;">
          <a href="${googleReviewUrl}" 
             style="background-color: #4285f4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block; font-weight: bold;">
            Leave a Google Review ⭐
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Your review means the world to us and helps other clients discover our services.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999;">
          If you have any concerns about your appointment, please reply to this email and we'll address them personally.
        </p>
      </div>
    </body>
    </html>
  `;
}