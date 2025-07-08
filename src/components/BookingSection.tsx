'use client';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import SectionHeader from './SectionHeader';
import BarberCard from './BarberCard';
import { barbers, Barber } from '../data/barbers';

const BookingSection = () => {
  return (
    <LazyMotion features={domAnimation}>
      <section
        className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8"
        id="booking"
        aria-labelledby="booking-heading"
      >
        <m.div
          id="booking-heading"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        >
          <SectionHeader title="Booking" />
        </m.div>

        <m.div
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        >
          {barbers.map((barber: Barber) => (
            <BarberCard key={barber.name} {...barber} />
          ))}
        </m.div>
      </section>
    </LazyMotion>
  );
};

export default BookingSection;
