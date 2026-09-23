"use client";

import React, { useState } from "react";
import { Tag, ShieldCheck, X, Lock } from "lucide-react";
import { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface UnifiedCheckoutSidebarProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  shippingLabel?: string;
  discountAmount: number;
  totalPayable: number;
}

export const UnifiedCheckoutSidebar: React.FC<UnifiedCheckoutSidebarProps> = ({
  items,
  subtotal,
  shippingFee,
  shippingLabel = "FREE",
  discountAmount,
  totalPayable,
}) => {
  const { appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    try {
      const res = await applyCoupon(couponInput.trim().toUpperCase());
      if (res.success) {
        setCouponInput("");
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] lg:bg-transparent rounded-3xl p-6 sm:p-7 space-y-6">
      {/* 1. Itemized Products List */}
      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
        {items.map((item) => {
          const qty = item.quantity || 1;
          const unitPrice = Number(item.product?.price || 0);
          const lensPrice = Number(item.lensConfig?.totalLensPrice || 0);
          const lineTotal = (unitPrice + lensPrice) * qty;

          const imageSrc =
            item.product?.images?.[0] ||
            "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/placeholder-frame.webp";

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3.5 pb-3 border-b border-stone-200/80 last:border-b-0"
            >
              {/* Product Thumbnail with Quantity Badge */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-16 h-16 rounded-xl bg-white border border-stone-200 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                  <img
                    src={imageSrc}
                    alt={item.product?.name || "Eyewear"}
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-800 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {qty}
                  </span>
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                    {item.product?.name || "Luxury Frame"}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {item.product?.brand || "Designer Eyewear"} • {item.selectedColor || "Standard"}
                  </p>
                  {item.lensConfig?.lensPackage && (
                    <span className="inline-block text-[10px] text-[#C86A28] font-medium truncate max-w-[200px]">
                      {item.lensConfig.lensPackage.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Line Price */}
              <div className="text-right shrink-0 font-bold text-xs sm:text-sm text-stone-900 font-mono">
                {formatCurrency(lineTotal)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Promo / Gift Card Form Matching Reference */}
      <div className="pt-2">
        {appliedCoupon ? (
          <div className="p-3 bg-white border border-[#E8DCCF] rounded-xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C86A28]" />
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                {appliedCoupon}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                (-{formatCurrency(discountAmount)})
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeCoupon()}
              className="text-stone-400 hover:text-rose-600 transition-colors p-1"
              title="Remove promo code"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Discount code or gift card"
              className="flex-1 px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-stone-800 transition-colors shadow-2xs"
            />
            <button
              type="submit"
              disabled={isApplying || !couponInput.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs ${
                couponInput.trim()
                  ? "bg-stone-800 hover:bg-black text-white cursor-pointer"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              {isApplying ? "..." : "Apply"}
            </button>
          </form>
        )}
      </div>

      {/* 3. Financial Ledger Breakdown */}
      <div className="space-y-2.5 pt-2 text-xs sm:text-sm border-t border-stone-200/80">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span className="font-semibold text-stone-900 font-mono">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-stone-600">
          <span className="flex items-center gap-1">
            <span>Shipping</span>
          </span>
          <span
            className={`font-semibold uppercase tracking-wider text-[11px] ${
              shippingFee === 0 ? "text-stone-800" : "text-stone-900 font-mono"
            }`}
          >
            {shippingFee === 0 ? shippingLabel : formatCurrency(shippingFee)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Discount</span>
            <span className="font-semibold font-mono">
              -{formatCurrency(discountAmount)}
            </span>
          </div>
        )}

        {/* Total Row */}
        <div className="pt-3 border-t border-stone-300 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-stone-900 text-base sm:text-lg">
              Total
            </span>
            <span className="text-[11px] font-mono text-stone-400 uppercase">
              INR
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight font-serif">
            {formatCurrency(totalPayable)}
          </div>
        </div>
      </div>

      {/* 4. Trust & Security Badges */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-200/60">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>256-bit SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#C86A28] shrink-0" />
          <span>Razorpay Verified Atelier</span>
        </div>
      </div>
    </div>
  );
};
