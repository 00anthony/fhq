import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/react-datepicker-custom.css'
import { DateTime } from 'luxon'
import { getBarberById } from '@/data/barbers'

type DateTimePickerFieldProps = {
  selected: Date | null
  onChange: (date: Date | null) => void
  availableTimes: { time: string; barbers: string[] }[]
  selectedBarber: string 
  selectedService: string
  isLoading: boolean
}

export function DateTimePickerField({
  selected,
  onChange,
  availableTimes,
  selectedBarber,
  selectedService,
  isLoading,
}: DateTimePickerFieldProps) {
  const now = DateTime.now()

  console.log('All availableTimes (raw):', availableTimes);
  console.log('Sample available time:', availableTimes[0]);
  console.log('Sample barbers array:', availableTimes[0]?.barbers);

  // Helper function to get barber name from ID
  const getBarberNameFromId = (barberId: string): string => {
    if (barberId === 'any') return 'any'
    try {
      const barber = getBarberById(barberId)
      return barber.name
    } catch {
      return barberId // fallback to ID if barber not found
    }
  }

  console.log('Selected barber ID:', selectedBarber)

  // 1. Filter availableTimes by selected barber - use ID for comparison
  const filteredTimesByBarber = availableTimes.filter(({ barbers }) => {
    console.log('Checking slot barbers:', barbers, 'against:', selectedBarber);
    
    if (selectedBarber === 'any') return true;
    
    // Handle if barbers is undefined or empty
    if (!barbers || !Array.isArray(barbers)) {
      console.log('⚠️ Barbers is not an array or is empty');
      return false;
    }
    
    // Compare barber IDs directly (barbers array contains IDs like ['jj'])
    const matches = barbers.includes(selectedBarber);
    console.log('Match result:', matches);
    return matches;
  });

  console.log('Filtered times by barber:', filteredTimesByBarber.length)

  // 2. Map times to DateTime objects (local zone) and filter future times
  const availableTimesDates = filteredTimesByBarber
    .map(t => {
      // Parse ISO string in UTC, then convert to local zone
      const utcDT = DateTime.fromISO(t.time, { zone: 'utc' })
      const localDT = utcDT.setZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
      return { ...t, localDT }
    })
    .filter(({ localDT }) => localDT > now)

  console.log('Available times after timezone conversion:', availableTimesDates.length)

  // 3. Filter times by selected date (compare only the date parts, ignoring time)
  const timeSlotsForSelectedDate = selected
    ? availableTimesDates.filter(({ localDT }) =>
        localDT.hasSame(DateTime.fromJSDate(selected), 'day')
      )
    : []

  // 4. When selecting date from calendar, reset time to start of day local
  const handleDateChange = (date: Date | null) => {
    if (!date) return onChange(null)
    const dt = DateTime.fromJSDate(date).startOf('day')
    onChange(dt.toJSDate())
  }

  // 5. When clicking time slot, pass full Date object for that local time
  const handleTimeClick = (localDT: DateTime) => {
    onChange(localDT.toJSDate())
  }

  const isMissingBarber = !selectedBarber
  const isMissingService = !selectedService
  const shouldDisableCalendar = isMissingBarber || isMissingService  

  // Debug logs - checking if slot dates are from the same day in local time
  console.log("Selected Date (JS):", selected);
  console.log("Selected Date (Luxon):", selected ? DateTime.fromJSDate(selected).toISO() : null);
  console.log("All available slot dates (local):", availableTimesDates.map(t => t.localDT.toISODate()));
  console.log('Times for selected date:', timeSlotsForSelectedDate.length)

  return (
    <div id='date-section' className="flex flex-col space-y-3 scroll-mt-24">
      <label className="text-sm font-medium">Select Date & Time</label>

      <div className="min-w-[20rem] -mx-4 sm:mx-0">
        <div className="relative overflow-hidden">
          <DatePicker
            selected={selected}
            onChange={handleDateChange}
            minDate={new Date()}
            maxDate={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
            inline
            calendarClassName="font-sans"
          />

          {shouldDisableCalendar && (
            <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl pointer-events-auto">
              <p className="text-sm text-gray-500 px-4 text-center">
                {isMissingBarber && isMissingService
                  ? 'Please select a barber and a service to view available times.'
                  : isMissingBarber
                  ? 'Please select a barber.'
                  : 'Please select a service.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Available time slots */}
      {isLoading ? (
        <p className="text-gray-400 text-sm italic">Loading available times...</p>
      ) : timeSlotsForSelectedDate.length > 0 ? (
        <div id='time-section' className="grid grid-cols-3 gap-2 mt-2 scroll-mt-20">
          {timeSlotsForSelectedDate.map(({ localDT, barbers, time }) => (
            <button
              key={time}
              type="button"
              onClick={() => handleTimeClick(localDT)}
              aria-pressed={selected?.getTime() === localDT.toJSDate().getTime()}
              className={`px-3 py-2 rounded-xl border text-sm transition cursor-pointer ${
                selected?.getTime() === localDT.toJSDate().getTime()
                  ? 'bg-red-900 text-white border-gray-300'
                  : 'border-gray-300 text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              {localDT.toFormat('hh:mm a')}
              <span className="block text-xs text-gray-400">
                {barbers.length === 1 
                  ? getBarberNameFromId(barbers[0])  // Convert ID to name for display
                  : `${barbers.length} barbers`
                }
              </span>
            </button>
          ))}
        </div>
      ) : (
        shouldDisableCalendar || isLoading || timeSlotsForSelectedDate.length !== 0 ? null : (
          <p className="text-gray-500 text-sm">
            {selected
              ? '*No available time slots for this day.'
              : 'Select a date to view available times.'}
          </p>
        )
      )}
    </div>
  )
}