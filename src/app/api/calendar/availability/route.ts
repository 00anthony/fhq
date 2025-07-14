import { NextResponse } from 'next/server';
import { getBusyTimes } from '@/lib/google-calendar';

const START_HOUR = 9;
const END_HOUR = 17;
const SLOT_DURATION_MINUTES = 30;

function generateTimeSlotsForDay(date: Date): string[] {
  const slots: string[] = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let min = 0; min < 60; min += SLOT_DURATION_MINUTES) {
      const slot = new Date(date);
      slot.setHours(hour, min, 0, 0);
      slots.push(slot.toISOString());
    }
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

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing start or end query parameters' }, { status: 400 });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  // ✅ getBusyTimes returns an array directly
  const busy = await getBusyTimes(start, end);

  // ✅ filter out any undefined/null times
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
