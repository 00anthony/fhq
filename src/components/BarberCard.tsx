'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import dynamic from 'next/dynamic';
import { memo } from 'react'; //memoised card so array(barber.ts) must be static so this needs to be removed if reviews are fetched dynamically later on
import ThumbnailCarousel from "@/components/ThumbnailCarousel";
import { useRouter } from 'next/navigation';
import { Barber } from "@/data/barbers";
import StarRating from './StarRating';
import ReviewsModal from './ReviewsModal';


type BarberCardProps = {
  barber: Barber;
};

const ModalGallery = dynamic(() => import('./ModalGallery'), {
  ssr: false,          // keep out of the server bundle
  loading: () => null, // no flash
});

const BarberCard = ({
  barber
}: BarberCardProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showReviews, setShowReviews] = useState(false);

  const showPrev = () =>
    setSelectedIdx((i) => (i !== null ? (i > 0 ? i - 1 : barber.workPics.length - 1) : 0));

  const showNext = () =>
    setSelectedIdx((i) => (i !== null ? (i < barber.workPics.length - 1 ? i + 1 : 0) : 0));

  const router = useRouter();

  return (
    <>
      <div
        aria-label={`View ${barber.name}'s profile`}
        className="group relative w-full max-w-lg h-[550px] rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 focus:scale-105 cursor-pointer"
        tabIndex={0}
        onClick={() => router.push(`/barbers/${barber.slug}`)}
      >
        <Image
          src={barber.profilePic}
          alt={`${barber.name}'s profile`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="object-cover absolute inset-0 z-0"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-80 group-hover:opacity-20 group-focus:opacity-60 transition-opacity duration-300"></div>
        
        <LazyMotion features={domAnimation}>
          <m.h3
            className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {barber.name}
          </m.h3>
        </LazyMotion>
        

        {/* ------------ Footer content (non-link actions) ------------ */}

        <div 
          className="absolute bottom-0 w-full px-4 pb-4 pt-24 bg-gradient-to-t from-neutral-950 flex flex-col items-center group/thumbs"
        >
          <ThumbnailCarousel
            media={barber.workPics}
            onSelect={(idx, e) => {
              e?.stopPropagation?.();
              setSelectedIdx(idx)
            }}
          />

          {/* Socials */}
          <div className="flex gap-4 text-2xl mb-4">
            <a 
              href={barber.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-pink-600 hover:text-pink-700"
              onClick={(e) => e.stopPropagation()}
            >
              <FaInstagram />
            </a>
            <a 
              href={barber.tiktok} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-black hover:text-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <FaTiktok className='text-white'/>
            </a>
            
            {/* ⭐ Star rating and review count */}
            <div onClick={(e) => e.stopPropagation()}>
              <StarRating
                rating={barber.rating}
                reviewCount={barber.reviewCount}
                onReviewClick={() => setShowReviews(true)}
              />
            </div>
            
          </div>

          {/* BOOK NOW BUTTON */}
          <Link 
            href={barber.bookLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-neutral-100 text-black font-semibold py-2 px-6 rounded-2xl hover:bg-white transition"
            onClick={(e) => e.stopPropagation()}
          >
            Book Now
          </Link>
        </div>
      </div>

      {selectedIdx !== null && (
        <ModalGallery
          media={barber.workPics}
          selectedIdx={selectedIdx}
          onClose={() => setSelectedIdx(null)}
          showPrev={showPrev}
          showNext={showNext}
        />
      )}

      {/* Reviews Modal */}
      {showReviews && (
        <ReviewsModal
          barberName={barber.name}
          reviews={barber.reviews}
          onClose={() => setShowReviews(false)}
        />
      )}
    </>
  );
};

export default memo(BarberCard);