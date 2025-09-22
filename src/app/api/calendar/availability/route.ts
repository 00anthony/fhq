import { NextRequest, NextResponse } from 'next/server'
import { getBusyTimes } from '@/lib/google-calendar'
import { getServiceBarbers } from '@/data/services'
import { Barber } from '@/data/barbers'
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

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing start or end' }, { status: 400 })
  }
  if (!service) {
    return NextResponse.json({ availableSlots: [] })
  }

  // Step 1: Get service details with full barber info
  const serviceBarbers = getServiceBarbers(service);
  console.log('🔍 Service barbers found:', serviceBarbers?.length || 0);
  
  if (!serviceBarbers || serviceBarbers.length === 0) {
    return NextResponse.json({ error: 'Service not found or no barbers available' }, { status: 400 });
  }

  // Step 2: Filter to only barbers with calendar integration
  let barbersToCheck = serviceBarbers.filter(sb => sb.barberInfo?.calendarId);

  console.log('🧑‍🔧 Barbers offering this service with calendars:', barbersToCheck.map(b => b.barberInfo?.name));

  if (!barbersToCheck || barbersToCheck.length === 0) {
    console.log('❌ No barbers with calendar integration found');
    return NextResponse.json({ availableSlots: [] });
  }

  // Step 3: If a specific barber was selected, filter to just that one
  if (selectedBarber && selectedBarber !== 'any') {
    const originalCount = barbersToCheck.length;
    barbersToCheck = barbersToCheck.filter(b => 
      b.barberId?.toLowerCase() === selectedBarber.toLowerCase()
    );
    console.log(`🎯 Filtered from ${originalCount} to ${barbersToCheck.length} barbers for selected barber: ${selectedBarber}`);
    console.log('Available barber IDs:', barbersToCheck.map(b => `"${b.barberId}"`));
    
    if (barbersToCheck.length === 0) {
      console.log('❌ Selected barber not found in service barbers');
      console.log('Expected:', selectedBarber, 'Available IDs:', barbersToCheck.map(b => b.barberId));
      return NextResponse.json({ availableSlots: [] });
    }
  }

  console.log('Final barbers to check:', barbersToCheck.map(b => b.barberInfo?.name));

  // Store slots per barber with their specific duration and availability settings
  const barberSlots: Record<string, { slots: string[], duration: number, barberInfo: Barber }> = {};

  function generateAvailableSlots(
    start: string,
    end: string,
    busy: { start: string; end: string }[],
    barberInfo: Barber,
    serviceDurationMinutes: number
  ): string[] {
    const timeZone = barberInfo.timeZone || 'America/Chicago';
    const slots: string[] = [];

    console.log(`🕒 Generating slots for ${barberInfo.name} with ${serviceDurationMinutes}min duration in ${timeZone}`);

    // Parse input dates as UTC, then convert to local timezone start of day
    const startDate = DateTime.fromISO(start, { zone: 'utc' }).setZone(timeZone).startOf('day');
    const endDate = DateTime.fromISO(end, { zone: 'utc' }).setZone(timeZone).startOf('day');

    console.log(`📅 Checking dates from ${startDate.toISODate()} to ${endDate.toISODate()}`);

    for (
      let day = startDate;
      day <= endDate;
      day = day.plus({ days: 1 })
    ) {
      // Get day of week for availability lookup - fix potential undefined issue
      const dayOfWeekLong = day.weekdayLong?.toLowerCase();
      console.log(`📆 Processing day: ${day.toISODate()} (${dayOfWeekLong})`);
      
      if (!dayOfWeekLong) {
        console.log('⚠️ Could not determine day of week, skipping');
        continue;
      }

      // Ensure we have a valid key for availability lookup
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      if (!validDays.includes(dayOfWeekLong)) {
        console.log(`⚠️ Invalid day of week: ${dayOfWeekLong}, skipping`);
        continue;
      }

      const dayOfWeek = dayOfWeekLong as keyof typeof barberInfo.availability;
      const dayAvailability = barberInfo.availability[dayOfWeek];

      console.log(`🔍 ${dayOfWeek} availability:`, {
        isActive: dayAvailability?.isActive,
        startTime: dayAvailability?.startTime,
        endTime: dayAvailability?.endTime,
        slotInterval: dayAvailability?.slotInterval
      });

      // Skip if barber is not available this day
      if (!dayAvailability?.isActive) {
        console.log(`❌ ${barberInfo.name} not available on ${dayOfWeek}`);
        continue;
      }

      // Parse barber's working hours for this day
      const startTimeParts = dayAvailability.startTime.split(':');
      const endTimeParts = dayAvailability.endTime.split(':');
      
      if (startTimeParts.length !== 2 || endTimeParts.length !== 2) {
        console.log(`⚠️ Invalid time format for ${dayOfWeek}: ${dayAvailability.startTime} - ${dayAvailability.endTime}`);
        continue;
      }

      const [startHour, startMinute] = startTimeParts.map(Number);
      const [endHour, endMinute] = endTimeParts.map(Number);
      
      const workStart = day.set({ hour: startHour, minute: startMinute });
      const workEnd = day.set({ hour: endHour, minute: endMinute });

      console.log(`⏰ Work hours: ${workStart.toFormat('HH:mm')} - ${workEnd.toFormat('HH:mm')}`);

      // Use barber's specific slot interval
      const slotInterval = dayAvailability.slotInterval || 15; // Default to 15 if undefined

      let slotsGeneratedForDay = 0;

      // Generate potential start times based on barber's slot interval
      for (
        let slotTime = workStart;
        slotTime.plus({ minutes: serviceDurationMinutes }) <= workEnd;
        slotTime = slotTime.plus({ minutes: slotInterval })
      ) {
        // Check if this time conflicts with barber's breaks
        const isInBreak = dayAvailability.breaks?.some((breakTime: { startTime: string; endTime: string }) => {
          const breakStartParts = breakTime.startTime.split(':');
          const breakEndParts = breakTime.endTime.split(':');
          
          if (breakStartParts.length !== 2 || breakEndParts.length !== 2) {
            console.log(`⚠️ Invalid break time format: ${breakTime.startTime} - ${breakTime.endTime}`);
            return false;
          }

          const [breakStartHour, breakStartMinute] = breakStartParts.map(Number);
          const [breakEndHour, breakEndMinute] = breakEndParts.map(Number);
          
          const breakStart = day.set({ hour: breakStartHour, minute: breakStartMinute });
          const breakEnd = day.set({ hour: breakEndHour, minute: breakEndMinute });
          
          const serviceStart = slotTime;
          const serviceEnd = slotTime.plus({ minutes: serviceDurationMinutes });
          
          // Check if service overlaps with break
          const overlaps = serviceStart < breakEnd && serviceEnd > breakStart;
          if (overlaps) {
            console.log(`🚫 Slot ${slotTime.toFormat('HH:mm')} conflicts with break ${breakStart.toFormat('HH:mm')}-${breakEnd.toFormat('HH:mm')}`);
          }
          return overlaps;
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
          const overlaps = busyInterval.overlaps(slotInterval);
          if (overlaps) {
            console.log(`🚫 Slot ${slotTime.toFormat('HH:mm')} conflicts with busy time`);
          }
          return overlaps;
        });

        if (isSlotAvailable) {
          slots.push(slotStartUtc.toISO()!);
          slotsGeneratedForDay++;
        }
      }

      console.log(`✅ Generated ${slotsGeneratedForDay} slots for ${dayOfWeek}`);
    }

    console.log(`🎯 Total slots generated for ${barberInfo.name}: ${slots.length}`);
    return slots;
  }

  // Process each barber with their specific duration and availability
  for (const serviceBarber of barbersToCheck) {
    const { barberId, duration } = serviceBarber;
    const barberInfo = serviceBarber.barberInfo;
    
    console.log(`🔄 Processing barber: ${barberInfo?.name} (${barberId}) with ${duration}min duration`);
    
    if (!barberInfo?.calendarId) {
      console.log(`❌ No calendar ID for ${barberInfo?.name || barberId}`);
      continue;
    }

    try {
      console.log(`📅 Checking busy times for barber: ${barberInfo.name} (${barberId})`);
      const busyRaw = await getBusyTimes(start, end, barberInfo.calendarId);
      console.log(`📊 Raw busy times count: ${busyRaw.length}`);
      
      const busy = busyRaw
        .filter(
          (p): p is { start: string; end: string } =>
            typeof p.start === 'string' && typeof p.end === 'string'
        )
        .map(p => ({ start: p.start, end: p.end }));

      console.log(`📊 Filtered busy times count: ${busy.length}`);

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
      console.error(`❌ Failed to get availability for ${barberInfo.name}:`, error);
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
    // Use case-insensitive lookup for barber data
    const barberKey = Object.keys(barberSlots).find(key => 
      key.toLowerCase() === selectedBarber.toLowerCase()
    );
    const barberData = barberKey ? barberSlots[barberKey] : undefined;
    
    if (barberData) {
      console.log(`🎯 Using slots for selected barber ${selectedBarber}: ${barberData.slots.length} slots`);
      barberData.slots.forEach(slot => {
        finalAvailableSlots.push({
          slot,
          barbers: [{ 
            barberId: barberKey!, 
            name: barberData.barberInfo.name,
            duration: barberData.duration 
          }],
          serviceDuration: barberData.duration
        });
      });
    } else {
      console.log(`❌ No slot data found for selected barber: ${selectedBarber}`);
      console.log('Available barber keys:', Object.keys(barberSlots));
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

  console.log('🏁 Final result - returning available slots:', finalAvailableSlots.length, 'total slots');

  return NextResponse.json({ 
    availableSlots: finalAvailableSlots,
    // For backward compatibility, return duration of first barber or default
    serviceDuration: barbersToCheck[0]?.duration || 30
  });
}