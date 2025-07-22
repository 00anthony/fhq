'use client';

import { useState } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import { GalleryGridProps } from '@/types/gallery';
import ModalGallery from '@/components/ModalGallery';
import BarberFilter from './BarberFilter';
import MultiSelectDropdown from './MultiSelectDropdown';

// Masonry breakpoints
const breakpointColumnsObj = {
  default: 3, // Desktop
  1024: 2, // Tablet
  640: 1, // Mobile
};

export default function GalleryGrid({ items, barbers }: GalleryGridProps) {
  const [barberFilter, setBarberFilter] = useState('All');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

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


  // Modal navigation helpers
  const openModal = (index: number) => setSelectedIdx(index);
  const closeModal = () => setSelectedIdx(null);
  const showPrev = () =>
    setSelectedIdx((prev) =>
      prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null,
    );
  const showNext = () =>
    setSelectedIdx((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null));

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

        {/* Masonry layout */}
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => openModal(index)}
              className="cursor-pointer relative group rounded-xl overflow-hidden shadow-xl mb-6"
            >
              {item.type === 'video' ? (
                <video
                  src={item.src}
                  poster={item.poster}
                  className="w-full h-auto object-cover rounded-xl"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={item.src}
                  alt={`${item.style} by ${item.barber}`}
                  width={400}
                  height={400}
                  className="object-cover w-full h-auto rounded-xl"
                />
              )}

              <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <div className="text-center">
                  <h2 className="text-xl">{item.style}</h2>
                  <p className="mt-1 text-sm">{item.barber}</p>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      </div>

      {/* Modal */}
      {selectedIdx !== null && (
        <ModalGallery
          media={filteredItems.map((item) => ({
            type: item.type,
            src: item.src,
            barber: item.barber,
            barberId: item.barberId,
            style: item.style,
          }))}
          selectedIdx={selectedIdx}
          onClose={closeModal}
          showPrev={showPrev}
          showNext={showNext}
        />
      )}
    </section>
  );
}
