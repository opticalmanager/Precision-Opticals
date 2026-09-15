"use client";

import React, { useState, useEffect } from "react";
import { Truck, ShieldCheck, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminShippingPage() {
  const [shippingConfig, setShippingConfig] = useState<any>({
    freeShippingThreshold: 5000,
    standardShippingFee: 250,
    expressShippingFee: 490,
    defaultCarrier: "BlueDart Express",
    supportedCarriers: ["BlueDart Express", "Delhivery Air", "DHL International"],
    enableWhiteGloveHomeTrial: true,
    trialDepositAmount: 3000,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings?key=shipping")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.value) {
          setShippingConfig(data.value);
        }
      })
      .catch((e) => console.warn("Failed to fetch shipping settings:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "shipping", value: shippingConfig }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shipping rules updated successfully");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCF]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2A1E17] font-serif">
            Shipping & Logistics Architecture
          </h1>
          <p className="text-xs text-stone-500">
            Define insured courier rules, free-shipping thresholds, and white-glove delivery options
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

      {/* Free Shipping Rule Module */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#C86A28] mb-1">
              Storewide Incentive Policy
            </div>
            <h2 className="text-base font-bold text-[#2A1E17]">Complimentary Insured Transit</h2>
            <p className="text-xs text-stone-600 max-w-xl mt-1 leading-relaxed">
              Orders surpassing this value receive zero-cost priority armored transit with transit insurance coverage included.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Free Shipping Threshold (INR ₹)
            </label>
            <input
              type="number"
              value={shippingConfig.freeShippingThreshold}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  freeShippingThreshold: Number(e.target.value),
                })
              }
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Standard Courier Rate (Sub-threshold) (INR ₹)
            </label>
            <input
              type="number"
              value={shippingConfig.standardShippingFee}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  standardShippingFee: Number(e.target.value),
                })
              }
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Default Primary Air Courier
            </label>
            <input
              type="text"
              value={shippingConfig.defaultCarrier}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  defaultCarrier: e.target.value,
                })
              }
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>
        </div>
      </div>

      {/* White-Glove Concierge Home Trial */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Luxury Atelier Service
            </div>
            <h2 className="text-base font-bold text-[#2A1E17]">
              White-Glove In-Home Frame Trial
            </h2>
            <p className="text-xs text-stone-600 max-w-xl mt-1 leading-relaxed">
              Optician hand-delivers a curated case of up to 5 designer frames directly to the client residence or executive suite with digital pupillometer.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <span className="text-stone-600">Active</span>
            <input
              type="checkbox"
              checked={shippingConfig.enableWhiteGloveHomeTrial}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  enableWhiteGloveHomeTrial: e.target.checked,
                })
              }
              className="rounded text-[#C86A28] w-4 h-4"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Home Trial Security Hold Deposit (INR ₹)
            </label>
            <input
              type="number"
              value={shippingConfig.trialDepositAmount}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  trialDepositAmount: Number(e.target.value),
                })
              }
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Eligible Metro Clusters
            </label>
            <div className="text-stone-600 text-xs py-1.5">
              Delhi NCR, Mumbai South, Bengaluru Koramangala & Indiranagar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
