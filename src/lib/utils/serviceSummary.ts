import { servicesData } from "@/data/services"

export function getServiceSummary(
  serviceName: string,
  selectedBarber: string,
  selectedBarberForTime?: string
) {
  const resolvedBarber =
    selectedBarber.toLowerCase() === 'any' ? selectedBarberForTime : selectedBarber

  const fullService = servicesData.find(s => s.name === serviceName)
  const barberDetails = fullService?.barbers.find(b => b.name === resolvedBarber)

  if (!fullService || !barberDetails) return null

  return {
    name: fullService.name,
    price: barberDetails.price,
    duration: barberDetails.duration 
  }
}