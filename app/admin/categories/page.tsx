"use client";

import React, { useState, useEffect } from "react";
import { Plus, Layers, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.warn("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, displayOrder }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category created successfully");
        setIsModalOpen(false);
        setName("");
        setDescription("");
        fetchCategories();
      } else {
        toast.error("Error creating category", { description: data.error });
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
            Categories & Collections
          </h1>
          <p className="text-xs text-stone-500">
            Organize the storefront catalog into distinct optical hierarchies
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add Category</span>
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
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-3">Category Name</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Products</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF7F2]/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-stone-500">
                    {c.display_order}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#2A1E17]">{c.name}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-stone-500">{c.slug}</td>
                  <td className="py-3 px-3 text-stone-600 max-w-xs truncate">
                    {c.description || "—"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-full">
                      {c.product_count || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={c.is_active ? "active" : "inactive"} size="sm" />
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
              <h3 className="text-sm font-bold text-[#2A1E17]">Add New Category</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Meta Smart Glasses"
                  className="w-full px-3 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category description..."
                  className="w-full px-3 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                />
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
                  {saving ? "Saving..." : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
