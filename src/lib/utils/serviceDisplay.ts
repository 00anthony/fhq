// utils/serviceDisplay.ts
import { BarberOption } from "@/types/services";

export const getRange = (
  values: (string | number)[],
  { prefix = "", suffix = "" } = {}
): string => {
  const numericValues = values.map((v) =>
    typeof v === "string" ? parseInt(v) : v
  );

  if (numericValues.every((v) => v === 0)) return "FREE";

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);

  return min === max
    ? `${prefix}${min}${suffix}`
    : `${prefix}${min}${suffix} - ${prefix}${max}${suffix}`;
};

export const getPriceRange = (barbers: BarberOption[]): string => {
  const prices = barbers.map((b) => b.price);
  return getRange(prices, { prefix: "$" });
};

export const getDurationRange = (barbers: BarberOption[]): string => {
  const durations = barbers.map((b) => b.duration);
  return getRange(durations, { suffix: " min" });
};

export const getPriceDisplay = (
  serviceBarbers: BarberOption[],
  selectedBarber: string
): string => {
  const selectedBarberInfo = serviceBarbers.find(
    (b) => b.name.toLowerCase() === selectedBarber.toLowerCase()
  );

  if (
    selectedBarber.toLowerCase() !== "any barber" &&
    selectedBarberInfo !== undefined
  ) {
    return selectedBarberInfo.price === 0
      ? "FREE"
      : `$${selectedBarberInfo.price}`;
  }

  return getPriceRange(serviceBarbers);
};

export const getDurationDisplay = (
  serviceBarbers: BarberOption[],
  selectedBarber: string
): string => {
  const selectedBarberInfo = serviceBarbers.find(
    (b) => b.name.toLowerCase() === selectedBarber.toLowerCase()
  );

  if (
    selectedBarber.toLowerCase() !== "any barber" &&
    selectedBarberInfo !== undefined
  ) {
    // Convert number to string with "min" suffix
    return `${selectedBarberInfo.duration} min`;
  }

  return getDurationRange(serviceBarbers);
};
