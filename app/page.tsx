"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { CartPage } from "@/components/cart/CartPage";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { OrderSuccessModal } from "@/components/cart/OrderSuccessModal";

import { SearchModal } from "@/components/pages/SearchModal";
import { ContactUsPage } from "@/components/pages/ContactUsPage";
import { AppointmentPage } from "@/components/pages/AppointmentPage";
import { AboutUsPage } from "@/components/pages/AboutUsPage";
import { PrivacyPolicyPage } from "@/components/pages/PrivacyPolicyPage";
import { OrderTrackingModal } from "@/components/pages/OrderTrackingModal";

import { WhatsAppWidget } from "@/components/widgets/WhatsAppWidget";

import { PRODUCTS } from "@/data/products";
import { getCatalogProducts, filterAndSortProducts, ALL_FALLBACK_PRODUCTS } from "@/lib/productsService";
import { Product, FilterState, SelectedLensConfig, Order } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function HomePage() {
  const { addCustomLensToCart, addToCartDirect, closeCart } = useCart();
  const { openTrackingModal } = useAuth();
  const { openWishlist } = useWishlist();

  const [currentPage, setCurrentPage] = useState<"home" | "shop" | "contact" | "appointment" | "wishlist" | "about" | "privacy" | "cart">("home");
  const [products, setProducts] = useState<Product[]>(ALL_FALLBACK_PRODUCTS);

  // Background optimistic hydration from Supabase
  useEffect(() => {
    getCatalogProducts()
      .then((data) => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => console.warn("Supabase hydration skipped:", err));
  }, []);

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

  // Filtered & Sorted Products with high-performance zero-latency memoization
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, filterState);
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

  // Synchronize initial page from URL parameter if present (?page=about, ?page=privacy)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get("page");
      if (pageParam === "about" || pageParam === "about-us") setCurrentPage("about");
      else if (pageParam === "privacy" || pageParam === "privacy-policy") setCurrentPage("privacy");
      else if (pageParam === "contact") setCurrentPage("contact");
      else if (pageParam === "appointment") setCurrentPage("appointment");
      else if (pageParam === "shop") setCurrentPage("shop");
      else if (pageParam === "cart") setCurrentPage("cart");
    }
  }, []);

  const handleNavigate = (page: "home" | "shop" | "contact" | "appointment" | "wishlist" | "about" | "privacy" | "cart") => {
    closeCart();
    if (page === "wishlist") {
      openWishlist();
      return;
    }
    setSelectedProductDetail(null);
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      const url = page === "home" ? "/" : `/?page=${page}`;
      window.history.pushState(null, "", url);
    }
    if (page === "home") {
      setFilterState((prev) => ({ ...prev, category: "all", brands: [] }));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleOpenCartEvent = () => {
      handleNavigate("cart");
    };
    window.addEventListener("open-cart-page", handleOpenCartEvent);
    return () => {
      window.removeEventListener("open-cart-page", handleOpenCartEvent);
    };
  }, []);

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
            onNavigateToCart={() => handleNavigate("cart")}
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
                  onViewAll={(tab) => {
                    handleResetFilters();
                    if (tab === "new") {
                      handleUpdateFilter({ category: "new" });
                    } else if (tab === "bestsellers") {
                      handleUpdateFilter({ sortBy: "featured" });
                    }
                    setCurrentPage("shop");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />

                <ShopByGender
                  onSelectGender={(gender) => {
                    handleSelectGender(gender);
                    setCurrentPage("shop");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  activeGender={filterState.gender}
                  activeCategory={filterState.category}
                  onExploreShop={() => {
                    setCurrentPage("shop");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onSelectCategory={(cat) => {
                    handleUpdateFilter({ category: cat, brands: [], shapes: [] });
                    setCurrentPage("shop");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />

                <ShopByShapeSection
                  category="sunglasses"
                  onSelectShape={(shape, category) => {
                    handleResetFilters();
                    handleUpdateFilter({
                      shapes: [shape],
                      category: category || "sunglasses",
                    });
                    setCurrentPage("shop");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  activeCategory={filterState.category}
                />

                <CollectorsEditionSection
                  products={products}
                  onSelectProduct={handleSelectProduct}
                  onExploreCollection={() => {
                    handleResetFilters();
                    setCurrentPage("shop");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />

                <ShopByShapeSection
                  category="eyeglasses"
                  onSelectShape={(shape, category) => {
                    handleResetFilters();
                    handleUpdateFilter({
                      shapes: [shape],
                      category: category || "eyeglasses",
                    });
                    setCurrentPage("shop");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  activeCategory={filterState.category}
                />

                <TrendingSearchesSection
                  products={products}
                  onSelectProduct={handleSelectProduct}
                  onExploreTrending={(pillId) => {
                    handleResetFilters();
                    if (pillId === "ray-ban") {
                      handleUpdateFilter({ brands: ["Ray-Ban"], category: "sunglasses" });
                    } else if (pillId === "gucci") {
                      handleUpdateFilter({ brands: ["Gucci"], category: "sunglasses" });
                    } else if (pillId === "oakley") {
                      handleUpdateFilter({ brands: ["Oakley"], category: "sunglasses" });
                    } else if (pillId === "rimless") {
                      handleUpdateFilter({ rimTypes: ["rimless"], category: "eyeglasses" });
                    } else if (pillId === "polarised") {
                      handleUpdateFilter({ category: "sunglasses" });
                    } else if (pillId === "wayfarer") {
                      handleUpdateFilter({ shapes: ["wayfarer"] });
                    }
                    setCurrentPage("shop");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
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
                onNavigateContact={() => handleNavigate("contact")}
              />
            )}

            {/* VIEW 6: ABOUT PRECISION OPTICS PAGE (Figma 106:8153) */}
            {currentPage === "about" && (
              <AboutUsPage
                onNavigateHome={() => handleNavigate("home")}
                onNavigateShop={() => handleNavigate("shop")}
                onNavigateContact={() => handleNavigate("contact")}
              />
            )}

            {/* VIEW 7: PRIVACY POLICY PAGE (Figma 106:7668) */}
            {currentPage === "privacy" && (
              <PrivacyPolicyPage
                onNavigateHome={() => handleNavigate("home")}
                onNavigateContact={() => handleNavigate("contact")}
              />
            )}

            {/* VIEW 8: DEDICATED CART PAGE (Figma 106:7035) */}
            {currentPage === "cart" && (
              <CartPage
                onNavigateHome={() => handleNavigate("home")}
                onNavigateShop={() => handleNavigate("shop")}
                onNavigateContact={() => handleNavigate("contact")}
                onProceedToCheckout={() => setIsCheckoutOpen(true)}
                onSelectProduct={handleSelectProduct}
                onOpenVirtualTryOn={(p) => setSelectedVirtualTryOnProduct(p)}
                allProducts={products}
              />
            )}
          </>
        )}
      </div>

      {/* Main Luxury Footer */}
      <Footer
        onSelectCategory={(cat) => {
          if (cat === "about") {
            handleNavigate("about");
            return;
          }
          if (cat === "privacy") {
            handleNavigate("privacy");
            return;
          }
          handleUpdateFilter({ category: cat as any, brands: [] });
          setCurrentPage("shop");
        }}
        onSelectBrand={handleSelectBrandFromHeader}
        onNavigate={handleNavigate}
      />

      {/* Floating Interactive Concierge Widgets */}
      <WhatsAppWidget />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onViewCartPage={() => handleNavigate("cart")}
        allProducts={products}
      />

      {/* Slide-over Wishlist Drawer */}
      <WishlistDrawer
        allProducts={products}
        onSelectProduct={handleSelectProduct}
        onOpenVirtualTryOn={(p) => setSelectedVirtualTryOnProduct(p)}
        onNavigateShop={() => handleNavigate("shop")}
        onNavigateCart={() => handleNavigate("cart")}
      />

      {/* Modals */}
      {selectedVirtualTryOnProduct && (
        <VirtualTryOnModal
          product={selectedVirtualTryOnProduct}
          onClose={() => setSelectedVirtualTryOnProduct(null)}
          onAddToCart={(p) => addToCartDirect(p)}
          allProducts={products}
          onOpenLensCustomizer={(p) => setSelectedLensCustomizerProduct(p)}
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
