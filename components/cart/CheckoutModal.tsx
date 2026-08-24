"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Lock, CreditCard, Smartphone, Building2, Truck, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validations";
import { formatCurrency, generateTrackingId, getEstimatedDeliveryDate } from "@/lib/utils";
import { Order } from "@/src/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, grandTotal, rawSubtotal, discountAmount, appliedCoupon, includeCleaningKit, clearCart } = useCart();
  const { user, saveOrder } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      streetAddress: user.savedAddresses[0]?.streetAddress || "",
      city: user.savedAddresses[0]?.city || "Gurugram",
      state: user.savedAddresses[0]?.state || "Haryana",
      pincode: user.savedAddresses[0]?.pincode || "122002",
      paymentMethod: "upi",
      upiId: "",
    },
  });

  const selectedPaymentMethod = watch("paymentMethod");

  if (!isOpen) return null;

  const onFormSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    const trackingNumber = generateTrackingId();

    const newOrder: Order = {
      id: trackingNumber,
      trackingNumber,
      createdAt: new Date().toISOString(),
      items: [...items],
      shippingAddress: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: "India",
      },
      paymentMethod: data.paymentMethod,
      subtotal: rawSubtotal,
      discount: discountAmount,
      couponApplied: appliedCoupon || undefined,
      cleaningKitAdded: includeCleaningKit,
      totalAmount: grandTotal,
      status: "confirmed",
      estimatedDeliveryDate: getEstimatedDeliveryDate(4),
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      saveOrder(newOrder);
      clearCart();
      setIsSubmitting(false);
      onClose();
      onOrderSuccess(newOrder);

      toast.success("Order Placed Successfully!", {
        description: `Order ${trackingNumber} is now in laboratory assembly.`,
      });
    } catch (e) {
      saveOrder(newOrder);
      clearCart();
      setIsSubmitting(false);
      onClose();
      onOrderSuccess(newOrder);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FAF7F2] border border-[#E8DCCF] max-w-3xl w-full my-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#2A1E17] text-white px-6 py-4 flex items-center justify-between border-b border-orange-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-[#E59B62]" />
            <div>
              <h3 className="font-serif text-sm tracking-widest uppercase font-bold text-[#E59B62]">
                PRECISION OPTICS SECURE CHECKOUT
              </h3>
              <p className="text-[10px] text-stone-300 font-sans tracking-wider uppercase">
                Zero-Error Optical Order Calibration & Insured Dispatch
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:text-[#E59B62] text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans text-stone-800">
          {/* Section 1: Shipping Details */}
          <div className="bg-white p-5 border border-[#E8DCCF] space-y-4">
            <div className="flex items-center gap-2 font-serif font-bold text-xs uppercase tracking-wider text-[#2A1E17] border-b border-stone-200 pb-2">
              <Truck className="w-4 h-4 text-[#C85A1B]" />
              <span>1. Insured Delivery Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                  Full Name *
                </label>
                <Input
                  {...register("fullName")}
                  placeholder="e.g. Alexander Sterling"
                  className={errors.fullName ? "border-rose-500 bg-rose-50/20" : ""}
                />
                {errors.fullName && (
                  <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                    {errors.fullName.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                  Mobile Phone *
                </label>
                <Input
                  {...register("phone")}
                  placeholder="e.g. 9810012345"
                  className={errors.phone ? "border-rose-500 bg-rose-50/20" : ""}
                />
                {errors.phone && (
                  <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="name@example.com"
                  className={errors.email ? "border-rose-500 bg-rose-50/20" : ""}
                />
                {errors.email && (
                  <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                  Street Address *
                </label>
                <Input
                  {...register("streetAddress")}
                  placeholder="Building, street, suite..."
                  className={errors.streetAddress ? "border-rose-500 bg-rose-50/20" : ""}
                />
                {errors.streetAddress && (
                  <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                    {errors.streetAddress.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                  City *
                </label>
                <Input
                  {...register("city")}
                  placeholder="City"
                  className={errors.city ? "border-rose-500 bg-rose-50/20" : ""}
                />
                {errors.city && (
                  <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                    {errors.city.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
                  Pincode (6 Digits) *
                </label>
                <Input
                  {...register("pincode")}
                  placeholder="e.g. 110001"
                  className={errors.pincode ? "border-rose-500 bg-rose-50/20" : ""}
                />
                {errors.pincode && (
                  <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
                    {errors.pincode.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Payment Option */}
          <div className="bg-white p-5 border border-[#E8DCCF] space-y-4">
            <div className="flex items-center gap-2 font-serif font-bold text-xs uppercase tracking-wider text-[#2A1E17] border-b border-stone-200 pb-2">
              <CreditCard className="w-4 h-4 text-[#C85A1B]" />
              <span>2. Payment Option</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "upi", label: "UPI / QR", icon: Smartphone },
                { id: "card", label: "Cards", icon: CreditCard },
                { id: "netbanking", label: "NetBanking", icon: Building2 },
                { id: "cod", label: "Cash On Delivery", icon: Truck },
              ].map((p) => {
                const IconComp = p.icon;
                const isSelected = selectedPaymentMethod === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setValue("paymentMethod", p.id as any)}
                    className={`p-3 border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#C85A1B] bg-[#FAF3EB] text-[#2A1E17] font-bold ring-2 ring-[#C85A1B]/20"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    <IconComp className={`w-5 h-5 ${isSelected ? "text-[#C85A1B]" : "text-stone-500"}`} />
                    <span className="text-[11px] uppercase tracking-wider">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedPaymentMethod === "upi" && (
              <div className="p-3 bg-[#FAF7F2] border border-stone-200 space-y-2">
                <label className="block text-[11px] font-bold uppercase text-stone-700">
                  Enter VPA / UPI ID (GooglePay / PhonePe / Paytm / BHIM)
                </label>
                <Input
                  {...register("upiId")}
                  placeholder="yourname@okhdfcbank"
                  className="bg-white"
                />
              </div>
            )}
          </div>

          {/* Section 3: Summary */}
          <div className="bg-[#FAF3EB] p-4 border border-[#E8DCCF] space-y-2">
            <div className="flex justify-between font-bold text-stone-900">
              <span>Grand Total Payable</span>
              <span className="font-serif text-base text-[#C85A1B]">{formatCurrency(grandTotal)}</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Estimated Delivery: <strong>{getEstimatedDeliveryDate(4)}</strong> (Includes 100% transit insurance & zero-error optical warranty).
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-4 text-xs sm:text-sm shadow-lg h-auto"
            >
              {isSubmitting ? (
                <span>COMMUNICATING WITH LABORATORY...</span>
              ) : (
                <>
                  <span>CONFIRM & PLACE ORDER ({formatCurrency(grandTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
