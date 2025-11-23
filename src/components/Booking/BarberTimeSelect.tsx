import React from 'react'
import { getPriceDisplay } from "@/lib/utils/serviceDisplay";
import { BarberOption } from "@/data/services";

type BarberTimeSelectProps = {
  availableBarbers: Array<{ barberId: string; name: string; duration: number }> // Updated type
  selectedBarber: string // This is still a barber ID
  onChange: (value: string) => void // This will receive a barber ID
  serviceBarbers: BarberOption[]
}

export function BarberTimeSelect({
  availableBarbers,
  selectedBarber,
  onChange,
  serviceBarbers,
}: BarberTimeSelectProps) {
  if (availableBarbers.length === 0) return null

  // Find the selected barber's name for display
  const selectedBarberInfo =
    availableBarbers.find(b => b.barberId === selectedBarber) || availableBarbers[0];

  const selectedBarberName = selectedBarberInfo?.name || "Unassigned";


  const priceDisplay = getPriceDisplay(serviceBarbers, selectedBarber) // Pass barber ID to price function

  return (
    <div className="flex flex-col">
      {availableBarbers.length === 1 ? (
        <div>
          <label className="text-sm font-medium mb-1">Assigned Barber</label>
          <div className="text-neutral-300 px-2 py-1 border border-gray-300 rounded">
            {availableBarbers[0].name}
          </div>
        </div>
      ) : (
        <>
          <label className="text-sm font-medium mb-1">Assigned Barber</label>
          <div className="text-neutral-300 px-2 py-1 border border-gray-300 rounded mb-2">
            {selectedBarberName} — {priceDisplay}
          </div>

          <label className="text-sm font-medium mb-1">
            Choose another barber (optional)
          </label>
          <select
            value={selectedBarber} // This is the barber ID
            onChange={(e) => onChange(e.target.value)} // This passes the barber ID
            className="bg-neutral-800 border border-gray-300 p-2 rounded focus:outline-none transition cursor-pointer"
          >
            {availableBarbers.map((barber) => (
              <option key={barber.barberId} value={barber.barberId}>
                {barber.name} — {getPriceDisplay(serviceBarbers, barber.barberId)}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  )
}