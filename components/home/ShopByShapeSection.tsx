import React, { useState, useRef } from 'react';
import { FrameShape } from '../../types';
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
          <line x1="36" y1="13" x2="64" y2="13" strokeWidth="2" />
          <line x1="40" y1="18" x2="60" y2="18" strokeWidth="1.8" />
          <path d="M 12,18 C 12,18 22,14 38,18 C 38,31 33,43 23,43 C 14,43 12,32 12,18 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          <path d="M 62,18 C 78,14 88,18 88,18 C 88,32 86,43 77,43 C 67,43 62,31 62,18 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
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
          <path d="M 38,22 Q 50,16 62,22" strokeWidth="2.2" />
          <circle cx="24" cy="26" r="14" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          <circle cx="76" cy="26" r="14" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
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
          <path d="M 38,18 Q 50,15 62,18" strokeWidth="2.5" />
          <path d="M 10,16 L 38,18 L 34,38 L 14,36 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          <path d="M 62,18 L 90,16 L 86,36 L 66,38 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
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
          <path d="M 39,23 Q 50,18 61,23" strokeWidth="2" />
          <path d="M 7,13 C 20,15 33,20 39,23 C 37,36 22,41 14,36 C 8,31 5,20 7,13 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          <path d="M 93,13 C 80,15 67,20 61,23 C 63,36 78,41 86,36 C 92,31 95,20 93,13 Z" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
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
          <path d="M 40,22 L 60,22" strokeWidth="2.2" />
          <rect x="10" y="16" width="30" height="20" rx="3" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          <rect x="60" y="16" width="30" height="20" rx="3" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          <line x1="10" y1="18" x2="2" y2="16" strokeWidth="2" />
          <line x1="90" y1="18" x2="98" y2="16" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'geometric',
      shapeValue: 'geometric',
      name: 'Geometric / Octagon',
      renderSvg: (sunglasses) => (
        <svg viewBox="0 0 100 50" className="w-full h-full text-[#2A1E17]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="38" y1="22" x2="62" y2="22" strokeWidth="2.2" />
          <polygon points="17,14 31,14 38,22 38,32 31,40 17,40 10,32 10,22" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          <polygon points="69,14 83,14 90,22 90,32 83,40 69,40 62,32 62,22" fill={sunglasses ? "#2A1E17" : "#E2E8F0"} fillOpacity={sunglasses ? "0.85" : "0.3"} stroke="#2A1E17" strokeWidth="2.5" />
          <line x1="10" y1="22" x2="2" y2="18" strokeWidth="2" />
          <line x1="90" y1="22" x2="98" y2="18" strokeWidth="2" />
        </svg>
      )
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 bg-[#FAF7F2] border-b border-[#E8DCCF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#C85A1B] uppercase block">
              FIND YOUR SIGNATURE SILHOUETTE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1E17]">
              Get the Perfect Shape
            </h2>
          </div>

          <div className="inline-flex bg-[#E8DCCF]/50 p-1 rounded-full border border-[#D5C2B1]">
            <button
              onClick={() => setSelectedCategory('sunglasses')}
              className={`px-4 py-1.5 rounded-full text-xs font-serif font-bold tracking-wider uppercase transition-all cursor-pointer ${
                selectedCategory === 'sunglasses'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-stone-700 hover:text-black'
              }`}
            >
              Sunglasses
            </button>
            <button
              onClick={() => setSelectedCategory('eyeglasses')}
              className={`px-4 py-1.5 rounded-full text-xs font-serif font-bold tracking-wider uppercase transition-all cursor-pointer ${
                selectedCategory === 'eyeglasses'
                  ? 'bg-[#2A1E17] text-white shadow-sm'
                  : 'text-stone-700 hover:text-black'
              }`}
            >
              Eyeglasses
            </button>
          </div>
        </div>

        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex items-center gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth"
          >
            {shapes.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectShape(item.shapeValue, selectedCategory)}
                className="flex-shrink-0 w-44 bg-white border border-[#E8DCCF] hover:border-[#C85A1B] p-5 flex flex-col items-center justify-between text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md cursor-pointer group/card"
              >
                <div className="w-24 h-14 mb-3 flex items-center justify-center transform group-hover/card:scale-105 transition-transform">
                  {item.renderSvg(isSunglasses)}
                </div>
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#2A1E17] group-hover/card:text-[#C85A1B]">
                  {item.name}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => scroll('left')}
            aria-label="Scroll shapes left"
            className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white/90 border border-stone-300 p-2 rounded-full shadow-md text-stone-700 hover:text-black transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll shapes right"
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white/90 border border-stone-300 p-2 rounded-full shadow-md text-stone-700 hover:text-black transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
