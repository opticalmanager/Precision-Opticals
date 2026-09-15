"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { HomeProductCard } from './HomeProductCard';

interface CollectorsEditionSectionProps {
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onExploreCollection?: () => void;
}

export const CollectorsEditionSection: React.FC<CollectorsEditionSectionProps> = ({
  products = [],
  onSelectProduct = () => {},
  onExploreCollection = () => {},
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Filter collector / limited / top luxury pieces
  const collectorProducts = useMemo(() => {
    const priorityIds = [
      'figma-brown-gradient-rimless',
      'figma-fastrack-black-wayfarer',
      'figma-fastrack-gold-oval',
      'figma-cartier-blue-rimless',
      'figma-cartier-gold-rectangle',
      'cartier-premiere-ct0012o',
      'tom-ford-dax-0751-01v'
    ];

    const matched = priorityIds
      .map((slug) => products.find((p) => p.id === slug))
      .filter((p): p is Product => p !== undefined);

    if (matched.length >= 4) return matched;
    return products.slice(0, 6);
  }, [products]);

  const updateScrollState = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    const timer = setTimeout(updateScrollState, 150);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      clearTimeout(timer);
    };
  }, [collectorProducts.length, updateScrollState]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#FAF7F2] py-10 sm:py-14 border-b border-[#E8DCCF] select-none">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Header Section Matching Figma */}
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#2A1E17] font-serif tracking-tight">
            Collector’s Edition
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#57534D] font-sans font-medium tracking-wide mt-2">
            Handpicked pieces from the world’s finest eyewear brands.
          </p>
        </div>

        {/* Carousel Container with Perfectly Centered Nav Arrows & Compact Gutter */}
        <div className="relative px-3 sm:px-5 lg:px-6">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-0 sm:-left-2 lg:-left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center hover:bg-[#C86A28] hover:text-white hover:border-[#C86A28] transition-all duration-200 focus:outline-none cursor-pointer active:scale-95"
              aria-label="Previous collector frame"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 sm:-right-2 lg:-right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center hover:bg-[#C86A28] hover:text-white hover:border-[#C86A28] transition-all duration-200 focus:outline-none cursor-pointer active:scale-95"
              aria-label="Next collector frame"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Horizontal Product List */}
          <div
            ref={scrollRef}
            className="flex gap-3.5 sm:gap-4.5 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {collectorProducts.map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>

        {/* View More Button Matching Figma taupe pill */}
        <div className="flex justify-center mt-7 sm:mt-9">
          <button
            onClick={onExploreCollection}
            className="bg-[#BFA693] hover:bg-[#A98E7B] text-white font-medium text-sm sm:text-base px-9 py-2.5 rounded-full shadow-sm transition-all duration-300 focus:outline-none active:scale-95 cursor-pointer"
          >
            View More
          </button>
        </div>

      </div>
    </section>
  );
};
