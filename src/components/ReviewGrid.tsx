// components/ReviewGrid.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Review } from '@/data/barbers';
import StarRating from './StarRating';

type ReviewGridProps = {
  reviews: Review[];
};

const ReviewGrid: React.FC<ReviewGridProps> = ({ reviews }) => {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
      {reviews.map((review, idx) => (
        <div
          key={idx}
          className="bg-neutral-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          <Image
            src={`https://i.pravatar.cc/48?u=${review.user}`}
            alt={review.user}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div className="flex-1">
            <div className="flex flex-col">
              <span className="font-semibold">{review.user}</span>
              <div className="flex items-center space-x-2">
                <StarRating rating={review.rating} />
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-300">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewGrid;
