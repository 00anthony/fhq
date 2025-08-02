import { getBarberServiceMap } from "@/lib/utils/barberServiceMap";

type BarberSelectProps = {
  selected: string
  onChange: (value: string) => void
  barbers: string[]
  selectedService: string
}

export function BarberSelect({ selected, onChange, barbers, selectedService }: BarberSelectProps) {
  const barberServices = getBarberServiceMap();
  return (
    <div id="barber-section" className="flex flex-col scroll-mt-20">
      <label htmlFor="barber-select" className="text-sm font-medium mb-1">Select Barber</label>
      <select
        id="barber-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-800 border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 transition"
      >
        <option value="" disabled>Select a Barber</option>
        {barbers.map((name) => {
          const isAvailable = name === 'Any Barber'
            ? true
            : selectedService
              ? barberServices[name]?.includes(selectedService)
              : true

          return (
            <option
              key={name}
              value={name === 'Any Barber' ? 'any' : name}
              disabled={!isAvailable}
            >
              {name}
              {!isAvailable ? ' (Not available for this service)' : ''}
            </option>
          )
        })}
      </select>
    </div>
  )
}
