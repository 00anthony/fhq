"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from "next/image";

type NetworkInformation = {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
};
        
const backgroundUrl = '/images/hero-frame.avif';

const Hero = () => {
  const [shouldLoadVideo, setShouldLoadVideo] = useState<boolean>(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);

  useEffect(() => {
    const isWide = window.innerWidth > 768;

    const nav = navigator as Navigator & {
      connection?: NetworkInformation;
    };

    const connection = nav.connection;
    const isSaveData = connection?.saveData === true;

    if (isWide || (!isWide && !isSaveData)) {
      // Test if autoplay is allowed
      const testVideo = document.createElement("video");
      testVideo.src = "/videos/Hero-Video.mp4";
      testVideo.muted = true;
      testVideo.playsInline = true;

      const playPromise = testVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            testVideo.pause(); // Clean up
            setShouldLoadVideo(true);
          })
          .catch(() => {
            // Autoplay blocked, fallback to image
            setShouldLoadVideo(false);
          });
      } else {
        setShouldLoadVideo(true); // Autoplay allowed
      }
    }
  }, []);


  const handleVideoLoad = (): void => {
    setIsVideoLoaded(true);
  };

  return (
    <div className="hero relative w-full h-screen overflow-hidden" id="hero">
      {/* Static Background Image */}
      <div className="absolute top-0 left-0 w-full h-full z-0 transition-opacity duration-1000">
        <Image
          src={backgroundUrl}
          alt="Background"
          fill
          quality={75} // adjust for file size
          priority // optional: keeps LCP fast if this is above the fold
          className={`object-cover object-center transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      {/* Background Video */}
      {shouldLoadVideo && (
        <video
          className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src="/videos/Hero-Video.mp4"
          poster="/images/hero-frame.avif"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleVideoLoad}
          controls={false} // Explicitly ensure no controls
        />
      )}

      {/* Content Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-start sm:justify-center pt-20 sm:pt-0">
        
        <Image
          src="/images/hero-logo.avif" // Use the higher-res AVIF you exported
          alt="Faded Headquarters"
          width={748} 
          height={222}
          priority
          sizes="(max-width: 768px) 360px, 748px" 
          className="w-[90%] max-w-[800px] h-auto mx-auto mb-20 lg:-mt-40"
        />

        <Link
          href="/#booking"
          className="relative z-10 font-gotisch text-white bg-red-900/50 backdrop-blur-sm hover:bg-red-900 inline-flex items-center justify-center px-6 py-2 -mt-12 md:-mt-28 md:text-2xl text-lg shadow-xl rounded-2xl sm:w-auto sm:mb-0 group transition duration-300 ease-in-out"
        >
          book haircut
          <svg
            className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </section>
    </div>
  );
};

export default Hero;
