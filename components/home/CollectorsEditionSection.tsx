"use client";

import React, { useRef } from 'react';
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

  // Filter collector / limited / top luxury pieces
  const collectorProducts = React.useMemo(() => {
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

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#FAF7F2] py-10 sm:py-14 border-b border-[#E8DCCF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section Matching Figma */}
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-9">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#2A1E17] font-serif tracking-tight">
            Collector’s Edition
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#57534D] font-sans font-medium tracking-wide mt-2">
            Handpicked pieces from the world’s finest eyewear brands.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          
          {/* Scroll Left Button */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-30 w-10 h-10 rounded-full bg-white text-[#2A1E17] shadow-xl border border-[#E8DCCF] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-[#C86A28] hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
            aria-label="Previous collector frame"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scroll Right Button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-30 w-10 h-10 rounded-full bg-white text-[#2A1E17] shadow-xl border border-[#E8DCCF] flex items-center justify-center opacity-85 group-hover/carousel:opacity-100 hover:bg-[#C86A28] hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
            aria-label="Next collector frame"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontal Product List */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 px-1 -mx-1"
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
