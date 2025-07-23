type BarberSelectProps = {
  selected: string
  onChange: (value: string) => void
  barbers: string[]
}

export function BarberSelect({ selected, onChange, barbers }: BarberSelectProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor="barber-select" className="text-sm font-medium mb-1">Select Barber</label>
      <select
        id="barber-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-800 border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 transition"
      >
        <option value="" disabled hidden>
          Select Barber
        </option>
        {barbers.map((name) => (
          <option 
            key={name} 
            value={name === 'Any Barber' ? 'any' : name} 
          >
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
