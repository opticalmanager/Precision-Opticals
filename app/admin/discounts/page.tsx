"use client";

import React, { useState, useEffect } from "react";
import { Plus, Percent, Trash2, CheckCircle2, Loader2, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminDiscountsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderValue, setMinOrderValue] = useState(5000);
  const [maxDiscount, setMaxDiscount] = useState<number | "">(3000);
  const [usageLimit, setUsageLimit] = useState(500);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.warn("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minOrderValue: Number(minOrderValue),
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          usageLimit: Number(usageLimit),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Coupon code created successfully");
        setIsModalOpen(false);
        setCode("");
        fetchCoupons();
      } else {
        toast.error("Error creating coupon", { description: data.error });
      }
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(currentStatus ? "Coupon disabled" : "Coupon activated");
        fetchCoupons();
      }
    } catch (e: any) {
      toast.error("Status update error", { description: e.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Coupon removed");
        fetchCoupons();
      }
    } catch (e: any) {
      toast.error("Delete error", { description: e.message });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCF]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2A1E17] font-serif">
            Promotions & Privilege Codes
          </h1>
          <p className="text-xs text-stone-500">
            Configure boutique checkout coupons, minimum thresholds, and customer savings
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>New Promo Code</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-[#E8DCCF]">
          <Loader2 className="w-7 h-7 text-[#C86A28] animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-[#E8DCCF] rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-[#FAF7F2] text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-3">Discount Type & Value</th>
                <th className="py-3 px-3">Min Order / Cap</th>
                <th className="py-3 px-3">Usage</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF7F2]/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#2A1E17] bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {c.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(c.code);
                          toast.success(`Copied ${c.code} to clipboard`);
                        }}
                        className="text-stone-400 hover:text-stone-700 p-0.5"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-semibold text-stone-800">
                    {c.discount_type === "percentage"
                      ? `${c.discount_value}% Off`
                      : `${formatCurrency(Number(c.discount_value))} Flat Off`}
                  </td>

                  <td className="py-3 px-3 text-stone-600">
                    <div>Min: {formatCurrency(Number(c.min_order_value || 0))}</div>
                    {c.max_discount && (
                      <div className="text-[10px] text-stone-400">
                        Cap: {formatCurrency(Number(c.max_discount))}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3 text-stone-600">
                    {c.used_count || 0} / {c.usage_limit || "Unlimited"}
                  </td>

                  <td className="py-3 px-3">
                    <StatusBadge status={c.is_active ? "active" : "inactive"} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c.id, c.is_active)}
                        className="text-xs text-stone-600 hover:text-[#2A1E17] underline cursor-pointer"
                      >
                        {c.is_active ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E8DCCF] w-full max-w-md rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-2">
              <h3 className="text-sm font-bold text-[#2A1E17]">Create Promotional Code</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. VIPSUMMER2026"
                  className="w-full px-3 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs font-mono font-bold uppercase text-[#2A1E17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) =>
                      setMaxDiscount(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="Optional"
                    className="w-full px-3 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8DCCF]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white"
                >
                  {saving ? "Creating..." : "Save Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
