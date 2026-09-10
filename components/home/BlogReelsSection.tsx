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
      image: '/images/figma/reel_urban_icons.png',
      taggedProductId: 'figma-fastrack-black-wayfarer',
      likes: '14.2k',
    },
    {
      id: 'titanium',
      brand: 'HAPPSTER',
      title: 'Titanium',
      subtitle: 'The Science of Lightness',
      badgeStyle: 'clean',
      image: '/images/figma/reel_titanium.png',
      taggedProductId: 'figma-brown-gradient-rimless',
      likes: '18.9k',
    },
    {
      id: 'streak-drip',
      brand: 'STREAK',
      title: 'DRIP',
      badgeStyle: 'graffiti',
      image: '/images/figma/reel_drip.png',
      taggedProductId: 'figma-fastrack-gold-oval',
      likes: '22.1k',
    },
    {
      id: 'flip-ups',
      brand: 'HAPPSTER',
      title: 'Flip-ups',
      subtitle: 'Seamless clip-on transition',
      badgeStyle: 'bold',
      image: '/images/figma/reel_flipups.png',
      taggedProductId: 'figma-cartier-blue-rimless',
      likes: '9.8k',
    },
  ];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -310 : 310;
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
    <section className="bg-[#FAF7F2] py-12 sm:py-16 border-b border-[#E8DCCF] overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header Matching Figma Exact Typography */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-xs sm:text-sm font-sans font-bold tracking-[3px] text-[#C86A28] uppercase block mb-1.5">
            CURATED LOOKBOOKS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[46px] font-black text-[#111111] tracking-tight uppercase font-sans leading-none">
            NEW &amp; TRENDING
          </h2>
          <p className="mt-2 text-xs sm:text-[13px] text-[#4A4A4A] tracking-[1.5px] font-medium uppercase font-sans">
            THE LATEST FRAMES, CRAFTED FOR YOUR LOOK AND LIFESTYLE.
          </p>
        </div>

        {/* Horizontal Reels Track */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex items-center justify-center gap-5 sm:gap-6 overflow-x-auto scrollbar-none py-2 pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reelItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedReel(item)}
                className="w-[260px] sm:w-[280px] md:w-[285px] shrink-0 aspect-[283/620] rounded-[24px] overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Master cropped reel card */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Clickable overlay for SHOP NOW */}
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
                  className="absolute bottom-6 left-6 right-6 h-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label={`Shop ${item.title}`}
                />
              </div>
            ))}
          </div>

          {/* Bottom Scrollbar Indicator Bar matching Figma orange scroll */}
          <div className="mt-6 flex items-center gap-3 max-w-md mx-auto px-4">
            <button
              onClick={() => handleScroll('left')}
              className="text-[#C86A28] hover:text-orange-700 transition-colors focus:outline-none text-xs font-bold cursor-pointer"
              aria-label="Scroll left"
            >
              &#9664;
            </button>

            {/* Scroll progress track */}
            <div className="flex-1 h-1 bg-[#D9CDC2] rounded-full overflow-hidden relative">
              <div
                className="h-full bg-[#E85D04] rounded-full transition-all duration-200"
                style={{
                  width: '45%',
                  transform: `translateX(${scrollProgress * 1.2}%)`,
                }}
              />
            </div>

            <button
              onClick={() => handleScroll('right')}
              className="text-stone-400 hover:text-[#C86A28] transition-colors focus:outline-none text-xs font-bold cursor-pointer"
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
