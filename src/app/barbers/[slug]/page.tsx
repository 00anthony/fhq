'use client';

import { notFound, useParams } from 'next/navigation';
import { barbers, Barber } from '@/data/barbers'; // adjust path if needed
import BarberCard from '@/components/BarberCard';
import GallaryGrid from '@/components/GallaryGrid';
import ReviewGrid from '@/components/ReviewGrid';
import { LazyMotion, domAnimation, m } from 'framer-motion';

export default function BarberPage() {
  const params = useParams() 
  const slug = params?.slug;

  if (!slug) return notFound();

  const barber: Barber | undefined = barbers.find(b => b.slug === slug);

  if (!barber) return notFound();

  return (
    <div className='bg-neutral-950 py-20 px-6'>
      {/* Header */}
      <LazyMotion features={domAnimation}>
        <m.div
          id="barber-heading"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className='text-4xl text-white uppercase text-center'>{barber.name}</h1>
          <div className="mt-4 mx-auto w-24 border-b-4 border-red-900"></div>
        </m.div>
      </LazyMotion>

      <div className="max-w-6xl mx-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Sidebar */}
        <div className="col-span-1 space-y-6">

          {/* Barber Card */}
          <BarberCard barber={barber} />

          {/* Bio */}
          <section>
            <h2 className="text-xl mb-2">About Me</h2>
            <p className="text-gray-400 mt-2">{barber.bio}</p>

          </section>

          {/* Skills */}
          <section>
            <h2 className="text-xl mb-2">Skills</h2>
            <ul className="list-disc list-inside text-gray-400">
              {barber.skills.map(skill => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>

          {/* Achievements */}
          <section>
            <h2 className="text-xl mb-2">Achievements</h2>
            <ul className="list-disc list-inside text-gray-400">
              {barber.achievements.map(ach => (
                <li key={ach}>{ach}</li>
              ))}
            </ul>
          </section>

        </div>

        {/* Right Content Area */}
        <div className="col-span-2 space-y-8">
          {/* Experience */}
          <section>
            <h2 className="text-2xl mb-2">Experience</h2>
            <p className="text-gray-400">{barber.experience}</p>
          </section>

          {/* Portfolio */}
          <section>
            <h2 className="text-2xl mb-4">Portfolio</h2>
            <GallaryGrid items={barber.workPics} showBarberName={false}  />
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-2xl mb-4">Reviews</h2>
            <ReviewGrid reviews={barber.reviews} />
          </section>
        </div>
      </div>
    </div>
  );
}
