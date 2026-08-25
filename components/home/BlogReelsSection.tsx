"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, X, ShoppingBag, Volume2, VolumeX, Heart } from 'lucide-react';
import { Product } from '@/types';

interface TrendingReelItem {
  id: string;
  brand: string;
  title: string;
  subtitle?: string;
  badgeStyle?: 'stencil' | 'clean' | 'graffiti' | 'bold';
  image: string;
  videoUrl?: string;
  taggedProductId?: string;
  likes: string;
}

interface BlogReelsSectionProps {
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const BlogReelsSection: React.FC<BlogReelsSectionProps> = ({
  products = [],
  onSelectProduct,
}) => {
  const [selectedReel, setSelectedReel] = useState<TrendingReelItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reelItems: TrendingReelItem[] = [
    {
      id: 'urban-icons',
      brand: 'HAPPSTER',
      title: 'URBAN ICONS',
      subtitle: 'Built for the ones ahead',
      badgeStyle: 'stencil',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      taggedProductId: 'just-dropped-grey-wayfarer',
      likes: '14.2k',
    },
    {
      id: 'titanium',
      brand: 'HAPPSTER',
      title: 'Titanium',
      subtitle: 'The Science of Lightness',
      badgeStyle: 'clean',
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80',
      taggedProductId: 'just-dropped-blue-square-computer',
      likes: '18.9k',
    },
    {
      id: 'streak-drip',
      brand: 'streak',
      title: 'DRIP',
      badgeStyle: 'graffiti',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      taggedProductId: 'just-dropped-metallic-aviator',
      likes: '22.1k',
    },
    {
      id: 'flip-ups',
      brand: 'HAPPSTER',
      title: 'Flip-ups',
      subtitle: 'Seamless clip-on transition',
      badgeStyle: 'bold',
      image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      taggedProductId: 'just-dropped-green-square-sunglasses',
      likes: '9.8k',
    },
    {
      id: 'retro-classic',
      brand: 'HAPPSTER',
      title: 'RETRO CLASSIC',
      subtitle: 'Timeless optical silhouettes',
      badgeStyle: 'clean',
      image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80',
      taggedProductId: 'just-dropped-pink-cat-eye',
      likes: '16.5k',
    },
    {
      id: 'polar-aviators',
      brand: 'HAPPSTER',
      title: 'METALLIC AVIATORS',
      subtitle: 'Aerospace-grade precision',
      badgeStyle: 'bold',
      image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=800&q=80',
      taggedProductId: 'just-dropped-metallic-aviator',
      likes: '11.3k',
    },
  ];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const updateScrollProgress = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      if (totalScrollable > 0) {
        setScrollProgress((scrollLeft / totalScrollable) * 100);
      }
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollProgress);
      updateScrollProgress();
      return () => el.removeEventListener('scroll', updateScrollProgress);
    }
  }, []);

  return (
    <section className="bg-[#FAF7F2] py-14 sm:py-20 border-b border-[#E8DCCF] overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#C86A28] uppercase block mb-1">
            CURATED LOOKBOOKS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C1917] tracking-wider uppercase font-sans">
            NEW &amp; TRENDING
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 tracking-widest font-semibold uppercase font-sans">
            THE LATEST FRAMES, CRAFTED FOR YOUR LOOK AND LIFESTYLE.
          </p>
        </div>

        {/* Horizontal Reels Track */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex items-center gap-4 sm:gap-5 overflow-x-auto scrollbar-none py-2 pb-6 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reelItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedReel(item)}
                className="w-[260px] sm:w-[290px] md:w-[310px] shrink-0 h-[380px] sm:h-[430px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 bg-stone-900 border border-[#E8DCCF]"
              >
                {/* Background Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                  loading="lazy"
                />

                {/* Subtle gradient dark vignette at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/30 to-transparent" />

                {/* Centered Large Circular Play Button */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/90 bg-[#1C1917]/40 backdrop-blur-xs text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#C86A28] group-hover:border-[#C86A28] group-hover:text-white transition-all duration-300">
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-1" />
                  </div>
                </div>

                {/* Bottom Overlay Info & "SHOP NOW ▶" button */}
                <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col items-start gap-3">
                  
                  {/* Brand & Collection Title Graphic styling */}
                  <div className="text-white drop-shadow-md space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest block text-[#C86A28]">
                      {item.brand}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none text-white font-sans">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-[11px] font-medium text-stone-200 tracking-wide font-sans">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* White / Terracotta SHOP NOW ▶ Pill Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const prod = products.find(p => p.id === item.taggedProductId);
                      if (prod && onSelectProduct) {
                        onSelectProduct(prod);
                      } else {
                        setSelectedReel(item);
                      }
                    }}
                    className="bg-white hover:bg-[#C86A28] text-[#1C1917] hover:text-white py-2 px-4 rounded-xl text-[11px] sm:text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md transform active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
                  >
                    <span>SHOP NOW</span>
                    <span className="text-[10px] leading-none text-[#C86A28] group-hover:text-white">▶</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Scrollbar Indicator Bar matching homepage theme */}
          <div className="mt-4 flex items-center gap-3 max-w-2xl mx-auto px-4">
            <button
              onClick={() => handleScroll('left')}
              className="text-stone-500 hover:text-[#C86A28] transition-colors focus:outline-none text-xs font-bold cursor-pointer"
              aria-label="Scroll left"
            >
              &#9664;
            </button>

            {/* Scroll progress track */}
            <div className="flex-1 h-1.5 bg-[#E8DCCF] rounded-full overflow-hidden relative">
              <div
                className="h-full bg-[#C86A28] rounded-full transition-all duration-150"
                style={{
                  width: '35%',
                  transform: `translateX(${scrollProgress * 1.8}%)`,
                }}
              />
            </div>

            <button
              onClick={() => handleScroll('right')}
              className="text-stone-500 hover:text-[#C86A28] transition-colors focus:outline-none text-xs font-bold cursor-pointer"
              aria-label="Scroll right"
            >
              &#9654;
            </button>
          </div>

        </div>

      </div>

      {/* Video / Reel Player Modal */}
      {selectedReel && (
        <div className="fixed inset-0 z-50 bg-[#1C1917]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#1C1917] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-[#E8DCCF]/20 flex flex-col h-[80vh] sm:h-[85vh]">
            
            {/* Reel Top Bar Controls */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-white drop-shadow-md">
              <div className="flex items-center gap-2">
                <span className="bg-[#C86A28] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
                  {selectedReel.brand} • {selectedReel.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-[#C86A28] transition-colors text-white cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedReel(null)}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-[#C86A28] transition-colors text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Visual Container */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
              <img
                src={selectedReel.image}
                alt={selectedReel.title}
                className="w-full h-full object-cover animate-pulse"
                style={{ animationDuration: '4s' }}
              />

              {/* Simulated Reel Overlay Play Animation */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/95 via-transparent to-[#1C1917]/40 flex flex-col justify-end p-6">
                <div className="space-y-1 text-white mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#C86A28] fill-[#C86A28]" />
                    <span className="text-xs font-semibold">{selectedReel.likes} likes</span>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-wide text-white">
                    {selectedReel.brand} {selectedReel.title}
                  </h4>
                  {selectedReel.subtitle && (
                    <p className="text-xs text-stone-300 font-sans">
                      {selectedReel.subtitle}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    const prod = products.find(p => p.id === selectedReel.taggedProductId);
                    if (prod && onSelectProduct) {
                      onSelectProduct(prod);
                      setSelectedReel(null);
                    }
                  }}
                  className="w-full bg-[#C86A28] hover:bg-orange-700 text-white py-3.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  SHOP FEATURED COLLECTION
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
