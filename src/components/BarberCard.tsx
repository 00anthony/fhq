"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';


type BarberCardProps = {
  name?: string;
  profilePic?: string;
  workPics?: string[];
  instagram?: string;
  tiktok?: string;
  bookLink?: string;
};

const BarberCard = ({
  name = 'Unnamed Barber',
  profilePic = 'https://via.placeholder.com/300x300',
  workPics = [],
  instagram = '#',
  tiktok = '#',
  bookLink = '#',
}: BarberCardProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const showPrev = () => {
    setSelectedIdx((prev) =>
      prev !== null ? (prev > 0 ? prev - 1 : workPics.length - 1) : 0
    );
  };

  const showNext = () => {
    setSelectedIdx((prev) =>
      prev !== null ? (prev < workPics.length - 1 ? prev + 1 : 0) : 0
    );
  };

  const isVideo = (src: string): boolean =>
    src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.mov');

  return (
    <>
      <div
        className="group relative w-full max-w-sm sm:max-w-md md:max-w-lg h-[450px] sm:h-[500px] md:h-[550px] lg:h-[600px] rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 focus:scale-105 active:scale-105"
        tabIndex={0}
      >
        <Image
          src={profilePic}
          alt={`${name}'s profile`}
          className="w-full h-full object-cover absolute inset-0 z-0"
          fill
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-90 group-hover:opacity-60 group-focus:opacity-60 group-active:opacity-60 transition-opacity duration-300"></div>

        <motion.h3
          className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-lg md:text-xl drop-shadow-md text-center z-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 1.0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        >
          {name}
        </motion.h3>

        <div className="absolute bottom-0 z-10 w-full px-4 pb-4 pt-24 text-center flex flex-col items-center bg-gradient-to-t from-white/80 ">
          <div className="flex overflow-x-auto gap-2 mb-4 w-full scrollbar-hide">
            {workPics.map((src, idx) =>
              isVideo(src) ? (
                <video
                  key={idx}
                  src={src}
                  className="h-20 w-28 flex-shrink-0 rounded-lg object-cover cursor-pointer"
                  muted
                  loop
                  playsInline
                  onClick={() => setSelectedIdx(idx)}
                />
              ) : (
                <Image
                  key={idx}
                  src={src}
                  alt={`cut ${idx + 1}`}
                  height={230}
                  width={257}
                  className="h-20 w-28 flex-shrink-0 object-cover rounded-lg cursor-pointer"
                  onClick={() => setSelectedIdx(idx)}
                />
              )
            )}
          </div>

          <div className="flex justify-center gap-4 text-2xl mb-4">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700"
            >
              <FaInstagram />
            </a>
            <a
              href={tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-gray-800"
            >
              <FaTiktok />
            </a>
          </div>

          <Link
            href={bookLink}
            className="bg-black text-white py-2 px-6 rounded-full hover:bg-gray-800 transition"
          >
            Book Now
          </Link>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdx(null)}
          >
            <motion.div
              className="relative max-w-3xl max-h-[90vh] mx-4 w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo(workPics[selectedIdx]) ? (
                <video
                  src={workPics[selectedIdx]}
                  className="rounded-lg max-h-[90vh] w-full object-contain"
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <Image
                  src={workPics[selectedIdx]}
                  alt="Work Preview"
                  height={230}
                  width={257}
                  className="rounded-lg max-h-[90vh] w-full object-contain"
                />
              )}

              <button
                onClick={() => setSelectedIdx(null)}
                className="absolute top-2 right-2 text-white text-3xl bg-black bg-opacity-60 px-2 rounded-full hover:bg-opacity-90"
              >
                ✕
              </button>

              <button
                onClick={showPrev}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-3xl bg-black bg-opacity-60 px-3 py-1 rounded-full hover:bg-opacity-90"
              >
                ‹
              </button>

              <button
                onClick={showNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-3xl bg-black bg-opacity-60 px-3 py-1 rounded-full hover:bg-opacity-90"
              >
                ›
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BarberCard;
