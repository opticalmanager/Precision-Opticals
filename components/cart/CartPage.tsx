"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Minus,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/shop/ProductCard";

interface CartPageProps {
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onNavigateContact: () => void;
  onProceedToCheckout: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenVirtualTryOn?: (product: Product) => void;
  allProducts: Product[];
}

export const CartPage: React.FC<CartPageProps> = ({
  onNavigateHome,
  onNavigateShop,
  onNavigateContact,
  onProceedToCheckout,
  onSelectProduct,
  onOpenVirtualTryOn,
  allProducts = [],
}) => {
  const {
    items,
    cartCount,
    updateQuantity,
    removeItem,
    clearCart,
    appliedCoupon,
    discountPercentage,
    applyCoupon,
    removeCoupon,
    rawSubtotal,
    discountAmount,
    grandTotal,
  } = useCart();

  // Recommended products for "You May Also Like"
  const recommendedProducts = useMemo(() => {
    const cartProductIds = new Set(items.map((i) => i.product.id));
    const available = allProducts.filter((p) => !cartProductIds.has(p.id));
    return available.length >= 4 ? available.slice(0, 6) : allProducts.slice(0, 6);
  }, [allProducts, items]);

  // Horizontal scroll state for "You May Also Like"
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, recommendedProducts]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const distance = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <main className="w-full bg-[#FAF7F2] pb-24 text-[#2A1E17]">
      {/* 1. HERO BANNER (CONCISE LUNA & ROSE BANNER WITH SEAMLESS COLOR BLENDING) */}
      <section className="w-full relative overflow-hidden bg-[#FAF7F2]">
        <div className="max-w-[1140px] mx-auto relative w-full h-[145px] sm:h-[175px] md:h-[195px] lg:h-[210px]">
          <Image
            src="/images/cart-hero-banner.png"
            alt="Luna and Rose Designer Eyewear New Collection"
            fill
            priority
            sizes="(max-width: 1140px) 100vw, 1140px"
            className="object-cover object-center"
          />
          {/* Subtle bottom fade into the #FAF7F2 canvas */}
          <div className="absolute inset-x-0 bottom-0 h-10 sm:h-14 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/50 to-transparent pointer-events-none" />
          {/* Side soft feathering */}
          <div className="absolute inset-y-0 left-0 w-6 sm:w-12 bg-gradient-to-r from-[#FAF7F2]/60 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-6 sm:w-12 bg-gradient-to-l from-[#FAF7F2]/30 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* 2. MAIN CART CONTENT CONTAINER (CONSTRAINED TO MAX-W-[1140px]) */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 relative">
        {/* Ambient top-right soft blush glow replicating Figma signature blending */}
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 w-[420px] h-[340px] pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#F4D9D2]/70 via-[#F7E6E1]/30 to-transparent blur-3xl -z-0"
        />
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-4"
        >
          <button
            onClick={onNavigateHome}
            className="hover:text-[#C86A28] transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#2A1E17] font-semibold">Your Cart</span>
        </nav>

        {/* Section Heading matching Figma */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-[#2A1E17]">Your </span>
            <span className="text-[#C86A28]">Cart</span>
          </h1>
          <div className="w-12 h-0.5 bg-[#C86A28] mt-2 mb-2.5 rounded-full" />
          <p className="text-xs sm:text-sm text-stone-600">
            Review your items and proceed to checkout.
          </p>
        </div>

        {/* CART MAIN GRID: LEFT (ITEMS) + RIGHT (SUMMARY AND HELP) */}
        {items.length === 0 ? (
          /* EMPTY CART VIEW */
          <div className="bg-white border border-[#EBE6DF] rounded-2xl p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-[#FAF3EB] text-[#C86A28] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2A1E17]">
              Your Cart is Currently Empty
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto leading-relaxed">
              Explore our handcrafted luxury frames, blue-light filters, and polarized designer sunglasses.
            </p>
            <button
              onClick={onNavigateShop}
              className="mt-6 inline-flex items-center gap-2 bg-[#2A1E17] hover:bg-[#3D312A] text-white px-7 py-3.5 rounded-xl font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore Eyewear Catalog</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: CART ITEMS (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-[#EBE6DF] rounded-2xl p-5 sm:p-7 shadow-xs">
                {/* Header Badge */}
                <div className="flex items-center gap-3 pb-5 border-b border-[#F3EFEA]">
                  <div className="w-8 h-8 rounded-full bg-[#FAF3EB] text-[#C86A28] flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif font-bold text-base sm:text-lg text-[#2A1E17]">
                    {cartCount} {cartCount === 1 ? "Item" : "Items"} in Your Cart
                  </h2>
                </div>

                {/* Items List */}
                <div className="divide-y divide-[#F3EFEA]">
                  {items.map((item) => {
                    const itemUnitPrice =
                      item.product.price + (item.lensConfig?.totalLensPrice || 0);
                    const itemLineTotal = itemUnitPrice * item.quantity;
                    const imageSrc =
                      item.product.images?.[0] ||
                      "/images/products/figma_cartier_blue_rimless.png";
                    const colorLabel =
                      item.selectedColor ||
                      item.selectedVariant?.colorName ||
                      item.product.variants?.[0]?.colorName ||
                      "Matte Black";
                    const lensLabel =
                      item.lensConfig?.lensPackage?.name || "Polarized";

                    return (
                      <div
                        key={item.id}
                        className="py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        {/* Thumbnail + Details */}
                        <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                          {/* Image Box */}
                          <div
                            onClick={() => onSelectProduct(item.product)}
                            className="w-24 h-20 sm:w-28 sm:h-24 bg-[#F6F4F0] rounded-xl flex items-center justify-center p-2 shrink-0 cursor-pointer border border-[#EBE6DF] hover:border-[#C86A28] transition-colors"
                          >
                            <div className="relative w-full h-full">
                              <Image
                                src={imageSrc}
                                alt={item.product.name}
                                fill
                                unoptimized
                                sizes="112px"
                                className="object-contain transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <h3
                              onClick={() => onSelectProduct(item.product)}
                              className="font-serif font-bold text-sm sm:text-base text-[#2A1E17] hover:text-[#C86A28] transition-colors cursor-pointer leading-snug"
                            >
                              {item.product.name}
                            </h3>
                            <p className="text-xs text-stone-500 mt-1">
                              Color: <span className="text-stone-700 font-medium">{colorLabel}</span>
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              Lens: <span className="text-stone-700 font-medium">{lensLabel}</span>
                            </p>
                            <span className="inline-block text-[11px] font-semibold text-emerald-600 mt-1.5">
                              In Stock
                            </span>
                          </div>
                        </div>

                        {/* Price, Delete and Stepper */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F3EFEA]">
                          {/* Top: Price & Remove Button */}
                          <div className="flex items-center gap-3">
                            <span className="font-sans font-bold text-base sm:text-lg text-[#2A1E17]">
                              ₹{itemLineTotal.toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              title="Remove item"
                              className="w-7 h-7 rounded-full bg-[#FAF3EB] hover:bg-rose-50 text-stone-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Bottom: Stepper */}
                          <div className="flex items-center bg-[#FAF3EB] border border-[#EBE6DF] rounded-lg px-2.5 py-1 gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              title="Decrease quantity"
                              className="text-stone-600 hover:text-[#C86A28] transition-colors cursor-pointer p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-sans font-bold text-xs sm:text-sm text-[#2A1E17] min-w-[14px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              title="Increase quantity"
                              className="text-stone-600 hover:text-[#C86A28] transition-colors cursor-pointer p-0.5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions Row: Clear Cart + Continue Shopping */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={clearCart}
                  className="bg-white border border-[#EBE6DF] hover:bg-stone-50 text-stone-700 hover:text-rose-600 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>

                <button
                  onClick={onNavigateShop}
                  className="bg-white border border-[#EBE6DF] hover:bg-stone-50 text-[#2A1E17] hover:text-[#C86A28] px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY + NEED HELP (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. ORDER SUMMARY CARD */}
              <div className="bg-white border border-[#EBE6DF] rounded-2xl p-6 sm:p-7 shadow-xs">
                {/* Header */}
                <div className="flex items-center gap-3 pb-5 border-b border-[#F3EFEA]">
                  <div className="w-8 h-8 rounded-full bg-[#FAF3EB] text-[#C86A28] flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h2 className="font-serif font-bold text-base sm:text-lg text-[#2A1E17]">
                    Order Summary
                  </h2>
                </div>

                {/* Pricing Rows */}
                <div className="py-4 space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-sans font-semibold text-[#2A1E17]">
                      ₹{rawSubtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Discount</span>
                    <span className="font-sans font-semibold text-emerald-600">
                      {discountAmount > 0
                        ? `- ₹${discountAmount.toLocaleString("en-IN")}`
                        : "- ₹0"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-stone-600">
                    <span>Shipping</span>
                    <span className="font-sans font-medium text-[#2A1E17]">Free</span>
                  </div>

                  {/* Promo Code Input / Indicator */}
                  {!appliedCoupon ? (
                    <div className="pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Promo code (e.g. PO10)"
                          id="cart-page-coupon-input"
                          className="flex-1 bg-[#FAF7F2] border border-[#EBE6DF] px-3 py-2 text-xs rounded-lg uppercase tracking-wider focus:outline-none focus:border-[#C86A28]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = (e.target as HTMLInputElement).value;
                              if (val) applyCoupon(val);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(
                              "cart-page-coupon-input"
                            ) as HTMLInputElement;
                            if (input && input.value) applyCoupon(input.value);
                          }}
                          className="bg-[#2A1E17] hover:bg-[#C86A28] text-white px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold">{appliedCoupon} Applied</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-emerald-700 hover:text-rose-600 font-semibold cursor-pointer underline text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-[#EBE6DF] pt-3 flex items-center justify-between">
                    <span className="font-serif font-bold text-base text-[#2A1E17]">
                      Total
                    </span>
                    <span className="font-sans font-bold text-xl sm:text-2xl text-[#2A1E17]">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={onProceedToCheckout}
                  className="w-full mt-3 bg-[#2A1E17] hover:bg-[#3D312A] text-white py-3.5 px-6 rounded-xl font-serif font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-colors shadow-md cursor-pointer group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Trust Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#C86A28]" />
                  <span>Secure checkout. 100% safe payments.</span>
                </div>
              </div>

              {/* 2. NEED HELP? CARD MATCHING FIGMA */}
              <div className="bg-gradient-to-br from-[#FBF3EC] via-[#F8EAE0] to-[#F4E0D2] border border-[#EBE6DF] rounded-[20px] p-6 relative overflow-hidden shadow-xs min-h-[160px] flex items-center justify-between">
                <div className="relative z-10 max-w-[210px]">
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2A1E17]">
                    Need Help?
                  </h3>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    Our team is here to help you find the perfect pair.
                  </p>
                  <button
                    onClick={onNavigateContact}
                    className="mt-3.5 inline-flex items-center gap-2 bg-[#211712] hover:bg-[#C86A28] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Contact Us</span>
                    <Headphones className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Optical glasses graphic on the right */}
                <div className="absolute right-0 top-0 bottom-0 w-[140px] sm:w-[160px] pointer-events-none flex items-center justify-end">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/cart-need-help-glasses.jpg"
                      alt="Precision Optics Support"
                      fill
                      sizes="160px"
                      className="object-contain object-right"
                    />
                    {/* Left soft blend to merge background colors */}
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#F8EAE0] to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. YOU MAY ALSO LIKE SECTION MATCHING FIGMA */}
        <section className="mt-14 sm:mt-18 pt-8 sm:pt-10 border-t border-[#EBE6DF]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1E17]">
                You May Also Like
              </h2>
              <div className="w-12 h-0.5 bg-[#C86A28] mt-2 rounded-full" />
            </div>

            {/* Navigation arrows displayed strictly only when scrollable */}
            <div className="flex items-center gap-2">
              {canScrollLeft && (
                <button
                  onClick={() => handleScroll("left")}
                  aria-label="Previous products"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#EBE6DF] hover:border-[#C86A28] text-stone-700 hover:text-[#C86A28] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {canScrollRight && (
                <button
                  onClick={() => handleScroll("right")}
                  aria-label="Next products"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#EBE6DF] hover:border-[#C86A28] text-stone-700 hover:text-[#C86A28] flex items-center justify-center transition-all shadow-xs cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory"
          >
            {recommendedProducts.map((product) => (
              <div
                key={product.id}
                className="w-[240px] sm:w-[260px] md:w-[270px] shrink-0 snap-start"
              >
                <ProductCard
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onOpenVirtualTryOn={onOpenVirtualTryOn}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};
