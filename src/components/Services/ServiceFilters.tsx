"use client";

import BarberFilter from "../Filters/BarberFilter";
import AnimatedDropdown from "../Filters/AnimatedDropdown";

type ServicesFiltersProps = {
  selectedBarberId: string;
  selectedCategory: string;
  onSelectBarber: (barberId: string) => void;
  onSelectCategory: (category: string) => void;
  barbers: { id: string; name: string }[];
  categories: string[];
};

export default function ServicesFilters({
  selectedBarberId,
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
        selectedBarberId={selectedBarberId}
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