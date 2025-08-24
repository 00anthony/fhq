'use client';

import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import BookingModal from '../Booking/BookingModal';

// Unified media type
type MediaItem = {
  type: 'image' | 'video';
  src: string;
  style?: string;
  barber?: string;
  barberId?: string | number;
};

type ModalGalleryProps = {
  media: MediaItem[];
  selectedIdx: number;
  onClose: () => void;
  showPrev: () => void;
  showNext: () => void;
};

const isVideo = (media: MediaItem) => media.type === 'video';

export default function ModalGallery({
  media,
  selectedIdx,
  onClose,
  showPrev,
  showNext,
}: ModalGalleryProps) {
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [media, selectedIdx]);

  const modalContent = (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        <m.div
          key={media[selectedIdx].src}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <m.div
            className="relative max-w-3xl w-full mx-4 max-h-[90vh]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {isVideo(media[selectedIdx]) ? (
              <video
                src={media[selectedIdx].src}
                playsInline
                muted
                autoPlay
                loop
                preload="metadata"
                controls
                className="w-full max-h-[90vh] rounded-lg object-contain"
              />
            ) : (
              <Image
                src={media[selectedIdx].src}
                alt="preview photo"
                width={1200}
                height={800}
                className="w-full max-h-[90vh] rounded-lg object-contain"
              />
            )}

            {/* CTA Button */}
            {media[selectedIdx].barber && (
              <div
                className="w-full text-center mt-4"
                onClick={onClose} // Clicking anywhere in this div closes modal
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent close on button click
                    setShowBooking(true);
                  }}
                  className="inline-block bg-red-900/50 hover:bg-red-900 backdrop-blur-sm text-white px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Book {media[selectedIdx].barber}
                </button>
              </div>
            )}



            {/* Modal Controls */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white text-xl bg-black/60 px-2 py-1 rounded-full hover:bg-black/80"
            >
              ✕
            </button>
            <button
              onClick={showPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full px-3 py-1 hover:bg-black/80 cursor-pointer"
            >
              <span className="relative -top-0.5 text-3xl leading-none">‹</span>
            </button>
            <button
              onClick={showNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full px-3 py-1 hover:bg-black/80 cursor-pointer"
            >
              <span className="relative -top-0.5 text-3xl leading-none">›</span>
            </button>
          </m.div>
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(
  <>
    {modalContent}
    {showBooking && media[selectedIdx].barber && (
      <BookingModal
        barberName={media[selectedIdx].barber}
        onClose={() => setShowBooking(false)}
      />
    )}
  </>,
  document.body
);

}
