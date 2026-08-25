"use client";

import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

interface CollectorItem {
  id: string;
  badge: string;
  brandTag: string;
  title: string;
  description: string;
  imageUrl: string;
  categoryFilter?: string;
}

interface CollectorsEditionSectionProps {
  onExploreCollection?: (collectionId: string) => void;
}

export const CollectorsEditionSection: React.FC<CollectorsEditionSectionProps> = ({
  onExploreCollection,
}) => {
  const collections: CollectorItem[] = [
    {
      id: 'marvel-spiderman',
      badge: 'MARVEL EDITION',
      brandTag: 'SPIDERMAN | PRECISION OPTICS',
      title: 'MARVEL SPIDER-MAN',
      description: 'Exclusive Superhero Collector Edition frames with web-etched details.',
      imageUrl: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=800&q=80',
      categoryFilter: 'sunglasses',
    },
    {
      id: 'house-of-dragon',
      badge: 'HBO ORIGINAL',
      brandTag: 'JOHN JACOBS | HOUSE OF DRAGON',
      title: 'HOUSE OF THE DRAGON',
      description: 'Valyrian Steel & Targaryen Gold sculpted titanium silhouettes.',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      categoryFilter: 'sunglasses',
    },
    {
      id: 'devil-wears-prada',
      badge: 'RUNWAY CLASSIC',
      brandTag: 'JOHN JACOBS | RUNWAY',
      title: 'THE DEVIL WEARS PRADA',
      description: 'Runway High-Fashion Sculpted cat-eye & oversized statement frames.',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      categoryFilter: 'sunglasses',
    },
    {
      id: 'pop-mart-pastel',
      badge: 'LIMITED EDITION',
      brandTag: 'POP MART | PRECISION OPTICS',
      title: 'POP MART PASTEL',
      description: 'Sweet Heart Charm Wireframe & pastel color-block optical frames.',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      categoryFilter: 'eyeglasses',
    },
  ];

  return (
    <section className="bg-[#FAF7F2] py-12 sm:py-16 border-b border-[#E8DCCF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="relative inline-block mb-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2A1E17] font-serif tracking-tight">
              Collector’s <span className="relative inline-block">
                Edition
                {/* Decorative Brush Underline in Terracotta (#C86A28) */}
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-[#C86A28] overflow-visible"
                  viewBox="0 0 120 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 3,8 C 30,3 70,2 117,7 C 95,11 50,11 10,9"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-stone-600 font-medium tracking-wide mt-2">
            Handpicked pieces from the world’s finest eyewear brands.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((item) => (
            <div
              key={item.id}
              onClick={() => onExploreCollection && onExploreCollection(item.id)}
              className="group relative h-[420px] sm:h-[460px] rounded-[24px] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border border-[#E8DCCF]"
            >
              {/* Card Image Background */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Gradient Dark Overlay for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 group-hover:via-black/50 transition-colors duration-300" />

              {/* Top Bar: Badge (Left) & Sparkle Icon (Right) */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full uppercase border border-white/30 shadow-xs">
                  {item.badge}
                </span>

                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs group-hover:bg-[#C86A28] group-hover:border-[#C86A28] transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex flex-col justify-end text-white">
                {/* Brand / Subtitle tag in Warm Terracotta / Gold */}
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase text-[#E59B62] mb-1.5 block drop-shadow-xs font-sans">
                  {item.brandTag}
                </span>

                {/* Main Card Title */}
                <h3 className="text-lg sm:text-xl font-extrabold font-serif uppercase tracking-tight text-white mb-2 leading-snug group-hover:text-stone-100 transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-stone-300 font-normal line-clamp-2 mb-4 leading-relaxed opacity-90">
                  {item.description}
                </p>

                {/* SHOP NOW Button Link */}
                <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-white group-hover:text-[#E59B62] transition-colors">
                  <span>SHOP NOW</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
