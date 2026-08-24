import React from 'react';
import { Heart, Trash2, ShoppingBag, Glasses, ArrowRight, ArrowLeft } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatters';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface WishlistPageProps {
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateShop: () => void;
  onNavigateHome: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  allProducts,
  onSelectProduct,
  onNavigateShop,
  onNavigateHome
}) => {
  const { wishlistIds, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCartDirect } = useCart();

  const savedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 text-[#2A1E17] font-sans pb-20 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-stone-500 font-semibold">
            <button onClick={onNavigateHome} className="hover:text-[#C85A1B] font-bold cursor-pointer">
              HOME
            </button>
            <span>/</span>
            <span className="text-[#C85A1B] font-bold">SAVED FRAMES ({wishlistIds.length})</span>
          </div>

          {savedProducts.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-stone-500 hover:text-rose-600 font-bold uppercase tracking-wider cursor-pointer"
            >
              Clear All Saved
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-[10px] font-sans font-bold tracking-widest text-[#C85A1B] uppercase block">
            PERSONAL VAULT
          </span>
          <h1 className="font-serif text-3xl font-bold uppercase text-[#1C1917]">
            Your Saved Eyewear Frames
          </h1>
        </div>

        {savedProducts.length === 0 ? (
          <div className="bg-white border border-[#E8DCCF] p-12 sm:p-16 text-center space-y-4 rounded-xl shadow-xs">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold uppercase text-stone-900">
              No Saved Frames Yet
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              Explore our luxury sunglasses and optical eyewear collections to save your favorite frames here.
            </p>
            <button
              onClick={onNavigateShop}
              className="bg-[#2A1E17] hover:bg-[#C85A1B] text-white px-8 py-3.5 font-serif font-bold text-xs uppercase tracking-widest transition-colors shadow-md cursor-pointer"
            >
              Explore Eyewear Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-[#E8DCCF] hover:border-[#C85A1B] p-4 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-lg rounded-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#C85A1B] uppercase tracking-wider font-serif">
                      {product.brand}
                    </span>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div
                    onClick={() => onSelectProduct(product)}
                    className="w-full h-44 my-2 flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    <ImageWithFallback
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h4
                    onClick={() => onSelectProduct(product)}
                    className="font-bold text-sm text-[#1C1917] hover:text-[#C85A1B] cursor-pointer line-clamp-1"
                  >
                    {product.name}
                  </h4>
                  <p className="text-xs text-stone-500 capitalize mt-0.5">
                    {product.shape} • {product.rimType}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 mt-4 space-y-2">
                  <span className="font-serif font-bold text-base text-[#1C1917] block">
                    {formatINR(product.price)}
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addToCartDirect(product)}
                      className="bg-white hover:bg-stone-50 border border-stone-800 text-stone-900 py-2 text-[11px] font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>

                    <button
                      onClick={() => onSelectProduct(product)}
                      className="bg-[#2A1E17] hover:bg-[#C85A1B] text-white py-2 text-[11px] font-bold uppercase transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Glasses className="w-3.5 h-3.5 text-[#E8A267]" />
                      <span>Fit Lens</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
