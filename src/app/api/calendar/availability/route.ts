import { NextRequest, NextResponse } from 'next/server'
import { getBusyTimes } from '@/lib/google-calendar'
import { servicesData } from '@/data/services'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  //const bookingId = searchParams.get('bookingId') ?? null | will be used for rescheduling same day/time diff service later
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

  // Step 1: Get all barbers who offer this service
  let barbersToCheck = servicesData
    .find(s => s.name === service)
    ?.barbers.map(b => b.name)
    .filter(name => barberCalendars[name]); // only include barbers with calendar ID

    console.log('Query received:', service);
    console.log('Selected barber:', selectedBarber)


  if (!barbersToCheck || barbersToCheck.length === 0) {
    return NextResponse.json({ availableSlots: [] });
  }

  console.log('🧑‍🔧 Barbers offering this service:', barbersToCheck);

  // Step 2: If a specific barber was selected, filter to just that one
  if (selectedBarber && selectedBarber !== 'any') {
    barbersToCheck = barbersToCheck.filter(b => b === selectedBarber);
  }

  console.log('Barber received', barbersToCheck)

  // Define working hours and slot duration
  const workingHours = { startHour: 9, endHour: 18 }
  const slotDurationMinutes = 30

  // Prepare a map of all barbers' available slots
  const slotMap: Record<string, Set<string>> = {}
  const allSlotsSet = new Set<string>()

  function generateAvailableSlots(
    start: string,
    end: string,
    busy: { start: string; end: string }[],
    workingHours: { startHour: number; endHour: number },
    slotDurationMinutes: number
  ): string[] {
    const slots: string[] = []

    const startDate = new Date(start)
    const endDate = new Date(end)

    for (
      let day = new Date(startDate);
      day <= endDate;
      day.setDate(day.getDate() + 1)
    ) {
      for (
        let hour = workingHours.startHour;
        hour < workingHours.endHour;
        hour++
      ) {
        for (
          let minute = 0;
          minute < 60;
          minute += slotDurationMinutes
        ) {
          const slot = new Date(day)
          slot.setHours(hour, minute, 0, 0)
          const slotStart = slot.getTime()
          const slotEnd = slotStart + slotDurationMinutes * 60 * 1000

          const isBusy = busy.some(({ start, end }) => {
            const busyStart = new Date(start).getTime()
            const busyEnd = new Date(end).getTime()
            return slotStart < busyEnd && slotEnd > busyStart
          })

          if (!isBusy) {
            slots.push(new Date(slotStart).toISOString())
          }
        }
      }
    }

    return slots
  }


  for (const barber of barbersToCheck) {
    const calendarId = barberCalendars[barber]
    if (!calendarId) continue

    try {
      console.log(`📅 Checking busy times for barber: ${barber}`);
      const busyRaw = await getBusyTimes(start, end, calendarId)
      const busy = busyRaw
        .filter(
          (p): p is { start: string; end: string } =>
            typeof p.start === 'string' && typeof p.end === 'string'
        )
        .map(p => ({ start: p.start, end: p.end }))

        const available = generateAvailableSlots(start, end, busy, workingHours, slotDurationMinutes)

      available.forEach((slot: string) => {
        if (!slotMap[slot]) slotMap[slot] = new Set()
        slotMap[slot].add(barber)
        allSlotsSet.add(slot)

        console.log(`✅ Available slots for ${barber}:`, available);
      })
    } catch (error) {
      console.error(`Failed to get availability for ${barber}:`, error)
    }
  }

  // Convert final result to array format
  const availableSlots = Array.from(allSlotsSet).sort().map(slot => ({
    slot,
    barbers: Array.from(slotMap[slot])
  }))

  console.log('Returning available slots:', availableSlots)

  return NextResponse.json({ availableSlots })
}
