"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import ExpandedServiceContent from "@/components/Services/ExpandedServiceContent";
import { Service } from "@/types/services";
import { getPriceDisplay, getDurationDisplay, } from "@/lib/utils/serviceDisplay";

type ServiceCardProps = {
  service: Service;
  selectedBarber: string;
  expanded: boolean;
  onToggle: () => void;
  onSelectMedia: (idx: number) => void;
};

export default function ServiceCard({
  service,
  expanded,
  onToggle,
  onSelectMedia,
  selectedBarber,
}: ServiceCardProps) {

  const priceDisplay = getPriceDisplay(service.barbers, selectedBarber);
  const durationDisplay = getDurationDisplay(service.barbers, selectedBarber);

  return (
    <div
      onClick={onToggle}
      className={`bg-neutral-950 border border-neutral-700 p-6 rounded-2xl shadow-md transition cursor-pointer ${
        expanded ? "shadow-xl" : "hover:shadow-lg"
      }`}
    >
      {/* Header with arrow */}
      <div className="flex justify-between items-center select-none">
        <h3 className="text-xl">{service.name}</h3>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-block text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-chevron-down"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Duration: {durationDisplay}
      </p>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-bold">{priceDisplay}</span>
        <Link
          href="/booking"
          onClick={(e) => e.stopPropagation()} // Prevent toggle on button click
          className="border border-neutral-700 text-gray-300 hover:text-white hover:border-b-gray-600 duration-300 px-4 py-2 rounded-lg transition"
        >
          Book Now
        </Link>
      </div>

      <AnimatePresence>
        {expanded && (
          <ExpandedServiceContent
            service={service}
            onSelectMedia={onSelectMedia}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
