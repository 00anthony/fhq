// components/StarRating.tsx
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

type StarRatingProps = {
  rating: number;
  reviewCount?: number;
  onReviewClick?: () => void; // optional click handler for review count
};

export default function StarRating({ rating, reviewCount, onReviewClick }: StarRatingProps) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-500 w-3 h-3" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-500 w-3 h-3" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-500 w-3 h-3" />);
    }
  }

  return (
    <div className="flex items-center space-x-1 cursor-default">
      {stars}
      {reviewCount !== undefined && (
        <button
          onClick={onReviewClick}
          className="ml-2 text-xs text-blue-600 hover:underline cursor-pointer"
        >
          ({reviewCount})
        </button>
      )}
    </div>
  );
}
