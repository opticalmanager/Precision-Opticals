"use client";

import React, { useState, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';

interface TrendingSearchesSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  wishlistIds?: string[];
}

interface SearchPill {
  id: string;
  label: string;
  filterFn: (p: Product) => boolean;
}

export const TrendingSearchesSection: React.FC<TrendingSearchesSectionProps> = ({
  products,
  onSelectProduct,
  onToggleWishlist,
  wishlistIds,
}) => {
  const { wishlistIds: contextWishlistIds, toggleWishlist } = useWishlist();
  const effectiveWishlistIds = wishlistIds || contextWishlistIds;
  const handleToggle = onToggleWishlist || toggleWishlist;
  const [selectedPillId, setSelectedPillId] = useState<string>('ray-ban');
  const carouselRef = useRef<HTMLDivElement>(null);

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

    // Always fallback to top bestsellers if few items match
    if (result.length < 4) {
      const bestSellers = products.filter((p) => p.isBestSeller);
      const combined = [...result, ...bestSellers];
      // Deduplicate by ID
      const uniqueMap = new Map();
      combined.forEach((item) => uniqueMap.set(item.id, item));
      result = Array.from(uniqueMap.values());
    }

    return result;
  }, [products, selectedPillId]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#1C1612] text-white py-12 sm:py-16 relative overflow-hidden border-t border-b border-[#35271E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm font-medium tracking-widest text-[#D8C3B0] uppercase mb-1">
            Trending Searches
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white flex items-center justify-center gap-2 font-serif">
            <span>Most</span>
            <span className="font-serif italic text-[#E07A38] font-normal">
              Loved
            </span>
            <span className="text-2xl sm:text-3xl">❤️</span>
          </h2>
        </div>

        {/* Trending Search Pills Grid (Two Rows) */}
        <div className="flex flex-col items-center gap-2.5 sm:gap-3 mb-10 sm:mb-12">
          {/* Row 1 */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {searchPills.slice(0, 3).map((pill) => {
              const isActive = selectedPillId === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedPillId(pill.id)}
                  className={`inline-flex items-center gap-1.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#FAF7F2] text-[#2A1E17] font-semibold shadow-lg scale-102'
                      : 'bg-[#2E221A]/90 hover:bg-[#3E2F24] text-[#EADEC9] border border-[#443327]'
                  }`}
                >
                  <span>{pill.label}</span>
                  <ArrowUpRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#2A1E17]' : 'text-[#B8A392]'}`} />
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
                  onClick={() => setSelectedPillId(pill.id)}
                  className={`inline-flex items-center gap-1.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#FAF7F2] text-[#2A1E17] font-semibold shadow-lg scale-102'
                      : 'bg-[#2E221A]/90 hover:bg-[#3E2F24] text-[#EADEC9] border border-[#443327]'
                  }`}
                >
                  <span>{pill.label}</span>
                  <ArrowUpRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#2A1E17]' : 'text-[#B8A392]'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel Container with Side Navigation Buttons */}
        <div className="relative px-2 sm:px-10">
          
          {/* Left Scroll Arrow Button */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#2E221A]/90 hover:bg-[#3E2F24] text-white border border-[#443327] backdrop-blur-md shadow-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#C86A28] cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5 text-[#EADEC9]" />
          </button>

          {/* Right Scroll Arrow Button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#2E221A]/90 hover:bg-[#3E2F24] text-white border border-[#443327] backdrop-blur-md shadow-xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#C86A28] cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5 text-[#EADEC9]" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={carouselRef}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activeProducts.map((product) => {
              const isWishlisted = effectiveWishlistIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="w-[240px] sm:w-[270px] shrink-0 bg-white rounded-2xl p-4 sm:p-5 text-stone-900 border border-slate-200/80 shadow-md relative group flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                  {/* Top Wishlist Heart Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(product.id);
                    }}
                    className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-full hover:bg-rose-50 transition-colors focus:outline-none cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isWishlisted
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-rose-400 hover:text-rose-600'
                      }`}
                    />
                  </button>

                  {/* Product Content Click Handler */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="cursor-pointer flex flex-col h-full"
                  >
                    {/* Image Box */}
                    <div className="w-full h-36 sm:h-44 flex items-center justify-center p-2 mb-3 bg-white rounded-xl">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Meta Details */}
                    <div className="mt-auto">
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 tracking-wide mb-0.5 font-sans">
                        {product.brand}
                      </h4>
                      <p className="text-xs text-stone-500 font-normal line-clamp-2 min-h-[32px] mb-2 leading-relaxed">
                        {product.name}
                      </p>

                      {/* Size text if applicable */}
                      <p className="text-[11px] text-stone-600 font-medium mb-1">
                        Size: {product.specs?.lensWidth && product.specs.lensWidth >= 55 ? 'Large' : 'Medium'}
                      </p>

                      {/* Price & Taxes */}
                      <div className="pt-1 border-t border-stone-100 flex items-baseline justify-between">
                        <div>
                          <span className="font-bold text-sm sm:text-base text-stone-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-stone-400 font-normal">
                            Inclusive of all taxes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
