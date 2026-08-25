"use client";

import React, { useState } from 'react';

interface ShopByGenderProps {
  onSelectGender: (gender: 'men' | 'women' | 'kids') => void;
  activeGender?: string[];
  activeCategory?: string;
  onExploreShop?: () => void;
  onSelectCategory?: (category: string) => void;
}

export const ShopByGender: React.FC<ShopByGenderProps> = ({
  onSelectGender,
  activeGender = ['men'],
  activeCategory = 'all',
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
      className="relative py-7 sm:py-9 overflow-hidden border-b border-[#C8B09C]"
      style={{
        background: 'linear-gradient(135deg, #EBD9C8 0%, #DFCBBA 40%, #C3A790 80%, #7B5B47 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-4 sm:mb-5">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#2A1E17] tracking-tight">
            Shop by <span className="font-serif italic font-normal text-[#2A1E17]">Category</span>
          </h2>
        </div>

        {/* Pill Switcher */}
        <div className="flex justify-center mb-6 sm:mb-7">
          <div className="inline-flex items-center bg-[#6B5140]/40 backdrop-blur-md p-1 rounded-full border border-white/25 shadow-inner">
            <button
              onClick={() => handlePillClick('all')}
              className={`px-5 sm:px-6 py-1.5 rounded-full text-xs font-medium transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedPill === 'all'
                  ? 'bg-[#F9F6F0] text-[#2A1E17] shadow-md font-semibold scale-102'
                  : 'text-white hover:text-white/80'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handlePillClick('men')}
              className={`px-5 sm:px-6 py-1.5 rounded-full text-xs font-medium transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedPill === 'men'
                  ? 'bg-[#F9F6F0] text-[#2A1E17] shadow-md font-semibold scale-102'
                  : 'text-white hover:text-white/80'
              }`}
            >
              Men
            </button>
            <button
              onClick={() => handlePillClick('women')}
              className={`px-5 sm:px-6 py-1.5 rounded-full text-xs font-medium transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedPill === 'women'
                  ? 'bg-[#F9F6F0] text-[#2A1E17] shadow-md font-semibold scale-102'
                  : 'text-white hover:text-white/80'
              }`}
            >
              Women
            </button>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
          
          {/* LEFT BLOCK: Sunglasses & Eyeglasses Dual Showcase (Span 6 on LG) */}
          <div className="lg:col-span-6 relative flex flex-col justify-end min-h-[250px] sm:min-h-[280px] pt-14 sm:pt-16">
            
            {/* OVERLAPPING 3D GLASSES GRAPHIC */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-[75%] max-w-[280px] sm:max-w-[340px] pointer-events-none filter drop-shadow-[0_15px_20px_rgba(42,30,23,0.3)] transition-transform duration-500 hover:scale-105">
              <svg viewBox="0 0 500 220" className="w-full h-auto overflow-visible">
                <defs>
                  {/* Frame Gradient */}
                  <linearGradient id="beigeFrame" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDFBF7" />
                    <stop offset="30%" stopColor="#F3E5D4" />
                    <stop offset="70%" stopColor="#E2CAAF" />
                    <stop offset="100%" stopColor="#C4A88B" />
                  </linearGradient>

                  {/* Sunglass Amber Lens Gradient */}
                  <linearGradient id="amberLens" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C86A28" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#A84C12" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#5E2203" stopOpacity="0.92" />
                  </linearGradient>

                  {/* Eyeglass Clear Lens Gradient */}
                  <linearGradient id="clearLens" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#FAF0E6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#E0CFBE" stopOpacity="0.3" />
                  </linearGradient>

                  {/* Lens Highlight */}
                  <linearGradient id="lensHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                    <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>

                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#3A2416" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Left Lens (Sunglasses Tint) */}
                <path
                  d="M 68 62 C 105 60, 185 60, 215 65 C 220 100, 212 145, 180 162 C 140 180, 85 170, 68 135 C 60 110, 62 80, 68 62 Z"
                  fill="url(#amberLens)"
                />
                {/* Left Lens Glare */}
                <path
                  d="M 75 68 C 110 66, 170 66, 200 70 C 185 105, 130 115, 80 100 Z"
                  fill="url(#lensHighlight)"
                />

                {/* Right Lens (Clear Optical) */}
                <path
                  d="M 285 65 C 315 60, 395 60, 432 62 C 438 80, 440 110, 432 135 C 415 170, 360 180, 320 162 C 288 145, 280 100, 285 65 Z"
                  fill="url(#clearLens)"
                />
                <path
                  d="M 292 70 C 330 66, 390 66, 425 68 C 410 105, 355 115, 300 100 Z"
                  fill="url(#lensHighlight)"
                />

                {/* Outer Frame Chassis */}
                <path
                  d="M 50 50 
                     C 100 46, 200 46, 222 55 
                     C 230 58, 235 68, 238 72 
                     C 245 74, 255 74, 262 72 
                     C 265 68, 270 58, 278 55 
                     C 300 46, 400 46, 450 50 
                     C 475 52, 482 70, 470 100 
                     C 458 130, 445 155, 415 178 
                     C 375 202, 305 195, 272 165 
                     C 262 155, 250 120, 250 105 
                     C 250 120, 238 155, 228 165 
                     C 195 195, 125 202, 85 178 
                     C 55 155, 42 130, 30 100 
                     C 18 70, 25 52, 50 50 Z"
                  fill="url(#beigeFrame)"
                  stroke="#A88B6F"
                  strokeWidth="2"
                  filter="url(#shadow)"
                />

                {/* Frame Inner Cutouts (Left Rim) */}
                <path
                  d="M 68 62 C 105 60, 185 60, 215 65 C 220 100, 212 145, 180 162 C 140 180, 85 170, 68 135 C 60 110, 62 80, 68 62 Z"
                  fill="none"
                  stroke="#7A5E43"
                  strokeWidth="4"
                />

                {/* Frame Inner Cutouts (Right Rim) */}
                <path
                  d="M 285 65 C 315 60, 395 60, 432 62 C 438 80, 440 110, 432 135 C 415 170, 360 180, 320 162 C 288 145, 280 100, 285 65 Z"
                  fill="none"
                  stroke="#7A5E43"
                  strokeWidth="4"
                />

                {/* Left Hinges metallic accent */}
                <rect x="24" y="62" width="16" height="6" rx="2" fill="#D4AF37" stroke="#8C6D1F" strokeWidth="0.5" />
                <line x1="26" y1="65" x2="38" y2="65" stroke="#705510" strokeWidth="1" />

                {/* Right Hinges metallic accent */}
                <rect x="460" y="62" width="16" height="6" rx="2" fill="#D4AF37" stroke="#8C6D1F" strokeWidth="0.5" />
                <line x1="462" y1="65" x2="474" y2="65" stroke="#705510" strokeWidth="1" />

                {/* Keyhole Bridge Accent */}
                <path d="M 236 68 C 242 62, 258 62, 264 68 C 260 85, 240 85, 236 68 Z" fill="#6B513C" opacity="0.4" />
              </svg>
            </div>

            {/* TWO CARDS SIDE BY SIDE */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full h-full">
              
              {/* CARD 1: SHOP SUNGLASSES */}
              <div 
                onClick={() => handleCategoryClick('sunglasses')}
                className="group cursor-pointer rounded-[20px] sm:rounded-[22px] overflow-hidden p-4 sm:p-5 flex flex-col justify-end min-h-[180px] sm:min-h-[200px] relative border border-white/70 shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(180deg, #FAF4EC 0%, #E8D8C7 50%, #D8C0A6 100%)'
                }}
              >
                <div className="relative z-10 text-center mt-auto pt-8 sm:pt-10">
                  <div className="flex items-center justify-center gap-1.5 text-[#5E4839] text-[10px] tracking-[0.2em] font-medium uppercase mb-0.5">
                    <span className="h-[1px] w-4 bg-[#8C705C]/50"></span>
                    <span>Shop</span>
                    <span className="h-[1px] w-4 bg-[#8C705C]/50"></span>
                  </div>
                  <h3 className="font-serif italic text-xl sm:text-2xl md:text-3xl text-[#211712] font-normal tracking-tight group-hover:scale-105 transition-transform duration-300">
                    Sunglasses
                  </h3>
                </div>
              </div>

              {/* CARD 2: SHOP EYEGLASSES */}
              <div 
                onClick={() => handleCategoryClick('eyeglasses')}
                className="group cursor-pointer rounded-[20px] sm:rounded-[22px] overflow-hidden p-4 sm:p-5 flex flex-col justify-end min-h-[180px] sm:min-h-[200px] relative border border-white/70 shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(180deg, #FCF8F3 0%, #EFE1D2 50%, #DFC9B2 100%)'
                }}
              >
                <div className="relative z-10 text-center mt-auto pt-8 sm:pt-10">
                  <div className="flex items-center justify-center gap-1.5 text-[#5E4839] text-[10px] tracking-[0.2em] font-medium uppercase mb-0.5">
                    <span className="h-[1px] w-4 bg-[#8C705C]/50"></span>
                    <span>Shop</span>
                    <span className="h-[1px] w-4 bg-[#8C705C]/50"></span>
                  </div>
                  <h3 className="font-serif italic text-xl sm:text-2xl md:text-3xl text-[#211712] font-normal tracking-tight group-hover:scale-105 transition-transform duration-300">
                    Eyeglasses
                  </h3>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT BLOCK: 5 CATEGORY CARDS GRID (Span 6 on LG) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            {/* CARD 1 (TALL): SMART GLASSES - Spans 2 Rows on SM+ */}
            <div 
              onClick={() => handleCategoryClick('meta-smart')}
              className="group cursor-pointer sm:row-span-2 rounded-[20px] overflow-hidden p-4 sm:p-5 flex flex-col justify-between min-h-[160px] sm:min-h-[200px] relative border border-white/80 shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              style={{
                background: 'linear-gradient(145deg, #E2F5FF 0%, #BFE7FE 50%, #A2DAFD 100%)'
              }}
            >
              {/* Smart Glasses Graphic Illustration */}
              <div className="relative w-full h-24 sm:h-32 flex items-center justify-center my-auto">
                {/* Glowing Rings Platform */}
                <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-sky-300/60 bg-sky-100/40 animate-pulse" />
                <div className="absolute w-18 h-18 sm:w-22 sm:h-22 rounded-full border border-sky-400/80 shadow-[0_0_12px_rgba(56,189,248,0.4)]" />
                
                {/* Smart Glasses Vector */}
                <svg viewBox="0 0 240 100" className="w-36 sm:w-44 h-auto z-10 filter drop-shadow-[0_8px_12px_rgba(14,116,144,0.3)] group-hover:scale-110 transition-transform duration-500">
                  <path d="M 20 30 H 220 V 40 H 20 Z" fill="#2A323D" rx="2" />
                  {/* Left Frame */}
                  <rect x="25" y="32" width="85" height="50" rx="8" fill="#1E242C" stroke="#38BDF8" strokeWidth="2" />
                  <rect x="30" y="36" width="75" height="42" rx="6" fill="#0F172A" opacity="0.85" />
                  {/* Camera lens indicator */}
                  <circle cx="35" cy="42" r="3" fill="#38BDF8" />
                  <circle cx="35" cy="42" r="1.5" fill="#FFFFFF" />

                  {/* Right Frame */}
                  <rect x="130" y="32" width="85" height="50" rx="8" fill="#1E242C" stroke="#38BDF8" strokeWidth="2" />
                  <rect x="135" y="36" width="75" height="42" rx="6" fill="#0F172A" opacity="0.85" />
                  {/* HUD display subtle glow */}
                  <path d="M 145 45 H 180 M 145 52 H 165" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

                  {/* Bridge */}
                  <rect x="110" y="38" width="20" height="6" fill="#2A323D" rx="2" />
                </svg>
              </div>

              {/* Title */}
              <div className="relative z-10 pt-1">
                <h3 className="font-serif italic text-xl sm:text-2xl text-slate-900 font-normal">
                  Smart <span className="font-sans font-medium text-lg sm:text-xl not-italic ml-0.5">Glasses</span>
                </h3>
              </div>
            </div>

            {/* CARD 2: POWERED SUNGLASSES */}
            <div 
              onClick={() => handleCategoryClick('sunglasses')}
              className="group cursor-pointer rounded-[18px] overflow-hidden p-3.5 sm:p-4 flex items-center justify-between min-h-[85px] sm:min-h-[95px] relative border border-white/80 shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #FEF5E7 0%, #FDE4C3 60%, #F3CE9F 100%)'
              }}
            >
              <div className="relative z-10 pr-2">
                <h3 className="font-serif italic text-lg sm:text-xl text-[#2C1D11] font-normal leading-tight">
                  Powered
                  <span className="font-sans font-medium text-xs sm:text-sm not-italic block text-[#2C1D11]">
                    Sunglasses
                  </span>
                </h3>
              </div>

              {/* Beach Reflection Sunglass Graphic */}
              <div className="relative w-14 h-12 sm:w-16 sm:h-14 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 50" className="w-full h-auto filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                  <path d="M 10 15 Q 30 10 45 18 Q 30 40 10 35 Z" fill="#B45309" stroke="#78350F" strokeWidth="2" />
                  <path d="M 55 18 Q 70 10 90 15 Q 90 35 70 40 Z" fill="#B45309" stroke="#78350F" strokeWidth="2" />
                  <line x1="45" y1="18" x2="55" y2="18" stroke="#78350F" strokeWidth="3" />
                  {/* Sun reflection inside lens */}
                  <circle cx="28" cy="22" r="6" fill="#FDE047" opacity="0.8" />
                  <path d="M 12 32 C 20 28 35 32 40 30" stroke="#FEF3C7" strokeWidth="1.5" opacity="0.6" />
                </svg>
              </div>
            </div>

            {/* CARD 3: CONTACT LENSES */}
            <div 
              onClick={() => handleCategoryClick('contact-lenses')}
              className="group cursor-pointer rounded-[18px] overflow-hidden p-3.5 sm:p-4 flex items-center justify-between min-h-[85px] sm:min-h-[95px] relative border border-white/80 shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #E6F7FF 0%, #C4EDFE 60%, #9EE0FC 100%)'
              }}
            >
              <div className="relative z-10 pr-2">
                <h3 className="font-serif italic text-lg sm:text-xl text-[#0C384B] font-normal leading-tight">
                  Contact
                  <span className="font-sans font-medium text-xs sm:text-sm not-italic block text-[#0C384B]">
                    Lenses
                  </span>
                </h3>
              </div>

              {/* Contact Lens Graphic */}
              <div className="relative w-14 h-12 sm:w-16 sm:h-14 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 80 70" className="w-full h-auto filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                  {/* Fingertip silhouette */}
                  <path d="M 30 65 C 30 45, 50 45, 50 65 Z" fill="#E2B195" opacity="0.9" />
                  {/* Translucent Contact Lens */}
                  <path d="M 20 40 C 20 20, 60 20, 60 40 Q 40 48 20 40 Z" fill="#38BDF8" fillOpacity="0.45" stroke="#0284C7" strokeWidth="1.5" />
                  <ellipse cx="40" cy="32" rx="14" ry="6" fill="#FFFFFF" fillOpacity="0.5" />
                </svg>
              </div>
            </div>

            {/* CARD 4: COMPUTER GLASSES */}
            <div 
              onClick={() => handleCategoryClick('eyeglasses')}
              className="group cursor-pointer rounded-[18px] overflow-hidden p-3.5 sm:p-4 flex items-center justify-between min-h-[85px] sm:min-h-[95px] relative border border-white/80 shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #EEF2FF 0%, #DCE3FE 60%, #C7D2FE 100%)'
              }}
            >
              <div className="relative z-10 pr-2">
                <h3 className="font-serif italic text-lg sm:text-xl text-[#1E1B4B] font-normal leading-tight">
                  Computer
                  <span className="font-sans font-medium text-xs sm:text-sm not-italic block text-[#1E1B4B]">
                    Glasses
                  </span>
                </h3>
              </div>

              {/* Computer Glasses Graphic */}
              <div className="relative w-14 h-12 sm:w-16 sm:h-14 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 90 50" className="w-full h-auto filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                  {/* Keyboard key grid backdrop */}
                  <rect x="5" y="32" width="80" height="15" rx="3" fill="#94A3B8" opacity="0.4" />
                  {/* Glasses */}
                  <rect x="15" y="10" width="28" height="20" rx="5" fill="none" stroke="#312E81" strokeWidth="2.5" />
                  <rect x="47" y="10" width="28" height="20" rx="5" fill="none" stroke="#312E81" strokeWidth="2.5" />
                  <line x1="43" y1="18" x2="47" y2="18" stroke="#312E81" strokeWidth="2.5" />
                  {/* Blue light reflection */}
                  <path d="M 18 12 L 35 25" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                  <path d="M 50 12 L 67 25" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                </svg>
              </div>
            </div>

            {/* CARD 5: READING GLASSES */}
            <div 
              onClick={() => handleCategoryClick('eyeglasses')}
              className="group cursor-pointer rounded-[18px] overflow-hidden p-3.5 sm:p-4 flex items-center justify-between min-h-[85px] sm:min-h-[95px] relative border border-white/80 shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #FEFCE8 0%, #FEF08A 60%, #E9D5FF 100%)'
              }}
            >
              <div className="relative z-10 pr-2">
                <h3 className="font-serif italic text-lg sm:text-xl text-[#3B1F11] font-normal leading-tight">
                  Reading
                  <span className="font-sans font-medium text-xs sm:text-sm not-italic block text-[#3B1F11]">
                    Glasses
                  </span>
                </h3>
              </div>

              {/* Reading Glasses Graphic */}
              <div className="relative w-14 h-12 sm:w-16 sm:h-14 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 90 50" className="w-full h-auto filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                  {/* Book lines backdrop */}
                  <path d="M 10 38 H 80 M 10 42 H 70 M 10 46 H 75" stroke="#A16207" strokeWidth="1" opacity="0.3" />
                  {/* Tortoiseshell reading glasses */}
                  <circle cx="28" cy="22" r="14" fill="none" stroke="#78350F" strokeWidth="3" />
                  <circle cx="62" cy="22" r="14" fill="none" stroke="#78350F" strokeWidth="3" />
                  <path d="M 42 20 C 45 16, 48 16, 50 20" fill="none" stroke="#78350F" strokeWidth="2.5" />
                  {/* Reading magnifying highlight */}
                  <circle cx="28" cy="22" r="11" fill="#FEF08A" opacity="0.3" />
                  <circle cx="62" cy="22" r="11" fill="#FEF08A" opacity="0.3" />
                </svg>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
