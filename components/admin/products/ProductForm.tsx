"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Glasses,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Check,
  Loader2,
  Box,
  Camera,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { invalidateProductsCache } from "@/lib/productsService";

interface ProductFormProps {
  initialData?: any;
  categories: { id: string; slug: string; name: string }[];
  brands: { id: string; slug: string; name: string }[];
  isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  brands,
  isEdit = false,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"basic" | "media" | "pricing" | "specs" | "variants">("basic");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    subtitle: initialData?.subtitle || "",
    brand: initialData?.brand_slug || initialData?.brand_name || (brands[0]?.slug || "cartier"),
    category: initialData?.category_slug || (categories[0]?.slug || "sunglasses"),
    gender: initialData?.gender || "unisex",
    shape: initialData?.shape || "rectangle",
    rimType: initialData?.rim_type || "rimless",
    material: initialData?.material || "titanium",
    color: initialData?.color || "Gold",
    colorHex: initialData?.color_hex || "#D4AF37",
    basePrice: initialData?.base_price || 24900,
    originalPrice: initialData?.original_price || "",
    stock: initialData?.total_stock || 12,
    description: initialData?.description || "",
    isActive: initialData?.is_active !== undefined ? initialData.is_active : true,
    isNewArrival: initialData?.is_new_arrival || false,
    isBestSeller: initialData?.is_best_seller || false,
    tryOnEnabled: initialData?.try_on_enabled ?? initialData?.tryOnEnabled ?? false,
    tryOnModelUrl: initialData?.try_on_model_url || initialData?.tryOnModelUrl || "",
    tryOnConfiguration: initialData?.try_on_configuration || initialData?.tryOnConfig || null,
    lensProperties: initialData?.lens_properties || ["uv-protection", "anti-reflective"],
    specs: initialData?.specs || {
      lensWidth: 53,
      bridgeWidth: 18,
      templeLength: 145,
      frameWidth: 140,
      weight: "20g",
    },
  });

  // Images State
  const [images, setImages] = useState<string[]>(
    initialData?.images?.map((img: any) => (typeof img === "string" ? img : img.url)) || [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  // Variants State
  const [variants, setVariants] = useState<any[]>(
    initialData?.variants?.map((v: any) => ({
      id: v.id,
      colorName: v.color_name,
      colorHex: v.color_hex,
      sku: v.sku,
      stock: v.stock_quantity,
    })) || [
      {
        colorName: "Gold / Emerald Green",
        colorHex: "#D4AF37",
        sku: `SKU-${(initialData?.slug || "PREC").slice(0, 6).toUpperCase()}-01`,
        stock: 10,
      },
    ]
  );

  // File Upload to Cloudflare R2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "products");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImages((prev) => [...prev, data.url]);
        toast.success("Image uploaded directly to Cloudflare R2 CDN");
      } else {
        toast.error("Upload failed", { description: data.error });
      }
    } catch (err: any) {
      toast.error("Upload error", { description: err.message });
    } finally {
      setUploadingImage(false);
    }
  };

  // 3D GLB Model Upload to Cloudflare R2
  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "glb" && ext !== "gltf") {
      toast.error("Invalid file format. Please upload a .glb or .gltf 3D model.");
      return;
    }

    setUploadingModel(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "models");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          tryOnModelUrl: data.url,
          tryOnEnabled: true,
        }));
        toast.success("3D GLB model uploaded to Cloudflare R2", {
          description: file.name,
        });
      } else {
        toast.error("Failed to upload 3D model", { description: data.error });
      }
    } catch (err: any) {
      toast.error("Upload error", { description: err.message });
    } finally {
      setUploadingModel(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        colorName: "Silver",
        colorHex: "#C0C0C0",
        sku: `SKU-${(formData.slug || "PREC").slice(0, 6).toUpperCase()}-0${prev.length + 1}`,
        stock: 8,
      },
    ]);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      images,
      variants,
    };

    try {
      const endpoint = isEdit
        ? `/api/admin/products/${initialData.id}`
        : `/api/admin/products`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        invalidateProductsCache();
        toast.success(isEdit ? "Product updated successfully" : "Product created in catalog");
        router.push("/admin/products");
      } else {
        toast.error("Failed to save product", { description: data.error });
      }
    } catch (err: any) {
      toast.error("Error saving product", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8DCCF]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-1.5 rounded-md hover:bg-black/5 text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#2A1E17] font-serif">
              {isEdit ? `Edit Product: ${formData.name}` : "Create New Eyewear Product"}
            </h1>
            <p className="text-xs text-stone-500">
              Configure luxury frame specifications, optical properties, and high-res media
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/products")}
            className="text-xs bg-white border-stone-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span>{isEdit ? "Update Product" : "Publish Product"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#E8DCCF] text-xs font-medium overflow-x-auto">
        {[
          { id: "basic", label: "1. Basic Details", icon: Layers },
          { id: "media", label: "2. Product Media", icon: ImageIcon },
          { id: "pricing", label: "3. Pricing & Stock", icon: DollarSign },
          { id: "specs", label: "4. Optical Specifications", icon: Glasses },
          { id: "variants", label: "5. Color Variants", icon: Plus },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#C86A28] text-[#2A1E17] font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BASIC DETAILS */}
      {activeTab === "basic" && (
        <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Product Title / Frame Model *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Cartier Première CT0012O 001"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Subtitle / Marketing Tagline
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. Hand-Polished 18k Gold Electroplated Rimless"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                URL Slug (auto-generated if blank)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. cartier-premiere-ct0012o"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Luxury Brand *
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
              >
                {brands.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Eyewear Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
              >
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Junior / Kids</option>
              </select>
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-[#C86A28]"
                />
                <span>Published (Visible in Store)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="rounded text-[#C86A28]"
                />
                <span>New Arrival Badge</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Atelier Narrative & Detailed Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe craftsmanship, titanium construction, hinge technology, and luxury pedigree..."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MEDIA */}
      {activeTab === "media" && (
        <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Cloudflare R2 Object Storage & Gallery
            </h3>
            <p className="text-xs text-stone-500">
              Upload high-resolution luxury product photographs directly to the global R2 CDN.
            </p>
          </div>

          {/* Upload Box */}
          <div className="border-2 border-dashed border-[#E8DCCF] rounded-xl p-6 text-center bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors">
            <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-[#2A1E17] mb-1">
              Upload frame photos to Cloudflare R2 CDN
            </div>
            <p className="text-[11px] text-stone-500 mb-3">
              Supports PNG, JPG, WEBP with transparent or luxury studio background
            </p>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2A1E17] text-[#FAF7F2] text-xs font-medium cursor-pointer hover:bg-[#3d2c22] transition-colors">
              {uploadingImage ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading to R2...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image File</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          {/* Or Add Image URL */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Or paste external image URL (e.g. Unsplash, CDN URL)..."
              className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddImageUrl}
              className="text-xs bg-stone-700 hover:bg-stone-800 text-white"
            >
              Add URL
            </Button>
          </div>

          {/* Image Thumbnails Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-3">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-lg border border-[#E8DCCF] overflow-hidden bg-[#FAF7F2] flex items-center justify-center p-1"
              >
                <img
                  src={url}
                  alt={`Angle ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-[#C86A28] text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* 3D Virtual Try-On Asset (.GLB / .GLTF) - Cloudflare R2 */}
          <div className="mt-8 pt-6 border-t border-[#E8DCCF] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#C86A28]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                    3D Virtual Try-On Model (.GLB / .GLTF)
                  </h3>
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Cloudflare R2 Storage
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Upload or link a 3D eyewear model in binary GLB format for live augmented reality try-on.
                </p>
              </div>

              {/* Try-On Enable Toggle */}
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#2A1E17] cursor-pointer bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#E8DCCF]">
                <input
                  type="checkbox"
                  checked={formData.tryOnEnabled}
                  onChange={(e) => setFormData({ ...formData, tryOnEnabled: e.target.checked })}
                  className="rounded text-[#C86A28] focus:ring-[#C86A28]"
                />
                <span>Enable 3D Virtual Try-On</span>
              </label>
            </div>

            {/* Active Model Status Card */}
            {formData.tryOnModelUrl ? (
              <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E8DCCF] flex items-center justify-center shrink-0 shadow-2xs">
                    <Box className="w-5 h-5 text-[#C86A28]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2A1E17] truncate">
                        {formData.tryOnModelUrl.split("/").pop()}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                        Active 3D Model
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono truncate block max-w-md">
                      {formData.tryOnModelUrl}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/try-on-calibrator?product=${initialData?.id || initialData?.slug || formData.slug || ""}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2A1E17] text-[#FAF7F2] text-xs font-medium hover:bg-[#3d2c22] transition-colors"
                    title="Open Calibrator Studio"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#E59B62]" />
                    <span>Calibrate in 3D</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tryOnModelUrl: "", tryOnEnabled: false })}
                    className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Upload Area for .GLB */}
            <div className="border-2 border-dashed border-[#E8DCCF] rounded-xl p-6 text-center bg-[#FAF7F2] hover:bg-[#FAF3EB] transition-colors">
              <Box className="w-8 h-8 text-[#C86A28] mx-auto mb-2" />
              <div className="text-xs font-semibold text-[#2A1E17] mb-1">
                Upload .GLB or .GLTF 3D Model to Cloudflare R2
              </div>
              <p className="text-[11px] text-stone-500 mb-3">
                Binary GLB with embedded PBR textures (maximum 2.5 MB recommended)
              </p>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2A1E17] text-[#FAF7F2] text-xs font-medium cursor-pointer hover:bg-[#3d2c22] transition-colors">
                {uploadingModel ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading 3D Model to R2...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose .GLB File</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
                  onChange={handleModelUpload}
                  disabled={uploadingModel}
                  className="hidden"
                />
              </label>
            </div>

            {/* Or Paste direct model URL */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-600">
                Or Enter Model URL Directly:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.tryOnModelUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tryOnModelUrl: e.target.value,
                      tryOnEnabled: e.target.value.trim().length > 0 ? formData.tryOnEnabled : false,
                    })
                  }
                  placeholder="https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/models/... or /models/eyewear/..."
                  className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] font-mono focus:outline-hidden focus:border-[#C86A28]"
                />
                {formData.tryOnModelUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tryOnModelUrl: "" })}
                    className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Presets for Built-in Models */}
            <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-lg p-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Quick Select Canonical Model Preset:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Cartier Rimless Round", url: "/models/eyewear/cartier_rimless_round.glb" },
                  { label: "Fastrack Wayfarer Black", url: "/models/eyewear/fastrack_wayfarer_black.glb" },
                  { label: "Classic Aviator Gold", url: "/models/eyewear/classic_aviator_gold.glb" },
                  { label: "Titanium Rectangle Gold", url: "/models/eyewear/rectangle_titanium_gold.glb" },
                  { label: "Cat-Eye Luxury Havana", url: "/models/eyewear/cateye_luxury_havana.glb" },
                ].map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        tryOnModelUrl: preset.url,
                        tryOnEnabled: true,
                      })
                    }
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                      formData.tryOnModelUrl === preset.url
                        ? "bg-[#2A1E17] text-white border-[#C86A28]"
                        : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING & INVENTORY */}
      {activeTab === "pricing" && (
        <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Selling Base Price (INR ₹) *
              </label>
              <input
                type="number"
                required
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Original MRP / Cross-out Price (INR ₹)
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="Optional higher retail price"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Initial Stock Units
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] focus:outline-hidden focus:border-[#C86A28]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OPTICAL SPECIFICATIONS */}
      {activeTab === "specs" && (
        <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Optical Geometry & Physical Dimensions
            </h3>
            <p className="text-xs text-stone-500">
              Crucial millimetric specifications for optician surfacing and customer fit.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Frame Shape
              </label>
              <select
                value={formData.shape}
                onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              >
                <option value="rectangle">Rectangle</option>
                <option value="aviator">Aviator</option>
                <option value="round">Round</option>
                <option value="square">Square</option>
                <option value="cat-eye">Cat-Eye</option>
                <option value="geometric">Geometric</option>
                <option value="oval">Oval</option>
                <option value="wayfarer">Wayfarer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Rim Type
              </label>
              <select
                value={formData.rimType}
                onChange={(e) => setFormData({ ...formData, rimType: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              >
                <option value="rimless">Rimless (Minimalist)</option>
                <option value="full-rim">Full Rim</option>
                <option value="half-rim">Half Rim</option>
                <option value="semi-rimless">Semi-Rimless</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Material
              </label>
              <select
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              >
                <option value="titanium">Japanese Beta Titanium</option>
                <option value="acetate">Mazzucchelli Acetate</option>
                <option value="18k-gold-plated">18k Gold Plated</option>
                <option value="metal">Monel & Stainless Steel</option>
                <option value="horn">Natural Buffalo Horn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Weight (grams)
              </label>
              <input
                type="text"
                value={formData.specs?.weight || "20g"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specs: { ...formData.specs, weight: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Lens Width (mm)
              </label>
              <input
                type="number"
                value={formData.specs?.lensWidth || 53}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specs: { ...formData.specs, lensWidth: Number(e.target.value) },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Bridge Width (mm)
              </label>
              <input
                type="number"
                value={formData.specs?.bridgeWidth || 18}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specs: { ...formData.specs, bridgeWidth: Number(e.target.value) },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Temple Length (mm)
              </label>
              <input
                type="number"
                value={formData.specs?.templeLength || 145}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specs: { ...formData.specs, templeLength: Number(e.target.value) },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Total Frame Width (mm)
              </label>
              <input
                type="number"
                value={formData.specs?.frameWidth || 140}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specs: { ...formData.specs, frameWidth: Number(e.target.value) },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COLOR VARIANTS */}
      {activeTab === "variants" && (
        <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Color Variants & SKU Stock
              </h3>
              <p className="text-xs text-stone-500">
                Manage distinct finishes, hardware colors, and individual inventory allocations.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleAddVariant}
              className="text-xs bg-[#2A1E17] hover:bg-[#3d2c22] text-[#FAF7F2]"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Variant</span>
            </Button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#E8DCCF] bg-[#FAF7F2]"
              >
                <div className="w-8 h-8 rounded-full border border-stone-300 shrink-0 relative overflow-hidden">
                  <input
                    type="color"
                    value={v.colorHex || "#D4AF37"}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].colorHex = e.target.value;
                      setVariants(updated);
                    }}
                    className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-none"
                  />
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={v.colorName}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].colorName = e.target.value;
                      setVariants(updated);
                    }}
                    placeholder="Color finish name"
                    className="px-2.5 py-1 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  />

                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].sku = e.target.value;
                      setVariants(updated);
                    }}
                    placeholder="SKU"
                    className="px-2.5 py-1 bg-white border border-[#E8DCCF] rounded-md text-xs font-mono text-[#2A1E17]"
                  />

                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].stock = Number(e.target.value);
                      setVariants(updated);
                    }}
                    placeholder="Stock units"
                    className="px-2.5 py-1 bg-white border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  />
                </div>

                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};
