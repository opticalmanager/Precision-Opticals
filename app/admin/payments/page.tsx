"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, ShieldCheck, Check, AlertCircle, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const [paymentsConfig, setPaymentsConfig] = useState<any>({
    stripe: {
      enabled: true,
      mode: "live",
      publicKeyMasked: "pk_live_••••••••••••••••8912",
      acceptedMethods: ["Credit Cards", "Apple Pay", "Google Pay"],
    },
    razorpayUpi: {
      enabled: true,
      mode: "live",
      keyIdMasked: "rzp_live_••••••••••••••••4310",
      acceptedMethods: ["UPI", "GPay", "PhonePe", "Paytm", "NetBanking", "RuPay"],
    },
    cod: {
      enabled: true,
      minOrderValue: 2000,
      maxOrderValue: 50000,
      requiresPhoneVerification: true,
    },
    netbanking: {
      enabled: true,
      supportedBanks: ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra"],
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings?key=payments")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.value) {
          setPaymentsConfig(data.value);
        }
      })
      .catch((e) => console.warn("Failed to fetch payments settings:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "payments", value: paymentsConfig }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment gateway configurations updated successfully");
      }
    } catch (e: any) {
      toast.error("Save error", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-[#C86A28] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header (Reference 1 style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCF]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2A1E17] font-serif">
            Payment Gateways & Processing
          </h1>
          <p className="text-xs text-stone-500">
            Configure boutique settlement gateways, UPI QR integration, and luxury credit card acceptance
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white shadow-xs"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
          <span>Save Changes</span>
        </Button>
      </div>

      {/* Primary Gateway Card (Reference 1 Inspiration) */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#C86A28] mb-1">
              Primary Gateway: Domestic & Unified Payments Interface
            </div>
            <h2 className="text-base font-bold text-[#2A1E17]">Razorpay UPI & NetBanking</h2>
            <p className="text-xs text-stone-600 max-w-xl mt-1 leading-relaxed">
              Provides instant QR scanning via Google Pay, PhonePe, Paytm, BHIM UPI, and direct netbanking with premier Indian banks. Zero drop-off rate for luxury optical checkouts.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <span className="text-stone-600">Active</span>
            <input
              type="checkbox"
              checked={paymentsConfig.razorpayUpi?.enabled}
              onChange={(e) =>
                setPaymentsConfig({
                  ...paymentsConfig,
                  razorpayUpi: { ...paymentsConfig.razorpayUpi, enabled: e.target.checked },
                })
              }
              className="rounded text-[#C86A28] w-4 h-4"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Live Key ID (Masked)</label>
            <input
              type="text"
              readOnly
              value={paymentsConfig.razorpayUpi?.keyIdMasked}
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md font-mono text-stone-600"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Environment Mode</label>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live Production (Secured by PCI-DSS Level 1)
            </span>
          </div>
        </div>
      </div>

      {/* Global Card Module: Stripe International (Reference 1 style) */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              International & Ultra-High-Net-Worth Cards
            </div>
            <h2 className="text-base font-bold text-[#2A1E17]">Stripe International Payments</h2>
            <p className="text-xs text-stone-600 max-w-xl mt-1 leading-relaxed">
              Accept American Express Centurion, Platinum, Visa Infinite, and Apple Pay from global collectors and expatriate patrons.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <span className="text-stone-600">Active</span>
            <input
              type="checkbox"
              checked={paymentsConfig.stripe?.enabled}
              onChange={(e) =>
                setPaymentsConfig({
                  ...paymentsConfig,
                  stripe: { ...paymentsConfig.stripe, enabled: e.target.checked },
                })
              }
              className="rounded text-[#C86A28] w-4 h-4"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Publishable Key (Masked)</label>
            <input
              type="text"
              readOnly
              value={paymentsConfig.stripe?.publicKeyMasked}
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md font-mono text-stone-600"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Accepted Payment Rails</label>
            <div className="text-stone-600 text-xs py-1.5">
              {paymentsConfig.stripe?.acceptedMethods?.join(", ") || "Credit Cards, Apple Pay"}
            </div>
          </div>
        </div>
      </div>

      {/* Cash on Delivery (COD) Constraints Module */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Concierge Doorstep Payment
            </div>
            <h2 className="text-base font-bold text-[#2A1E17]">Cash on Delivery (COD)</h2>
            <p className="text-xs text-stone-600 max-w-xl mt-1 leading-relaxed">
              Allows patrons to pay upon arrival by insured armored courier. Requires strict order value thresholds.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <span className="text-stone-600">Active</span>
            <input
              type="checkbox"
              checked={paymentsConfig.cod?.enabled}
              onChange={(e) =>
                setPaymentsConfig({
                  ...paymentsConfig,
                  cod: { ...paymentsConfig.cod, enabled: e.target.checked },
                })
              }
              className="rounded text-[#C86A28] w-4 h-4"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Minimum COD Order Value (₹)</label>
            <input
              type="number"
              value={paymentsConfig.cod?.minOrderValue}
              onChange={(e) =>
                setPaymentsConfig({
                  ...paymentsConfig,
                  cod: { ...paymentsConfig.cod, minOrderValue: Number(e.target.value) },
                })
              }
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Maximum COD Order Ceiling (₹)</label>
            <input
              type="number"
              value={paymentsConfig.cod?.maxOrderValue}
              onChange={(e) =>
                setPaymentsConfig({
                  ...paymentsConfig,
                  cod: { ...paymentsConfig.cod, maxOrderValue: Number(e.target.value) },
                })
              }
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
