"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Printer,
  Package,
  Truck,
  FlaskConical,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface StepOrderSummaryProps {
  order: Order;
  onContinueShopping: () => void;
}

export const StepOrderSummary: React.FC<StepOrderSummaryProps> = ({
  order,
  onContinueShopping,
}) => {
  const handlePrintInvoice = () => {
    window.print();
  };

  const steps = [
    { label: "Confirmed", status: "completed", desc: "Payment verified" },
    { label: "Lab Assembly", status: "current", desc: "Zeiss optical calibration" },
    { label: "Quality Check", status: "upcoming", desc: "Laser alignment test" },
    { label: "Dispatched", status: "upcoming", desc: "BlueDart Express courier" },
    { label: "Delivered", status: "upcoming", desc: "Doorstep white-glove handoff" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Confirmation Card */}
      <div className="bg-white border border-[#EBE6DF] rounded-[24px] p-6 sm:p-8 lg:p-10 shadow-sm text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 border-2 border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>

        <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#C86A28] block mb-1">
          PRECISION OPTICS ATELIER ORDER CONFIRMED
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight mb-2">
          Thank you for your order
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          An SMS and order confirmation email with your lab tracking link have been dispatched to{" "}
          <strong className="text-stone-900">{order.shippingAddress.email}</strong>.
        </p>

        {/* Order Meta Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#E8DCCF]">
          <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-4 py-2 text-left">
            <span className="text-[10px] uppercase font-extrabold text-stone-500 block">ORDER NUMBER</span>
            <span className="font-mono font-bold text-stone-900 text-sm">{order.id}</span>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-4 py-2 text-left">
            <span className="text-[10px] uppercase font-extrabold text-stone-500 block">TRACKING ID</span>
            <span className="font-mono font-bold text-[#C86A28] text-sm">{order.trackingNumber}</span>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-4 py-2 text-left">
            <span className="text-[10px] uppercase font-extrabold text-stone-500 block">ESTIMATED DELIVERY</span>
            <span className="font-bold text-stone-900 text-sm">{order.estimatedDeliveryDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={handlePrintInvoice}
            className="px-5 py-2.5 rounded-xl border border-[#E8DCCF] bg-[#FAF3EB] hover:bg-[#F2E8DC] text-[#2A1E17] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-stone-700" />
            <span>Print Tax Invoice (GST)</span>
          </button>

          <button
            type="button"
            onClick={onContinueShopping}
            className="px-6 py-2.5 rounded-xl bg-[#1C1917] hover:bg-black text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Optical Lab 5-Stage Timeline */}
      <div className="bg-white border border-[#EBE6DF] rounded-[24px] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <FlaskConical className="w-5 h-5 text-[#C86A28]" />
          <h3 className="font-serif font-bold text-stone-900 text-lg">
            Optical Laboratory Assembly Progress
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all ${
                st.status === "completed"
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  : st.status === "current"
                  ? "bg-[#FFF8F0] border-[#FED7AA] ring-2 ring-[#C86A28]/20"
                  : "bg-stone-50 border-stone-200 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  STAGE 0{idx + 1}
                </span>
                {st.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : st.status === "current" ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C86A28] animate-ping" />
                ) : null}
              </div>
              <h4 className="font-bold text-xs text-stone-900">{st.label}</h4>
              <p className="text-[11px] text-stone-600 leading-tight mt-0.5">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Items Ordered & Delivery Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Items breakdown */}
        <div className="md:col-span-7 bg-white border border-[#EBE6DF] rounded-[24px] p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-stone-900 text-base border-b border-[#E8DCCF] pb-3">
            Items in this Shipment ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
          </h3>

          <div className="space-y-4 divide-y divide-[#E8DCCF]/60">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center gap-4">
                <div className="w-16 h-16 bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-1 flex items-center justify-center shrink-0">
                  <img
                    src={item.product.images?.[0] || "/images/products/figma_cartier_blue_rimless.png"}
                    alt={item.product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                    {item.product.brand}
                  </span>
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{item.product.name}</h4>
                  {item.lensConfig?.lensPackage && (
                    <span className="text-[11px] text-[#C86A28] font-semibold block mt-0.5">
                      Lens: {item.lensConfig.lensPackage.name}
                    </span>
                  )}
                  <span className="text-xs text-stone-500">Qty: {item.quantity}</span>
                </div>

                <div className="text-right font-bold text-stone-900 text-sm">
                  {formatCurrency((item.product.price + (item.lensConfig?.totalLensPrice || 0)) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Shipping details */}
        <div className="md:col-span-5 bg-white border border-[#EBE6DF] rounded-[24px] p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-stone-900 text-base border-b border-[#E8DCCF] pb-3">
            Shipping & Payment
          </h3>

          <div className="space-y-3 text-xs text-stone-700">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                DELIVER TO
              </span>
              <p className="font-bold text-stone-900 mt-0.5">{order.shippingAddress.fullName}</p>
              <p className="leading-relaxed mt-0.5">{order.shippingAddress.streetAddress}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="pt-2 border-t border-[#E8DCCF]/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                PAYMENT METHOD
              </span>
              <p className="font-bold text-stone-900 uppercase mt-0.5">{order.paymentMethod}</p>
              <p className="text-emerald-600 font-semibold mt-0.5">
                Total Paid: {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
