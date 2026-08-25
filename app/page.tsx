"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { BrandMarquee } from "@/components/layout/BrandMarquee";
import { Footer } from "@/components/layout/Footer";

import { HeroSlider } from "@/components/home/HeroSlider";
import { ShopByGender } from "@/components/home/ShopByGender";
import { ShopByShapeSection } from "@/components/home/ShopByShapeSection";
import { CollectorsEditionSection } from "@/components/home/CollectorsEditionSection";
import { JustDroppedSection } from "@/components/home/JustDroppedSection";
import { NeedToKnowSection } from "@/components/home/NeedToKnowSection";
import { WordsWeLiveBySection } from "@/components/home/WordsWeLiveBySection";
import { BlogReelsSection } from "@/components/home/BlogReelsSection";
import { TrendingSearchesSection } from "@/components/home/TrendingSearchesSection";

import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductDetailPage } from "@/components/product/ProductDetailPage";

import { VirtualTryOnModal } from "@/components/optical/VirtualTryOnModal";
import { LensCustomizerModal } from "@/components/optical/LensCustomizerModal";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { OrderSuccessModal } from "@/components/cart/OrderSuccessModal";

import { SearchModal } from "@/components/pages/SearchModal";
import { ContactUsPage } from "@/components/pages/ContactUsPage";
import { AppointmentPage } from "@/components/pages/AppointmentPage";
import { WishlistPage } from "@/components/pages/WishlistPage";
import { OrderTrackingModal } from "@/components/pages/OrderTrackingModal";

import { GemsLoyaltyWidget } from "@/components/widgets/GemsLoyaltyWidget";
import { WhatsAppWidget } from "@/components/widgets/WhatsAppWidget";

