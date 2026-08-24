import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, Grid3x3, LayoutGrid, Grid2x2, X, RotateCcw } from 'lucide-react';
import { Product, FilterState, FrameShape, RimType, FrameMaterial, GenderCategory } from '../../types';
import { ProductCard } from './ProductCard';

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
  onOpenVirtualTryOn
}) => {
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    type: true,
    gender: true,
    shape: true,
    rim: false,
    color: false,
    material: false,
    price: false
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShapeToggle = (shape: FrameShape) => {
    const current = filterState.shapes;
    const exists = current.includes(shape);
    const updated = exists ? current.filter((s) => s !== shape) : [...current, shape];
    onUpdateFilter({ shapes: updated });
  };

  const handleRimToggle = (rim: RimType) => {
    const current = filterState.rimTypes;
    const exists = current.includes(rim);
    const updated = exists ? current.filter((r) => r !== rim) : [...current, rim];
    onUpdateFilter({ rimTypes: updated });
  };

  const handleMaterialToggle = (mat: FrameMaterial) => {
    const current = filterState.materials;
    const exists = current.includes(mat);
    const updated = exists ? current.filter((m) => m !== mat) : [...current, mat];
    onUpdateFilter({ materials: updated });
  };

  const handleBrandToggle = (brandName: string) => {
    const current = filterState.brands;
    const exists = current.includes(brandName);
    const updated = exists ? current.filter((b) => b !== brandName) : [...current, brandName];
    onUpdateFilter({ brands: updated });
  };

  const handleGenderToggle = (g: any) => {
    const current = filterState.gender;
    if (g === 'all') {
      onUpdateFilter({ gender: [] });
      return;
    }
    const exists = current.includes(g as GenderCategory);
    const updated = exists ? current.filter((item) => item !== g) : [g as GenderCategory];
    onUpdateFilter({ gender: updated });
  };

  const activeFilterCount =
    filterState.shapes.length +
    filterState.rimTypes.length +
    filterState.materials.length +
    filterState.brands.length +
    filterState.gender.length +
    (filterState.category !== 'all' ? 1 : 0);

  const SHAPES: { label: string; value: FrameShape }[] = [
    { label: 'Aviator', value: 'aviator' },
    { label: 'Cat Eye', value: 'cat-eye' },
    { label: 'Rectangle', value: 'rectangle' },
    { label: 'Round', value: 'round' },
    { label: 'Square', value: 'square' },
    { label: 'Geometric', value: 'geometric' },
    { label: 'Wayfarer', value: 'wayfarer' }
  ];

  const RIMS: { label: string; value: RimType }[] = [
    { label: 'Full Rim', value: 'full-rim' },
    { label: 'Half Rim', value: 'half-rim' },
    { label: 'Rimless', value: 'rimless' }
  ];

  const MATERIALS: { label: string; value: FrameMaterial }[] = [
    { label: 'Japanese Titanium', value: 'titanium' },
    { label: 'Italian Block Acetate', value: 'acetate' },
    { label: '18k Gold Plated', value: '18k-gold-plated' },
    { label: 'Lightweight Alloy', value: 'metal' }
  ];

  const BRANDS = ['Cartier', 'Tom Ford', 'GAST', 'Ray-Ban', 'Jacques Marie Mage', 'Lindberg', 'Prada', 'Gucci'];

  return (
    <div id="product-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Grid Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 mb-6">
        <div>
          <span className="text-[10px] font-sans font-bold tracking-widest text-[#C85A1B] uppercase block">
            PRECISION CATALOGUE
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 uppercase">
            {filterState.category === 'all'
              ? 'All Luxury Eyewear'
              : filterState.category.replace('-', ' ').toUpperCase()}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Showing {products.length} master-crafted optical silhouettes
          </p>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 bg-white border border-stone-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          {/* Desktop Grid Switcher */}
          <div className="hidden md:flex items-center bg-stone-100 p-1 border border-stone-300 gap-1">
            <button
              onClick={() => setGridCols(2)}
              className={`p-1.5 transition-colors cursor-pointer ${gridCols === 2 ? 'bg-white shadow-xs text-black' : 'text-stone-500'}`}
              title="2 Columns"
            >
              <Grid2x2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(3)}
              className={`p-1.5 transition-colors cursor-pointer ${gridCols === 3 ? 'bg-white shadow-xs text-black' : 'text-stone-500'}`}
              title="3 Columns"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`p-1.5 transition-colors cursor-pointer ${gridCols === 4 ? 'bg-white shadow-xs text-black' : 'text-stone-500'}`}
              title="4 Columns"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={filterState.sortBy}
            onChange={(e) => onUpdateFilter({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="bg-white border border-stone-300 px-3 py-2 text-xs font-sans text-stone-800 focus:outline-none focus:border-[#C85A1B] cursor-pointer"
          >
            <option value="featured">Featured Curations</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Main Grid Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sidebar Filters (Desktop) */}
        <aside className="hidden md:block space-y-6 text-xs font-sans">
          {/* Active Filters / Reset */}
          {activeFilterCount > 0 && (
            <div className="bg-[#FAF3EB] p-3.5 border border-[#E8DCCF] flex items-center justify-between">
              <span className="font-bold text-stone-900 uppercase text-[11px]">
                {activeFilterCount} Active Filters
              </span>
              <button
                onClick={onResetFilters}
                className="text-[#C85A1B] hover:text-black flex items-center gap-1 font-bold uppercase text-[10px] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>
          )}

          {/* Gender Filter */}
          <div className="border-b border-stone-200 pb-4">
            <button
              onClick={() => toggleSection('gender')}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-stone-900 mb-2 cursor-pointer"
            >
              <span>Gender</span>
              {openSections.gender ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.gender && (
              <div className="space-y-1.5 pt-1">
                {[
                  { label: 'All Silhouettes', value: 'all' },
                  { label: "Men's Collection", value: 'men' },
                  { label: "Women's Collection", value: 'women' },
                  { label: 'Kids & Teens', value: 'kids' }
                ].map((item) => {
                  const isChecked = item.value === 'all' ? filterState.gender.length === 0 : filterState.gender.includes(item.value as GenderCategory);
                  return (
                    <label key={item.value} className="flex items-center gap-2 text-stone-700 hover:text-black cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleGenderToggle(item.value)}
                        className="rounded border-stone-300 text-[#C85A1B] focus:ring-[#C85A1B]"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shape Filter */}
          <div className="border-b border-stone-200 pb-4">
            <button
              onClick={() => toggleSection('shape')}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-stone-900 mb-2 cursor-pointer"
            >
              <span>Frame Shape</span>
              {openSections.shape ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.shape && (
              <div className="space-y-1.5 pt-1">
                {SHAPES.map((shape) => (
                  <label key={shape.value} className="flex items-center gap-2 text-stone-700 hover:text-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterState.shapes.includes(shape.value)}
                      onChange={() => handleShapeToggle(shape.value)}
                      className="rounded border-stone-300 text-[#C85A1B] focus:ring-[#C85A1B]"
                    />
                    <span>{shape.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Brands Filter */}
          <div className="border-b border-stone-200 pb-4">
            <button
              onClick={() => toggleSection('brand')}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-stone-900 mb-2 cursor-pointer"
            >
              <span>Luxury Brand</span>
              {openSections.brand ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.brand !== false && (
              <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
                {BRANDS.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 text-stone-700 hover:text-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterState.brands.some((b) => b.toLowerCase() === brand.toLowerCase())}
                      onChange={() => handleBrandToggle(brand)}
                      className="rounded border-stone-300 text-[#C85A1B] focus:ring-[#C85A1B]"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rim Filter */}
          <div className="border-b border-stone-200 pb-4">
            <button
              onClick={() => toggleSection('rim')}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-stone-900 mb-2 cursor-pointer"
            >
              <span>Rim Construction</span>
              {openSections.rim ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.rim && (
              <div className="space-y-1.5 pt-1">
                {RIMS.map((rim) => (
                  <label key={rim.value} className="flex items-center gap-2 text-stone-700 hover:text-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterState.rimTypes.includes(rim.value)}
                      onChange={() => handleRimToggle(rim.value)}
                      className="rounded border-stone-300 text-[#C85A1B] focus:ring-[#C85A1B]"
                    />
                    <span>{rim.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Material Filter */}
          <div className="border-b border-stone-200 pb-4">
            <button
              onClick={() => toggleSection('material')}
              className="w-full flex items-center justify-between font-serif font-bold uppercase tracking-wider text-stone-900 mb-2 cursor-pointer"
            >
              <span>Frame Material</span>
              {openSections.material ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {openSections.material && (
              <div className="space-y-1.5 pt-1">
                {MATERIALS.map((mat) => (
                  <label key={mat.value} className="flex items-center gap-2 text-stone-700 hover:text-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterState.materials.includes(mat.value)}
                      onChange={() => handleMaterialToggle(mat.value)}
                      className="rounded border-stone-300 text-[#C85A1B] focus:ring-[#C85A1B]"
                    />
                    <span>{mat.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="md:col-span-3">
          {products.length === 0 ? (
            <div className="bg-white border border-[#E8DCCF] p-12 text-center space-y-4">
              <p className="font-serif text-lg text-stone-800">No frames match your selected filters.</p>
              <button
                onClick={onResetFilters}
                className="bg-[#2A1E17] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#C85A1B] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-4 sm:gap-6 ${
                gridCols === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : gridCols === 4
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
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
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="font-serif font-bold uppercase text-sm">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <h4 className="font-bold uppercase mb-2">Shapes</h4>
                <div className="space-y-2">
                  {SHAPES.map((shape) => (
                    <label key={shape.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filterState.shapes.includes(shape.value)}
                        onChange={() => handleShapeToggle(shape.value)}
                      />
                      <span>{shape.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase mb-2">Brands</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {BRANDS.map((brand) => (
                    <label key={brand} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filterState.brands.some((b) => b.toLowerCase() === brand.toLowerCase())}
                        onChange={() => handleBrandToggle(brand)}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t flex gap-2">
              <button
                onClick={() => {
                  onResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 border border-stone-300 text-xs font-bold uppercase"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-[#2A1E17] text-white text-xs font-bold uppercase"
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
