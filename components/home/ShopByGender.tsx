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
        <div className="text-center mb-4 sm:mb-5">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#2A1E17] tracking-tight">
            Shop by <span className="font-serif italic font-normal text-[#2A1E17]">Category</span>
          </h2>
        </div>

        <div className="flex justify-center mb-6 sm:mb-7">
          <div className="inline-flex items-center bg-[#6B5140]/40 backdrop-blur-md p-1 rounded-full border border-white/25 shadow-inner">
            <button
              onClick={() => handlePillClick('all')}
              className={`px-5 sm:px-6 py-1.5 rounded-full text-xs font-medium transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedPill === 'all'
                  ? 'bg-[#F9F6F0] text-[#2A1E17] shadow-md font-semibold'
                  : 'text-white hover:text-white/80'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handlePillClick('men')}
              className={`px-5 sm:px-6 py-1.5 rounded-full text-xs font-medium transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedPill === 'men'
                  ? 'bg-[#F9F6F0] text-[#2A1E17] shadow-md font-semibold'
                  : 'text-white hover:text-white/80'
              }`}
            >
              Men
            </button>
            <button
              onClick={() => handlePillClick('women')}
              className={`px-5 sm:px-6 py-1.5 rounded-full text-xs font-medium transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedPill === 'women'
                  ? 'bg-[#F9F6F0] text-[#2A1E17] shadow-md font-semibold'
                  : 'text-white hover:text-white/80'
              }`}
            >
              Women
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div
            onClick={() => handleCategoryClick('sunglasses')}
            className="group relative bg-[#2A1E17] text-white p-6 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[220px]"
          >
            <div className="z-10">
              <span className="text-[10px] font-sans tracking-widest text-[#E59B62] uppercase font-bold">POLARIZED & UV400</span>
              <h3 className="font-serif text-2xl font-bold mt-1">Sunglasses</h3>
              <p className="text-stone-300 text-xs mt-2">Bespoke Italian acetate and Japanese titanium luxury sunwear.</p>
            </div>
            <div className="z-10 flex items-center gap-1 font-serif text-xs text-[#E59B62] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              <span>EXPLORE SUN</span>
              <span>→</span>
            </div>
          </div>

          <div
            onClick={() => handleCategoryClick('eyeglasses')}
            className="group relative bg-[#FAF7F2] text-[#2A1E17] border border-[#C8B09C] p-6 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[220px]"
          >
            <div className="z-10">
              <span className="text-[10px] font-sans tracking-widest text-[#C85A1B] uppercase font-bold">CLINICAL PRECISION</span>
              <h3 className="font-serif text-2xl font-bold mt-1">Eyeglasses</h3>
              <p className="text-stone-600 text-xs mt-2">Custom single-vision & progressive Zeiss / Essilor prescription lenses.</p>
            </div>
            <div className="z-10 flex items-center gap-1 font-serif text-xs text-[#C85A1B] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              <span>EXPLORE OPTICAL</span>
              <span>→</span>
            </div>
          </div>

          <div
            onClick={() => handleCategoryClick('meta-smart')}
            className="group relative bg-[#1C1917] text-white p-6 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[220px] border border-[#C85A1B]/40"
          >
            <div className="z-10">
              <span className="bg-[#C85A1B] text-white text-[9px] font-sans font-black px-2 py-0.5 rounded tracking-widest uppercase">
                AI POWERED
              </span>
              <h3 className="font-serif text-2xl font-bold mt-2">Meta Smart Glasses</h3>
              <p className="text-stone-300 text-xs mt-2">Built-in 12MP Ultra-HD camera, open-ear spatial audio & Meta AI assistant.</p>
            </div>
            <div className="z-10 flex items-center gap-1 font-serif text-xs text-[#E59B62] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              <span>EXPLORE AI GLASSES</span>
              <span>→</span>
            </div>
          </div>

          <div
            onClick={() => {
              onSelectGender('kids');
              if (onExploreShop) onExploreShop();
            }}
            className="group relative bg-[#FAF3EB] text-[#2A1E17] border border-[#C8B09C] p-6 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[220px]"
          >
            <div className="z-10">
              <span className="text-[10px] font-sans tracking-widest text-[#C85A1B] uppercase font-bold">FLEXIBLE & DURABLE</span>
              <h3 className="font-serif text-2xl font-bold mt-1">Kids & Teens</h3>
              <p className="text-stone-600 text-xs mt-2">Ultra-lightweight, hypoallergenic, impact-resistant safety frames.</p>
            </div>
            <div className="z-10 flex items-center gap-1 font-serif text-xs text-[#C85A1B] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              <span>EXPLORE KIDS</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
