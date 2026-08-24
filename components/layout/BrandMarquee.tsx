import React from 'react';

export const BRAND_LOGOS = [
  { id: 'maybach', filterQuery: 'maybach', label: 'MAYBACH', font: 'font-sans font-bold tracking-[0.2em] text-[10px] sm:text-xs' },
  { id: 'cartier', filterQuery: 'cartier', label: 'Cartier', font: 'font-heading italic font-normal tracking-wide text-sm sm:text-base' },
  { id: 'tom-ford', filterQuery: 'tom', label: 'TOM FORD', font: 'font-sans font-bold tracking-[0.2em] text-[10px] sm:text-xs' },
  { id: 'ray-ban', filterQuery: 'ray', label: 'RAY-BAN', font: 'font-sans font-bold tracking-[0.15em] text-[10px] sm:text-xs' },
  { id: 'prada', filterQuery: 'prada', label: 'PRADA', font: 'font-sans font-bold tracking-[0.25em] text-[10px] sm:text-xs' },
  { id: 'jmm', filterQuery: 'jacques', label: 'JACQUES MARIE MAGE', font: 'font-sans font-semibold tracking-[0.12em] text-[9px] sm:text-[10px]' },
  { id: 'lindberg', filterQuery: 'lindberg', label: 'LINDBERG', font: 'font-sans font-bold tracking-[0.2em] text-[10px] sm:text-xs' },
  { id: 'gast', filterQuery: 'gast', label: 'GAST', font: 'font-sans font-bold tracking-[0.3em] text-[10px] sm:text-xs' },
];

interface BrandMarqueeProps {
  onSelectBrand?: (brandName: string) => void;
}

export const BrandMarquee: React.FC<BrandMarqueeProps> = ({ onSelectBrand }) => {
  // Double the items for seamless infinite scroll
  const doubledBrands = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <div 
      className="w-full py-2.5 overflow-hidden relative shadow-sm border-y border-[#D03500]"
      style={{ backgroundColor: '#E83E00', color: '#FFFFFF' }}
    >
      <div className="flex items-center animate-marquee whitespace-nowrap">
        {doubledBrands.map((brand, idx) => (
          <React.Fragment key={`${brand.id}-${idx}`}>
            <button
              onClick={() => onSelectBrand?.(brand.filterQuery)}
              className={`text-white hover:text-amber-100 transition-all uppercase cursor-pointer whitespace-nowrap px-6 sm:px-10 hover:scale-105 transform duration-200 shrink-0 ${brand.font}`}
              style={{ color: '#FFFFFF' }}
              title={`View ${brand.label} Collection`}
            >
              {brand.label}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
