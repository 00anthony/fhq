import { google } from 'googleapis';
import auth from '@/lib/google-auth';

const calendar = google.calendar({ version: 'v3', auth });

export async function getBusyTimes(start: string, end: string, calendarId: string = 'primary') {
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: start,
      timeMax: end,
      timeZone: 'America/Chicago',
      items: [{ id: calendarId }],
    },
  });

  return res.data.calendars?.[calendarId]?.busy ?? [];
}
