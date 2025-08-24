import React from 'react';
import Intro from "@/components/About/Intro";
import ReviewSection from "@/components/Reviews/ReviewSection";
import AdvantagesSection from '@/components/About/AdvantageSection';
import { barbers } from "@/data/barbers";
import { advantages } from '@/data/advantages';

const AboutPage = () => {
  return (
    <div className="bg-neutral-900 py-20">

      {/* Header w/ padding to match other pages */}
      <div className='py-8'> 
        <h1 className="text-4xl uppercase text-center text-white">About Us</h1>
        <div className="mt-4 mx-auto w-24 border-b-4 border-red-900"></div>
      </div>
      
      <div className='max-w-6xl mx-auto px-4 space-y-20'> 

        <div className='bg-neutral-800 rounded-xl'>
          <Intro />
        </div>

        <AdvantagesSection advantages={advantages} />

        <ReviewSection reviews={barbers.flatMap(barber => barber.reviews)} />

            
      </div>

    </div>
  );
};

export default AboutPage;
