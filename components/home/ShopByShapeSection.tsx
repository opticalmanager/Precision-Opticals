"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { FrameShape } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShapeItem {
  id: string;
  shapeValue: FrameShape;
  name: string;
  imgSrc: string;
}

interface ShopByShapeSectionProps {
  onSelectShape: (shape: FrameShape, category?: string) => void;
  category?: 'sunglasses' | 'eyeglasses';
  activeCategory?: string;
}

export const ShopByShapeSection: React.FC<ShopByShapeSectionProps> = ({
  onSelectShape,
  category = 'sunglasses',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSunglasses = category === 'sunglasses';

  const sunglassesShapes: ShapeItem[] = [
    { id: 'aviator', shapeValue: 'aviator', name: 'Aviator', imgSrc: '/images/shapes/sun_aviator.png' },
    { id: 'round', shapeValue: 'round', name: 'Round', imgSrc: '/images/shapes/sun_round.png' },
    { id: 'rectangle', shapeValue: 'rectangle', name: 'Rectangle', imgSrc: '/images/shapes/sun_rectangle.png' },
    { id: 'cat-eye', shapeValue: 'cat-eye', name: 'Cat Eye', imgSrc: '/images/shapes/sun_cat-eye.png' },
    { id: 'geometric', shapeValue: 'geometric', name: 'Geometric', imgSrc: '/images/shapes/sun_geometric.png' },
    { id: 'clubmaster', shapeValue: 'wayfarer', name: 'Clubmaster', imgSrc: '/images/shapes/sun_clubmaster.png' },
    { id: 'square', shapeValue: 'square', name: 'Square', imgSrc: '/images/shapes/sun_square.png' },
  ];

  const eyeglassesShapes: ShapeItem[] = [
    { id: 'rectangle', shapeValue: 'rectangle', name: 'Rectangle', imgSrc: '/images/shapes/eye_rectangle.png' },
    { id: 'cat-eye', shapeValue: 'cat-eye', name: 'Cateye', imgSrc: '/images/shapes/eye_cat-eye.png' },
    { id: 'aviator', shapeValue: 'aviator', name: 'Aviator', imgSrc: '/images/shapes/eye_aviator.png' },
    { id: 'geometric', shapeValue: 'geometric', name: 'Geometric', imgSrc: '/images/shapes/eye_geometric.png' },
    { id: 'round', shapeValue: 'round', name: 'Round', imgSrc: '/images/shapes/eye_round.png' },
    { id: 'clubmaster', shapeValue: 'wayfarer', name: 'Clubmaster', imgSrc: '/images/shapes/eye_clubmaster.png' },
    { id: 'square', shapeValue: 'square', name: 'Square', imgSrc: '/images/shapes/eye_square.png' },
  ];

  const shapes = isSunglasses ? sunglassesShapes : eyeglassesShapes;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-8 sm:py-10 border-y border-[#E8DCCF]/50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Matching Figma exact styling */}
        <div className="mb-6 sm:mb-8">
          <h2 className="font-sans font-bold text-xl sm:text-2xl md:text-[22px] text-[#000042] tracking-tight">
            Get the perfect shape - {isSunglasses ? 'Sunglasses' : 'Eyeglasses'}
          </h2>
        </div>

        {/* Scrollable Container with Arrows */}
        <div className="relative group/carousel">
          
          {/* Left Arrow Button */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 hover:bg-[#C86A28] hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
            aria-label="Previous shape"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#2A1E17] shadow-lg border border-[#E8DCCF] flex items-center justify-center opacity-80 group-hover/carousel:opacity-100 hover:bg-[#C86A28] hover:text-white transition-all duration-200 focus:outline-none cursor-pointer"
            aria-label="Next shape"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontal Track of Shape Circles */}
          <div
            ref={scrollRef}
            className="flex items-center justify-between gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {shapes.map((shape) => (
              <div
                key={shape.id}
                onClick={() => onSelectShape(shape.shapeValue, category)}
                className="flex flex-col items-center shrink-0 cursor-pointer group/item transition-transform duration-300"
              >
                {/* Photographic Circular Container */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-[130px] md:h-[130px] rounded-full bg-[#F7F7F7] flex items-center justify-center p-2.5 sm:p-3 transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-md">
                  <div className="relative w-full h-full">
                    <Image
                      src={shape.imgSrc}
                      alt={shape.name}
                      fill
                      sizes="(max-width: 768px) 112px, 130px"
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Shape Label underneath */}
                <span className="mt-3 text-sm sm:text-[15px] font-bold text-[#000042] group-hover/item:text-[#C86A28] transition-colors text-center font-sans tracking-tight">
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
