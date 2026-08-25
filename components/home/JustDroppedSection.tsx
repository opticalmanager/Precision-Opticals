"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Heart, ShoppingBag, ChevronRight, ChevronLeft } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface JustDroppedSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAll: () => void;
}

export const JustDroppedSection: React.FC<JustDroppedSectionProps> = ({
  products,
  onSelectProduct,
  onViewAll,
}) => {
  const { addToCartDirect } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<'new' | 'bestsellers'>('new');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter Just Dropped / New Arrivals
  const justDroppedProducts = useMemo(() => {
    const specificIds = [
      'just-dropped-grey-wayfarer',
      'just-dropped-metallic-aviator',
      'just-dropped-blue-square-computer',
      'just-dropped-green-square-sunglasses',
      'gast-astro-as02-53',
      'gast-pai-pa04-48',
      'ray-ban-meta-wayfarer-matte-black',
      'lindberg-blok-titanium-6584'
    ];

    const matched = specificIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    const newArrivals = products.filter((p) => p.isNewArrival);
    const combined = [...matched, ...newArrivals];
    const uniqueMap = new Map<string, Product>();
    combined.forEach((item) => uniqueMap.set(item.id, item));
    return Array.from(uniqueMap.values());
  }, [products]);

  // Filter Best Sellers
  const bestSellerProducts = useMemo(() => {
    const bestSellers = products.filter((p) => p.isBestSeller);
    if (bestSellers.length >= 4) return bestSellers;
    
    // Fallback if less than 4
    const fallback = products.slice(0, 8);
    const combined = [...bestSellers, ...fallback];
    const uniqueMap = new Map<string, Product>();
    combined.forEach((item) => uniqueMap.set(item.id, item));
    return Array.from(uniqueMap.values());
  }, [products]);

  const displayedProducts = activeTab === 'new' ? justDroppedProducts : bestSellerProducts;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#FAF7F2] py-12 sm:py-16 border-b border-[#E8DCCF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Tab Toggle (Just Dropped / New Arrivals vs Best Sellers) */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="bg-white/90 p-1.5 rounded-2xl border border-[#E8DCCF] inline-flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-6 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-[#2A1E17] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#2A1E17] hover:bg-[#FAF3EB]'
              }`}
            >
              Just Dropped
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`px-6 sm:px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'bestsellers'
                  ? 'bg-[#2A1E17] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#2A1E17] hover:bg-[#FAF3EB]'
              }`}
            >
              Best Sellers
            </button>
          </div>
        </div>

        {/* Product Slider Container with Floating Nav Arrow */}
        <div className="relative group/carousel">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-20 w-10 h-10 rounded-full bg-white text-[#2A1E17] shadow-xl border border-[#E8DCCF] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-[#C86A28] hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
            aria-label="Previous Products"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-20 w-10 h-10 rounded-full bg-white text-[#2A1E17] shadow-xl border border-[#E8DCCF] flex items-center justify-center opacity-90 group-hover/carousel:opacity-100 hover:bg-[#C86A28] hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
            aria-label="Next Products"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontal Product List Grid / Carousel */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 px-1 -mx-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayedProducts.map((product) => {
              const wishlisted = isWishlisted(product.id);

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="min-w-[260px] sm:min-w-[280px] lg:min-w-[0] lg:w-1/4 shrink-0 bg-white rounded-2xl p-4 flex flex-col justify-between relative group cursor-pointer transition-all duration-300 border border-[#E8DCCF] hover:border-[#C86A28]/60 shadow-2xs hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Heart Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id, product.name);
                    }}
                    className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-white/90 hover:bg-[#C86A28] hover:text-white transition-all focus:outline-none shadow-2xs border border-[#E8DCCF] cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        wishlisted
                          ? 'fill-[#C86A28] text-[#C86A28]'
                          : 'text-stone-400 group-hover:text-white'
                      }`}
                    />
                  </button>

                  {/* Product Image Area */}
                  <div className="w-full h-44 sm:h-48 flex items-center justify-center p-3 relative bg-[#FAF8F5] rounded-xl border border-[#E8DCCF]/50 overflow-hidden mb-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Badge at Bottom-Left of Image */}
                    <div className="absolute bottom-2.5 left-2.5 z-10">
                      <span className="bg-[#C86A28] text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-2xs">
                        {activeTab === 'new' ? 'NEW ARRIVAL' : 'BEST SELLER'}
                      </span>
                    </div>
                  </div>

                  {/* Info Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5 mb-3">
                      <span className="text-[10.5px] font-extrabold text-[#C86A28] tracking-wider uppercase block">
                        {product.brand}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-[#2A1E17] line-clamp-1 uppercase font-sans">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 pt-0.5">
                        {product.originalPrice && (
                          <span className="text-[11px] text-stone-400 line-through font-mono">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="font-extrabold text-xs sm:text-sm text-[#2A1E17] font-sans">
                          ₹{product.price.toLocaleString('en-IN')}.00
                        </span>
                      </div>
                    </div>

                    {/* Add To Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCartDirect(product);
                      }}
                      className="w-full bg-[#2A1E17] hover:bg-[#C86A28] active:scale-[0.98] text-white font-bold text-xs py-2.5 sm:py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 uppercase tracking-wider shadow-2xs cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Centered VIEW ALL Button */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <button
            onClick={onViewAll}
            className="bg-[#2A1E17] hover:bg-[#C86A28] text-white font-bold text-xs sm:text-sm tracking-widest uppercase px-10 py-3 rounded-full shadow-md hover:shadow-xl transition-all duration-300 focus:outline-none active:scale-95 border border-[#2A1E17] cursor-pointer"
          >
            VIEW ALL PRODUCTS
          </button>
        </div>

      </div>
    </section>
  );
};
