"use client";

import BarberFilter from "./BarberFilter";
import AnimatedDropdown from "./AnimatedDropdown";

type ServicesFiltersProps = {
  selectedBarber: string;
  selectedCategory: string;
  onSelectBarber: (barber: string) => void;
  onSelectCategory: (category: string) => void;
  barbers: string[];
  categories: string[];
};

export default function ServicesFilters({
  selectedBarber,
  selectedCategory,
  onSelectBarber,
  onSelectCategory,
  barbers,
  categories,
}: ServicesFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
      {/* Barber Filter - Left */}
      <BarberFilter
        barbers={barbers}
        selectedBarber={selectedBarber}
        onSelect={onSelectBarber}
      />

      {/* Category Dropdown - Right */}
      <AnimatedDropdown
        label="All Services"
        options={categories}
        selected={selectedCategory}
        onSelect={onSelectCategory}
      />
    </div>
  );
}
