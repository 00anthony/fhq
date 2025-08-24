import { useEffect } from "react";
import Image from "next/image";
import { Review } from "@/data/barbers";
import StarRating from "./StarRating";

type ReviewsModalProps = {
  barberName: string;
  reviews: Review[];
  onClose: () => void;
};

export default function ReviewsModal({ barberName, reviews, onClose }: ReviewsModalProps) {
  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  // Lock scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={onClose}
    >
      <div 
      className="bg-neutral-900 rounded-lg shadow-lg max-w-lg w-full p-6"
      onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl ">{barberName} Reviews</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-400 text-xl cursor-pointer transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Average Rating Summary */}
        <div className="flex flex-col items-center mb-6">
          <span className="text-4xl font-bold">{averageRating}</span>
          <StarRating rating={parseFloat(averageRating)}  />
          <span className="text-sm text-gray-500 mt-1">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Reviews list */}
        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
          {reviews.map((review, i) => (
            <div key={i} className="flex items-start space-x-4 py-2 border-t border-t-neutral-800">
              {/* Profile Picture */}
              <Image
                src={`https://i.pravatar.cc/48?u=${review.user}`}
                alt={review.user}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex flex-col ">
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
      </div>
    </div>
  );
}
