"use client";

import React, { useState, useRef } from 'react';
import { FrameShape } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShapeItem {
  id: string;
  shapeValue: FrameShape;
  name: string;
  renderSvg: (isSunglasses: boolean) => React.ReactNode;
}

interface ShopByShapeSectionProps {
  onSelectShape: (shape: FrameShape, category?: string) => void;
  activeCategory?: string;
}

export const ShopByShapeSection: React.FC<ShopByShapeSectionProps> = ({
  onSelectShape,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'sunglasses' | 'eyeglasses'>('sunglasses');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isSunglasses = selectedCategory === 'sunglasses';

  const shapes: ShapeItem[] = [
    {
      id: 'aviator',
      shapeValue: 'aviator',
      name: 'Aviator',
      renderSvg: (sunglasses) => (
        <svg viewBox="0 0 100 50" className="w-full h-full text-[#2A1E17]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Double Top Bridge */}
          <line x1="36" y1="13" x2="64" y2="13" strokeWidth="2" />
          <line x1="40" y1="18" x2="60" y2="18" strokeWidth="1.8" />
          {/* Left Aviator Lens */}
          <path d="M 12,18 C 12,18 22,14 38,18 C 38,31 33,43 23,43 C 14,43 12,32 12,18 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Right Aviator Lens */}
          <path d="M 62,18 C 78,14 88,18 88,18 C 88,32 86,43 77,43 C 67,43 62,31 62,18 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Temples */}
          <line x1="12" y1="18" x2="2" y2="15" strokeWidth="2" />
          <line x1="88" y1="18" x2="98" y2="15" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'round',
      shapeValue: 'round',
      name: 'Round',
      renderSvg: (sunglasses) => (
        <svg viewBox="0 0 100 50" className="w-full h-full text-[#2A1E17]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bridge */}
          <path d="M 38,22 Q 50,16 62,22" strokeWidth="2.2" />
          {/* Left Round Lens */}
          <circle cx="24" cy="26" r="14" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Right Round Lens */}
          <circle cx="76" cy="26" r="14" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Temples */}
          <line x1="10" y1="24" x2="2" y2="21" strokeWidth="2" />
          <line x1="90" y1="24" x2="98" y2="21" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'wayfarer',
      shapeValue: 'wayfarer',
      name: 'Wayfarer',
      renderSvg: (sunglasses) => (
        <svg viewBox="0 0 100 50" className="w-full h-full text-[#2A1E17]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Keyhole Bridge */}
          <path d="M 38,18 Q 50,15 62,18" strokeWidth="2.5" />
          {/* Left Lens */}
          <path d="M 10,16 L 38,18 L 34,38 L 14,36 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Right Lens */}
          <path d="M 62,18 L 90,16 L 86,36 L 66,38 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Temples */}
          <line x1="10" y1="16" x2="2" y2="13" strokeWidth="2.5" />
          <line x1="90" y1="16" x2="98" y2="13" strokeWidth="2.5" />
        </svg>
      )
    },
    {
      id: 'cat-eye',
      shapeValue: 'cat-eye',
      name: 'Cat Eye',
      renderSvg: (sunglasses) => (
        <svg viewBox="0 0 100 50" className="w-full h-full text-[#2A1E17]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bridge */}
          <path d="M 39,23 Q 50,18 61,23" strokeWidth="2" />
          {/* Left Cat Eye Lens */}
          <path d="M 7,13 C 20,15 33,20 39,23 C 37,36 22,41 14,36 C 8,31 5,20 7,13 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Right Cat Eye Lens */}
          <path d="M 93,13 C 80,15 67,20 61,23 C 63,36 78,41 86,36 C 92,31 95,20 93,13 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Temples */}
          <line x1="7" y1="13" x2="1" y2="10" strokeWidth="2.2" />
          <line x1="93" y1="13" x2="99" y2="10" strokeWidth="2.2" />
        </svg>
      )
    },
    {
      id: 'rectangle',
      shapeValue: 'rectangle',
      name: 'Rectangle',
      renderSvg: (sunglasses) => (
        <svg viewBox="0 0 100 50" className="w-full h-full text-[#2A1E17]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bridge */}
          <line x1="38" y1="22" x2="62" y2="22" strokeWidth="2.2" />
          {/* Left Rectangle Lens */}
          <rect x="10" y="15" width="28" height="21" rx="4" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Right Rectangle Lens */}
          <rect x="62" y="15" width="28" height="21" rx="4" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Temples */}
          <line x1="10" y1="19" x2="2" y2="17" strokeWidth="2" />
          <line x1="90" y1="19" x2="98" y2="17" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'square',
      shapeValue: 'square',
      name: 'Square',
      renderSvg: (sunglasses) => (
        <svg viewBox="0 0 100 50" className="w-full h-full text-[#2A1E17]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bridge */}
          <line x1="38" y1="20" x2="62" y2="20" strokeWidth="2.2" />
          {/* Left Square Lens */}
          <rect x="11" y="13" width="27" height="27" rx="3" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Right Square Lens */}
          <rect x="62" y="13" width="27" height="27" rx="3" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Temples */}
          <line x1="11" y1="17" x2="2" y2="15" strokeWidth="2" />
          <line x1="89" y1="17" x2="98" y2="15" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'geometric',
      shapeValue: 'geometric',
      name: 'Geometric',
      renderSvg: (sunglasses) => (
        <svg viewBox="0 0 100 50" className="w-full h-full text-[#2A1E17]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bridge */}
          <line x1="38" y1="22" x2="62" y2="22" strokeWidth="2.2" />
          {/* Left Hexagon Polygon */}
          <polygon points="17,14 33,14 39,25 33,37 17,37 11,25" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Right Hexagon Polygon */}
          <polygon points="67,14 83,14 89,25 83,37 67,37 61,25" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          {/* Temples */}
          <line x1="11" y1="25" x2="2" y2="23" strokeWidth="2" />
          <line x1="89" y1="25" x2="98" y2="23" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'clubmaster',
      shapeValue: 'wayfarer',
      name: 'Clubmaster',
      renderSvg: (sunglasses) => (
        <svg viewBox="0 0 100 50" className="w-full h-full text-[#2A1E17]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Bridge */}
          <path d="M 38,18 Q 50,15 62,18" strokeWidth="2.2" />
          {/* Browline Rims */}
          <path d="M 10,18 L 38,18 L 36,24 L 12,24 Z" fill="#2A1E17" />
          <path d="M 62,18 L 90,18 L 88,24 L 64,24 Z" fill="#2A1E17" />
          {/* Wire frame bottom */}
          <path d="M 12,24 C 12,38 36,38 36,24" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2" />
          <path d="M 64,24 C 64,38 88,38 88,24" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2" />
          {/* Temples */}
          <line x1="10" y1="18" x2="2" y2="15" strokeWidth="2" />
          <line x1="90" y1="18" x2="98" y2="15" strokeWidth="2" />
        </svg>
      )
    }
  ];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#FAF7F2] py-12 sm:py-16 border-b border-[#E8DCCF] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title and Category Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <span className="text-[10px] font-sans font-extrabold tracking-[0.2em] text-[#C86A28] uppercase block mb-1">
              CURATED EYEWEAR COLLECTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2A1E17] tracking-tight uppercase font-serif">
              GET THE <span className="font-serif italic font-normal text-[#C86A28]">PERFECT SHAPE</span>
            </h2>
          </div>

          {/* Category Switcher pill */}
          <div className="inline-flex items-center bg-white/90 p-1.5 rounded-2xl border border-[#E8DCCF] self-start sm:self-auto shadow-2xs">
            <button
              onClick={() => setSelectedCategory('sunglasses')}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                selectedCategory === 'sunglasses'
                  ? 'bg-[#2A1E17] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#2A1E17] hover:bg-[#FAF3EB]'
              }`}
            >
              Sunglasses
            </button>
            <button
              onClick={() => setSelectedCategory('eyeglasses')}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                selectedCategory === 'eyeglasses'
                  ? 'bg-[#2A1E17] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#2A1E17] hover:bg-[#FAF3EB]'
              }`}
            >
              Eyeglasses
            </button>
          </div>
        </div>

        {/* Scrollable Container with Arrows */}
        <div className="relative group/carousel">
          
          {/* Left Arrow Button */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-[#2A1E17] shadow-xl border border-[#E8DCCF] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-[#C86A28] hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
            aria-label="Previous shape"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-[#2A1E17] shadow-xl border border-[#E8DCCF] flex items-center justify-center opacity-90 group-hover/carousel:opacity-100 hover:bg-[#C86A28] hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
            aria-label="Next shape"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontal Track of Shape Circles */}
          <div
            ref={scrollRef}
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-3 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {shapes.map((shape) => (
              <div
                key={shape.id}
                onClick={() => onSelectShape(shape.shapeValue, selectedCategory)}
                className="flex flex-col items-center shrink-0 cursor-pointer group/item transition-transform duration-300 hover:-translate-y-1.5"
              >
                {/* Circular Container matching luxury design */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#FFFDF9] hover:bg-[#FAF3EB] border border-[#E8DCCF] shadow-2xs flex items-center justify-center p-4 sm:p-6 transition-all duration-300 group-hover/item:shadow-md group-hover/item:border-[#C86A28]/60">
                  <div className="w-full h-full flex items-center justify-center p-1">
                    {shape.renderSvg(isSunglasses)}
                  </div>
                </div>

                {/* Shape Label underneath */}
                <span className="mt-3.5 text-xs sm:text-sm font-extrabold text-[#2A1E17] group-hover/item:text-[#C86A28] transition-colors text-center uppercase tracking-wider font-sans">
                  {shape.name}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
