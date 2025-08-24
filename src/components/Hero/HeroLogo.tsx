// Deprecated: This file is kept for backup purposes only. Not used in the current build.
//this file detects screen size: mobile-.avif, desktop-.svg
'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from 'framer-motion';


const HeroLogo = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's `md` breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile ? (
    <Image
      src="/images/hero-logo.avif"
      alt="faded headquarters"
      width={500}
      height={150}
      priority
      className="mx-auto -mt-4 lg:-mt-20"
    />
  ) : (
    <LazyMotion features={domAnimation}>
      <m.svg
        viewBox="0 0 1000 500"
        className="overflow-visible w-[90%] max-w-[1000px] h-auto mx-auto -mt-4 lg:-mt-20"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <defs>
          <path
            id="arcPath"
            d="M 100,250 A 400,200 0 0,1 900,250"
            fill="none"
          />
        </defs>
        <text
          fontSize="120"
          className="font-gotisch fill-white"
          textAnchor="middle"
          fontFamily="'Grenze Gotisch', serif"
        >
          <textPath href="#arcPath" startOffset="50%">
            faded headquarters
          </textPath>
        </text>
      </m.svg>
    </LazyMotion>

  );
};

export default HeroLogo;
