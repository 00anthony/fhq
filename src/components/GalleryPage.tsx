'use client';

import { useState } from 'react';
import { GalleryGridProps } from '@/types/gallery';
import GallaryGrid from './GallaryGrid';
import BarberFilter from './BarberFilter';
import MultiSelectDropdown from './MultiSelectDropdown';

export default function GalleryGrid({ items, barbers }: GalleryGridProps) {
  const [barberFilter, setBarberFilter] = useState('All');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const groupedOptions = [
    { label: 'Hair Styles', options: ['Fade', 'Pompadour', 'Buzz Cut'] },
    { label: 'Beard Styles', options: ['Full Beard', 'Goatee', 'Stubble'] },
    { label: 'Equipment', options: ['Razor', 'Scissors', 'Clippers'] },
  ];

  // Filtering items by barber AND selectedFilters
  const filteredItems = items.filter(item => {
    if (barberFilter !== 'All' && item.barber !== barberFilter) return false;

    if (selectedFilters.length === 0) return true;

    const matchesHair = selectedFilters.some(filter => item.hairStyle?.includes(filter) ?? false);
    const matchesBeard = selectedFilters.some(filter => item.beardStyle?.includes(filter) ?? false);
    const matchesEquipment = selectedFilters.some(filter => item.equipment?.includes(filter) ?? false);

    return matchesHair || matchesBeard || matchesEquipment;
  });

  return (
    <section className="py-20 bg-neutral-950 text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl text-center">Gallery</h1>
        <div className="my-4 pb-4 mx-auto w-32 border-t-4 border-white"></div>

        {/* Filters Container */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          {/* Barber Filter - Left */}
          <BarberFilter
            barbers={['All', ...barbers]}
            selectedBarber={barberFilter}
            onSelect={setBarberFilter}
          />

          {/* Dropdown Filters - Right */}
          <MultiSelectDropdown
            groupedOptions={groupedOptions}
            selectedOptions={selectedFilters}
            onChange={setSelectedFilters}
            label="Filter Styles & Equipment"
          />
        </div>

        {/* Masonry grid w/ modal */}
        <GallaryGrid items={filteredItems} showBarberName={true} />

      </div>
    </section>
  );
}
