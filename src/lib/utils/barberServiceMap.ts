// lib/utils/barberServiceMap.ts
import { servicesData } from "@/data/services";
import { getBarberById } from "@/data/barbers";

export const getBarberServiceMap = (): Record<string, string[]> => {
  const map: Record<string, Set<string>> = {};

  servicesData.forEach((service) => {
    service.barbers.forEach((serviceBarber) => {
      const barber = getBarberById(serviceBarber.barberId);
      if (!barber) return; // Skip if barber doesn't exist
      
      const name = barber.name; // Use actual barber name from barbers.ts
      if (!map[name]) map[name] = new Set();
      map[name].add(service.name);
    });
  });

  // Add 'any' barber with all services
  const allServices = servicesData.map((s) => s.name);
  const finalMap: Record<string, string[]> = {
    any: allServices,
  };

  for (const barber in map) {
    finalMap[barber] = Array.from(map[barber]);
  }

  return finalMap;
};

// New helper: Get service map by barber ID instead of name
export const getBarberServiceMapById = (): Record<string, string[]> => {
  const map: Record<string, Set<string>> = {};

  servicesData.forEach((service) => {
    service.barbers.forEach((serviceBarber) => {
      const barberId = serviceBarber.barberId;
      if (!map[barberId]) map[barberId] = new Set();
      map[barberId].add(service.name);
    });
  });

  // Add 'any' barber with all services
  const allServices = servicesData.map((s) => s.name);
  const finalMap: Record<string, string[]> = {
    any: allServices,
  };

  for (const barberId in map) {
    finalMap[barberId] = Array.from(map[barberId]);
  }

  return finalMap;
};