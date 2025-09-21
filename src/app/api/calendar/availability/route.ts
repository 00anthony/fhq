import { NextRequest, NextResponse } from 'next/server'
import { getBusyTimes } from '@/lib/google-calendar'
import { getServiceBarbers } from '@/data/services'
import { getBarberCalendarMap } from '@/data/barbers'
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

  // Get calendar mapping from barber data instead of hardcoded object
  const barberCalendars = getBarberCalendarMap();

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing start or end' }, { status: 400 })
  }
  if (!service) {
    return NextResponse.json({ availableSlots: [] })
  }

  // Step 1: Get service details with full barber info
  const serviceBarbers = getServiceBarbers(service);
  if (!serviceBarbers || serviceBarbers.length === 0) {
    return NextResponse.json({ error: 'Service not found or no barbers available' }, { status: 400 });
  }

  // Step 2: Filter to only barbers with calendar integration
  let barbersToCheck = serviceBarbers.filter(sb => sb.barberInfo?.calendarId);

  console.log('🧑‍🔧 Barbers offering this service with calendars:', barbersToCheck.map(b => b.barberInfo?.name));

  if (!barbersToCheck || barbersToCheck.length === 0) {
    return NextResponse.json({ availableSlots: [] });
  }

  // Step 3: If a specific barber was selected, filter to just that one
  if (selectedBarber && selectedBarber !== 'any') {
    barbersToCheck = barbersToCheck.filter(b => b.barberId === selectedBarber);
  }

  console.log('Final barbers to check:', barbersToCheck.map(b => b.barberInfo?.name));

  // Store slots per barber with their specific duration and availability settings
  const barberSlots: Record<string, { slots: string[], duration: number, barberInfo: any }> = {};

  function generateAvailableSlots(
    start: string,
    end: string,
    busy: { start: string; end: string }[],
    barberInfo: any,
    serviceDurationMinutes: number
  ): string[] {
    const timeZone = barberInfo.timeZone || 'America/Chicago';
    const slots: string[] = [];

    // Parse input dates as UTC, then convert to local timezone start of day
    const startDate = DateTime.fromISO(start, { zone: 'utc' }).setZone(timeZone).startOf('day');
    const endDate = DateTime.fromISO(end, { zone: 'utc' }).setZone(timeZone).startOf('day');

    for (
      let day = startDate;
      day <= endDate;
      day = day.plus({ days: 1 })
    ) {
      // Get day of week for availability lookup
      const dayOfWeek = day.weekdayLong?.toLowerCase() as keyof typeof barberInfo.availability;
      const dayAvailability = barberInfo.availability[dayOfWeek];

      // Skip if barber is not available this day
      if (!dayAvailability?.isActive) {
        continue;
      }

      // Parse barber's working hours for this day
      const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
      const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);
      
      const workStart = day.set({ hour: startHour, minute: startMinute });
      const workEnd = day.set({ hour: endHour, minute: endMinute });

      // Use barber's specific slot interval
      const slotInterval = dayAvailability.slotInterval;

      // Generate potential start times based on barber's slot interval
      for (
        let slotTime = workStart;
        slotTime.plus({ minutes: serviceDurationMinutes }) <= workEnd;
        slotTime = slotTime.plus({ minutes: slotInterval })
      ) {
        // Check if this time conflicts with barber's breaks
        const isInBreak = dayAvailability.breaks?.some((breakTime: { startTime: string; endTime: string }) => {
          const [breakStartHour, breakStartMinute] = breakTime.startTime.split(':').map(Number);
          const [breakEndHour, breakEndMinute] = breakTime.endTime.split(':').map(Number);
          
          const breakStart = day.set({ hour: breakStartHour, minute: breakStartMinute });
          const breakEnd = day.set({ hour: breakEndHour, minute: breakEndMinute });
          
          const serviceStart = slotTime;
          const serviceEnd = slotTime.plus({ minutes: serviceDurationMinutes });
          
          // Check if service overlaps with break
          return serviceStart < breakEnd && serviceEnd > breakStart;
        });

        if (isInBreak) {
          continue;
        }

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

  // Process each barber with their specific duration and availability
  for (const serviceBarber of barbersToCheck) {
    const { barberId, duration } = serviceBarber;
    const barberInfo = serviceBarber.barberInfo;
    
    if (!barberInfo?.calendarId) continue;

    try {
      console.log(`📅 Checking busy times for barber: ${barberInfo.name} (${barberId})`);
      const busyRaw = await getBusyTimes(start, end, barberInfo.calendarId);
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
        barberInfo,
        duration // Use service-specific duration for this barber
      );

      barberSlots[barberId] = {
        slots: available,
        duration: duration,
        barberInfo: barberInfo
      };

      console.log(`✅ Available slots for ${barberInfo.name}:`, available.length, 'slots');
    } catch (error) {
      console.error(`Failed to get availability for ${barberInfo.name}:`, error);
    }
  }

  // Create final available slots ensuring proper barber-slot-duration matching
  const finalAvailableSlots: Array<{
    slot: string;
    barbers: Array<{ barberId: string; name: string; duration: number }>;
    serviceDuration: number;
  }> = [];

  // If specific barber selected, use their duration and slots
  if (selectedBarber && selectedBarber !== 'any') {
    const barberData = barberSlots[selectedBarber];
    if (barberData) {
      barberData.slots.forEach(slot => {
        finalAvailableSlots.push({
          slot,
          barbers: [{ 
            barberId: selectedBarber, 
            name: barberData.barberInfo.name,
            duration: barberData.duration 
          }],
          serviceDuration: barberData.duration
        });
      });
    }
  } else {
    // For "any" barber: group slots by time, showing which barbers are available
    const allUniqueSlots = new Set<string>();
    Object.values(barberSlots).forEach(barberData => {
      barberData.slots.forEach(slot => allUniqueSlots.add(slot));
    });

    Array.from(allUniqueSlots).sort().forEach(slot => {
      const availableBarbersForSlot: Array<{ barberId: string; name: string; duration: number }> = [];
      
      // Check which barbers are available for this specific slot
      Object.entries(barberSlots).forEach(([barberId, barberData]) => {
        if (barberData.slots.includes(slot)) {
          availableBarbersForSlot.push({
            barberId: barberId,
            name: barberData.barberInfo.name,
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