"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, Heart } from 'lucide-react';
import { Product } from '@/types';
import { HomeProductCard } from './HomeProductCard';
import { useDraggableRow } from '@/hooks/useDraggableRow';

interface TrendingSearchesSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onExploreTrending?: (pillId: string) => void;
}

interface SearchPill {
  id: string;
  label: string;
  filterFn: (p: Product) => boolean;
}

export const TrendingSearchesSection: React.FC<TrendingSearchesSectionProps> = ({
  products,
  onSelectProduct,
  onExploreTrending,
}) => {
  const [selectedPillId, setSelectedPillId] = useState<string>('ray-ban');
  const {
    containerRef,
    canScrollLeft,
    canScrollRight,
    scrollByWholeRow,
    dragHandlers,
    updateScrollState,
  } = useDraggableRow();

  const searchPills: SearchPill[] = [
    {
      id: 'ray-ban',
      label: 'Ray-Ban Sunglasses',
      filterFn: (p) =>
        p.brand.toLowerCase().includes('ray') ||
        p.brand.toLowerCase().includes('rayban') ||
        p.id.includes('rayban') ||
        p.id.includes('ray-ban'),
    },
    {
      id: 'gucci',
      label: 'Gucci Sunglasses',
      filterFn: (p) =>
        p.brand.toLowerCase().includes('gucci') || p.id.includes('gucci'),
    },
    {
      id: 'oakley',
      label: 'Oakley Sunglasses',
      filterFn: (p) =>
        p.brand.toLowerCase().includes('oakley') || p.id.includes('oakley'),
    },
    {
      id: 'rimless',
      label: 'Rimless Eyeglasses',
      filterFn: (p) =>
        p.rimType === 'rimless' || p.category === 'eyeglasses',
    },
    {
      id: 'polarised',
      label: 'Polarised Sunglasses',
      filterFn: (p) =>
        p.lensProperties?.includes('polarized') || p.category === 'sunglasses',
    },
    {
      id: 'wayfarer',
      label: 'Wayfarer Sunglasses',
      filterFn: (p) =>
        p.shape === 'wayfarer' ||
        p.id.includes('wayfarer') ||
        p.shape === 'square',
    },
  ];

  // Filtered products for the active pill
  const activeProducts = useMemo(() => {
    const currentPill = searchPills.find((pill) => pill.id === selectedPillId);
    let result = products;

    if (currentPill) {
      const filtered = products.filter(currentPill.filterFn);
      if (filtered.length > 0) {
        result = filtered;
      }
    }

    if (result.length < 4) {
      const bestSellers = products.filter((p) => p.isBestSeller);
      const combined = [...result, ...bestSellers];
      const uniqueMap = new Map();
      combined.forEach((item) => uniqueMap.set(item.id, item));
      result = Array.from(uniqueMap.values());
    }

    return result;
  }, [products, selectedPillId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      updateScrollState();
    }
  }, [selectedPillId, activeProducts.length, updateScrollState]);

  return (
    <section className="bg-[#FAF7F2] py-12 sm:py-16 relative overflow-hidden border-t border-b border-[#35271E]/20 select-none">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
        
        {/* Section Header Matching Figma */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xs sm:text-[13px] font-sans font-medium tracking-[2.5px] text-[#A8988B] uppercase mb-1.5">
            TRENDING SEARCHES
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-normal tracking-tight text-[#2A1E17] flex items-center justify-center gap-2 font-serif">
            <span className="text-[#8C7D73] font-serif font-normal">Most</span>
            <span className="font-serif italic text-[#C86A28] font-normal ml-1">Loved</span>
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 fill-[#DC2626] text-[#DC2626] inline-block ml-1" />
          </h2>
        </div>

        {/* Trending Search Pills Grid (Two Rows) Matching Figma */}
        <div className="flex flex-col items-center gap-2.5 sm:gap-3 mb-8 sm:mb-10">
          {/* Row 1 */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {searchPills.slice(0, 3).map((pill) => {
              const isActive = selectedPillId === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    if (isActive && onExploreTrending) {
                      onExploreTrending(pill.id);
                    } else {
                      setSelectedPillId(pill.id);
                    }
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-medium transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#FAF7F2] text-[#2A1E17] font-semibold shadow-sm border border-[#D5C7B8]'
                      : 'bg-[#3C322C] hover:bg-[#4D4039] text-white/95 border border-[#3C322C]'
                  }`}
                  title={isActive ? `Explore ${pill.label} in Shop` : pill.label}
                >
                  <span>{pill.label}</span>
                  <ArrowUpRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#2A1E17]' : 'text-white/70'}`} />
                </button>
              );
            })}
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {searchPills.slice(3, 6).map((pill) => {
              const isActive = selectedPillId === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    if (isActive && onExploreTrending) {
                      onExploreTrending(pill.id);
                    } else {
                      setSelectedPillId(pill.id);
                    }
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-medium transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#FAF7F2] text-[#2A1E17] font-semibold shadow-sm border border-[#D5C7B8]'
                      : 'bg-[#3C322C] hover:bg-[#4D4039] text-white/95 border border-[#3C322C]'
                  }`}
                  title={isActive ? `Explore ${pill.label} in Shop` : pill.label}
                >
                  <span>{pill.label}</span>
                  <ArrowUpRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#2A1E17]' : 'text-white/70'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel Container with Perfectly Centered Nav Arrows & Compact Gutter */}
        <div className="relative px-3 sm:px-5 lg:px-6">
          {/* Left Scroll Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => scrollByWholeRow('left')}
              className="absolute left-0 sm:-left-2 lg:-left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center hover:bg-[#C86A28] hover:text-white hover:border-[#C86A28] transition-all duration-200 focus:outline-none cursor-pointer active:scale-95"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Right Scroll Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => scrollByWholeRow('right')}
              className="absolute right-0 sm:-right-2 lg:-right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center hover:bg-[#C86A28] hover:text-white hover:border-[#C86A28] transition-all duration-200 focus:outline-none cursor-pointer active:scale-95"
              aria-label="Scroll Right"
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
            {activeProducts.map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