import { PRODUCTS } from "@/data/products";
import { Product, FilterState, SelectedLensConfig, Order } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { addCustomLensToCart, addToCartDirect } = useCart();
  const { openTrackingModal } = useAuth();

  const [currentPage, setCurrentPage] = useState<"home" | "shop" | "contact" | "appointment" | "wishlist">("home");
  const [products] = useState<Product[]>(PRODUCTS);

  // Filter State
  const [filterState, setFilterState] = useState<FilterState>({
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
  });

  // Modal Overlay States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [selectedVirtualTryOnProduct, setSelectedVirtualTryOnProduct] = useState<Product | null>(null);
  const [selectedLensCustomizerProduct, setSelectedLensCustomizerProduct] = useState<Product | null>(null);

  const handleUpdateFilter = (updated: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilterState({
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
    });
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (filterState.category === "sunglasses") {
      result = result.filter((p) => p.category === "sunglasses");
    } else if (filterState.category === "eyeglasses") {
      result = result.filter((p) => p.category === "eyeglasses");
    } else if (filterState.category === "meta-smart") {
      result = result.filter((p) => p.category === "meta-smart");
    } else if (filterState.category === "kids") {
      result = result.filter((p) => p.category === "kids" || p.gender === "kids");
    } else if (filterState.category === "new") {
      result = result.filter((p) => p.isNewArrival);
    } else if (filterState.category === "sale") {
      result = result.filter((p) => p.isOnSale || p.originalPrice);
    }

    // Gender Filter
    if (filterState.gender && filterState.gender.length > 0) {
      result = result.filter((p) => {
        if (filterState.gender.includes("men")) {
          return p.gender === "men" || p.gender === "unisex";
        }
        if (filterState.gender.includes("women")) {
          return p.gender === "women" || p.gender === "unisex";
        }
        if (filterState.gender.includes("kids")) {
          return p.gender === "kids" || p.category === "kids";
        }
        return filterState.gender.includes(p.gender);
      });
    }

    // Brands Filter
    if (filterState.brands.length > 0) {
      result = result.filter((p) =>
        filterState.brands.some((b) => p.brand.toLowerCase().includes(b.toLowerCase()))
      );
    }

    // Shapes Filter
    if (filterState.shapes.length > 0) {
      result = result.filter((p) => filterState.shapes.includes(p.shape));
    }

    // Rim Types
    if (filterState.rimTypes.length > 0) {
      result = result.filter((p) => filterState.rimTypes.includes(p.rimType));
    }

    // Materials
    if (filterState.materials.length > 0) {
      result = result.filter((p) => filterState.materials.includes(p.material));
    }

    // Sort By
    if (filterState.sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (filterState.sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (filterState.sortBy === "newest") {
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }

    return result;
  }, [products, filterState]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProductDetail(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectBrandFromHeader = (brandSlug: string) => {
    setSelectedProductDetail(null);
    setFilterState({
      category: "all",
      brands: [brandSlug],
      shapes: [],
      rimTypes: [],
      materials: [],
      colors: [],
      properties: [],
      gender: [],
      priceRange: [0, 200000],
      searchQuery: "",
      sortBy: "featured",
    });
    setCurrentPage("shop");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectGender = (gender: "men" | "women" | "kids") => {
    setSelectedProductDetail(null);
    if (gender === "kids") {
      setFilterState((prev) => ({
        ...prev,
        category: "kids",
        gender: ["kids"],
        brands: [],
        shapes: [],
        rimTypes: [],
        materials: [],
      }));
    } else {
      setFilterState((prev) => ({
        ...prev,
        category: "all",
        gender: [gender],
        brands: [],
        shapes: [],
        rimTypes: [],
        materials: [],
      }));
    }
  };

  const handleNavigate = (page: "home" | "shop" | "contact" | "appointment" | "wishlist") => {
    setSelectedProductDetail(null);
    setCurrentPage(page);
    if (page === "home") {
      setFilterState((prev) => ({ ...prev, category: "all", brands: [] }));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmLensConfig = (config: SelectedLensConfig) => {
    if (!selectedLensCustomizerProduct) return;
    addCustomLensToCart(selectedLensCustomizerProduct, config);
    setSelectedLensCustomizerProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2A1E17] selection:bg-[#C86A28] selection:text-white flex flex-col justify-between">
      <div>
        {/* Main Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectCategory={(cat) => {
            handleUpdateFilter({ category: cat as any, brands: [] });
            if (cat !== "about") setCurrentPage("shop");
          }}
          onSelectBrand={handleSelectBrandFromHeader}
          activeCategory={filterState.category}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />

        {/* Luxury Brand Marquee Bar */}
        <BrandMarquee onSelectBrand={handleSelectBrandFromHeader} />

        {/* VIEW 1: PRODUCT DETAIL VIEW */}
        {selectedProductDetail ? (
          <ProductDetailPage
            product={selectedProductDetail}
            onClose={() => setSelectedProductDetail(null)}
            onOpenVirtualTryOn={(p) => setSelectedVirtualTryOnProduct(p)}
            onOpenLensCustomizer={(p) => setSelectedLensCustomizerProduct(p)}
            allProducts={products}
            onSelectProduct={handleSelectProduct}
          />
        ) : (
          <>
            {/* VIEW 2: HOME PAGE */}
            {currentPage === "home" && (
              <>
                <HeroSlider
                  onSelectSlideCategory={(cat, brand) => {
                    if (cat) handleUpdateFilter({ category: cat });
                    if (brand) handleUpdateFilter({ brands: [brand] });
                    setCurrentPage("shop");
                  }}
                  onOpenAiStylist={() => {
                    handleUpdateFilter({ category: "sunglasses" });
                    setCurrentPage("shop");
                  }}
                />

                <JustDroppedSection
                  products={products}
                  onSelectProduct={handleSelectProduct}
                  onViewAll={() => {
                    handleResetFilters();
                    setCurrentPage("shop");
                  }}
                />

                <ShopByGender
                  onSelectGender={handleSelectGender}
                  activeGender={filterState.gender}
                  activeCategory={filterState.category}
                  onExploreShop={() => setCurrentPage("shop")}
                  onSelectCategory={(cat) => handleUpdateFilter({ category: cat })}
                />

                <ShopByShapeSection
                  onSelectShape={(shape, category) => {
                    handleUpdateFilter({
                      shapes: [shape],
                      category: category || "sunglasses",
                    });
                    setCurrentPage("shop");
                  }}
                  activeCategory={filterState.category}
                />

                <CollectorsEditionSection
                  onExploreCollection={() => {
                    handleResetFilters();
                    setCurrentPage("shop");
                  }}
                />

                <TrendingSearchesSection
                  products={products}
                  onSelectProduct={handleSelectProduct}
                />

                <BlogReelsSection
                  products={products}
                  onSelectProduct={handleSelectProduct}
                />

                <WordsWeLiveBySection />
                <NeedToKnowSection />
              </>
            )}

            {/* VIEW 3: SHOP / CATALOGUE PAGE */}
            {currentPage === "shop" && (
              <ProductGrid
                products={filteredProducts}
                filterState={filterState}
                onUpdateFilter={handleUpdateFilter}
                onResetFilters={handleResetFilters}
                onSelectProduct={handleSelectProduct}
                onOpenVirtualTryOn={(p) => setSelectedVirtualTryOnProduct(p)}
              />
            )}

            {/* VIEW 4: CONTACT & CLINICS PAGE */}
            {currentPage === "contact" && (
              <ContactUsPage onNavigateHome={() => handleNavigate("home")} />
            )}

            {/* VIEW 5: BOOK EYE TEST APPOINTMENT PAGE */}
            {currentPage === "appointment" && (
              <AppointmentPage
                onNavigateHome={() => handleNavigate("home")}
                onNavigateShop={() => handleNavigate("shop")}
              />
            )}

            {/* VIEW 6: WISHLIST SAVED FRAMES PAGE */}
            {currentPage === "wishlist" && (
              <WishlistPage
                allProducts={products}
                onSelectProduct={handleSelectProduct}
                onNavigateShop={() => handleNavigate("shop")}
                onNavigateHome={() => handleNavigate("home")}
              />
            )}
          </>
        )}
      </div>

      {/* Main Luxury Footer */}
      <Footer
        onSelectCategory={(cat) => {
          handleUpdateFilter({ category: cat as any, brands: [] });
          if (cat !== "about") setCurrentPage("shop");
        }}
        onSelectBrand={handleSelectBrandFromHeader}
        onNavigate={handleNavigate}
      />

      {/* Floating Interactive Concierge Widgets */}
      <GemsLoyaltyWidget />
      <WhatsAppWidget />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        allProducts={products}
      />

      {/* Modals */}
      {selectedVirtualTryOnProduct && (
        <VirtualTryOnModal
          product={selectedVirtualTryOnProduct}
          onClose={() => setSelectedVirtualTryOnProduct(null)}
          onAddToCart={(p) => addToCartDirect(p)}
        />
      )}

      {selectedLensCustomizerProduct && (
        <LensCustomizerModal
          product={selectedLensCustomizerProduct}
          onClose={() => setSelectedLensCustomizerProduct(null)}
          onConfirmLensConfig={handleConfirmLensConfig}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={(order) => setConfirmedOrder(order)}
        />
      )}

      {confirmedOrder && (
        <OrderSuccessModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={(order) => openTrackingModal(order)}
        />
      )}

      <OrderTrackingModal />

      {isSearchOpen && (
        <SearchModal
          products={products}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(p) => handleSelectProduct(p)}
          onSelectBrand={handleSelectBrandFromHeader}
        />
      )}
    </div>
  );
}
