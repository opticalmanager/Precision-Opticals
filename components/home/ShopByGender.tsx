"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface ShopByGenderProps {
  onSelectGender: (gender: 'men' | 'women' | 'kids') => void;
  activeGender?: string[];
  activeCategory?: string;
  onExploreShop?: () => void;
  onSelectCategory?: (category: string) => void;
}

export const ShopByGender: React.FC<ShopByGenderProps> = ({
  onSelectGender,
  onExploreShop,
  onSelectCategory
}) => {
  const [selectedPill, setSelectedPill] = useState<'all' | 'men' | 'women'>('all');

  const handlePillClick = (pill: 'all' | 'men' | 'women') => {
    setSelectedPill(pill);
    if (pill === 'men') {
      onSelectGender('men');
    } else if (pill === 'women') {
      onSelectGender('women');
    } else {
      if (onSelectCategory) onSelectCategory('all');
    }
  };

  const handleCategoryClick = (categoryKey: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryKey);
    }
    if (onExploreShop) {
      onExploreShop();
    }
  };

  return (
    <section 
      id="shop-by-category-section" 
      className="relative py-8 sm:py-12 overflow-hidden border-b border-[#C8B09C]"
      style={{
        background: 'linear-gradient(135deg, #EBD9C8 0%, #DFCBBA 40%, #C3A790 80%, #7B5B47 100%)'
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Matching Figma exact typography */}
        <div className="text-center mb-4 sm:mb-5">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[40px] font-normal text-[#2A1E17] tracking-tight">
            Shop by <span className="font-serif italic font-normal text-[#2A1E17]">Category</span>
          </h2>
        </div>

        {/* Pill Switcher */}
        <div className="flex justify-center mb-7 sm:mb-9">
          <div className="inline-flex items-center bg-[#6B5140]/45 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-inner">
            <button
              onClick={() => handlePillClick('all')}
              className={`px-6 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedPill === 'all'
                  ? 'bg-white text-[#2A1E17] shadow-md font-semibold'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handlePillClick('men')}
              className={`px-6 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedPill === 'men'
                  ? 'bg-white text-[#2A1E17] shadow-md font-semibold'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Men
            </button>
            <button
              onClick={() => handlePillClick('women')}
              className={`px-6 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedPill === 'women'
                  ? 'bg-white text-[#2A1E17] shadow-md font-semibold'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Women
            </button>
          </div>
        </div>

        {/* 2-Column Grid Container matching Figma 580px : 580px */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-center">
          
          {/* LEFT BLOCK: Dual Showcase Image with 2 Interactive Click Zones */}
          <div className="relative w-full max-w-[580px] mx-auto rounded-[24px] group">
            <div className="relative w-full aspect-[580/315] select-none">
              <Image
                src="/images/figma/cat_dual_showcase.png"
                alt="Shop Sunglasses & Eyeglasses"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 580px"
                className="object-contain drop-shadow-[0_12px_24px_rgba(42,30,23,0.18)] transition-transform duration-300 group-hover:scale-[1.01]"
              />
              {/* Clickable Left Half: Sunglasses */}
              <button
                onClick={() => handleCategoryClick('sunglasses')}
                className="absolute left-0 top-0 w-1/2 h-full z-20 cursor-pointer rounded-l-[24px] focus:outline-none group/sun transition-colors hover:bg-black/[0.02]"
                aria-label="Shop Sunglasses"
              />
              {/* Clickable Right Half: Eyeglasses */}
              <button
                onClick={() => handleCategoryClick('eyeglasses')}
                className="absolute right-0 top-0 w-1/2 h-full z-20 cursor-pointer rounded-r-[24px] focus:outline-none group/eye transition-colors hover:bg-black/[0.02]"
                aria-label="Shop Eyeglasses"
              />
            </div>
          </div>

          {/* RIGHT BLOCK: 5 Category Tiles Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-[580px] mx-auto w-full">
            
            {/* Column 1: Smart Glasses (tall) + Computer Glasses */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Smart Glasses */}
              <button
                onClick={() => handleCategoryClick('meta-smart')}
                className="relative w-full aspect-[282/204] rounded-[20px] overflow-hidden group focus:outline-none cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
              >
                <Image
                  src="/images/figma/cat_smart_glasses_hd.png"
                  alt="Smart Glasses"
                  fill
                  sizes="(max-width: 768px) 50vw, 282px"
                  className="object-contain"
                />
              </button>

              {/* Computer Glasses */}
              <button
                onClick={() => handleCategoryClick('eyeglasses')}
                className="relative w-full aspect-[282/94] rounded-[18px] overflow-hidden group focus:outline-none cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg drop-shadow-[0_6px_12px_rgba(0,0,0,0.05)]"
              >
                <Image
                  src="/images/figma/cat_computer_glasses_hd.png"
                  alt="Computer Glasses"
                  fill
                  sizes="(max-width: 768px) 50vw, 282px"
                  className="object-contain"
                />
              </button>
            </div>

            {/* Column 2: Powered Sunglasses + Contact Lenses + Reading Glasses */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Powered Sunglasses */}
              <button
                onClick={() => handleCategoryClick('sunglasses')}
                className="relative w-full aspect-[282/94] rounded-[18px] overflow-hidden group focus:outline-none cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg drop-shadow-[0_6px_12px_rgba(0,0,0,0.05)]"
              >
                <Image
                  src="/images/figma/cat_powered_sunglasses_hd.png"
                  alt="Powered Sunglasses"
                  fill
                  sizes="(max-width: 768px) 50vw, 282px"
                  className="object-contain"
                />
              </button>

              {/* Contact Lenses */}
              <button
                onClick={() => handleCategoryClick('contact-lenses')}
                className="relative w-full aspect-[282/94] rounded-[18px] overflow-hidden group focus:outline-none cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg drop-shadow-[0_6px_12px_rgba(0,0,0,0.05)]"
              >
                <Image
                  src="/images/figma/cat_contact_lenses_hd.png"
                  alt="Contact Lenses"
                  fill
                  sizes="(max-width: 768px) 50vw, 282px"
                  className="object-contain"
                />
              </button>

              {/* Reading Glasses */}
              <button
                onClick={() => handleCategoryClick('eyeglasses')}
                className="relative w-full aspect-[282/94] rounded-[18px] overflow-hidden group focus:outline-none cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg drop-shadow-[0_6px_12px_rgba(0,0,0,0.05)]"
              >
                <Image
                  src="/images/figma/cat_reading_glasses_hd.png"
                  alt="Reading Glasses"
                  fill
                  sizes="(max-width: 768px) 50vw, 282px"
                  className="object-contain"
                />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

