"use client";

import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { toast } from "sonner";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [tagline, setTagline] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/brands");
      const data = await res.json();
      if (data.success) {
        setBrands(data.brands || []);
      }
    } catch (err) {
      console.warn("Failed to load brands:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, origin, tagline, isFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Brand created successfully");
        setIsModalOpen(false);
        setName("");
        setOrigin("");
        setTagline("");
        fetchBrands();
      }
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCF]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2A1E17] font-serif">
            Luxury Eyewear Maisons & Brands
          </h1>
          <p className="text-xs text-stone-500">
            Authorized luxury optical houses, origin, and featured boutique collections
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add Brand</span>
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
                <th className="py-3 px-4">Brand Name</th>
                <th className="py-3 px-3">Origin / Atelier</th>
                <th className="py-3 px-3">Tagline</th>
                <th className="py-3 px-3">Products</th>
                <th className="py-3 px-3">Featured</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-[#FAF7F2]/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#2A1E17]">{b.name}</td>
                  <td className="py-3 px-3 text-stone-600">{b.origin || "International"}</td>
                  <td className="py-3 px-3 text-stone-500 max-w-xs truncate">
                    {b.tagline || "—"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-full">
                      {b.product_count || 0}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {b.is_featured ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        Featured
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={b.is_active ? "active" : "inactive"} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E8DCCF] w-full max-w-md rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-2">
              <h3 className="text-sm font-bold text-[#2A1E17]">Add Luxury Brand</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jacques Marie Mage"
                  className="w-full px-3 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Origin / Atelier</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Los Angeles / Japan"
                  className="w-full px-3 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Artisanal Precision & Limited Batches"
                  className="w-full px-3 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-stone-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#C86A28]"
                  />
                  <span>Feature in Storefront Marquee & Navigation</span>
                </label>
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
                  {saving ? "Saving..." : "Create Brand"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
