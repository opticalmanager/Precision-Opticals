import React from 'react';

export const BRAND_LOGOS = [
  { id: 'ray-ban', filterQuery: 'ray', label: 'Ray-Ban', font: 'font-sans font-black tracking-tighter text-sm sm:text-base' },
  { id: 'cartier', filterQuery: 'cartier', label: 'Cartier', font: 'font-serif italic font-bold tracking-wide text-sm sm:text-base' },
  { id: 'gucci', filterQuery: 'gucci', label: 'GUCCI', font: 'font-serif font-extrabold tracking-[0.28em] text-xs sm:text-sm' },
  { id: 'tom-ford', filterQuery: 'tom', label: 'TOM FORD', font: 'font-sans font-bold tracking-[0.22em] text-xs sm:text-sm' },
  { id: 'prada', filterQuery: 'prada', label: 'PRADA', font: 'font-serif font-black tracking-[0.25em] text-xs sm:text-sm' },
];

interface BrandMarqueeProps {
  onSelectBrand?: (brandName: string) => void;
}

export const BrandMarquee: React.FC<BrandMarqueeProps> = ({ onSelectBrand }) => {
  return (
    <div 
      className="text-white py-1.5 px-4 shadow-xs relative border-y border-[#D03500]"
      style={{ backgroundColor: '#E83E00' }}
    >
      {/* Subtle top glossy highlight for luxury feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative z-10">
        {/* Left Badge */}
        <div className="hidden lg:flex items-center gap-1.5 pr-4 border-r border-white/25 text-[9px] font-serif tracking-[0.2em] text-orange-100 font-bold uppercase shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          TOP BESTSELLERS
        </div>

        {/* Top 5 Bestseller Brands - No scrollbar visible */}
        <div className="flex items-center justify-between sm:justify-around w-full gap-2 sm:gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-0">
          {BRAND_LOGOS.map((brand, idx) => (
            <React.Fragment key={brand.id}>
              <button
                onClick={() => onSelectBrand?.(brand.filterQuery)}
                className={`text-white hover:text-amber-200 transition-all uppercase cursor-pointer whitespace-nowrap opacity-95 hover:opacity-100 hover:scale-105 transform duration-200 drop-shadow-sm px-1 ${brand.font}`}
                title={`View ${brand.label} Collection`}
              >
                {brand.label}
              </button>
              {idx < BRAND_LOGOS.length - 1 && (
                <span className="text-white/40 text-[8px] font-serif shrink-0 select-none">✦</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
