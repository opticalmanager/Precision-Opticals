import React, { useState } from 'react';
import { Heart, Camera, Glasses, Check, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatters';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onOpenVirtualTryOn?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onOpenVirtualTryOn
}) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCartDirect } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const saved = isWishlisted(product.id);

  const selectedVariant = product.variants && product.variants.length > 0
    ? product.variants[selectedVariantIdx]
    : undefined;

  const displayImage = selectedVariant
    ? selectedVariant.image
    : (isHovered && product.images.length > 1 ? product.images[1] : product.images[0]);

  return (
    <div
      className="group bg-white rounded-none border border-[#E8E2D5] hover:border-[#C85A1B] transition-all duration-300 flex flex-col justify-between p-4 relative shadow-2xs hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges & Wishlist */}
      <div className="flex items-center justify-between w-full mb-2 z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.isNewArrival && (
            <span className="bg-[#2A1E17] text-white text-[9px] font-sans font-bold tracking-widest px-2 py-0.5 uppercase">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#C85A1B] text-white text-[9px] font-sans font-bold tracking-widest px-2 py-0.5 uppercase">
              BESTSELLER
            </span>
          )}
          {product.category === 'meta-smart' && (
            <span className="bg-[#2A1E17] text-white border border-[#C85A1B] text-[9px] font-sans font-bold tracking-widest px-2 py-0.5 uppercase">
              META AI
            </span>
          )}
          {product.isLimitedEdition && (
            <span className="bg-[#8A6D3B] text-white text-[9px] font-sans font-bold tracking-widest px-2 py-0.5 uppercase">
              LIMITED
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onOpenVirtualTryOn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenVirtualTryOn(product);
              }}
              className="p-1.5 rounded-full hover:bg-[#FAF7F2] text-stone-500 hover:text-[#C85A1B] transition-colors"
              title="Virtual Try-On (3D Mirror)"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id, product.name);
            }}
            className="p-1.5 rounded-full hover:bg-[#FAF7F2] text-stone-500 hover:text-rose-600 transition-colors"
            title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              className={`w-4 h-4 ${saved ? 'fill-rose-600 text-rose-600' : 'text-stone-400'}`}
            />
          </button>
        </div>
      </div>

      {/* Main Product Image Container */}
      <div
        onClick={() => onSelectProduct(product)}
        className="w-full h-48 sm:h-56 flex items-center justify-center cursor-pointer relative my-2 overflow-hidden bg-white"
      >
        <ImageWithFallback
          src={displayImage}
          alt={product.name}
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover Quick Action overlay */}
        <div
          className={`absolute bottom-2 inset-x-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="w-full bg-[#2A1E17] hover:bg-[#C85A1B] text-white py-2 text-[11px] font-sans font-bold tracking-widest uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Glasses className="w-3.5 h-3.5 text-[#E8A267]" />
            <span>CUSTOMIZE & FIT LENSES</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="pt-2">
        <div className="flex items-center justify-between">
          <span className="font-serif font-bold text-xs text-[#C85A1B] uppercase tracking-wider">
            {product.brand}
          </span>
          <span className="text-[10px] text-stone-500 capitalize">
            {product.shape} • {product.rimType}
          </span>
        </div>

        <h3
          onClick={() => onSelectProduct(product)}
          className="font-bold text-xs sm:text-sm text-[#2A1E17] hover:text-[#C85A1B] transition-colors cursor-pointer line-clamp-1 mt-0.5"
        >
          {product.name}
        </h3>

        {/* Color Variants Swatches */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {product.variants.map((v, idx) => (
              <button
                key={v.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVariantIdx(idx);
                }}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  selectedVariantIdx === idx
                    ? 'ring-2 ring-[#C85A1B] ring-offset-1 scale-110'
                    : 'border-stone-300 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: v.colorHex }}
                title={v.colorName}
              />
            ))}
            <span className="text-[10px] text-stone-400 ml-1">
              +{product.variants.length} colors
            </span>
          </div>
        )}

        {/* Price Row & Quick Add Direct */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
          <div>
            <span className="font-serif font-bold text-sm text-[#2A1E17]">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-stone-400 line-through ml-2">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCartDirect(product, selectedVariant);
            }}
            className="text-stone-700 hover:text-[#C85A1B] p-1 transition-colors flex items-center gap-1 text-[11px] font-bold uppercase cursor-pointer"
            title="Add frame only to bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
