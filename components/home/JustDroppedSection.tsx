import React, { useState, useRef, useMemo } from 'react';
import { Heart, ShoppingBag, ChevronRight, ChevronLeft, Sparkles, Glasses } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatINR } from '../../utils/formatters';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface JustDroppedSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAll: () => void;
}

export const JustDroppedSection: React.FC<JustDroppedSectionProps> = ({
  products,
  onSelectProduct,
  onViewAll
}) => {
  const { addToCartDirect } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<'new' | 'bestsellers'>('new');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const justDroppedProducts = useMemo(() => {
    return products.filter((p) => p.isNewArrival || p.isLimitedEdition);
  }, [products]);

  const bestSellerProducts = useMemo(() => {
    const bestSellers = products.filter((p) => p.isBestSeller);
    return bestSellers.length > 0 ? bestSellers : products.slice(0, 8);
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#C85A1B] uppercase block">
              CURATED EXCELLENCE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1E17]">
              {activeTab === 'new' ? 'Just Dropped Arrivals' : 'Most Coveted Bestsellers'}
            </h2>
          </div>

          <div className="bg-white p-1 rounded-2xl border border-[#E8DCCF] inline-flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-[#2A1E17] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#2A1E17]'
              }`}
            >
              Just Dropped
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'bestsellers'
                  ? 'bg-[#2A1E17] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#2A1E17]'
              }`}
            >
              Best Sellers
            </button>
          </div>
        </div>

        <div className="relative group">
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
          >
            {displayedProducts.map((product) => {
              const saved = isWishlisted(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="flex-shrink-0 w-72 sm:w-80 bg-white border border-[#E8DCCF] hover:border-[#C85A1B] p-4 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer group/card"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-[#2A1E17] text-white text-[9px] font-sans font-bold px-2 py-0.5 uppercase tracking-wider">
                        {product.isNewArrival ? 'NEW DROP' : 'POPULAR'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id, product.name);
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <Heart className={`w-4 h-4 ${saved ? 'fill-rose-600 text-rose-600' : ''}`} />
                      </button>
                    </div>

                    <div className="w-full h-44 my-2 flex items-center justify-center overflow-hidden">
                      <ImageWithFallback
                        src={product.images[0]}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transform group-hover/card:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <span className="font-serif font-bold text-xs text-[#C85A1B] uppercase tracking-wider block">
                      {product.brand}
                    </span>
                    <h4 className="font-bold text-sm text-[#2A1E17] mt-0.5 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-stone-500 capitalize mt-0.5">
                      {product.shape} • {product.rimType}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-3">
                    <div>
                      <span className="font-serif font-bold text-sm text-[#2A1E17]">
                        {formatINR(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[11px] text-stone-400 line-through ml-2">
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCartDirect(product);
                      }}
                      className="bg-[#2A1E17] hover:bg-[#C85A1B] text-white p-2 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Add frame to cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white/90 border border-stone-300 p-2.5 rounded-full shadow-md text-stone-700 hover:text-black transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white/90 border border-stone-300 p-2.5 rounded-full shadow-md text-stone-700 hover:text-black transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-2 bg-[#2A1E17] hover:bg-[#C85A1B] text-white px-8 py-3 text-xs font-serif font-bold tracking-widest uppercase transition-colors shadow-md cursor-pointer"
          >
            <span>VIEW COMPLETE CATALOG</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
