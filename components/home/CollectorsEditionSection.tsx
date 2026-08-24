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
      badge: 'LIMITED EDITION',
      brandTag: 'HERITAGE | PRECISION OPTICS',
      title: 'TITANIUM BESPOKE ARCHIVE',
      description: 'Exclusive 18k Gold Plated and aerospace Japanese Titanium collector frames.',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      categoryFilter: 'sunglasses',
    },
    {
      id: 'house-of-dragon',
      badge: 'HAUTE COUTURE',
      brandTag: 'CARTIER & TOM FORD | PRIVATE VAULT',
      title: 'THE ROYAL SIGNATURE C',
      description: 'Hand-sculpted gold-tone rimless silhouettes with emerald tinted lenses.',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      categoryFilter: 'sunglasses',
    },
    {
      id: 'devil-wears-prada',
      badge: 'RUNWAY MASTERPIECE',
      brandTag: 'JACQUES MARIE MAGE | 10MM ACETATE',
      title: 'DEALAN LIMITED ARCHIVE',
      description: 'Runway sculpted thick block Italian acetate with custom wirecore detailing.',
      imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      categoryFilter: 'sunglasses',
    },
    {
      id: 'pop-mart-pastel',
      badge: 'META AI INTELLIGENCE',
      brandTag: 'RAY-BAN META | SPATIAL AUDIO',
      title: 'META SMART GLASSES AI',
      description: 'Ultra-light frames with dual 12MP cameras, 5-mic spatial audio array and Meta AI.',
      imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80',
      categoryFilter: 'meta-smart',
    },
  ];

  return (
    <section className="bg-[#FAF7F2] py-12 sm:py-16 border-b border-[#E8DCCF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-sans font-bold tracking-widest text-[#C85A1B] uppercase block mb-1">
            RARE & COVETED
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2A1E17] font-serif tracking-tight">
            Collector’s Edition
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-medium tracking-wide mt-2">
            Handpicked rarities from the world’s most prestigious optical maisons.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((item) => (
            <div
              key={item.id}
              onClick={() => onExploreCollection?.(item.id)}
              className="group relative h-[420px] sm:h-[460px] rounded-[24px] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border border-[#E8DCCF]"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 transition-colors duration-300" />

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full uppercase border border-white/30 shadow-xs">
                  {item.badge}
                </span>

                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xs group-hover:bg-[#C85A1B] group-hover:border-[#C85A1B] transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex flex-col justify-end text-white">
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase text-[#E59B62] mb-1.5 block drop-shadow-xs font-sans">
                  {item.brandTag}
                </span>

                <h3 className="text-lg sm:text-xl font-extrabold font-serif uppercase tracking-tight text-white mb-2 leading-snug group-hover:text-stone-100 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-stone-300 font-normal line-clamp-2 mb-4 leading-relaxed opacity-90">
                  {item.description}
                </p>

                <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-white group-hover:text-[#E59B62] transition-colors">
                  <span>EXPLORE COLLECTION</span>
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
