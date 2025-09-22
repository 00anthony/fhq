import { getBarberServiceMapById } from "@/lib/utils/barberServiceMap";

type BarberSelectProps = {
  selected: string
  onChange: (value: string) => void
  barbers: Array<{ id: string; name: string }>  // Changed to use objects
  selectedService: string
}

export function BarberSelect({ selected, onChange, barbers, selectedService }: BarberSelectProps) {
  const barberServices = getBarberServiceMapById(); // Use ID-based map

  return (
    <div id="barber-section" className="flex flex-col scroll-mt-20">
      <label htmlFor="barber-select" className="text-sm font-medium mb-1">Select Barber</label>
      <select
        id="barber-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-800 border border-gray-300 p-2 rounded focus:outline-none transition cursor-pointer"
      >
        <option value="" disabled>Select a Barber</option>
        {barbers.map((barber) => {
          const isAvailable = barber.id === 'any'
            ? true
            : selectedService
              ? barberServices[barber.id]?.includes(selectedService)
              : true
          
          return (
            <option
              key={barber.id}
              value={barber.id}  // Use ID as value
              disabled={!isAvailable}
            >
              {barber.name}  {/* Display name to user */}
              {!isAvailable ? ' (Not available for this service)' : ''}
            </option>
          )
        })}
      </select>
    </div>
  )
}