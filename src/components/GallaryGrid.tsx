'use client';

import { useState } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import { WorkMedia } from '@/data/barbers';
import ModalGallery from './ModalGallery';

type MediaItem = WorkMedia & {
  style: string;
  barber?: string;
};

interface GallaryGridProps {
  items: MediaItem[];
  showBarberName?: boolean; // default true
}

const breakpointColumnsObj = {
  default: 3,
  1024: 2,
  640: 1,
};

export default function GallaryGrid({
  items,
  showBarberName = true,
}: GallaryGridProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const openModal = (idx: number) => setSelectedIdx(idx);
  const closeModal = () => setSelectedIdx(null);
  const showPrev = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx - 1 + items.length) % items.length);
  };

  const showNext = () => {
    if (selectedIdx === null) return;
    setSelectedIdx((selectedIdx + 1) % items.length);
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => openModal(idx)}
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
                {showBarberName && item.barber && (
                  <p className="text-sm mt-1">{item.barber}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </Masonry>

      {/* Modal */}
        {selectedIdx !== null && (
          <ModalGallery
            media={items.map((item) => ({
              type: item.type,
              src: item.src,
              barber: item.barber,
              style: item.style,
            }))}
            selectedIdx={selectedIdx}
            onClose={closeModal}
            showPrev={showPrev}
            showNext={showNext}
          />
        )}
    </>
    
  );
}
