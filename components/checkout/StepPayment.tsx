"use client";

import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  Building2,
  Truck,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Check,
  X,
  Lock,
  Zap,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { PaymentMethod, ShippingAddress } from "@/types";
import { getEstimatedDeliveryDate } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface StepPaymentProps {
  shippingAddress: ShippingAddress;
  selectedMethod?: PaymentMethod;
  onSelectMethod?: (method: PaymentMethod) => void;
  onPaymentSubmit?: (paymentMethod: PaymentMethod, paymentDetails?: any) => void;
  isSubmitting?: boolean;
  paymentsConfig?: any;
}

export const StepPayment: React.FC<StepPaymentProps> = ({
  shippingAddress,
  selectedMethod: controlledMethod,
  onSelectMethod,
  onPaymentSubmit,
  isSubmitting = false,
  paymentsConfig,
}) => {
  const { appliedCoupon, applyCoupon, removeCoupon } = useCart();

  // Determine enabled options
  const razorpayEnabled =
    paymentsConfig?.razorpayUpi?.enabled !== false ||
    paymentsConfig?.stripe?.enabled !== false;
  const codEnabled = paymentsConfig?.cod?.enabled !== false;

  const defaultMethod: PaymentMethod = razorpayEnabled
    ? "razorpay"
    : codEnabled
    ? "cod"
    : "razorpay";

  const [localMethod, setLocalMethod] = useState<PaymentMethod>(defaultMethod);
  const activeMethod = controlledMethod ?? localMethod;

  const handleSelectMethod = (m: PaymentMethod) => {
    setLocalMethod(m);
    onSelectMethod?.(m);
  };

  // Voucher coupon state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await applyCoupon(couponInput.trim().toUpperCase());
      if (res.success) {
        setIsCouponModalOpen(false);
        setCouponInput("");
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const codEstimatedDate = getEstimatedDeliveryDate(5);
  const isOnlineSelected =
    activeMethod === "razorpay" ||
    activeMethod === "upi" ||
    activeMethod === "card" ||
    activeMethod === "netbanking";

  return (
    <div className="w-full space-y-6">
      {/* Payment Selection Header */}
      <div>
        <h3 className="font-serif font-extrabold text-stone-900 text-sm tracking-wider uppercase mb-1">
          Payment Method
        </h3>
        <p className="text-xs text-stone-500">
          Select your preferred payment channel. All transactions are protected by 256-bit bank-grade encryption.
        </p>
      </div>

      {/* 1. Official Razorpay Integrated Checkout Option */}
      <div
        onClick={() => handleSelectMethod("razorpay")}
        className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
          isOnlineSelected
            ? "border-[#1C1917] ring-2 ring-[#1C1917]/10 shadow-sm"
            : "border-[#E8DCCF] hover:border-stone-400"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center shrink-0 text-[#C86A28]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                  Online Payment (Razorpay Secure Checkout)
                </h4>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pay securely using Google Pay, PhonePe, Paytm, Credit / Debit Cards, or Net Banking.
              </p>
            </div>
          </div>

          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              isOnlineSelected
                ? "border-[#1C1917] bg-[#1C1917] text-white"
                : "border-stone-300"
            }`}
          >
            {isOnlineSelected && <Check className="w-3 h-3" />}
          </div>
        </div>

        {/* Expanded Payment Methods Chips & Security Seals */}
        {isOnlineSelected && (
          <div className="mt-4 pt-4 border-t border-[#E8DCCF]/60 space-y-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              ACCEPTED PAYMENT RAILS VIA RAZORPAY
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#C86A28] shrink-0" />
                <div>
                  <div className="font-bold text-stone-900 text-[11px]">UPI & QR</div>
                  <div className="text-[10px] text-stone-500">GPay, PhonePe, Paytm</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#C86A28] shrink-0" />
                <div>
                  <div className="font-bold text-stone-900 text-[11px]">Cards</div>
                  <div className="text-[10px] text-stone-500">Visa, MC, RuPay, Amex</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C86A28] shrink-0" />
                <div>
                  <div className="font-bold text-stone-900 text-[11px]">Net Banking</div>
                  <div className="text-[10px] text-stone-500">All Indian Banks</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#C86A28] shrink-0" />
                <div>
                  <div className="font-bold text-stone-900 text-[11px]">Wallets & EMI</div>
                  <div className="text-[10px] text-stone-500">No Cost EMI & more</div>
                </div>
              </div>
            </div>

            {/* Seamless Flow Assurance */}
            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DCCF] flex items-center gap-2 text-xs text-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Clicking <strong className="text-stone-900">Pay Now</strong> opens the official Razorpay checkout modal for instant confirmation.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Cash on Delivery (COD) Option */}
      {codEnabled && (
        <div
          onClick={() => handleSelectMethod("cod")}
          className={`rounded-2xl border transition-all cursor-pointer overflow-hidden bg-white ${
            activeMethod === "cod"
              ? "border-[#1C1917] ring-2 ring-[#1C1917]/10 shadow-sm"
              : "border-[#E8DCCF] hover:border-stone-400"
          }`}
        >
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center shrink-0 text-stone-800">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                  Cash on Delivery (COD)
                </h4>
                <p className="text-xs text-stone-500">
                  Pay via cash or UPI directly to our courier agent upon doorstep arrival
                </p>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                activeMethod === "cod"
                  ? "border-[#1C1917] bg-[#1C1917] text-white"
                  : "border-stone-300"
              }`}
            >
              {activeMethod === "cod" && <Check className="w-3 h-3" />}
            </div>
          </div>

          {/* Delivery Note Banner */}
          <div className="bg-[#FFF8F0] border-t border-[#FED7AA]/60 px-5 py-2.5 flex items-center gap-2 text-xs text-[#C86A28] font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Estimated delivery by {codEstimatedDate} for COD orders</span>
          </div>
        </div>
      )}

      {/* 3. Apply Voucher / Privilege Code Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between p-4 bg-white border border-[#E8DCCF] rounded-2xl">
          <div className="flex items-center gap-2.5 text-stone-800">
            <Tag className="w-4 h-4 text-[#C86A28]" />
            <span className="text-xs sm:text-sm font-bold">
              {appliedCoupon ? `Applied Voucher: ${appliedCoupon}` : "Apply Atelier Gift Card or Voucher"}
            </span>
          </div>

          {appliedCoupon ? (
            <button
              type="button"
              onClick={() => removeCoupon()}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(true)}
              className="text-xs font-bold text-[#C86A28] hover:underline cursor-pointer"
            >
              Apply
            </button>
          )}
        </div>

        {/* Voucher Modal Form */}
        {isCouponModalOpen && (
          <div className="mt-3 p-4 bg-[#FAF7F2] border border-[#E8DCCF] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                ENTER PROMO CODE
              </span>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="e.g. PRECISION10"
                className="flex-1 px-3.5 py-2 bg-white border border-[#E8DCCF] rounded-xl text-sm font-bold uppercase outline-none focus:border-[#C86A28]"
                autoFocus
              />
              <button
                type="submit"
                disabled={validatingCoupon}
                className="bg-[#C86A28] hover:bg-[#b05a1f] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center min-w-[70px]"
              >
                {validatingCoupon ? "..." : "Apply"}
              </button>
            </form>
            <div className="text-[11px] text-stone-500">
              Verified boutique privilege codes: <strong className="text-stone-800">PRECISION10</strong> (10% off), <strong className="text-stone-800">LUXURY2026</strong> (₹2,000 off)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
