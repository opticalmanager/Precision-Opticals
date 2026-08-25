"use client";

import React, { useState } from 'react';
import { Heart, Camera, Glasses } from 'lucide-react';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onOpenVirtualTryOn?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onOpenVirtualTryOn,
  onToggleWishlist,
  isWishlisted: propIsWishlisted
}) => {
  const { isWishlisted: contextIsWishlisted, toggleWishlist } = useWishlist();
  const isWishlisted = propIsWishlisted !== undefined ? propIsWishlisted : contextIsWishlisted(product.id);
  const handleToggle = onToggleWishlist || ((id) => toggleWishlist(id, product.name));

  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const displayImage = product.variants && product.variants.length > 0
    ? product.variants[selectedVariantIdx].image
    : (isHovered && product.images.length > 1 ? product.images[1] : product.images[0]);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(product.price);

  return (
    <div
      className="group bg-white rounded-none border border-[#E8E2D5] hover:border-[#C86A28] transition-all duration-300 flex flex-col justify-between p-4 relative shadow-xs"
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
            <span className="bg-[#C86A28] text-white text-[9px] font-sans font-bold tracking-widest px-2 py-0.5 uppercase">
              BESTSELLER
            </span>
          )}
          {product.category === 'meta-smart' && (
            <span className="bg-[#2A1E17] text-white border border-[#C86A28] text-[9px] font-sans font-bold tracking-widest px-2 py-0.5 uppercase">
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
              className="p-1.5 rounded-full hover:bg-[#FAF7F2] text-stone-500 hover:text-[#C86A28] transition-colors cursor-pointer"
              title="Virtual Try-On (3D Mirror)"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          {/* Wishlist Heart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(product.id);
            }}
            className="p-1.5 rounded-full hover:bg-[#FAF7F2] text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? 'fill-rose-600 text-rose-600' : 'text-stone-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Product Image Container */}
      <div
        onClick={() => onSelectProduct(product)}
        className="w-full h-48 sm:h-56 flex items-center justify-center cursor-pointer relative my-2 overflow-hidden bg-white"
      >
        <img
          src={displayImage}
          alt={product.name}
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover Quick Action overlay button */}
        <div className={`absolute bottom-2 inset-x-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="w-full bg-[#2A1E17] hover:bg-[#C86A28] text-white py-2 text-xs font-sans font-bold tracking-widest uppercase transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Glasses className="w-4 h-4 text-[#E8A267]" />
            SELECT &amp; CUSTOMIZE LENS
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="text-center pt-3 border-t border-[#F0EAE1]">
        {/* Color Swatch Dots if available */}
        {product.variants && product.variants.length > 1 && (
          <div className="flex items-center justify-center space-x-1.5 mb-2">
            {product.variants.map((v, idx) => (
              <button
                key={v.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVariantIdx(idx);
                }}
                className={`w-3 h-3 rounded-full border cursor-pointer ${
                  idx === selectedVariantIdx ? 'ring-2 ring-[#C86A28] scale-125' : 'border-stone-300'
                }`}
                style={{ backgroundColor: v.colorHex }}
                title={v.colorName}
              />
            ))}
          </div>
        )}

        {/* Brand Name */}
        <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#C86A28] uppercase block mb-0.5">
          {product.brand}
        </span>

        {/* Product Model Name */}
        <h3
          onClick={() => onSelectProduct(product)}
          className="font-sans text-[11px] sm:text-xs font-medium tracking-wider text-[#2A1E17] uppercase hover:text-[#C86A28] cursor-pointer line-clamp-1 mb-1"
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="text-[11px] sm:text-xs font-sans font-bold tracking-wider text-stone-900 uppercase">
          <span>{formattedPrice} INR</span>
          {product.originalPrice && (
            <span className="ml-2 text-[10px] text-stone-400 line-through font-normal">
              ₹ {product.originalPrice.toLocaleString()} INR
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
