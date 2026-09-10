"use client";

import React, { useEffect, useMemo } from "react";
import { X, Trash2, ShoppingBag, Glasses, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/utils/formatters";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { toast } from "sonner";

interface WishlistDrawerProps {
  allProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  onOpenVirtualTryOn?: (product: Product) => void;
  onNavigateShop?: () => void;
  onNavigateCart?: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  allProducts = [],
  onSelectProduct,
  onOpenVirtualTryOn,
  onNavigateShop,
  onNavigateCart,
}) => {
  const { wishlistIds, isWishlistOpen, closeWishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCartDirect, openCart } = useCart();

  // Filter products currently in wishlist
  const savedProducts = useMemo(() => {
    return allProducts.filter((p) => wishlistIds.includes(p.id));
  }, [allProducts, wishlistIds]);

  // Total value of saved frames
  const totalValue = useMemo(() => {
    return savedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
  }, [savedProducts]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isWishlistOpen) {
        closeWishlist();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWishlistOpen, closeWishlist]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isWishlistOpen]);

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (product: Product) => {
    addToCartDirect(product);
    removeFromWishlist(product.id);
    toast.success("Moved to Shopping Bag", {
      description: `${product.name} added to your bag.`,
    });
  };

  const handleMoveAllToCart = () => {
    if (savedProducts.length === 0) return;
    savedProducts.forEach((p) => addToCartDirect(p));
    clearWishlist();
    closeWishlist();
    if (onNavigateCart) {
      onNavigateCart();
    } else {
      openCart();
    }
    toast.success("All Saved Frames Moved to Bag", {
      description: `${savedProducts.length} items added to your shopping bag.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={closeWishlist}
        aria-label="Close wishlist drawer overlay"
      />

      {/* Main Slide-over Drawer Container */}
      <div className="w-full sm:w-[400px] max-w-[400px] bg-[#FAF7F2] h-full flex flex-col justify-between shadow-2xl relative z-10 border-l border-[#E8DCCF] font-sans text-[#2A1E17] animate-in slide-in-from-right duration-300 ease-out shrink-0">
        {/* Top Header */}
        <div className="bg-[#FAF7F2] border-b border-[#E8DCCF] px-4 sm:px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF3EB] border border-[#E8DCCF] flex items-center justify-center text-[#C85A1B]">
              <Heart className="w-4 h-4 fill-[#C85A1B]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917] tracking-tight uppercase">
                Saved Frames
              </h2>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                {savedProducts.length} {savedProducts.length === 1 ? "FRAME" : "FRAMES"} IN VAULT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedProducts.length > 0 && (
              <button
                onClick={clearWishlist}
                className="text-[10px] font-bold text-stone-400 hover:text-rose-600 uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer"
                title="Clear all saved frames"
              >
                Clear All
              </button>
            )}

            <button
              onClick={closeWishlist}
              className="bg-[#FAF3EB] hover:bg-stone-200 text-[#1C1917] text-xs font-bold px-3 py-1.5 rounded-full border border-[#E8DCCF] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              aria-label="Close wishlist"
            >
              <X className="w-4 h-4 text-stone-700" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Items Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          {savedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF3EB] border border-[#E8DCCF] flex items-center justify-center mx-auto text-[#C85A1B]">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold uppercase text-stone-800">
                Your Saved Vault is Empty
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Save your favorite sunglasses, optical glasses, and limited edition frames while browsing to view or purchase them later.
              </p>
              <button
                onClick={() => {
                  closeWishlist();
                  onNavigateShop?.();
                }}
                className="bg-[#2A1E17] text-white px-6 py-2.5 text-xs font-bold font-serif uppercase tracking-widest hover:bg-[#C85A1B] transition-colors shadow-sm cursor-pointer"
              >
                Explore Eyewear Catalog
              </button>
            </div>
          ) : (
            <>
              {/* Luxury Vault Banner */}
              <div className="bg-white rounded-none p-3 border border-[#E8DCCF] shadow-2xs flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#C85A1B] shrink-0" />
                <p className="text-[11px] text-stone-600 font-medium leading-snug">
                  Personal Vault: Move items directly to your shopping bag or launch virtual try-on.
                </p>
              </div>

              {/* Wishlist Items List */}
              <div className="space-y-3">
                {savedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-[#E8DCCF] hover:border-[#C85A1B] p-3 flex gap-3 transition-all duration-200 shadow-2xs group relative"
                  >
                    {/* Product Image Thumbnail */}
                    <div
                      onClick={() => {
                        closeWishlist();
                        onSelectProduct?.(product);
                      }}
                      className="w-20 h-20 shrink-0 bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center p-1.5 cursor-pointer relative overflow-hidden"
                    >
                      <ImageWithFallback
                        src={product.images?.[0] || "/images/products/figma_cartier_blue_rimless.png"}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.isNewArrival && (
                        <span className="absolute top-1 left-1 bg-[#2A1E17] text-white text-[7.5px] font-bold px-1 py-0.5 uppercase tracking-wider">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Product Info & Actions */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-bold text-[#C85A1B] uppercase tracking-wider font-serif">
                            {product.brand}
                          </span>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove frame"
                            aria-label={`Remove ${product.name} from wishlist`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4
                          onClick={() => {
                            closeWishlist();
                            onSelectProduct?.(product);
                          }}
                          className="font-serif text-xs font-bold text-[#1C1917] hover:text-[#C85A1B] cursor-pointer line-clamp-1 transition-colors mt-0.5"
                          title={product.name}
                        >
                          {product.name}
                        </h4>

                        <div className="flex items-center gap-1.5 text-[9.5px] text-stone-500 mt-1 flex-wrap">
                          {product.shape && (
                            <span className="capitalize bg-stone-100 px-1.5 py-0.5 text-stone-600">
                              {product.shape}
                            </span>
                          )}
                          {product.color && (
                            <span className="bg-stone-100 px-1.5 py-0.5 text-stone-600">
                              {product.color}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Action Buttons */}
                      <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
                        <div>
                          <span className="font-serif font-bold text-xs sm:text-sm text-[#1C1917]">
                            {formatINR(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[9px] text-stone-400 line-through ml-1 block sm:inline">
                              {formatINR(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onOpenVirtualTryOn && (
                            <button
                              onClick={() => {
                                closeWishlist();
                                onOpenVirtualTryOn(product);
                              }}
                              className="border border-[#E8DCCF] hover:border-[#C85A1B] hover:text-[#C85A1B] bg-white text-[#2A1E17] text-[9.5px] font-bold uppercase tracking-wider px-2 py-1.5 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Virtual Try-On"
                            >
                              <Glasses className="w-3 h-3" />
                              <span className="hidden sm:inline">Try On</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleMoveToCart(product)}
                            className="bg-[#2A1E17] hover:bg-[#C85A1B] text-white text-[9.5px] font-serif font-bold uppercase tracking-wider px-2.5 py-1.5 flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            title="Move to shopping bag"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Move to Bag</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom Sticky Action Footer */}
        {savedProducts.length > 0 && (
          <div className="bg-[#FAF7F2] border-t border-[#E8DCCF] p-4 sm:p-5 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-medium">Total Vault Value:</span>
              <span className="font-serif text-base font-bold text-[#1C1917]">
                {formatINR(totalValue)}
              </span>
            </div>

            <button
              onClick={handleMoveAllToCart}
              className="w-full bg-[#2A1E17] hover:bg-[#C85A1B] text-white py-3 px-4 font-serif text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Move All to Shopping Bag</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={closeWishlist}
              className="w-full text-center text-stone-500 hover:text-black text-[11px] font-semibold uppercase tracking-wider py-1 cursor-pointer transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
