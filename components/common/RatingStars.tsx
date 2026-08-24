import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 to 5
  maxStars?: number;
  showScore?: boolean;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  showScore = true,
  reviewCount,
  size = 'sm'
}) => {
  const iconSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="inline-flex items-center gap-1.5 font-sans">
      <div className="flex items-center text-amber-500">
        {Array.from({ length: maxStars }).map((_, index) => {
          const filled = index + 1 <= Math.floor(rating);
          const half = !filled && index < rating;

          return (
            <Star
              key={index}
              className={`${iconSize} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-stone-300'
              }`}
            />
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-bold text-stone-800 ml-0.5">{rating.toFixed(1)}</span>
      )}

      {reviewCount !== undefined && (
        <span className="text-[11px] text-stone-500">({reviewCount} reviews)</span>
      )}
    </div>
  );
};
