"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: string;
  brand: string;
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
  categoryFilter?: string;
  brandFilter?: string;
  accentColor?: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 'new-arrival-aurora',
    brand: 'NEW ARRIVAL',
    title: 'AURORA EYEWEAR',
    subtitle: 'TITANIUM COLLECTION • PRECISION OPTICS LUXURY EYEWEAR',
    buttonText: 'SHOP COLLECTION',
    imageUrl: '/images/figma_hero_banner.png',
    categoryFilter: 'sunglasses',
    accentColor: '#C86A28'
  },
  {
    id: 'see-beyond',
    brand: 'PRECISION OPTICS',
    title: 'SEE BEYOND.',
    subtitle: 'TIMELESS STYLE • EVERYDAY CONFIDENCE • PREMIUM SUNGLASSES FOR EVERY YOU',
    buttonText: 'SHOP NOW',
    imageUrl: '/images/banner_see_beyond_1785153512408.jpg',
    categoryFilter: 'sunglasses',
    accentColor: '#D4AF37'
  },
  {
    id: 'eyewear-every-you',
    brand: 'EXCLUSIVE COLLECTION',
    title: 'EYEWEAR FOR EVERY YOU',
    subtitle: 'STYLE THAT SPEAKS • VISION THAT LASTS • UV PROTECTION & LIGHTWEIGHT COMFORT',
    buttonText: 'EXPLORE COLLECTION',
    imageUrl: '/images/banner_every_you_1785153527777.jpg',
    categoryFilter: 'sunglasses',
    accentColor: '#1A1A1A'
  },
  {
    id: 'theo-eyewear',
    brand: 'THEO EYEWEAR',
    title: 'DESIGNED TO STAND OUT',
    subtitle: 'AVANT-GARDE HANDCRAFTED FRAMES • BELGIAN ARTISTRY & VIBRANT TINTS',
    buttonText: 'DISCOVER THEO',
    imageUrl: '/images/banner_theo_eyewear_1785153543549.jpg',
    brandFilter: 'theo',
    accentColor: '#E83E00'
  }
];

interface HeroSliderProps {
  onSelectSlideCategory: (category?: string, brand?: string) => void;
  onOpenAiStylist?: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onSelectSlideCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000); // 3 seconds interval
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleManualChange = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[400px] max-h-[580px] bg-black overflow-hidden group">
      {/* Background Images with smooth fade and subtle slow zoom */}
      {HERO_SLIDES.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            onClick={() => onSelectSlideCategory(item.categoryFilter, item.brandFilter)}
            className={`w-full h-full object-cover object-center cursor-pointer transition-transform duration-[6000ms] ease-out ${
              idx === currentSlide ? 'scale-105' : 'scale-100'
            }`}
          />
        </div>
      ))}

      {/* Slide Counter Badge (Top Right) */}
      <div className="absolute top-4 right-4 sm:right-6 lg:right-12 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10 text-xs font-mono tracking-widest">
        <span className="text-orange-400 font-bold">0{currentSlide + 1}</span>
        <span className="text-stone-500">/</span>
        <span className="text-stone-400">0{HERO_SLIDES.length}</span>
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={() => handleManualChange(currentSlide === 0 ? HERO_SLIDES.length - 1 : currentSlide - 1)}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 text-white hover:text-white hover:bg-orange-600 backdrop-blur-md transition-all border border-white/20 shadow-lg cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => handleManualChange((currentSlide + 1) % HERO_SLIDES.length)}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 text-white hover:text-white hover:bg-orange-600 backdrop-blur-md transition-all border border-white/20 shadow-lg cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Navigation Tabs (Bottom Bar) */}
      <div className="absolute bottom-4 right-6 sm:right-12 z-30 hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => handleManualChange(idx)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              idx === currentSlide
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-[9px] opacity-70">0{idx + 1}</span>
            <span>{s.brand}</span>
          </button>
        ))}
      </div>

      {/* Mobile Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex md:hidden items-center space-x-2">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleManualChange(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === currentSlide
                ? 'bg-orange-500 w-6'
                : 'bg-white/40 w-2 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
