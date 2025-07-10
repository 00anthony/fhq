'use client';

import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { WorkMedia } from '../data/barbers'; 


type ModalGalleryProps = {
  media: WorkMedia[];
  selectedIdx: number;
  onClose: () => void;
  showPrev: () => void;
  showNext: () => void;
};

const isVideo = (media: WorkMedia) => media.type === 'video';

export default function ModalGallery({
  media,
  selectedIdx,
  onClose,
  showPrev,
  showNext,
}: ModalGalleryProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const modalContent = (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        <m.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // closes on background click
        >
          <m.div
            className="relative max-w-3xl w-full mx-4 max-h-[90vh]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onClick={(e) => e.stopPropagation()} // prevent inner clicks from bubbling
          >
            {isVideo(media[selectedIdx]) ? (
              <video
                src={media[selectedIdx].src}  // <-- Use .src here
                playsInline
                muted
                autoPlay
                preload="metadata"
                controls
                className="w-full max-h-[90vh] rounded-lg object-contain"
              />
            ) : (
              <Image
                src={media[selectedIdx].src}  // <-- Use .src here
                alt="Work preview"
                width={1200}
                height={800}
                className="w-full max-h-[90vh] rounded-lg object-contain"
              />
            )}

            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white text-xl bg-black/60 px-2 py-1 rounded-full hover:bg-black/80"
            >
              ✕
            </button>
            <button
              onClick={showPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full px-3 py-1 hover:bg-black/80"
            >
              <span className="relative -top-0.5 text-3xl leading-none">‹</span>
            </button>
            <button
              onClick={showNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full px-3 py-1 hover:bg-black/80"
            >
              <span className="relative -top-0.5 text-3xl leading-none">›</span>
            </button>
          </m.div>
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(modalContent, document.body);
}
