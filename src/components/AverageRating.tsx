// components/AverageRating.tsx
'use client';

import React from 'react';
import { Review } from '@/data/barbers';
import StarRating from './StarRating';

type AverageRatingProps = {
  reviews: Review[];
};

const AverageRating: React.FC<AverageRatingProps> = ({ reviews }) => {
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="flex flex-col items-center mb-6">
      <span className="text-4xl font-bold">{averageRating}</span>
      <StarRating rating={parseFloat(averageRating)} />
      <span className="text-sm text-gray-500 mt-1">
        {reviews.length} review{reviews.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
};

export default AverageRating;
