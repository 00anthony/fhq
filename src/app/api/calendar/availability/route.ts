import { NextResponse } from 'next/server';
import { getBusyTimes } from '@/lib/google-calendar';
import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';


const prisma = new PrismaClient();

const BARBER_TIMEZONE = 'America/Chicago';
const START_HOUR = 9;
const END_HOUR = 17;
const SLOT_DURATION_MINUTES = 30;

function generateTimeSlotsForDay(date: Date): string[] {
  const slots: string[] = [];

  // Start at the given date in the barber's timezone at 9 AM
  let current = DateTime.fromJSDate(date, { zone: BARBER_TIMEZONE })
    .set({ hour: START_HOUR, minute: 0, second: 0, millisecond: 0 });

  const end = current.set({ hour: END_HOUR, minute: 0 });

  while (current < end) {
    // Convert local barber time to UTC and store as ISO string
    const iso = current.toUTC().toISO();
    if (iso) slots.push(iso);
    current = current.plus({ minutes: SLOT_DURATION_MINUTES });
  }

  return slots;
}

function isSlotAvailable(slot: string, busyTimes: { start: string; end: string }[]): boolean {
  const slotStart = new Date(slot).getTime();
  const slotEnd = slotStart + SLOT_DURATION_MINUTES * 60 * 1000;

  return !busyTimes.some(({ start, end }) => {
    const busyStart = new Date(start).getTime();
    const busyEnd = new Date(end).getTime();
    return slotStart < busyEnd && slotEnd > busyStart;
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const bookingId = searchParams.get('bookingId'); // optional

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing start or end query parameters' }, { status: 400 });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  const now = new Date();
  const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // Validation: start and end must be >= now and <= twoWeeksFromNow
  if (startDate < now) {
    return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 });
  }
  if (endDate > twoWeeksFromNow) {
    return NextResponse.json({ error: 'End date cannot be more than 2 weeks from now' }, { status: 400 });
  }

  let busy = await getBusyTimes(start, end);

  if (bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (booking) {
      busy = busy.filter(period => {
        const bookingStart = booking.datetime.toISOString();
        const bookingEnd = new Date(booking.datetime.getTime() + SLOT_DURATION_MINUTES * 60 * 1000).toISOString();
        return !(period.start === bookingStart && period.end === bookingEnd);
      });
    }
  }

  const busyTimes = busy.filter(
    (period): period is { start: string; end: string } =>
      typeof period.start === 'string' && typeof period.end === 'string'
  );

  const availableSlots: string[] = [];

  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
    const day = new Date(d);
    const slots = generateTimeSlotsForDay(day);
    const freeSlots = slots.filter(slot => isSlotAvailable(slot, busyTimes));
    availableSlots.push(...freeSlots);
  }

  return NextResponse.json({ availableSlots });
}

