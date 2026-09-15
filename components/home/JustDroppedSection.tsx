"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Product } from '@/types';
import { HomeProductCard } from './HomeProductCard';

interface JustDroppedSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAll: (tab?: 'new' | 'bestsellers') => void;
}

export const JustDroppedSection: React.FC<JustDroppedSectionProps> = ({
  products,
  onSelectProduct,
  onViewAll,
}) => {
  const [activeTab, setActiveTab] = useState<'new' | 'bestsellers'>('new');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Filter Just Dropped / New Arrivals (Prioritize exact Figma products)
  const justDroppedProducts = useMemo(() => {
    const figmaIds = [
      'figma-cartier-blue-rimless',
      'figma-brown-gradient-rimless',
      'figma-fastrack-black-wayfarer',
      'figma-fastrack-gold-oval',
      'figma-cartier-gold-rectangle',
    ];

    const matched = figmaIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    const otherNewArrivals = products.filter((p) => !figmaIds.includes(p.id) && p.isNewArrival);
    return [...matched, ...otherNewArrivals];
  }, [products]);

  // Filter Best Sellers
  const bestSellerProducts = useMemo(() => {
    const figmaIds = [
      'figma-cartier-gold-rectangle',
      'figma-fastrack-black-wayfarer',
      'figma-cartier-blue-rimless',
      'figma-fastrack-gold-oval',
      'figma-brown-gradient-rimless',
    ];

    const matched = figmaIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    const otherBestSellers = products.filter((p) => !figmaIds.includes(p.id) && p.isBestSeller);
    return [...matched, ...otherBestSellers];
  }, [products]);

  const displayedProducts = activeTab === 'new' ? justDroppedProducts : bestSellerProducts;

  const updateScrollState = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Reset scroll on tab change
    el.scrollLeft = 0;
    updateScrollState();

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    const timer = setTimeout(updateScrollState, 150);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
      clearTimeout(timer);
    };
  }, [activeTab, displayedProducts.length, updateScrollState]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#FAF7F2] py-8 sm:py-10 border-b border-[#E8DCCF] select-none">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Centered Tab Toggle Matching Figma */}
        <div className="flex justify-center items-center gap-6 mb-7">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-2 rounded-[6px] text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              activeTab === 'new'
                ? 'bg-[#211712] text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            JUST DROPPED
          </button>
          <button
            onClick={() => setActiveTab('bestsellers')}
            className={`px-6 py-2 rounded-[6px] text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              activeTab === 'bestsellers'
                ? 'bg-[#211712] text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            BEST SELLERS
          </button>
        </div>

        {/* Product Slider Container with Perfectly Centered Nav Arrows & Compact Gutter */}
        <div className="relative px-3 sm:px-5 lg:px-6">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 sm:-left-2 lg:-left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center hover:bg-[#C86A28] hover:text-white hover:border-[#C86A28] transition-all duration-200 focus:outline-none cursor-pointer active:scale-95"
              aria-label="Previous Products"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 sm:-right-2 lg:-right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center hover:bg-[#C86A28] hover:text-white hover:border-[#C86A28] transition-all duration-200 focus:outline-none cursor-pointer active:scale-95"
              aria-label="Next Products"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Scrollable Track */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3.5 sm:gap-4.5 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayedProducts.map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>

        {/* Centered View More Button Matching Figma */}
        <div className="flex justify-center mt-6 sm:mt-7">
          <button
            onClick={() => onViewAll(activeTab)}
            className="bg-[#BFA693] hover:bg-[#A88B77] text-white font-medium text-xs tracking-wider px-8 py-2 rounded-full shadow-xs transition-all duration-200 focus:outline-none active:scale-95 cursor-pointer"
          >
            View More
          </button>
        </div>
      </div>
    </section>
  );
};
