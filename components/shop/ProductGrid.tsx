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
  Search,
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
  allProducts?: Product[];
  filterState: FilterState;
  onUpdateFilter: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenVirtualTryOn: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  allProducts,
  filterState,
  onUpdateFilter,
  onResetFilters,
  onSelectProduct,
  onOpenVirtualTryOn,
}) => {
  // Accordion sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    gender: true,
    shape: true,
    rim: false,
    material: false,
    contactLens: true,
  });

  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Master catalog pool for filter counts to ensure filters never vanish when one is selected
  const catalogPool = allProducts && allProducts.length > 0 ? allProducts : products;

  // Filter pool scoped by active category
  const categoryScopedPool = useMemo(() => {
    if (!filterState.category || filterState.category === "all") {
      return catalogPool;
    }
    const cat = filterState.category.toLowerCase();
    if (cat === "sunglasses") return catalogPool.filter((p) => p.category === "sunglasses");
    if (cat === "eyeglasses") return catalogPool.filter((p) => p.category === "eyeglasses");
    if (cat === "meta-smart" || cat === "smart-glasses") return catalogPool.filter((p) => p.category === "meta-smart");
    if (cat === "contact-lenses" || cat === "contacts" || cat === "contact lenses") {
      return catalogPool.filter((p) => {
        const c = p.category?.toLowerCase();
        return c === "contact-lenses" || c === "contact lenses" || c === "contact lens";
      });
    }
    if (cat === "kids") return catalogPool.filter((p) => p.category === "kids" || p.gender === "kids");
    if (cat === "new" || cat === "new-arrivals") return catalogPool.filter((p) => p.isNewArrival);
    if (cat === "sale") return catalogPool.filter((p) => p.isOnSale || (p.originalPrice && p.originalPrice > p.price));
    return catalogPool;
  }, [catalogPool, filterState.category]);

  // Dynamic Brand Counts from Category Scoped Catalog
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryScopedPool.forEach((p) => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return counts;
  }, [categoryScopedPool]);

  // All available brands dynamically sorted by count descending, then alphabetically
  const sortedBrands = useMemo(() => {
    return Object.keys(brandCounts).sort((a, b) => {
      const diff = (brandCounts[b] || 0) - (brandCounts[a] || 0);
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    });
  }, [brandCounts]);

  // Instant brand search filtering
  const filteredBrands = useMemo(() => {
    if (!brandSearchQuery.trim()) return sortedBrands;
    return sortedBrands.filter((b) =>
      b.toLowerCase().includes(brandSearchQuery.toLowerCase().trim())
    );
  }, [sortedBrands, brandSearchQuery]);

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: catalogPool.length,
      eyeglasses: 0,
      sunglasses: 0,
      "meta-smart": 0,
      "contact-lenses": 0,
    };
    catalogPool.forEach((p) => {
      const c = (p.category || "").toLowerCase();
      if (c.includes("meta") || c.includes("smart")) {
        counts["meta-smart"] = (counts["meta-smart"] || 0) + 1;
      } else if (c.includes("contact") || c.includes("lens")) {
        counts["contact-lenses"] = (counts["contact-lenses"] || 0) + 1;
      } else if (c.includes("sun")) {
        counts.sunglasses = (counts.sunglasses || 0) + 1;
      } else {
        counts.eyeglasses = (counts.eyeglasses || 0) + 1;
      }
    });
    return counts;
  }, [catalogPool]);

  // Dynamic Shape Counts
  const shapeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryScopedPool.forEach((p) => {
      if (p.shape) {
        const s = p.shape.toLowerCase();
        counts[s] = (counts[s] || 0) + 1;
      }
    });
    return counts;
  }, [categoryScopedPool]);

  // Dynamic Gender Counts
  const genderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: categoryScopedPool.length, men: 0, women: 0, unisex: 0, kids: 0 };
    categoryScopedPool.forEach((p) => {
      if (p.gender === "men") counts.men = (counts.men || 0) + 1;
      else if (p.gender === "women") counts.women = (counts.women || 0) + 1;
      else if (p.gender === "kids") counts.kids = (counts.kids || 0) + 1;
      else counts.unisex = (counts.unisex || 0) + 1;
    });
    return counts;
  }, [categoryScopedPool]);

  // Filter Handlers
  const handleCategorySelect = (catSlug: string) => {
    onUpdateFilter({ category: catSlug });
  };

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
    const exists = current.some((s) => s.toLowerCase() === shape.toLowerCase());
    const updated = exists
      ? current.filter((s) => s.toLowerCase() !== shape.toLowerCase())
      : [...current, shape];
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

  const CATEGORIES = [
    { label: "All Collections", value: "all", count: categoryCounts.all },
    { label: "Eyeglasses", value: "eyeglasses", count: categoryCounts.eyeglasses },
    { label: "Sunglasses", value: "sunglasses", count: categoryCounts.sunglasses },
    { label: "Smart Glasses", value: "meta-smart", count: categoryCounts["meta-smart"] || 0 },
    { label: "Contact Lenses", value: "contact-lenses", count: categoryCounts["contact-lenses"] },
  ];

  const GENDERS: { label: string; value: "all" | GenderCategory; count: number }[] = [
    { label: "All Silhouettes", value: "all", count: genderCounts.all },
    { label: "Men's Collection", value: "men", count: genderCounts.men + genderCounts.unisex },
    { label: "Women's Collection", value: "women", count: genderCounts.women + genderCounts.unisex },
    { label: "Unisex Exclusive", value: "unisex", count: genderCounts.unisex },
  ];

  const SHAPES: { label: string; value: FrameShape }[] = [
    { label: "Rectangle", value: "rectangle" },
    { label: "Aviator", value: "aviator" },
    { label: "Wayfarer", value: "wayfarer" },
    { label: "Square", value: "square" },
    { label: "Cat Eye", value: "cat-eye" },
    { label: "Round", value: "round" },
    { label: "Geometric", value: "geometric" },
    { label: "Hexagon", value: "hexagon" },
    { label: "Octagonal", value: "octagonal" },
    { label: "Oval", value: "oval" },
  ];

  const RIMS: { label: string; value: RimType }[] = [
    { label: "Full Rim", value: "full-rim" },
    { label: "Half Rim", value: "half-rim" },
    { label: "Rimless", value: "rimless" },
  ];

  const MATERIALS: { label: string; value: FrameMaterial }[] = [
    { label: "Italian Block Acetate", value: "acetate" },
    { label: "Titanium Precision", value: "titanium" },
    { label: "Stainless Metal", value: "metal" },
    { label: "Silicone Hydrogel", value: "silicone-hydrogel" },
  ];

  const isContactLensCategory =
    filterState.category === "contact-lenses" || filterState.category === "contacts";

  // Active filter count
  const activeFilterCount =
    (filterState.gender?.length || 0) +
    (filterState.shapes?.length || 0) +
    (filterState.brands?.length || 0) +
    (filterState.rimTypes?.length || 0) +
    (filterState.materials?.length || 0) +
    (filterState.category && filterState.category !== "all" ? 1 : 0) +
    (filterState.onlyNewArrivals ? 1 : 0) +
    (filterState.onlySale ? 1 : 0) +
    (filterState.minDiscount ? 1 : 0);

  // Active filter pill chips list
  const activePills = useMemo(() => {
    const pills: { label: string; onRemove: () => void }[] = [];

    if (filterState.onlyNewArrivals) {
      pills.push({
        label: "New Arrivals",
        onRemove: () => onUpdateFilter({ onlyNewArrivals: false }),
      });
    }

    if (filterState.onlySale && !filterState.minDiscount) {
      pills.push({
        label: "Sale / Offers",
        onRemove: () => onUpdateFilter({ onlySale: false }),
      });
    }

    if (filterState.minDiscount) {
      pills.push({
        label: `Min ${filterState.minDiscount}% Off`,
        onRemove: () => onUpdateFilter({ minDiscount: undefined, onlySale: false }),
      });
    }

    if (filterState.category && filterState.category !== "all") {
      const catLabel = CATEGORIES.find((c) => c.value === filterState.category)?.label || filterState.category;
      pills.push({
        label: `Category: ${catLabel}`,
        onRemove: () => onUpdateFilter({ category: "all" }),
      });
    }

    filterState.gender?.forEach((g) => {
      pills.push({
        label: g === "men" ? "Men's" : g === "women" ? "Women's" : g === "unisex" ? "Unisex" : "Kids",
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
            Showing <strong className="text-[#2A1E17]">{products.length}</strong> items in atelier
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
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* 2-Column Main Layout: Sidebar (Desktop) + 4-Column Product Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Sidebar Filters (Desktop Only) */}
        <aside className="hidden md:block w-56 lg:w-64 shrink-0 select-none">
          {/* CATEGORY Filter Accordion */}
          <div className="border-b border-[#E8E1D9] pb-4 mb-4">
            <button
              onClick={() => toggleSection("category")}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-[13px] text-[#1A1A1A] mb-3 cursor-pointer group"
            >
              <span>CATEGORY</span>
              {openSections.category ? (
                <ChevronUp className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              )}
            </button>
            {openSections.category && (
              <div className="space-y-2 pt-1">
                {CATEGORIES.map((item) => {
                  const isChecked =
                    item.value === "all"
                      ? !filterState.category || filterState.category === "all"
                      : filterState.category === item.value;
                  return (
                    <label
                      key={item.value}
                      onClick={() => handleCategorySelect(item.value)}
                      className="flex items-center justify-between text-[13px] text-[#333333] hover:text-black cursor-pointer group py-0.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-[#007AFF] border border-[#007AFF]"
                              : "bg-white border border-[#C4B8AB] group-hover:border-[#786C62]"
                          }`}
                        >
                          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={isChecked ? "font-semibold text-black" : "font-normal"}>
                          {item.label}
                        </span>
                      </div>
                      {item.count > 0 && (
                        <span className="text-[11px] font-sans text-[#8C7D73] font-medium">
                          {item.count}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* LUXURY BRANDS Filter Accordion */}
          <div className="border-b border-[#E8E1D9] pb-4 mb-4">
            <button
              onClick={() => toggleSection("brand")}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-[13px] text-[#1A1A1A] mb-3 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                <span>LUXURY BRANDS</span>
                <span className="text-[11px] font-sans font-normal text-[#8C7D73]">
                  ({sortedBrands.length})
                </span>
              </div>
              {openSections.brand ? (
                <ChevronUp className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              )}
            </button>
            {openSections.brand && (
              <div className="space-y-2 pt-1">
                {/* Brand Search Filter Bar */}
                {sortedBrands.length > 6 && (
                  <div className="relative mb-2.5">
                    <Search className="w-3.5 h-3.5 text-[#8C7D73] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={brandSearchQuery}
                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E8E1D9] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-[#2A1E17] placeholder-[#8C7D73] focus:outline-none focus:border-[#C86A28]"
                    />
                    {brandSearchQuery && (
                      <button
                        onClick={() => setBrandSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C7D73] hover:text-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {filteredBrands.map((brand) => {
                    const isChecked = Boolean(
                      filterState.brands?.some((b) => b.toLowerCase() === brand.toLowerCase())
                    );
                    const count = brandCounts[brand] || 0;
                    return (
                      <label
                        key={brand}
                        onClick={() => handleBrandToggle(brand)}
                        className="flex items-center justify-between text-[13px] text-[#333333] hover:text-black cursor-pointer group py-0.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-[#007AFF] border border-[#007AFF]"
                                : "bg-white border border-[#C4B8AB] group-hover:border-[#786C62]"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                          <span className={isChecked ? "font-semibold text-black" : "font-normal"}>
                            {brand}
                          </span>
                        </div>
                        {count > 0 && (
                          <span className="text-[11px] font-sans text-[#8C7D73] font-medium">
                            {count}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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
              <div className="space-y-2 pt-1">
                {GENDERS.map((item) => {
                  const isChecked =
                    item.value === "all"
                      ? !filterState.gender || filterState.gender.length === 0
                      : Boolean(filterState.gender?.includes(item.value as GenderCategory));
                  return (
                    <label
                      key={item.value}
                      onClick={() => handleGenderToggle(item.value)}
                      className="flex items-center justify-between text-[13px] text-[#333333] hover:text-black cursor-pointer group py-0.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-[#007AFF] border border-[#007AFF]"
                              : "bg-white border border-[#C4B8AB] group-hover:border-[#786C62]"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <span className={isChecked ? "font-semibold text-black" : "font-normal"}>
                          {item.label}
                        </span>
                      </div>
                      {item.count > 0 && (
                        <span className="text-[11px] font-sans text-[#8C7D73] font-medium">
                          {item.count}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* FRAME SHAPE Filter Accordion (Hidden when exclusively viewing Contact Lenses) */}
          {!isContactLensCategory && (
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
                <div className="space-y-2 pt-1">
                  {SHAPES.map((shape) => {
                    const isChecked = Boolean(
                      filterState.shapes?.some((s) => s.toLowerCase() === shape.value.toLowerCase())
                    );
                    const count = shapeCounts[shape.value] || 0;
                    return (
                      <label
                        key={shape.value}
                        onClick={() => handleShapeToggle(shape.value)}
                        className="flex items-center justify-between text-[13px] text-[#333333] hover:text-black cursor-pointer group py-0.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-[#007AFF] border border-[#007AFF]"
                                : "bg-white border border-[#C4B8AB] group-hover:border-[#786C62]"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                          <span className={isChecked ? "font-semibold text-black" : "font-normal"}>
                            {shape.label}
                          </span>
                        </div>
                        {count > 0 && (
                          <span className="text-[11px] font-sans text-[#8C7D73] font-medium">
                            {count}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* RIM CONSTRUCTION Filter Accordion */}
          {!isContactLensCategory && (
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
                <div className="space-y-2 pt-1">
                  {RIMS.map((rim) => {
                    const isChecked = Boolean(filterState.rimTypes?.includes(rim.value));
                    return (
                      <label
                        key={rim.value}
                        onClick={() => handleRimToggle(rim.value)}
                        className="flex items-center gap-2.5 text-[13px] text-[#333333] hover:text-black cursor-pointer group py-0.5"
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
                        <span className={isChecked ? "font-semibold text-black" : "font-normal"}>
                          {rim.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MATERIAL Filter Accordion */}
          <div className="border-b border-[#E8E1D9] pb-4 mb-4">
            <button
              onClick={() => toggleSection("material")}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-[13px] text-[#1A1A1A] mb-3 cursor-pointer group"
            >
              <span>MATERIAL</span>
              {openSections.material ? (
                <ChevronUp className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#786C62] group-hover:text-black" />
              )}
            </button>
            {openSections.material && (
              <div className="space-y-2 pt-1">
                {MATERIALS.map((mat) => {
                  const isChecked = Boolean(filterState.materials?.includes(mat.value));
                  return (
                    <label
                      key={mat.value}
                      onClick={() => handleMaterialToggle(mat.value)}
                      className="flex items-center gap-2.5 text-[13px] text-[#333333] hover:text-black cursor-pointer group py-0.5"
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
                      <span className={isChecked ? "font-semibold text-black" : "font-normal"}>
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
                We couldn&apos;t find any optical items matching your selected filters. Try broadening
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

              {/* Mobile Category */}
              <div className="mb-6">
                <h4 className="font-serif font-bold uppercase text-xs tracking-wider text-[#1A1A1A] mb-3">
                  CATEGORY
                </h4>
                <div className="space-y-2">
                  {CATEGORIES.map((item) => {
                    const isChecked =
                      item.value === "all"
                        ? !filterState.category || filterState.category === "all"
                        : filterState.category === item.value;
                    return (
                      <label
                        key={item.value}
                        onClick={() => handleCategorySelect(item.value)}
                        className="flex items-center justify-between text-xs text-[#333333] cursor-pointer py-0.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-[#007AFF] border border-[#007AFF]"
                                : "bg-white border border-[#C4B8AB]"
                            }`}
                          >
                            {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={isChecked ? "font-semibold text-black" : "font-normal"}>
                            {item.label}
                          </span>
                        </div>
                        {item.count > 0 && (
                          <span className="text-[10px] text-[#8C7D73] font-medium">{item.count}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Brands */}
              <div className="mb-6">
                <h4 className="font-serif font-bold uppercase text-xs tracking-wider text-[#1A1A1A] mb-3">
                  LUXURY BRANDS ({sortedBrands.length})
                </h4>
                {sortedBrands.length > 5 && (
                  <div className="relative mb-2.5">
                    <Search className="w-3.5 h-3.5 text-[#8C7D73] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={brandSearchQuery}
                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E8E1D9] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-[#2A1E17] placeholder-[#8C7D73] focus:outline-none focus:border-[#C86A28]"
                    />
                    {brandSearchQuery && (
                      <button
                        onClick={() => setBrandSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C7D73] hover:text-black"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2">
                  {filteredBrands.map((brand) => {
                    const isChecked = Boolean(
                      filterState.brands?.some((b) => b.toLowerCase() === brand.toLowerCase())
                    );
                    const count = brandCounts[brand] || 0;
                    return (
                      <label
                        key={brand}
                        onClick={() => handleBrandToggle(brand)}
                        className="flex items-center justify-between text-xs text-[#333333] cursor-pointer py-0.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-[#007AFF] border border-[#007AFF]"
                                : "bg-white border border-[#C4B8AB]"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                          <span className={isChecked ? "font-semibold text-black" : "font-normal"}>
                            {brand}
                          </span>
                        </div>
                        {count > 0 && (
                          <span className="text-[10px] text-[#8C7D73] font-medium">{count}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Gender */}
              <div className="mb-6">
                <h4 className="font-serif font-bold uppercase text-xs tracking-wider text-[#1A1A1A] mb-3">
                  GENDER
                </h4>
                <div className="space-y-2">
                  {GENDERS.map((item) => {
                    const isChecked =
                      item.value === "all"
                        ? !filterState.gender || filterState.gender.length === 0
                        : Boolean(filterState.gender?.includes(item.value as GenderCategory));
                    return (
                      <label
                        key={item.value}
                        onClick={() => handleGenderToggle(item.value)}
                        className="flex items-center justify-between text-xs text-[#333333] cursor-pointer py-0.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                              isChecked
                                ? "bg-[#007AFF] border border-[#007AFF]"
                                : "bg-white border border-[#C4B8AB]"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                          <span className={isChecked ? "font-semibold text-black" : "font-normal"}>
                            {item.label}
                          </span>
                        </div>
                        {item.count > 0 && (
                          <span className="text-[10px] text-[#8C7D73] font-medium">{item.count}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Shapes */}
              {!isContactLensCategory && (
                <div className="mb-6">
                  <h4 className="font-serif font-bold uppercase text-xs tracking-wider text-[#1A1A1A] mb-3">
                    FRAME SHAPE
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {SHAPES.map((shape) => {
                      const isChecked = Boolean(
                        filterState.shapes?.some((s) => s.toLowerCase() === shape.value.toLowerCase())
                      );
                      const count = shapeCounts[shape.value] || 0;
                      return (
                        <label
                          key={shape.value}
                          onClick={() => handleShapeToggle(shape.value)}
                          className="flex items-center justify-between text-xs text-[#333333] cursor-pointer py-0.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all ${
                                isChecked
                                  ? "bg-[#007AFF] border border-[#007AFF]"
                                  : "bg-white border border-[#C4B8AB]"
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                            <span className={isChecked ? "font-semibold text-black" : "font-normal"}>
                              {shape.label}
                            </span>
                          </div>
                          {count > 0 && (
                            <span className="text-[10px] text-[#8C7D73] font-medium">{count}</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
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
