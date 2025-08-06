import React from 'react'
import { getPriceDisplay } from "@/lib/utils/serviceDisplay";
import { BarberOption } from "@/types/services";


type BarberTimeSelectProps = {
  availableBarbers: string[]
  selectedBarber: string
  onChange: (value: string) => void
  serviceBarbers: BarberOption[]
}

export function BarberTimeSelect({
  availableBarbers,
  selectedBarber,
  onChange,
  serviceBarbers,
}: BarberTimeSelectProps) {
  if (availableBarbers.length === 0) return null

  const priceDisplay = getPriceDisplay(serviceBarbers, selectedBarber)

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
            {selectedBarber} — {priceDisplay}
          </div>

          <label className="text-sm font-medium mb-1">
            Choose another barber (optional)
          </label>
          <select
            value={selectedBarber}
            onChange={(e) => onChange(e.target.value)}
            className="bg-neutral-800 border border-gray-300 p-2 rounded focus:outline-none transition cursor-pointer"
          >
            {availableBarbers.map((barber) => (
              <option key={barber} value={barber}>
                {barber} — {getPriceDisplay(serviceBarbers, barber)}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  )
}
