"use client";

import React, { useState, useMemo } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Check,
  SearchX,
} from "lucide-react";
import {
  Product,
  FilterState,
  FrameShape,
  RimType,
  FrameMaterial,
  GenderCategory,
} from "../../types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  filterState: FilterState;
  onUpdateFilter: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenVirtualTryOn: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  filterState,
  onUpdateFilter,
  onResetFilters,
  onSelectProduct,
  onOpenVirtualTryOn,
}) => {
  // Accordion sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gender: true,
    shape: true,
    brand: true,
    rim: false,
    material: false,
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter Handlers
  const handleGenderToggle = (g: "all" | GenderCategory) => {
    if (g === "all") {
      onUpdateFilter({ gender: [] });
      return;
    }
    const current = filterState.gender || [];
    const exists = current.includes(g);
    const updated = exists ? current.filter((item) => item !== g) : [g];
    onUpdateFilter({ gender: updated });
  };

  const handleShapeToggle = (shape: FrameShape) => {
    const current = filterState.shapes || [];
    const exists = current.includes(shape);
    const updated = exists ? current.filter((s) => s !== shape) : [...current, shape];
    onUpdateFilter({ shapes: updated });
  };

  const handleBrandToggle = (brandName: string) => {
    const current = filterState.brands || [];
    const exists = current.some((b) => b.toLowerCase() === brandName.toLowerCase());
    const updated = exists
      ? current.filter((b) => b.toLowerCase() !== brandName.toLowerCase())
      : [...current, brandName];
    onUpdateFilter({ brands: updated });
  };

  const handleRimToggle = (rim: RimType) => {
    const current = filterState.rimTypes || [];
    const exists = current.includes(rim);
    const updated = exists ? current.filter((r) => r !== rim) : [...current, rim];
    onUpdateFilter({ rimTypes: updated });
  };

  const handleMaterialToggle = (mat: FrameMaterial) => {
    const current = filterState.materials || [];
    const exists = current.includes(mat);
    const updated = exists ? current.filter((m) => m !== mat) : [...current, mat];
    onUpdateFilter({ materials: updated });
  };

  // Static options lists matching Figma 106:5939
  const GENDERS: { label: string; value: "all" | GenderCategory }[] = [
    { label: "All Silhouettes", value: "all" },
    { label: "Men's Collection", value: "men" },
    { label: "Women's Collection", value: "women" },
    { label: "Kids & Teens", value: "kids" },
  ];

  const SHAPES: { label: string; value: FrameShape }[] = [
    { label: "Aviator", value: "aviator" },
    { label: "Cat Eye", value: "cat-eye" },
    { label: "Rectangle", value: "rectangle" },
    { label: "Round", value: "round" },
    { label: "Square", value: "square" },
    { label: "Geometric", value: "geometric" },
    { label: "Wayfarer", value: "wayfarer" },
  ];

  const BRANDS = [
    "Cartier",
    "Tom Ford",
    "GAST",
    "Ray-Ban",
    "Jacques Marie Mage",
    "Lindberg",
    "Prada",
    "Gucci",
  ];

  const RIMS: { label: string; value: RimType }[] = [
    { label: "Full Rim", value: "full-rim" },
    { label: "Half Rim", value: "half-rim" },
    { label: "Rimless", value: "rimless" },
  ];

  const MATERIALS: { label: string; value: FrameMaterial }[] = [
    { label: "Japanese Titanium", value: "titanium" },
    { label: "Italian Block Acetate", value: "acetate" },
    { label: "18k Gold Plated", value: "18k-gold-plated" },
    { label: "Lightweight Alloy", value: "metal" },
  ];

  // Active filter count
  const activeFilterCount =
    (filterState.gender?.length || 0) +
    (filterState.shapes?.length || 0) +
    (filterState.brands?.length || 0) +
    (filterState.rimTypes?.length || 0) +
    (filterState.materials?.length || 0) +
    (filterState.category && filterState.category !== "all" ? 1 : 0);

  // Active filter pill chips list
  const activePills = useMemo(() => {
    const pills: { label: string; onRemove: () => void }[] = [];

    if (filterState.category && filterState.category !== "all") {
      pills.push({
        label: `Category: ${filterState.category.replace("-", " ")}`,
        onRemove: () => onUpdateFilter({ category: "all" }),
      });
    }

    filterState.gender?.forEach((g) => {
      pills.push({
        label: g === "men" ? "Men's" : g === "women" ? "Women's" : "Kids & Teens",
        onRemove: () => handleGenderToggle(g),
      });
    });

    filterState.shapes?.forEach((s) => {
      const match = SHAPES.find((item) => item.value === s);
      pills.push({
        label: match ? match.label : s,
        onRemove: () => handleShapeToggle(s),
      });
    });

    filterState.brands?.forEach((b) => {
      pills.push({
        label: b,
        onRemove: () => handleBrandToggle(b),
      });
    });

    filterState.rimTypes?.forEach((r) => {
      const match = RIMS.find((item) => item.value === r);
      pills.push({
        label: match ? match.label : r,
        onRemove: () => handleRimToggle(r),
      });
    });

    filterState.materials?.forEach((m) => {
      const match = MATERIALS.find((item) => item.value === m);
      pills.push({
        label: match ? match.label : m,
        onRemove: () => handleMaterialToggle(m),
      });
    });

    return pills;
  }, [filterState]);

  return (
    <div id="product-catalog" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile Filters Trigger Bar & Active Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#E8E1D9]">
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden inline-flex items-center gap-2 bg-white border border-[#D5C7B8] px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-[#2A1E17] shadow-xs cursor-pointer hover:bg-[#FAF7F2]"
            aria-label="Open Filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C86A28]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C86A28] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-xs font-medium text-[#786C62]">
            Showing <strong className="text-[#2A1E17]">{products.length}</strong> silhouettes
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="sort-select" className="text-xs font-medium text-[#786C62] hidden sm:inline">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={filterState.sortBy || "featured"}
            onChange={(e) => onUpdateFilter({ sortBy: e.target.value as FilterState["sortBy"] })}
            className="bg-white border border-[#D5C7B8] rounded-full px-3.5 py-1.5 text-xs font-medium text-[#2A1E17] focus:outline-none focus:border-[#C86A28] cursor-pointer shadow-2xs"
          >
            <option value="featured">Featured Curations</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activePills.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 pb-5 mb-6 border-b border-[#E8E1D9]/60">
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#8C7D73] mr-1">
            Active:
          </span>
          {activePills.map((pill, idx) => (
            <button
              key={idx}
              onClick={pill.onRemove}
              className="inline-flex items-center gap-1.5 bg-white border border-[#D5C7B8] hover:border-[#C86A28] text-[#2A1E17] text-xs font-medium px-3 py-1 rounded-full shadow-2xs transition-colors group cursor-pointer"
              title="Remove filter"
            >
              <span>{pill.label}</span>
              <X className="w-3 h-3 text-[#8C7D73] group-hover:text-[#C86A28]" />
            </button>
          ))}
          <button
            onClick={onResetFilters}
            className="text-[11px] font-bold text-[#C86A28] hover:text-[#9A4C16] ml-2 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* 2-Column Main Layout: Sidebar (Desktop) + 4-Column Product Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Sidebar Filters (Desktop Only) */}
        <aside className="hidden md:block w-56 lg:w-60 shrink-0 select-none">
          {/* GENDER Filter Accordion */}
          <div className="border-b border-[#E8E1D9] pb-4 mb-4">
            <button
              onClick={() => toggleSection("gender")}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-[13px] text-[#1A1A1A] mb-3 cursor-pointer group"
            >
              <span>GENDER</span>
              {openSections.gender ? (
                <ChevronUp className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              )}
            </button>
            {openSections.gender && (
              <div className="space-y-2.5 pt-1">
                {GENDERS.map((item) => {
                  const isChecked =
                    item.value === "all"
                      ? !filterState.gender || filterState.gender.length === 0
                      : Boolean(filterState.gender?.includes(item.value as GenderCategory));
                  return (
                    <label
                      key={item.value}
                      onClick={() => handleGenderToggle(item.value)}
                      className="flex items-center gap-2.5 text-[13px] text-[#333333] hover:text-black cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-[#007AFF] border border-[#007AFF]"
                            : "bg-white border border-[#C4B8AB] group-hover:border-[#786C62]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <span className={isChecked ? "font-medium text-black" : "font-normal"}>
                        {item.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* FRAME SHAPE Filter Accordion */}
          <div className="border-b border-[#E8E1D9] pb-4 mb-4">
            <button
              onClick={() => toggleSection("shape")}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-[13px] text-[#1A1A1A] mb-3 cursor-pointer group"
            >
              <span>FRAME SHAPE</span>
              {openSections.shape ? (
                <ChevronUp className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              )}
            </button>
            {openSections.shape && (
              <div className="space-y-2.5 pt-1">
                {SHAPES.map((shape) => {
                  const isChecked = Boolean(filterState.shapes?.includes(shape.value));
                  return (
                    <label
                      key={shape.value}
                      onClick={() => handleShapeToggle(shape.value)}
                      className="flex items-center gap-2.5 text-[13px] text-[#333333] hover:text-black cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-[#007AFF] border border-[#007AFF]"
                            : "bg-white border border-[#C4B8AB] group-hover:border-[#786C62]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <span className={isChecked ? "font-medium text-black" : "font-normal"}>
                        {shape.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* LUXURY BRAND Filter Accordion */}
          <div className="border-b border-[#E8E1D9] pb-4 mb-4">
            <button
              onClick={() => toggleSection("brand")}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-[13px] text-[#1A1A1A] mb-3 cursor-pointer group"
            >
              <span>LUXURY BRAND</span>
              {openSections.brand ? (
                <ChevronUp className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              )}
            </button>
            {openSections.brand && (
              <div className="space-y-2.5 pt-1">
                {BRANDS.map((brand) => {
                  const isChecked = Boolean(
                    filterState.brands?.some((b) => b.toLowerCase() === brand.toLowerCase())
                  );
                  return (
                    <label
                      key={brand}
                      onClick={() => handleBrandToggle(brand)}
                      className="flex items-center gap-2.5 text-[13px] text-[#333333] hover:text-black cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-[#007AFF] border border-[#007AFF]"
                            : "bg-white border border-[#C4B8AB] group-hover:border-[#786C62]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <span className={isChecked ? "font-medium text-black" : "font-normal"}>
                        {brand}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIM CONSTRUCTION Filter Accordion */}
          <div className="border-b border-[#E8E1D9] pb-4 mb-4">
            <button
              onClick={() => toggleSection("rim")}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-[13px] text-[#1A1A1A] mb-3 cursor-pointer group"
            >
              <span>RIM CONSTRUCTION</span>
              {openSections.rim ? (
                <ChevronUp className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              )}
            </button>
            {openSections.rim && (
              <div className="space-y-2.5 pt-1">
                {RIMS.map((rim) => {
                  const isChecked = Boolean(filterState.rimTypes?.includes(rim.value));
                  return (
                    <label
                      key={rim.value}
                      onClick={() => handleRimToggle(rim.value)}
                      className="flex items-center gap-2.5 text-[13px] text-[#333333] hover:text-black cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-[#007AFF] border border-[#007AFF]"
                            : "bg-white border border-[#C4B8AB] group-hover:border-[#786C62]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <span className={isChecked ? "font-medium text-black" : "font-normal"}>
                        {rim.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* FRAME MATERIAL Filter Accordion */}
          <div className="border-b border-[#E8E1D9] pb-4 mb-4">
            <button
              onClick={() => toggleSection("material")}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-[13px] text-[#1A1A1A] mb-3 cursor-pointer group"
            >
              <span>FRAME MATERIAL</span>
              {openSections.material ? (
                <ChevronUp className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              )}
            </button>
            {openSections.material && (
              <div className="space-y-2.5 pt-1">
                {MATERIALS.map((mat) => {
                  const isChecked = Boolean(filterState.materials?.includes(mat.value));
                  return (
                    <label
                      key={mat.value}
                      onClick={() => handleMaterialToggle(mat.value)}
                      className="flex items-center gap-2.5 text-[13px] text-[#333333] hover:text-black cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-[#007AFF] border border-[#007AFF]"
                            : "bg-white border border-[#C4B8AB] group-hover:border-[#786C62]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <span className={isChecked ? "font-medium text-black" : "font-normal"}>
                        {mat.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reset Action */}
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="w-full mt-2 py-2.5 px-4 bg-white border border-[#D5C7B8] hover:border-[#C86A28] rounded-full text-xs font-bold uppercase tracking-wider text-[#2A1E17] hover:text-[#C86A28] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </aside>

        {/* Right Main Product Card Grid (4 Columns Desktop matching Figma) */}
        <main className="flex-1 w-full min-w-0">
          {products.length === 0 ? (
            /* Empty State Matching User Requirements with Zero Emojis */
            <div className="bg-white border border-[#EBE6DF] rounded-2xl p-12 sm:p-16 text-center max-w-xl mx-auto shadow-sm my-6">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center mx-auto mb-5 text-[#C86A28]">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2A1E17] mb-2.5">
                No Silhouettes Match Your Criteria
              </h3>
              <p className="text-sm font-sans text-[#786C62] leading-relaxed max-w-md mx-auto mb-6">
                We couldn&apos;t find any optical frames matching your selected filters. Try broadening
                your search or resetting your filters to discover our full luxury catalog.
              </p>
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-2 bg-[#2A1E17] hover:bg-[#C86A28] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#E8A267]" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            /* 4-Column Product Grid (Responsive: 1 on mobile, 2 on tablet, 3 on laptop, 4 on desktop) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onOpenVirtualTryOn={onOpenVirtualTryOn}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xs sm:max-w-sm h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D9] mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#C86A28]" />
                  <h3 className="font-serif font-bold uppercase text-base text-[#2A1E17]">
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </h3>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#FAF7F2] text-[#786C62] hover:text-black cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Gender */}
              <div className="mb-6">
                <h4 className="font-serif font-bold uppercase text-xs tracking-wider text-[#1A1A1A] mb-3">
                  GENDER
                </h4>
                <div className="space-y-2.5">
                  {GENDERS.map((item) => {
                    const isChecked =
                      item.value === "all"
                        ? !filterState.gender || filterState.gender.length === 0
                        : Boolean(filterState.gender?.includes(item.value as GenderCategory));
                    return (
                      <label
                        key={item.value}
                        onClick={() => handleGenderToggle(item.value)}
                        className="flex items-center gap-2.5 text-xs text-[#333333] cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-[#007AFF] border border-[#007AFF]"
                              : "bg-white border border-[#C4B8AB]"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <span className={isChecked ? "font-medium text-black" : "font-normal"}>
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Shapes */}
              <div className="mb-6">
                <h4 className="font-serif font-bold uppercase text-xs tracking-wider text-[#1A1A1A] mb-3">
                  FRAME SHAPE
                </h4>
                <div className="space-y-2.5">
                  {SHAPES.map((shape) => {
                    const isChecked = Boolean(filterState.shapes?.includes(shape.value));
                    return (
                      <label
                        key={shape.value}
                        onClick={() => handleShapeToggle(shape.value)}
                        className="flex items-center gap-2.5 text-xs text-[#333333] cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-[#007AFF] border border-[#007AFF]"
                              : "bg-white border border-[#C4B8AB]"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <span className={isChecked ? "font-medium text-black" : "font-normal"}>
                          {shape.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Brands */}
              <div className="mb-6">
                <h4 className="font-serif font-bold uppercase text-xs tracking-wider text-[#1A1A1A] mb-3">
                  LUXURY BRAND
                </h4>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
                  {BRANDS.map((brand) => {
                    const isChecked = Boolean(
                      filterState.brands?.some((b) => b.toLowerCase() === brand.toLowerCase())
                    );
                    return (
                      <label
                        key={brand}
                        onClick={() => handleBrandToggle(brand)}
                        className="flex items-center gap-2.5 text-xs text-[#333333] cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-[#007AFF] border border-[#007AFF]"
                              : "bg-white border border-[#C4B8AB]"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <span className={isChecked ? "font-medium text-black" : "font-normal"}>
                          {brand}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-[#E8E1D9] flex gap-3">
              <button
                onClick={() => {
                  onResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 border border-[#D5C7B8] rounded-full text-xs font-bold uppercase tracking-wider text-[#2A1E17] hover:bg-[#FAF7F2] transition-colors cursor-pointer text-center"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-[#2A1E17] hover:bg-[#C86A28] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center shadow-md"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
