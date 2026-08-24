import React, { useState, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatINR } from '../../utils/formatters';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface TrendingSearchesSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const TrendingSearchesSection: React.FC<TrendingSearchesSectionProps> = ({
  products,
  onSelectProduct,
}) => {
  const { addToCartDirect } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [selectedPillId, setSelectedPillId] = useState<string>('cartier');
  const carouselRef = useRef<HTMLDivElement>(null);

  const searchPills = [
    {
      id: 'cartier',
      label: 'Cartier Gold Luxury',
      filterFn: (p: Product) => p.brand.toLowerCase().includes('cartier') || p.material === '18k-gold-plated',
    },
    {
      id: 'tom-ford',
      label: 'Tom Ford Signature',
      filterFn: (p: Product) => p.brand.toLowerCase().includes('tom'),
    },
    {
      id: 'gast',
      label: 'GAST Milano Titanium',
      filterFn: (p: Product) => p.brand.toLowerCase().includes('gast'),
    },
    {
      id: 'meta-ai',
      label: 'Meta Smart Audio AI',
      filterFn: (p: Product) => p.category === 'meta-smart',
    },
    {
      id: 'rimless',
      label: 'Rimless Optical Frames',
      filterFn: (p: Product) => p.rimType === 'rimless',
    },
    {
      id: 'polarized',
      label: 'Polarized Sunwear',
      filterFn: (p: Product) => p.lensProperties.includes('polarized') || p.category === 'sunglasses',
    },
  ];

  const activeProducts = useMemo(() => {
    const currentPill = searchPills.find((pill) => pill.id === selectedPillId);
    let result = products;

    if (currentPill) {
      const filtered = products.filter(currentPill.filterFn);
      if (filtered.length > 0) {
        result = filtered;
      }
    }

    return result.slice(0, 8);
  }, [products, selectedPillId]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#FAF7F2] py-12 sm:py-16 border-b border-[#E8DCCF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#C85A1B] uppercase block">
              TRENDING TODAY
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1E17]">
              Most Loved & Trending
            </h2>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 no-scrollbar">
          {searchPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedPillId(pill.id)}
              className={`px-4 py-2 rounded-full text-xs font-serif tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedPillId === pill.id
                  ? 'bg-[#2A1E17] text-white shadow-xs font-bold'
                  : 'bg-white text-stone-700 hover:text-black border border-[#E8DCCF]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative group mt-4">
          <div
            ref={carouselRef}
            className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
          >
            {activeProducts.map((product) => {
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
                        {product.brand}
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

                    <h4 className="font-bold text-sm text-[#2A1E17] mt-1 line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-stone-500 capitalize mt-0.5">
                      {product.color}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-3">
                    <span className="font-serif font-bold text-sm text-[#2A1E17]">
                      {formatINR(product.price)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCartDirect(product);
                      }}
                      className="bg-[#2A1E17] hover:bg-[#C85A1B] text-white p-2 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Add to cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll trending left"
            className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white/90 border border-stone-300 p-2.5 rounded-full shadow-md text-stone-700 hover:text-black transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            aria-label="Scroll trending right"
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white/90 border border-stone-300 p-2.5 rounded-full shadow-md text-stone-700 hover:text-black transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
