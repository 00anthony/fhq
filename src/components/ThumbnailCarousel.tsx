'use client';

import { useRef } from 'react';
import Image from 'next/image';

type ThumbnailCarouselProps = {
  media: { src: string; type?: 'image' | 'video'; poster?: string }[];
  onSelect?: (idx: number) => void;
};

const ThumbnailCarousel = ({ media, onSelect }: ThumbnailCarouselProps) => {
  const thumbStripRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full group/thumbs">
      {/* Left Arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();  // Prevent click from parent container
          if (thumbStripRef.current) {
            thumbStripRef.current.scrollLeft -= 150;
          }

        }}
        className="hidden group-hover/thumbs:block absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white bg-black/60 px-2 py-1 rounded-md hover:bg-black/80"
      >
        ‹
      </button>

      {/* Right Arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();  // Prevent click from parent container
          if (thumbStripRef.current) {
            thumbStripRef.current.scrollLeft += 150;
          }

        }}
        className="hidden group-hover/thumbs:block absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white bg-black/60 px-2 py-1 rounded-md hover:bg-black/80"
      >
        ›
      </button>

      {/* Scrollable thumbnails */}
      <div
        ref={thumbStripRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-2 mb-4 w-full scrollbar-hide"
        tabIndex={0}
        role="group"
      >
        {media.map((m, idx) =>
          m.type === 'video' ? (
            <video
              key={idx}
              src={m.src}
              poster={m.poster}
              aria-label={`Video ${idx + 1}`}
              playsInline
              muted
              preload="metadata"
              onClick={(e) => {
                e.stopPropagation();  // Prevent click from parent container
                if (onSelect) {
                  onSelect(idx);
                }

              }}
              className="h-20 w-28 flex-shrink-0 rounded-lg object-cover cursor-pointer snap-start"
            />
          ) : (
            <Image
              key={idx}
              src={m.src}
              alt={`Thumbnail ${idx + 1}`}
              width={112}
              height={80}
              loading="lazy"
              onClick={(e) => {
                e.stopPropagation();  // Prevent click from parent container
                if (onSelect) {
                  onSelect(idx);
                }
              }}
              className="h-20 w-28 flex-shrink-0 rounded-lg object-cover cursor-pointer snap-start"
            />
          )
        )}
      </div>
    </div>
  );
};

export default ThumbnailCarousel;
