"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BrandMarquee } from "@/components/layout/BrandMarquee";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { VirtualTryOnModal } from "@/components/optical/VirtualTryOnModal";
import { LensCustomizerModal } from "@/components/optical/LensCustomizerModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { SearchModal } from "@/components/pages/SearchModal";
import { WhatsAppWidget } from "@/components/widgets/WhatsAppWidget";
import { OrderTrackingModal } from "@/components/pages/OrderTrackingModal";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { OrderSuccessModal } from "@/components/cart/OrderSuccessModal";
import { getCatalogProducts, filterAndSortProducts, ALL_FALLBACK_PRODUCTS } from "@/lib/productsService";
import { Product, FilterState, SelectedLensConfig, Order, FrameShape, RimType, FrameMaterial, GenderCategory } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addCustomLensToCart, addToCartDirect, closeCart } = useCart();
  const { openTrackingModal } = useAuth();
  const { openWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>(ALL_FALLBACK_PRODUCTS);

  // Initialize filter state directly from URL query parameters
  const getInitialFiltersFromUrl = useCallback((): FilterState => {
    const cat = searchParams.get("category") || "all";
    const brandParam = searchParams.get("brand") || searchParams.get("brands");
    const genderParam = searchParams.get("gender");
    const shapeParam = searchParams.get("shape") || searchParams.get("shapes");
    const rimParam = searchParams.get("rim") || searchParams.get("rimTypes");
    const materialParam = searchParams.get("material") || searchParams.get("materials");
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const sort = (searchParams.get("sort") || searchParams.get("sortBy") || "featured") as any;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 200000;

    const filterParam = searchParams.get("filter");
    const onlyNewArrivals =
      filterParam === "new_arrivals" ||
      filterParam === "new" ||
      cat === "new" ||
      cat === "new-arrivals";
    const onlySale =
      filterParam === "sale" ||
      cat === "sale";
    const discountParam = searchParams.get("discount") ? Number(searchParams.get("discount")) : undefined;

    return {
      category: (cat === "new" || cat === "new-arrivals" || cat === "sale") ? "all" : (cat as any),
      brands: brandParam ? brandParam.split(",").filter(Boolean) : [],
      gender: genderParam ? (genderParam.split(",").filter(Boolean) as GenderCategory[]) : [],
      shapes: shapeParam ? (shapeParam.split(",").filter(Boolean) as FrameShape[]) : [],
      rimTypes: rimParam ? (rimParam.split(",").filter(Boolean) as RimType[]) : [],
      materials: materialParam ? (materialParam.split(",").filter(Boolean) as FrameMaterial[]) : [],
      colors: [],
      properties: [],
      priceRange: [minPrice, maxPrice],
      searchQuery: search,
      sortBy: sort,
      onlyNewArrivals,
      onlySale: onlySale || Boolean(discountParam),
      minDiscount: discountParam,
    };
  }, [searchParams]);

  const [filterState, setFilterState] = useState<FilterState>(getInitialFiltersFromUrl);

  // Re-sync filter state if URL changes externally (e.g. browser forward/back buttons)
  useEffect(() => {
    setFilterState(getInitialFiltersFromUrl());
  }, [getInitialFiltersFromUrl]);

  // Load catalog products
  useEffect(() => {
    let mounted = true;
    getCatalogProducts()
      .then((data) => {
        if (mounted && data && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => console.warn("Catalog fetch error:", err));
    return () => {
      mounted = false;
    };
  }, []);

  // Update browser URL query params whenever filters change
  const syncFiltersToUrl = useCallback((newFilters: FilterState) => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams();

    if (newFilters.category && newFilters.category !== "all") {
      params.set("category", newFilters.category);
    }
    if (newFilters.brands && newFilters.brands.length > 0) {
      params.set("brand", newFilters.brands.join(","));
    }
    if (newFilters.gender && newFilters.gender.length > 0) {
      params.set("gender", newFilters.gender.join(","));
    }
    if (newFilters.shapes && newFilters.shapes.length > 0) {
      params.set("shape", newFilters.shapes.join(","));
    }
    if (newFilters.rimTypes && newFilters.rimTypes.length > 0) {
      params.set("rim", newFilters.rimTypes.join(","));
    }
    if (newFilters.materials && newFilters.materials.length > 0) {
      params.set("material", newFilters.materials.join(","));
    }
    if (newFilters.searchQuery && newFilters.searchQuery.trim() !== "") {
      params.set("search", newFilters.searchQuery.trim());
    }
    if (newFilters.sortBy && newFilters.sortBy !== "featured") {
      params.set("sort", newFilters.sortBy);
    }
    if (newFilters.priceRange && (newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 200000)) {
      params.set("minPrice", newFilters.priceRange[0].toString());
      params.set("maxPrice", newFilters.priceRange[1].toString());
    }
    if (newFilters.onlyNewArrivals) {
      params.set("filter", "new_arrivals");
    }
    if (newFilters.onlySale) {
      params.set("filter", "sale");
    }
    if (newFilters.minDiscount) {
      params.set("discount", newFilters.minDiscount.toString());
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/shop?${queryString}` : "/shop";
    window.history.replaceState(null, "", newUrl);
  }, []);

  const handleUpdateFilter = useCallback(
    (updated: Partial<FilterState>) => {
      setFilterState((prev) => {
        const next = { ...prev, ...updated };
        syncFiltersToUrl(next);
        return next;
      });
    },
    [syncFiltersToUrl]
  );

  const handleResetFilters = useCallback(() => {
    const resetState: FilterState = {
      category: "all",
      brands: [],
      shapes: [],
      rimTypes: [],
      materials: [],
      colors: [],
      properties: [],
      gender: [],
      priceRange: [0, 200000],
      searchQuery: "",
      sortBy: "featured",
      onlyNewArrivals: false,
      onlySale: false,
      minDiscount: undefined,
    };
    setFilterState(resetState);
    syncFiltersToUrl(resetState);
  }, [syncFiltersToUrl]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, filterState);
  }, [products, filterState]);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [selectedVirtualTryOnProduct, setSelectedVirtualTryOnProduct] = useState<Product | null>(null);
  const [selectedLensCustomizerProduct, setSelectedLensCustomizerProduct] = useState<Product | null>(null);

  const handleSelectProduct = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleConfirmLensConfig = (config: SelectedLensConfig) => {
    if (!selectedLensCustomizerProduct) return;
    addCustomLensToCart(selectedLensCustomizerProduct, config);
    setSelectedLensCustomizerProduct(null);
  };

  const handleNavigate = (page: string) => {
    closeCart();
    if (page === "home") {
      router.push("/");
    } else if (page === "shop") {
      handleResetFilters();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "cart") {
      router.push("/cart");
    } else if (page === "appointment") {
      router.push("/appointment");
    } else if (page === "about") {
      router.push("/about-us");
    } else if (page === "privacy") {
      router.push("/privacy-policy");
    } else if (page === "contact") {
      router.push("/contact");
    } else {
      router.push(`/${page}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2A1E17] selection:bg-[#C86A28] selection:text-white flex flex-col justify-between">
      <div>
        {/* Main Luxury Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectCategory={(cat) => {
            handleUpdateFilter({ category: cat as any, brands: [], shapes: [] });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onSelectBrand={(brand) => {
            handleUpdateFilter({ category: "all", brands: [brand], shapes: [] });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          activeCategory={filterState.category}
          currentPage="shop"
          onNavigate={handleNavigate}
        />

        {/* Brand Marquee Bar */}
        <BrandMarquee
          onSelectBrand={(brand) => {
            handleUpdateFilter({ category: "all", brands: [brand] });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Product Catalog Grid */}
        <ProductGrid
          products={filteredProducts}
          filterState={filterState}
          onUpdateFilter={handleUpdateFilter}
          onResetFilters={handleResetFilters}
          onSelectProduct={handleSelectProduct}
          onOpenVirtualTryOn={(p) => setSelectedVirtualTryOnProduct(p)}
        />
      </div>

      {/* Main Luxury Footer */}
      <Footer
        onSelectCategory={(cat) => {
          if (cat === "about") router.push("/about-us");
          else if (cat === "privacy") router.push("/privacy-policy");
          else if (cat === "contact") router.push("/contact");
          else {
            handleUpdateFilter({ category: cat as any, brands: [] });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        onSelectBrand={(brand) => {
          handleUpdateFilter({ brands: [brand] });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNavigate={handleNavigate}
      />

      {/* Concierge Widget */}
      <WhatsAppWidget />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => router.push("/checkout")}
        onViewCartPage={() => router.push("/cart")}
        allProducts={products}
      />

      {/* Slide-over Wishlist Drawer */}
      <WishlistDrawer
        allProducts={products}
        onSelectProduct={handleSelectProduct}
        onOpenVirtualTryOn={(p) => setSelectedVirtualTryOnProduct(p)}
        onNavigateShop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onNavigateCart={() => router.push("/cart")}
      />

      {/* 3D Virtual Try-On Modal */}
      {selectedVirtualTryOnProduct && (
        <VirtualTryOnModal
          product={selectedVirtualTryOnProduct}
          onClose={() => setSelectedVirtualTryOnProduct(null)}
          onAddToCart={(p) => addToCartDirect(p)}
          allProducts={products}
          onOpenLensCustomizer={(p) => setSelectedLensCustomizerProduct(p)}
        />
      )}

      {/* Clinical Lens Customizer Modal */}
      {selectedLensCustomizerProduct && (
        <LensCustomizerModal
          product={selectedLensCustomizerProduct}
          onClose={() => setSelectedLensCustomizerProduct(null)}
          onConfirmLensConfig={handleConfirmLensConfig}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={(order) => setConfirmedOrder(order)}
        />
      )}

      {/* Order Success Modal */}
      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={(order) => openTrackingModal(order)}
        />
      )}

      <OrderTrackingModal />

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal
          products={products}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={handleSelectProduct}
          onSelectBrand={(brand) => {
            handleUpdateFilter({ brands: [brand] });
          }}
        />
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#C86A28] animate-spin" />
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
