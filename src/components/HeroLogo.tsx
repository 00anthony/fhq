import { useEffect, useState } from "react";
import Image from "next/image";

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
      src="/images/hero-logo-mobile.webp"
      alt="faded headquarters"
      width={500}
      height={150}
      priority
      className="mx-auto -mt-4 lg:-mt-20"
    />
  ) : (
    <svg
      viewBox="0 0 1000 500"
      className="overflow-visible w-[90%] max-w-[1000px] h-auto mx-auto -mt-4 lg:-mt-20"
      xmlns="http://www.w3.org/2000/svg"
      data-aos="fade-up"
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
    </svg>
  );
};

export default HeroLogo;
