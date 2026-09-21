"use client";

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { HomeProductCard } from './HomeProductCard';
import { useDraggableRow } from '@/hooks/useDraggableRow';

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
  const {
    containerRef,
    canScrollLeft,
    canScrollRight,
    scrollByWholeRow,
    dragHandlers,
  } = useDraggableRow();

  // Filter collector / limited / top luxury pieces
  const collectorProducts = useMemo(() => {
    const limited = products.filter((p) => p.isLimitedEdition);
    if (limited.length >= 8) return limited;
    const luxury = products.filter(
      (p) =>
        p.isLimitedEdition ||
        p.price > 4000 ||
        p.brand?.toLowerCase().includes('cartier') ||
        p.brand?.toLowerCase().includes('lindberg') ||
        p.brand?.toLowerCase().includes('gucci') ||
        p.brand?.toLowerCase().includes('maybach')
    );
    if (luxury.length >= 8) return luxury;
    return products.length > 0 ? products : [];
  }, [products]);

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
              onClick={() => scrollByWholeRow('left')}
              className="absolute left-0 sm:-left-2 lg:-left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center hover:bg-[#C86A28] hover:text-white hover:border-[#C86A28] transition-all duration-200 focus:outline-none cursor-pointer active:scale-95"
              aria-label="Previous collector frame"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={() => scrollByWholeRow('right')}
              className="absolute right-0 sm:-right-2 lg:-right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center hover:bg-[#C86A28] hover:text-white hover:border-[#C86A28] transition-all duration-200 focus:outline-none cursor-pointer active:scale-95"
              aria-label="Next collector frame"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Horizontal Product List with Mouse Drag-to-Scroll */}
          <div
            ref={containerRef}
            {...dragHandlers}
            className="flex gap-3.5 sm:gap-4.5 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 px-1 cursor-grab active:cursor-grabbing select-none"
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
