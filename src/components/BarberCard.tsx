'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import dynamic from 'next/dynamic';
import { memo } from 'react'; //memoised card so array(barber.ts) must be static
import type { WorkMedia } from '../data/barbers'; 


type BarberCardProps = {
  name?: string;
  profilePic?: string;
  workPics?: WorkMedia[]; // <- UPDATED
  instagram?: string;
  tiktok?: string;
  bookLink?: string;
};

const ModalGallery = dynamic(() => import('./ModalGallery'), {
  ssr: false,          // keep out of the server bundle
  loading: () => null, // no flash
});

const BarberCard = ({
  name = 'Unnamed Barber',
  profilePic = 'https://via.placeholder.com/300x300',
  workPics = [],
  instagram = '#',
  tiktok = '#',
  bookLink = '#',
}: BarberCardProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  const showPrev = () =>
    setSelectedIdx((i) => (i !== null ? (i > 0 ? i - 1 : workPics.length - 1) : 0));

  const showNext = () =>
    setSelectedIdx((i) => (i !== null ? (i < workPics.length - 1 ? i + 1 : 0) : 0));

  const isVideo = (media: WorkMedia) => media.type === 'video';


  return (
    <>
      <div
        className="group relative w-full max-w-lg h-[550px] rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 focus:scale-105"
        tabIndex={0}
      >
        <Image
          src={profilePic}
          alt={`${name}'s profile`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="object-cover absolute inset-0 z-0"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/40 opacity-100 group-hover:opacity-60 transition-opacity duration-300"></div>
        <LazyMotion features={domAnimation}>
          <m.h3
            className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {name}
          </m.h3>
        </LazyMotion>
        

        {/* ------------ Thumbnail Strip with Arrows ------------ */}

        <div className="absolute bottom-0 w-full px-4 pb-4 pt-24 bg-gradient-to-t from-white/70 flex flex-col items-center group/thumbs">
          {/* Scroll buttons (fixed in place) */}
          <button
            onClick={() =>
              thumbStripRef.current && (thumbStripRef.current.scrollLeft -= 150)
            }
            className="hidden group-hover/thumbs:block absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white bg-black/60 px-2 py-1 rounded-md hover:bg-black/80"
          >
            <span className="relative -top-0.5 text-xl leading-none">‹</span>
          </button>

          <button
            onClick={() =>
              thumbStripRef.current && (thumbStripRef.current.scrollLeft += 150)
            }
            className="hidden group-hover/thumbs:block absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white bg-black/60 px-2 py-1 rounded-md hover:bg-black/80"
          >
            <span className="relative -top-0.5 text-xl leading-none">›</span>
          </button>
          {/* Scrollable thumbnails */}
          <div
            ref={thumbStripRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-2 mb-4 w-full scrollbar-hide"
            tabIndex={0}
            role="group"
          >
            {workPics.map((media, idx) =>
              media.type === 'video' ? (
                <video
                  key={idx}
                  src={media.src}
                  poster={media.poster}
                  aria-label={`Video work ${idx + 1} by ${name}`}
                  playsInline
                  muted
                  preload="metadata"
                  onClick={() => setSelectedIdx(idx)}
                  className="h-20 w-28 flex-shrink-0 rounded-lg object-cover cursor-pointer snap-start"
                />
              ) : (
                <Image
                  key={idx}
                  src={media.src}
                  alt={`work ${idx + 1}`}
                  width={112}
                  height={80}
                  loading="lazy"
                  onClick={() => setSelectedIdx(idx)}
                  className="h-20 w-28 flex-shrink-0 rounded-lg object-cover cursor-pointer snap-start"
                />
              )
            )}
          </div>


          <div className="flex gap-4 text-2xl mb-4">
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
              <FaInstagram />
            </a>
            <a href={tiktok} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-800">
              <FaTiktok />
            </a>
          </div>

          <Link href={bookLink} className="bg-black text-white py-2 px-6 rounded-2xl hover:bg-gray-800 transition">
            Book Now
          </Link>
        </div>
      </div>

      {selectedIdx !== null && (
        <ModalGallery
          media={workPics}
          selectedIdx={selectedIdx}
          onClose={() => setSelectedIdx(null)}
          showPrev={showPrev}
          showNext={showNext}
        />
      )}

    </>
  );
};

export default memo(BarberCard);
