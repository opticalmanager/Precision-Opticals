import React, { useState, useRef } from 'react';
import { Play, X, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface TrendingReelItem {
  id: string;
  brand: string;
  title: string;
  subtitle?: string;
  image: string;
  likes: string;
}

interface BlogReelsSectionProps {
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const BlogReelsSection: React.FC<BlogReelsSectionProps> = ({
  products = [],
  onSelectProduct,
}) => {
  const [selectedReel, setSelectedReel] = useState<TrendingReelItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reelItems: TrendingReelItem[] = [
    {
      id: 'urban-icons',
      brand: 'GAST MILANO',
      title: 'TITANIUM AS02 IN MOTION',
      subtitle: 'Hand-finished in Milan, Italy',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      likes: '14.2k',
    },
    {
      id: 'titanium',
      brand: 'LINDBERG',
      title: 'THE SCIENCE OF 2.7G LIGHTNESS',
      subtitle: 'Danish screwless titanium architecture',
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80',
      likes: '18.9k',
    },
    {
      id: 'streak-drip',
      brand: 'TOM FORD',
      title: 'DAX T-SIGNATURE CRAFT',
      subtitle: 'Hand-sculpted Italian acetate',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      likes: '22.1k',
    },
    {
      id: 'flip-ups',
      brand: 'RAY-BAN META',
      title: 'HANDS-FREE AI GLASSES',
      subtitle: 'Spatial audio & instant capture',
      image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      likes: '31.4k',
    },
  ];

  return (
    <section className="bg-[#FAF7F2] py-14 border-b border-[#E8DCCF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-[11px] font-sans font-bold tracking-widest text-[#C85A1B] uppercase block mb-1">
            EDITORIAL & ATELIER
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#2A1E17]">
            From the Master Opticians Journal
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {reelItems.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setSelectedReel(reel)}
              className="group relative h-[380px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={reel.image}
                alt={reel.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Play Badge */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white">
                <Play className="w-4 h-4 fill-white" />
              </div>

              {/* Reel Text */}
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <span className="text-[10px] font-bold text-[#E59B62] uppercase tracking-wider block mb-1">
                  {reel.brand}
                </span>
                <h4 className="font-serif font-bold text-base uppercase leading-snug">
                  {reel.title}
                </h4>
                {reel.subtitle && (
                  <p className="text-xs text-stone-300 mt-1 opacity-90">{reel.subtitle}</p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-3 font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-rose-400" />
                  <span>{reel.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Popover modal */}
        {selectedReel && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1C1917] border border-[#4A372C] max-w-md w-full p-6 text-white relative rounded-xl shadow-2xl">
              <button
                onClick={() => setSelectedReel(null)}
                className="absolute top-4 right-4 p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] text-[#E59B62] font-bold uppercase tracking-wider">
                {selectedReel.brand}
              </span>
              <h3 className="font-serif text-xl font-bold mt-1 mb-3">
                {selectedReel.title}
              </h3>

              <div className="relative aspect-video bg-black rounded-lg overflow-hidden my-3 flex items-center justify-center">
                <img
                  src={selectedReel.image}
                  alt={selectedReel.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#C85A1B] flex items-center justify-center shadow-xl text-white">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Discover the architectural precision and meticulous craftsmanship behind our luxury eyewear collections. Hand-calibrated in our certified optical labs.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
