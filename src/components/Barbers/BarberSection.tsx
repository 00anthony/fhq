'use client';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import BarberCard from './BarberCard';
import { barbers, Barber } from '@/data/barbers';

const BarberSection = () => {
  return (
    <LazyMotion features={domAnimation}>
      <section
        className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 "
        id="barbers"
        aria-labelledby="barbers-heading"
      >
        <m.div
          id="barber-heading"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className='text-4xl text-white uppercase text-center'>Meet Our Barbers</h1>
          <div className="mt-4 mx-auto w-24 border-b-4 border-red-900"></div>
        </m.div>

        <m.div
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        >
          {barbers.map((barber: Barber) => (
            <BarberCard key={barber.name} barber={barber} />
          ))}
        </m.div>
      </section>
    </LazyMotion>
  );
};

export default BarberSection;
