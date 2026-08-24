import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: string;
  imageUrl: string;
  categoryFilter?: string;
  brandFilter?: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 'see-beyond',
    imageUrl: '/images/banner_see_beyond_1785153512408.jpg',
    categoryFilter: 'sunglasses',
  },
  {
    id: 'eyewear-every-you',
    imageUrl: '/images/banner_every_you_1785153527777.jpg',
    categoryFilter: 'sunglasses',
  },
  {
    id: 'theo-eyewear',
    imageUrl: '/images/banner_theo_eyewear_1785153543549.jpg',
    brandFilter: 'theo',
  },
  {
    id: 'vision-redefined',
    imageUrl: '/images/banner_new_arrival_1785154858163.jpg',
    categoryFilter: 'eyeglasses',
  },
];

interface HeroSliderProps {
  onSelectSlideCategory: (category?: string, brand?: string) => void;
  onOpenAiStylist: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  onSelectSlideCategory,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (idx: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIdx(idx);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((currentIdx + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIdx, goToSlide]);

  const prevSlide = () => {
    goToSlide(currentIdx === 0 ? HERO_SLIDES.length - 1 : currentIdx - 1);
  };

  const nextSlide = () => {
    goToSlide((currentIdx + 1) % HERO_SLIDES.length);
  };

  const currentSlide = HERO_SLIDES[currentIdx];

  return (
    <div
      className="relative w-full overflow-hidden cursor-pointer"
      style={{ height: 'calc(100vh - 160px)', minHeight: '400px', maxHeight: '800px' }}
      onClick={() =>
        onSelectSlideCategory(currentSlide.categoryFilter, currentSlide.brandFilter)
      }
    >
      {/* Slides */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: index === currentIdx ? 1 : 0 }}
        >
          <img
            src={slide.imageUrl}
            alt={`Precision Optics Collection ${index + 1}`}
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
        </div>
      ))}

      {/* Navigation Arrows - subtle, Gem Opticians style */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
      </button>

      {/* Pagination Dots - bottom center, minimal */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIdx
                ? 'w-7 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
