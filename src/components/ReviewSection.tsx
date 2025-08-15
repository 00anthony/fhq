// components/ReviewSection.tsx
'use client';

import React from 'react';
import { Review } from '@/data/barbers';
import AverageRating from './AverageRating';
import ReviewGrid from './ReviewGrid';

type ReviewSectionProps = {
  reviews: Review[];
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews }) => {
  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl text-center">What Our Customers Say</h2>
        <div className="w-24 h-1 bg-red-900 mx-auto mt-4 mb-10 rounded"></div>

        <div className='bg-neutral-800 rounded-xl text-neutral-100 p-6'>
          <AverageRating reviews={reviews} />
          <ReviewGrid reviews={reviews} />
        </div>
        
      </div>
    </section>
  );
};

export default ReviewSection;
