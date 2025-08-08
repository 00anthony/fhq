// components/ReviewSection.tsx
import React from "react";
import { Review } from "@/data/reviews"; // adjust the path if needed

type ReviewSectionProps = {
  reviews: Review[];
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews }) => {
  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl text-center ">
          What Our Customers Say
        </h2>
        <div className="w-24 h-1 bg-red-900 mx-auto mt-4 mb-10 rounded"></div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-neutral-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              {/* Star Rating (Optional) */}
              <div className="flex justify-center mb-2">
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <svg
                    key={starIdx}
                    className="w-4 h-4 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.176 3.617a1 1 0 00.95.69h3.801c.969 0 1.371 1.24.588 1.81l-3.073 2.23a1 1 0 00-.364 1.118l1.176 3.617c.3.921-.755 1.688-1.54 1.118l-3.073-2.23a1 1 0 00-1.175 0l-3.073 2.23c-.784.57-1.838-.197-1.539-1.118l1.175-3.617a1 1 0 00-.364-1.118l-3.073-2.23c-.783-.57-.38-1.81.588-1.81h3.8a1 1 0 00.951-.69l1.175-3.617z" />
                  </svg>
                ))}
              </div>

              <hr className="border-gray-500 my-4" />

              <p className="text-gray-400 text-base leading-relaxed italic">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <p className="text-sm text-gray-300 font-medium">
                    {review.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
