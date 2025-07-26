'use client';

import { motion } from 'framer-motion';
import  useMeasure  from '@/hooks/useMeasure'; 
import ThumbnailCarousel from '@/components/ThumbnailCarousel';
import type { Service } from '@/types/services'; 

type ExpandedServiceContentProps = {
  service: Service;
  onSelectMedia: (idx: number) => void;
};

export default function ExpandedServiceContent({
  service,
  onSelectMedia,
}: ExpandedServiceContentProps) {
  const [contentRef, contentHeight] = useMeasure<HTMLDivElement>();
  const formatPrice = (price: number | "FREE") =>
  typeof price === "number" ? `$${price}` : price;

  return (
    <motion.div
      key="expanded-wrapper"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: contentHeight, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      style={{ overflow: 'hidden' }}
    >
      <motion.div
        ref={contentRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="pt-4"
      >
        <p className="text-sm text-gray-400">{service.description}</p>
        <ul className="mt-3 text-sm text-gray-600">
          {service.barbers.map((b, index) => (
            <li key={index} className="flex justify-between pb-4">
              <span>{b.name}</span>
              <span>{`${formatPrice(b.price)} • ${b.duration}`}</span>
            </li>
          ))}
        </ul>
        {service.media && (
          <ThumbnailCarousel
            media={service.media}
            onSelect={onSelectMedia}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
