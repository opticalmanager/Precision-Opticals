"use client";

import React, { memo, useState, useEffect } from "react";
import { Heart, Star, Tag, Zap } from "lucide-react";
import { Product } from "@/types";
import { useWishlist } from "@/context/WishlistContext";

interface HomeProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const HomeProductCard = memo(function HomeProductCard({
  product,
  onSelectProduct,
}: HomeProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  // Calculate discount percentage if originalPrice exists
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 15; // default fallback matching Figma

  const originalPriceDisplay = product.originalPrice || Math.round(product.price * 1.18);

  // Fallback-safe image state
  const fallbackImg = "/images/products/figma_cartier_blue_rimless.png";
  const initialImg = product.images?.[0] || fallbackImg;
  const [imgSrc, setImgSrc] = useState<string>(initialImg);

  useEffect(() => {
    setImgSrc(product.images?.[0] || fallbackImg);
  }, [product.images]);

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="w-[232px] sm:w-[244px] shrink-0 min-h-[390px] bg-white border border-[#EBE6DF] rounded-[16px] p-4 flex flex-col justify-between relative group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 select-none"
    >
      {/* Wishlist Heart Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id, product.name);
        }}
        className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-[#C86A28] hover:text-white border border-[#E5E7EB] backdrop-blur-xs flex items-center justify-center transition-all duration-200 focus:outline-none shadow-2xs cursor-pointer"
        aria-label="Add to wishlist"
      >
        <Heart
          className={`w-3.5 h-3.5 transition-colors ${
            wishlisted
              ? "fill-[#C86A28] text-[#C86A28]"
              : "text-[#6B7280] group-hover:text-white"
          }`}
        />
      </button>

      {/* Product Image Area - Fixed Aspect Ratio and Size */}
      <div className="w-full h-36 sm:h-40 shrink-0 flex items-center justify-center p-2 relative overflow-hidden mb-2 bg-transparent">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(fallbackImg)}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        {/* Brand Name & Subtitle */}
        <div>
          {product.brand ? (
            <h4 className="font-sans font-black text-[12px] leading-tight tracking-[0.5px] uppercase text-[#111827]">
              {product.brand}
            </h4>
          ) : (
            <div className="h-3" />
          )}

          {/* Subtitle / Model description */}
          <p className="font-sans font-normal text-[11px] leading-[15px] text-[#4B5563] line-clamp-2 mt-1">
            {product.subtitle || product.name}
          </p>
        </div>

        {/* Size and Rating row */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] font-sans">
          <span>Size: M</span>
          <span className="text-[#D1D5DB]">|</span>
          <div className="flex items-center gap-1 text-[#D97706] font-bold text-[11px]">
            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
            <span>{product.rating ? product.rating.toFixed(1) : "5.0"}</span>
          </div>
        </div>

        {/* Pricing Row */}
        <div className="pt-0.5 space-y-0.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-sans font-bold text-[16px] text-[#111827]">
              ₹ {product.price.toLocaleString("en-IN")}
            </span>
            <span className="font-sans font-normal text-[11px] text-[#6B7280]">
              including lenses
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-sans">
            <span className="text-[#9CA3AF] line-through">
              ₹ {originalPriceDisplay.toLocaleString("en-IN")}
            </span>
            <span className="text-[#0284C7] font-bold text-[11px]">
              ({discountPercent}% OFF)
            </span>
          </div>
        </div>

        {/* Sale Tag Bar */}
        <div className="border-t border-[#F3F4F6] pt-2 mt-1.5 flex items-center gap-1.5 text-[11px] text-[#1F2937] font-sans">
          {product.id === "figma-cartier-gold-rectangle" || product.brand?.toLowerCase() === "cartier" ? (
            <>
              <Tag className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span className="font-bold text-[#111827]">2 Offers Available</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-[#EA580C] fill-[#EA580C] shrink-0" />
              <span className="font-medium text-[#374151]">on sale price applied!</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
