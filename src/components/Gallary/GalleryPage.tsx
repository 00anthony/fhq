'use client';

import { useState } from 'react';
import { GalleryGridProps } from '@/types/gallery';
import GallaryGrid from './GallaryGrid';
import BarberFilter from '../Filters/BarberFilter';
import MultiSelectDropdown from '../Filters/MultiSelectDropdown';
import { allBarbers } from '@/data/barbers';

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedBarberId, setSelectedBarberId] = useState('any');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const groupedOptions = [
    { label: 'Hair Styles', options: ['Fade', 'Pompadour', 'Buzz Cut'] },
    { label: 'Beard Styles', options: ['Full Beard', 'Goatee', 'Stubble'] },
    { label: 'Equipment', options: ['Razor', 'Scissors', 'Clippers'] },
  ];

  // Filtering items by barber ID AND selectedFilters
  const filteredItems = items.filter(item => {
    // Check barber match using ID
    if (selectedBarberId !== 'any' && item.barberId !== selectedBarberId) return false;

    if (selectedFilters.length === 0) return true;

    const matchesHair = selectedFilters.some(filter => item.hairStyle?.includes(filter) ?? false);
    const matchesBeard = selectedFilters.some(filter => item.beardStyle?.includes(filter) ?? false);
    const matchesEquipment = selectedFilters.some(filter => item.equipment?.includes(filter) ?? false);

    return matchesHair || matchesBeard || matchesEquipment;
  });

  return (
    <section className="py-20 bg-neutral-950 text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl text-center uppercase">Gallery</h1>
        <div className="mt-4 mb-8 mx-auto w-24 border-b-4 border-red-900"></div>

        {/* Filters Container */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          {/* Barber Filter - Left */}
          <BarberFilter
            barbers={allBarbers}
            selectedBarberId={selectedBarberId}
            onSelect={setSelectedBarberId}
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