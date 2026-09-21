"use client";

import React, { useState } from "react";
import { Tag, ShieldCheck, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CheckoutBillDetailsProps {
  subtotal: number;
  discount: number;
  shippingFee?: number;
  totalPayable: number;
  ctaText?: string;
  onCtaClick?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  showCtaButton?: boolean;
}

export const CheckoutBillDetails: React.FC<CheckoutBillDetailsProps> = ({
  subtotal,
  discount,
  shippingFee = 0,
  totalPayable,
  ctaText,
  onCtaClick,
  isSubmitting = false,
  disabled = false,
  showCtaButton = true,
}) => {
  const [isPriceExpanded, setIsPriceExpanded] = useState(false);
  const [isDiscountExpanded, setIsDiscountExpanded] = useState(false);

  const savingsAmount = discount > 0 ? discount : Math.round(subtotal * 0.15);

  return (
    <div className="w-full space-y-4">
      {/* Bill Card Container */}
      <div className="bg-white border border-[#EBE6DF] rounded-[24px] p-6 shadow-sm">
        {/* Savings Pill Banner */}
        {savingsAmount > 0 && (
          <div className="bg-[#FFF8F0] border border-[#FED7AA] rounded-xl p-3 sm:p-3.5 flex items-center gap-2 mb-5">
            <Tag className="w-4 h-4 text-[#C86A28] shrink-0" />
            <span className="text-xs sm:text-[13px] font-bold text-[#C86A28]">
              You are saving {formatCurrency(savingsAmount)} on this order
            </span>
          </div>
        )}

        {/* Bill Heading */}
        <h3 className="font-serif font-extrabold text-stone-900 text-base sm:text-lg tracking-tight mb-4">
          Bill Details
        </h3>

        {/* Breakdown Items */}
        <div className="space-y-3 text-xs sm:text-sm">
          {/* Total item price */}
          <div>
            <div
              onClick={() => setIsPriceExpanded(!isPriceExpanded)}
              className="flex items-center justify-between text-stone-700 cursor-pointer hover:text-stone-900 select-none"
            >
              <div className="flex items-center gap-1">
                <span>Total item price</span>
                {isPriceExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                )}
              </div>
              <span className="font-semibold text-stone-900">{formatCurrency(subtotal)}</span>
            </div>
            {isPriceExpanded && (
              <div className="pl-3 pr-1 py-1 text-[11px] text-stone-500 flex justify-between">
                <span>Includes Luxury Frames & Zeiss Prescription Optics</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            )}
          </div>

          {/* Total discount */}
          <div>
            <div
              onClick={() => setIsDiscountExpanded(!isDiscountExpanded)}
              className="flex items-center justify-between text-stone-700 cursor-pointer hover:text-stone-900 select-none"
            >
              <div className="flex items-center gap-1">
                <span>Total discount</span>
                {isDiscountExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                )}
              </div>
              <span className="font-semibold text-emerald-600">
                {discount > 0 ? `- ${formatCurrency(discount)}` : "—"}
              </span>
            </div>
            {isDiscountExpanded && (
              <div className="pl-3 pr-1 py-1 text-[11px] text-emerald-600 flex justify-between">
                <span>Seasonal Atelier Privileges & Coupons</span>
                <span>- {formatCurrency(discount)}</span>
              </div>
            )}
          </div>

          {/* Delivery Fee */}
          <div className="flex items-center justify-between text-stone-700">
            <span>Delivery Fee</span>
            <span className="font-bold text-emerald-600 text-xs tracking-wider uppercase">
              {shippingFee === 0 ? "FREE EXPRESS" : formatCurrency(shippingFee)}
            </span>
          </div>

          {/* Hairline Divider */}
          <div className="border-t border-dashed border-[#E8DCCF] pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-stone-900 text-sm sm:text-base">
                Total payable
              </span>
              <span className="font-extrabold text-[#2A1E17] text-lg sm:text-xl tracking-tight">
                {formatCurrency(totalPayable)}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Step CTA Action Button */}
        {showCtaButton && ctaText && onCtaClick && (
          <div className="mt-6">
            <button
              type="button"
              onClick={onCtaClick}
              disabled={disabled || isSubmitting}
              className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                disabled || isSubmitting
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed shadow-none"
                  : "bg-[#1C1917] hover:bg-black text-white hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  <span>{ctaText}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Security Assurance Footer */}
      <div className="flex items-start gap-2.5 px-2 text-stone-600 text-xs leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          Precision Optics uses 256-bit SSL encryption. Your credentials and prescription data remain strictly confidential.
        </p>
      </div>
    </div>
  );
};
