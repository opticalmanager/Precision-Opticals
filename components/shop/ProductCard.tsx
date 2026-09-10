"use client";

import React, { memo, useState, useEffect } from "react";
import { Heart, Star, Tag, Zap, Camera } from "lucide-react";
import { Product } from "@/types";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onOpenVirtualTryOn?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  onSelectProduct,
  onOpenVirtualTryOn,
  onToggleWishlist,
  isWishlisted: propIsWishlisted,
}: ProductCardProps) {
  const { isWishlisted: contextIsWishlisted, toggleWishlist } = useWishlist();
  const isWishlisted = propIsWishlisted !== undefined ? propIsWishlisted : contextIsWishlisted(product.id);
  const handleToggle = onToggleWishlist || ((id: string) => toggleWishlist(id, product.name));

  // Discount calculation
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 15; // default 15% discount badge matching Figma

  const originalPriceDisplay = product.originalPrice || Math.round(product.price * 1.18);

  // Fallback-safe image state
  const fallbackImg = "/images/products/figma_cartier_blue_rimless.png";
  const initialImg = product.images?.[0] || fallbackImg;
  const [imgSrc, setImgSrc] = useState<string>(initialImg);

  useEffect(() => {
    setImgSrc(product.images?.[0] || fallbackImg);
  }, [product.images]);

  // Offers vs Sale badge logic matching Figma
  const hasMultipleOffers = product.id.includes("cartier-gold") || product.brand?.toLowerCase() === "cartier";

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="w-full min-h-[390px] bg-white border border-[#EBE6DF] rounded-[16px] p-4 flex flex-col justify-between relative group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 select-none"
    >
      {/* Top Floating Actions: Wishlist Heart & Virtual Try-On */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5">
        {onOpenVirtualTryOn && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenVirtualTryOn(product);
            }}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-[#FAF7F2] text-[#6B7280] hover:text-[#C86A28] border border-[#E5E7EB] backdrop-blur-xs flex items-center justify-center transition-all duration-200 focus:outline-none shadow-2xs cursor-pointer opacity-0 group-hover:opacity-100"
            title="3D Virtual Try-On"
            aria-label="Virtual Try-On"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(product.id);
          }}
          className="w-8 h-8 rounded-full bg-white/90 hover:bg-[#C86A28] hover:text-white border border-[#E5E7EB] backdrop-blur-xs flex items-center justify-center transition-all duration-200 focus:outline-none shadow-2xs cursor-pointer"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted
                ? "fill-[#C86A28] text-[#C86A28]"
                : "text-[#6B7280] group-hover:text-white"
            }`}
          />
        </button>
      </div>

      {/* Main Eyewear Image Display - Fixed Aspect Ratio and Size */}
      <div className="w-full h-36 sm:h-40 shrink-0 flex items-center justify-center p-2 relative overflow-hidden mb-2 bg-transparent">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(fallbackImg)}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </div>

      {/* Product Details Section */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Brand Name */}
          {product.brand ? (
            <h4 className="font-sans font-black text-[12px] leading-tight tracking-[0.5px] uppercase text-[#111827]">
              {product.brand}
            </h4>
          ) : (
            <div className="h-4" />
          )}

          {/* Subtitle / Model Title */}
          <p className="font-sans font-normal text-[11px] leading-[15px] text-[#4B5563] line-clamp-2 mt-1">
            {product.subtitle || product.name}
          </p>
        </div>

        {/* Size & Rating Row */}
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

        {/* Sale & Promo Status Row Matching Figma */}
        <div className="border-t border-[#F3F4F6] pt-2 mt-1.5 flex items-center gap-1.5 text-[11px] text-[#1F2937] font-sans">
          {hasMultipleOffers ? (
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
