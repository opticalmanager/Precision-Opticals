"use client";

import React, { useState, useRef, useMemo } from 'react';
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#FAF7F2] py-8 sm:py-10 border-b border-[#E8DCCF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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

        {/* Product Slider Container with Floating Nav Arrows */}
        <div className="relative group/carousel">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 text-stone-700 hover:text-stone-950 flex items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer"
            aria-label="Previous Products"
          >
            <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
          </button>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 text-stone-700 hover:text-stone-950 flex items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer"
            aria-label="Next Products"
          >
            <ChevronRight className="w-6 h-6 stroke-[1.5]" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 px-1 -mx-1"
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
