import React, { useState } from 'react';
import { Search, X, Glasses, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { formatINR } from '../../utils/formatters';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface SearchModalProps {
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectBrand: (brandId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  products,
  onClose,
  onSelectProduct,
  onSelectBrand
}) => {
  const [query, setQuery] = useState('');

  const filteredProducts =
    query.trim() === ''
      ? []
      : products.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.brand.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.color.toLowerCase().includes(query.toLowerCase()) ||
            p.shape.toLowerCase().includes(query.toLowerCase()) ||
            p.material.toLowerCase().includes(query.toLowerCase())
        );

  const POPULAR_TERMS = [
    'Cartier Gold',
    'Tom Ford Dax',
    'GAST Astro',
    'Meta Smart Glasses',
    'Lindberg Titanium',
    'Jacques Marie Mage',
    '18k Gold Plated',
    'Aviator Polarized'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 px-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#E8E2D5] max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:text-amber-800 text-stone-700 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="font-serif font-bold text-sm tracking-widest uppercase text-stone-900 mb-4">
          SEARCH PRECISION OPTICS CATALOGUE
        </h3>

        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand (Cartier, Tom Ford, GAST), model, or material (Titanium, Gold)..."
            autoFocus
            className="w-full bg-white border-2 border-stone-800 px-12 py-3.5 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-800/20"
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
        </div>

        {/* Popular Trending Keywords */}
        {query.trim() === '' && (
          <div className="space-y-4">
            <span className="text-[11px] font-sans font-bold tracking-widest uppercase text-stone-500 block">
              POPULAR SEARCHES
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-serif uppercase">
              {POPULAR_TERMS.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="bg-white border border-stone-300 hover:border-stone-900 px-3 py-1.5 text-stone-800 hover:text-black transition-all cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {query.trim() !== '' && (
          <div className="max-h-80 overflow-y-auto space-y-3 pt-2">
            <span className="text-[11px] font-sans font-bold tracking-widest uppercase text-stone-500 block">
              FOUND {filteredProducts.length} MATCHES
            </span>

            {filteredProducts.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-4">
                No frames matched "{query}". Try "Cartier", "Titanium", or "Sunglasses".
              </p>
            ) : (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    onClose();
                  }}
                  className="p-3 bg-white border border-stone-200 hover:border-stone-800 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#FAF7F2] border p-0.5 flex items-center justify-center shrink-0">
                      <ImageWithFallback src={p.images[0]} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <span className="font-serif font-bold text-xs text-[#C85A1B] uppercase block">
                        {p.brand}
                      </span>
                      <h5 className="font-bold text-xs text-stone-900 uppercase">{p.name}</h5>
                      <span className="text-[10px] text-stone-500 capitalize">
                        {p.category} • {p.shape} • {p.material}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-serif font-bold text-xs text-stone-900 block">
                      {formatINR(p.price)}
                    </span>
                    <span className="text-[10px] text-[#C85A1B] font-bold uppercase">View →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
