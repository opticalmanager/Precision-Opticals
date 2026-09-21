"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Product } from '@/types';
import { HomeProductCard } from './HomeProductCard';
import { useDraggableRow } from '@/hooks/useDraggableRow';

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
  const {
    containerRef,
    canScrollLeft,
    canScrollRight,
    scrollByWholeRow,
    dragHandlers,
    updateScrollState,
  } = useDraggableRow();

  // Filter Just Dropped / New Arrivals
  const justDroppedProducts = useMemo(() => {
    const list = products.filter((p) => p.isNewArrival);
    return list.length > 0 ? list : products;
  }, [products]);

  // Filter Best Sellers
  const bestSellerProducts = useMemo(() => {
    const list = products.filter((p) => p.isBestSeller);
    return list.length > 0 ? list : products.slice().reverse();
  }, [products]);

  const displayedProducts = activeTab === 'new' ? justDroppedProducts : bestSellerProducts;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      updateScrollState();
    }
  }, [activeTab, updateScrollState]);

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
              onClick={() => scrollByWholeRow('left')}
              className="absolute left-0 sm:-left-2 lg:-left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center hover:bg-[#C86A28] hover:text-white hover:border-[#C86A28] transition-all duration-200 focus:outline-none cursor-pointer active:scale-95"
              aria-label="Previous Products"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={() => scrollByWholeRow('right')}
              className="absolute right-0 sm:-right-2 lg:-right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center hover:bg-[#C86A28] hover:text-white hover:border-[#C86A28] transition-all duration-200 focus:outline-none cursor-pointer active:scale-95"
              aria-label="Next Products"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Scrollable Track with Mouse Drag-to-Scroll */}
          <div
            ref={containerRef}
            {...dragHandlers}
            className="flex gap-3.5 sm:gap-4.5 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 px-1 cursor-grab active:cursor-grabbing select-none"
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
