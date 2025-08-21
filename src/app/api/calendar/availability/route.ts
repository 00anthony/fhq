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

  // Step 1: Get service details including duration
  const serviceData = servicesData.find(s => s.name === service);
  if (!serviceData) {
    return NextResponse.json({ error: 'Service not found' }, { status: 400 });
  }

  // Get service duration (assuming it's stored in minutes in your servicesData)
  const serviceDurationMinutes = serviceData.duration || 30; // fallback to 30 if not specified

  console.log('🕒 Service duration:', serviceDurationMinutes, 'minutes');

  // Step 2: Get all barbers who offer this service
  let barbersToCheck = serviceData.barbers
    .map(b => b.name)
    .filter(name => barberCalendars[name]); // only include barbers with calendar ID

  console.log('Query received:', service);
  console.log('Selected barber:', selectedBarber);

  if (!barbersToCheck || barbersToCheck.length === 0) {
    return NextResponse.json({ availableSlots: [] });
  }

  console.log('🧑‍🔧 Barbers offering this service:', barbersToCheck);

  // Step 3: If a specific barber was selected, filter to just that one
  if (selectedBarber && selectedBarber !== 'any') {
    barbersToCheck = barbersToCheck.filter(b => b === selectedBarber);
  }

  console.log('Barber received', barbersToCheck);

  // Define working hours and base slot interval (keep small for flexibility)
  const workingHours = { startHour: 9, endHour: 17 };
  const baseSlotInterval = 15; // 15-minute base intervals for more flexibility

  // Prepare a map of all barbers' available slots
  const slotMap: Record<string, Set<string>> = {};
  const allSlotsSet = new Set<string>();

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

  for (const barber of barbersToCheck) {
    const calendarId = barberCalendars[barber];
    if (!calendarId) continue;

    try {
      console.log(`📅 Checking busy times for barber: ${barber}`);
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
        serviceDurationMinutes,
        baseSlotInterval
      );

      available.forEach((slot: string) => {
        if (!slotMap[slot]) slotMap[slot] = new Set();
        slotMap[slot].add(barber);
        allSlotsSet.add(slot);
      });

      console.log(`✅ Available slots for ${barber}:`, available.length, 'slots');
    } catch (error) {
      console.error(`Failed to get availability for ${barber}:`, error);
    }
  }

  // Convert final result to array format with service duration info
  const availableSlots = Array.from(allSlotsSet).sort().map(slot => ({
    slot,
    barbers: Array.from(slotMap[slot]),
    serviceDuration: serviceDurationMinutes // Include duration for frontend use
  }));

  console.log('Returning available slots:', availableSlots.length, 'total slots');

  return NextResponse.json({ 
    availableSlots,
    serviceDuration: serviceDurationMinutes // Also include at top level
  });
}