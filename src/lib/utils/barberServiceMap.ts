// lib/utils/barberServiceMap.ts
import { servicesData } from "@/data/services";

export const getBarberServiceMap = (): Record<string, string[]> => {
  const map: Record<string, Set<string>> = {};

  servicesData.forEach((service) => {
    service.barbers.forEach((barber) => {
      const name = barber.name;
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
