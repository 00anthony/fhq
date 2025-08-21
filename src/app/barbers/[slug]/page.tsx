import { notFound } from 'next/navigation';
import { barbers, Barber } from '@/data/barbers'; // adjust path if needed
import BarberCard from '@/components/BarberCard';
import GallaryGrid from '@/components/GallaryGrid';
import ReviewGrid from '@/components/ReviewGrid';


// ✅ Updated type for Next.js 15 - params is now a Promise
type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// ✅ Generate all barber slugs at build time
export async function generateStaticParams() {
  return barbers.map((barber) => ({
    slug: barber.slug,
  }));
}

export default async function BarberPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) return notFound();

  const barber: Barber | undefined = barbers.find(b => b.slug === slug);

  if (!barber) return notFound();

  return (
    <div className='bg-neutral-950 py-20 px-6'>
      {/* Header */}
        <div
          id="barber-heading"
          className=''
        >
          <h1 className='text-4xl text-white uppercase text-center'>{barber.name}</h1>
          <div className="mt-4 mx-auto w-24 border-b-4 border-red-900"></div>
        </div>

      <div className="max-w-6xl mx-auto py-6 grid grid-cols-1 lg:grid-cols-3 sm:gap-8">

        {/* Left Sidebar */}
        <div className="col-span-1 space-y-6">

          {/* Barber Card */}
          <BarberCard barber={barber} />

          {/* Bio */}
          <section>
            <h2 className="text-2xl mb-2">About Me</h2>
            <p className="text-gray-400 mt-2">{barber.bio}</p>

          </section>

          {/* Skills */}
          <section>
            <h2 className="text-2xl mb-2">Skills</h2>
            <ul className="list-disc list-inside text-gray-400">
              {barber.skills.map(skill => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>

          {/* Achievements */}
          <section>
            <h2 className="text-2xl mb-2">Achievements</h2>
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
            <h2 className="text-2xl mb-2 mt-6 sm:mt-0">Experience</h2>
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
