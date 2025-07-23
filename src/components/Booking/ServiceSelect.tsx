type ServiceSelectProps = {
  selected: string
  onChange: (value: string) => void
  services: string[]
}

export function ServiceSelect({ selected, onChange, services }: ServiceSelectProps) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Select Service</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-800 border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 transition"
      >
        <option value="">Select Service</option>
        {services.map((service) => (
          <option key={service} value={service}>
            {service}
          </option>
        ))}
      </select>
    </div>
  )
}
