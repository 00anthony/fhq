import React from 'react';
import Intro from "@/components/Intro";
import ReviewSection from "@/components/ReviewSection";
import AdvantagesSection from '@/components/AdvantageSection';
import { reviews } from "@/data/reviews";
import { advantages } from '@/data/advantages';

const AboutPage = () => {
  return (
    <div className="bg-neutral-900  py-20 space-y-16">

      <div className='max-w-6xl mx-auto px-4 space-y-20'> 

        <div className='bg-neutral-800 rounded-xl'>
          <Intro />
        </div>

        <AdvantagesSection advantages={advantages} />

        <div className='bg-neutral-800 rounded-xl text-neutral-100'>
          <ReviewSection reviews={reviews} />
        </div>
            
      </div>

    </div>
  );
};

export default AboutPage;
