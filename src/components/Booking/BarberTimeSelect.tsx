import React from 'react'

type BarberTimeSelectProps = {
  availableBarbers: string[]
  selectedBarber: string
  onChange: (value: string) => void
}

export function BarberTimeSelect({
  availableBarbers,
  selectedBarber,
  onChange,
}: BarberTimeSelectProps) {
  if (availableBarbers.length === 0) return null

  return (
    <div className="flex flex-col">
      {availableBarbers.length === 1 ? (
        <div>
          <label className="text-sm font-medium mb-1">Assigned Barber</label>
          <div className="text-neutral-300 px-2 py-1 border border-gray-300 rounded">
            {availableBarbers[0]}
          </div>
        </div>
      ) : (
        <>
          <label className="text-sm font-medium mb-1">Assigned Barber</label>
          <div className="text-neutral-300 px-2 py-1 border border-gray-300 rounded mb-2">
            {selectedBarber}
          </div>

          <label className="text-sm font-medium mb-1">
            Choose another barber (optional)
          </label>
          <select
            value={selectedBarber}
            onChange={(e) => onChange(e.target.value)}
            className="bg-neutral-800 border border-gray-300 p-2 rounded focus:outline-none focus:ring-1 transition"
          >
            {availableBarbers.map((barber) => (
              <option key={barber} value={barber}>
                {barber}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  )
}
