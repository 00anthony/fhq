import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/react-datepicker-custom.css'
import { DateTime } from 'luxon'

type DateTimePickerFieldProps = {
  selected: Date | null
  onChange: (date: Date | null) => void
  availableTimes: { time: string; barbers: string[] }[]
  selectedBarber: string  // <-- add this prop
}

export function DateTimePickerField({
  selected,
  onChange,
  availableTimes,
  selectedBarber,
}: DateTimePickerFieldProps) {
  const now = DateTime.now()

  console.log('All availableTimes (raw):', availableTimes);

  // 1. Filter availableTimes by selected barber first
  const filteredTimesByBarber = availableTimes.filter(({ barbers }) => 
    selectedBarber.toLowerCase() === 'any' || barbers.includes(selectedBarber)
  )

  // 2. Map times to DateTime objects (local zone) and filter future times
  const availableTimesDates = filteredTimesByBarber
    .map(t => {
      // Parse ISO string in UTC, then convert to local zone
      const utcDT = DateTime.fromISO(t.time, { zone: 'utc' })
      const localDT = utcDT.setZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
      return { ...t, localDT }
    })
    .filter(({ localDT }) => localDT > now)

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

  //checking if slot dates are from the same day in local time
  console.log("Selected Date (JS):", selected);
  console.log("Selected Date (Luxon):", selected ? DateTime.fromJSDate(selected).toISO() : null);
  console.log("All available slot dates (local):", availableTimesDates.map(t => t.localDT.toISODate()));


  // Debug logs (remove or comment out after testing)
  console.log('Selected barber:', selectedBarber)
  console.log('Available times filtered by barber and date:', timeSlotsForSelectedDate.map(t => t.localDT.toISO()))

  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium">Select Date & Time</label>
      <DatePicker
        selected={selected}
        onChange={handleDateChange}
        minDate={new Date()}
        maxDate={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
        inline
        calendarClassName="font-sans"
      />

      {/* Available time slots */}
      {timeSlotsForSelectedDate.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {timeSlotsForSelectedDate.map(({ localDT, barbers, time }) => (
            <button
              key={time}
              type="button"
              onClick={() => handleTimeClick(localDT)}
              aria-pressed={selected?.getTime() === localDT.toJSDate().getTime()}
              className={`px-3 py-2 rounded-xl border text-sm transition ${
                selected?.getTime() === localDT.toJSDate().getTime()
                  ? 'bg-red-900 text-white border-gray-300'
                  : 'border-gray-300 text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              {localDT.toFormat('hh:mm a')}
              <span className="block text-xs text-gray-400">
                {barbers.length === 1 ? barbers[0] : `${barbers.length} barbers`}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mt-2">
          {selected
            ? '*No available time slots for this day.'
            : 'Select a date to view available times.'}
        </p>
      )}
    </div>
  )
}
