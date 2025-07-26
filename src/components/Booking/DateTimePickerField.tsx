import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/react-datepicker-custom.css'


type DateTimePickerFieldProps = {
  selected: Date | null
  onChange: (date: Date | null) => void
  availableTimes: { time: string; barbers: string[] }[]
}

export function DateTimePickerField({
  selected,
  onChange,
  availableTimes,
}: DateTimePickerFieldProps) {
  const now = new Date()

  // Extract available dates & group times by day
  const availableTimesDates = availableTimes
    .map((t) => ({ ...t, date: new Date(t.time) }))
    .filter(({ date }) => date > now)


  // When selecting a date, reset time to midnight
  const handleDateChange = (date: Date | null) => {
    if (!date) return onChange(null)
    const newDate = new Date(date)
    newDate.setHours(0, 0, 0, 0)
    onChange(newDate)
  }

  // Filter time slots for selected date
  const timeSlotsForSelectedDate = selected
    ? availableTimesDates.filter(
        ({ date }) =>
          date.toDateString() === selected.toDateString() && date > now
      )
    : []


  const handleTimeClick = (time: Date) => {
    onChange(time) // full Date with time selected
  }

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
          {timeSlotsForSelectedDate.map(({ time, date, barbers }) => (
        <button
          key={time}
          type="button"
          onClick={() => handleTimeClick(date)}
          aria-pressed={selected?.getTime() === date.getTime()}
          className={`px-3 py-2 rounded-xl border text-sm transition ${
            selected?.getTime() === date.getTime()
              ? 'bg-red-900 text-white border-neutral-900'
              : 'border-gray-300 text-neutral-300 hover:bg-neutral-900'
          }`}
        >
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
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
