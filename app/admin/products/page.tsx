"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductFilterBar } from "@/components/admin/products/ProductFilterBar";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { BulkActionBar } from "@/components/admin/common/BulkActionBar";
import { ConfirmDialog } from "@/components/admin/common/ConfirmDialog";
import { EmptyState } from "@/components/admin/common/EmptyState";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0, outOfStock: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft" | "out_of_stock">("all");

  // Selection state for Bulk Actions (Reference 2)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (brand) params.set("brand", brand);
      if (activeTab !== "all") params.set("tab", activeTab);
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.warn("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, brand, activeTab, pagination.page, pagination.limit]);

  // Fetch categories & brands once
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/brands").then((r) => r.json()),
    ]).then(([catData, brandData]) => {
      if (catData.categories) setCategories(catData.categories);
      if (brandData.brands) setBrands(brandData.brands);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (products.every((p) => selectedIds.includes(p.id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`/api/admin/products/${deleteModal.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Product archived from catalog", {
          description: `${deleteModal.name} is now inactive.`,
        });
        setDeleteModal({ isOpen: false, id: "", name: "" });
        fetchProducts();
      } else {
        toast.error("Failed to archive product", { description: data.error });
      }
    } catch (err: any) {
      toast.error("Error deleting product", { description: err.message });
    }
  };

  // Bulk actions
  const handleBulkStatusChange = async (status: string) => {
    const isActive = status === "published";
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive }),
          })
        )
      );
      toast.success(`Updated ${selectedIds.length} products to ${status}`);
      setSelectedIds([]);
      fetchProducts();
    } catch (e: any) {
      toast.error("Failed to update status", { description: e.message });
    }
  };

  const handleToggleStatus = async (id: string, newStatus: boolean) => {
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: newStatus } : p))
      );
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Product ${newStatus ? "published" : "moved to draft"}`);
        fetchProducts();
      } else {
        toast.error("Failed to update status", { description: data.error });
        fetchProducts();
      }
    } catch (e: any) {
      toast.error("Status update error", { description: e.message });
      fetchProducts();
    }
  };

  const handleExportCSV = () => {
    const rows = products.map((p) => ({
      ID: p.id,
      Name: p.name,
      Brand: p.brand_name,
      Category: p.category_name,
      Price: p.base_price,
      Stock: p.total_stock,
      Status: p.is_active ? "Published" : "Draft",
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Name,Brand,Category,Price,Stock,Status"]
        .concat(
          rows.map(
            (r) =>
              `"${r.ID}","${r.Name}","${r.Brand}","${r.Category}","${r.Price}","${r.Stock}","${r.Status}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `precision_optics_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Catalog exported to CSV");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Page Header (Reference 2 style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCF]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2A1E17] font-serif">
            Products Catalog
          </h1>
          <p className="text-xs text-stone-500">
            Manage inventory, pricing, optical specifications, and frame availability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs h-8 bg-white border-[#E8DCCF] text-stone-700 hover:text-[#2A1E17]"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-stone-500" />
            <span>Export</span>
          </Button>

          <Link href="/admin/products/new">
            <Button
              type="button"
              size="sm"
              className="text-xs h-8 bg-[#C86A28] hover:bg-[#b0581e] text-white shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Tabs (Reference 2 style: All, Published, Draft, Out of Stock) */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-1 text-xs select-none">
        {[
          { id: "all", label: "All", count: counts.all },
          { id: "published", label: "Published", count: counts.published },
          { id: "draft", label: "Draft", count: counts.draft },
          { id: "out_of_stock", label: "Out of Stock", count: counts.outOfStock },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id as any);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[#C86A28] text-[#2A1E17] font-semibold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id
                  ? "bg-[#C86A28] text-white font-bold"
                  : "bg-stone-200 text-stone-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <ProductFilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        category={category}
        onCategoryChange={(val) => {
          setCategory(val);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        brand={brand}
        onBrandChange={(val) => {
          setBrand(val);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        categories={categories}
        brands={brands}
        onReset={() => {
          setSearch("");
          setCategory("");
          setBrand("");
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
      />

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#E8DCCF]">
          <Loader2 className="w-7 h-7 text-[#C86A28] animate-spin mb-2" />
          <span className="text-xs text-stone-500 font-medium">Filtering catalog items...</span>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="No products match your current search and filter settings. Try adjusting or resetting filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch("");
            setCategory("");
            setBrand("");
            setActiveTab("all");
          }}
        />
      ) : (
        <>
          {/* Main Product Table (Reference 2 style) */}
          <ProductTable
            products={products}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onDeleteClick={(id, name) => setDeleteModal({ isOpen: true, id, name })}
            onToggleStatus={handleToggleStatus}
          />

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 px-1">
            <div>
              Showing {Math.min(pagination.total, (pagination.page - 1) * pagination.limit + 1)} to{" "}
              {Math.min(pagination.total, pagination.page * pagination.limit)} of {pagination.total}{" "}
              products
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="text-xs h-7 px-2.5 bg-white border-stone-300"
              >
                Previous
              </Button>
              <span className="px-2 font-medium text-stone-700">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="text-xs h-7 px-2.5 bg-white border-stone-300"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Floating Bulk Action Bar (Reference 2 style) */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onExport={handleExportCSV}
        onStatusChange={handleBulkStatusChange}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Archive Product"
        description={`Are you sure you want to archive "${deleteModal.name}"? It will be marked as inactive and hidden from the customer storefront.`}
        confirmLabel="Archive"
        variant="danger"
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeleteModal({ isOpen: false, id: "", name: "" })}
      />
    </div>
  );
}
