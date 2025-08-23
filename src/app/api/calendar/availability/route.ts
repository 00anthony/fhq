import { NextRequest, NextResponse } from 'next/server'
import { getBusyTimes } from '@/lib/google-calendar'
import { servicesData } from '@/data/services'
import { DateTime, Interval } from 'luxon'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const service = searchParams.get('service') || ''
  const selectedBarber = searchParams.get('barber')

  console.log('🟨 API Query Params');
  console.log('Start:', start);
  console.log('End:', end);
  console.log('Service:', service);
  console.log('Selected Barber:', selectedBarber);

  const barberCalendars: Record<string, string> = {
    Jay: 'anthonytij3@gmail.com',
    Luis: 'luisbarber@gmail.com',
    //Los: 'losbarber@gmail.com',
  };

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing start or end' }, { status: 400 })
  }
  if (!service) {
    return NextResponse.json({ availableSlots: [] })
  }

  // Step 1: Get service details
  const serviceData = servicesData.find(s => s.name === service);
  if (!serviceData) {
    return NextResponse.json({ error: 'Service not found' }, { status: 400 });
  }

  // Step 2: Get all barbers who offer this service
  let barbersToCheck = serviceData.barbers
    .map(b => ({ name: b.name, duration: b.duration }))
    .filter(barber => barberCalendars[barber.name]); // only include barbers with calendar ID

  console.log('🧑‍🔧 Barbers offering this service:', barbersToCheck);

  if (!barbersToCheck || barbersToCheck.length === 0) {
    return NextResponse.json({ availableSlots: [] });
  }

  // Step 3: If a specific barber was selected, filter to just that one
  if (selectedBarber && selectedBarber !== 'any') {
    barbersToCheck = barbersToCheck.filter(b => b.name === selectedBarber);
  }

  console.log('Barber received', barbersToCheck);

  // Define working hours and base slot interval
  const workingHours = { startHour: 9, endHour: 17 };
  const baseSlotInterval = 15; // 15-minute base intervals for more flexibility

  // NEW: Store slots per barber with their specific duration
  const barberSlots: Record<string, { slots: string[], duration: number }> = {};

  function generateAvailableSlots(
    start: string,
    end: string,
    busy: { start: string; end: string }[],
    workingHours: { startHour: number; endHour: number },
    serviceDurationMinutes: number,
    baseSlotInterval: number = 15
  ): string[] {
    const timeZone = 'America/Chicago';
    const slots: string[] = [];

    // Parse input dates as UTC, then convert to local timezone start of day
    const startDate = DateTime.fromISO(start, { zone: 'utc' }).setZone(timeZone).startOf('day');
    const endDate = DateTime.fromISO(end, { zone: 'utc' }).setZone(timeZone).startOf('day');

    for (
      let day = startDate;
      day <= endDate;
      day = day.plus({ days: 1 })
    ) {
      const workStart = day.set({ hour: workingHours.startHour, minute: 0 });
      const workEnd = day.set({ hour: workingHours.endHour, minute: 0 });

      // Generate potential start times based on base interval
      for (
        let slotTime = workStart;
        slotTime.plus({ minutes: serviceDurationMinutes }) <= workEnd;
        slotTime = slotTime.plus({ minutes: baseSlotInterval })
      ) {
        const slotStartUtc = slotTime.toUTC();
        const slotEndUtc = slotTime.plus({ minutes: serviceDurationMinutes }).toUTC();

        // Check if this entire service duration conflicts with any busy time
        const isSlotAvailable = !busy.some(({ start, end }) => {
          const busyInterval = Interval.fromDateTimes(
            DateTime.fromISO(start, { zone: 'utc' }),
            DateTime.fromISO(end, { zone: 'utc' })
          );
          const slotInterval = Interval.fromDateTimes(slotStartUtc, slotEndUtc);
          
          // Check for any overlap between the service duration and busy time
          return busyInterval.overlaps(slotInterval);
        });

        if (isSlotAvailable) {
          slots.push(slotStartUtc.toISO()!);
        }
      }
    }

    return slots;
  }

  // NEW: Process each barber with their specific duration
  for (const barber of barbersToCheck) {
    const calendarId = barberCalendars[barber.name];
    if (!calendarId) continue;

    try {
      console.log(`📅 Checking busy times for barber: ${barber.name}`);
      const busyRaw = await getBusyTimes(start, end, calendarId);
      const busy = busyRaw
        .filter(
          (p): p is { start: string; end: string } =>
            typeof p.start === 'string' && typeof p.end === 'string'
        )
        .map(p => ({ start: p.start, end: p.end }));

      const available = generateAvailableSlots(
        start, 
        end, 
        busy, 
        workingHours, 
        barber.duration, // Use each barber's specific duration
        baseSlotInterval
      );

      barberSlots[barber.name] = {
        slots: available,
        duration: barber.duration
      };

      console.log(`✅ Available slots for ${barber.name}:`, available.length, 'slots');
    } catch (error) {
      console.error(`Failed to get availability for ${barber.name}:`, error);
    }
  }

  // NEW: Create final available slots ensuring proper barber-slot-duration matching
  const finalAvailableSlots: Array<{
    slot: string;
    barbers: Array<{ name: string; duration: number }>;
    serviceDuration: number;
  }> = [];

  // If specific barber selected, use their duration and slots
  if (selectedBarber && selectedBarber !== 'any') {
    const barberData = barberSlots[selectedBarber];
    if (barberData) {
      barberData.slots.forEach(slot => {
        finalAvailableSlots.push({
          slot,
          barbers: [{ name: selectedBarber, duration: barberData.duration }],
          serviceDuration: barberData.duration
        });
      });
    }
  } else {
    // For "any" barber: group slots by time, but each slot shows which barbers are available with their durations
    const allUniqueSlots = new Set<string>();
    Object.values(barberSlots).forEach(barberData => {
      barberData.slots.forEach(slot => allUniqueSlots.add(slot));
    });

    Array.from(allUniqueSlots).sort().forEach(slot => {
      const availableBarbersForSlot: Array<{ name: string; duration: number }> = [];
      
      // Check which barbers are available for this specific slot
      Object.entries(barberSlots).forEach(([barberName, barberData]) => {
        if (barberData.slots.includes(slot)) {
          availableBarbersForSlot.push({
            name: barberName,
            duration: barberData.duration
          });
        }
      });

      if (availableBarbersForSlot.length > 0) {
        finalAvailableSlots.push({
          slot,
          barbers: availableBarbersForSlot,
          serviceDuration: availableBarbersForSlot[0].duration // Use first available barber's duration as default
        });
      }
    });
  }

  console.log('Returning available slots:', finalAvailableSlots.length, 'total slots');

  return NextResponse.json({ 
    availableSlots: finalAvailableSlots,
    // For backward compatibility, return duration of first barber or default
    serviceDuration: barbersToCheck[0]?.duration || 30
  });
}