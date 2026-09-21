"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BrandMarquee } from "@/components/layout/BrandMarquee";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/home/HeroSlider";
import { JustDroppedSection } from "@/components/home/JustDroppedSection";
import { ShopByGender } from "@/components/home/ShopByGender";
import { ShopByShapeSection } from "@/components/home/ShopByShapeSection";
import { CollectorsEditionSection } from "@/components/home/CollectorsEditionSection";
import { TrendingSearchesSection } from "@/components/home/TrendingSearchesSection";
import { BlogReelsSection } from "@/components/home/BlogReelsSection";
import { WordsWeLiveBySection } from "@/components/home/WordsWeLiveBySection";
import { NeedToKnowSection } from "@/components/home/NeedToKnowSection";

import { VirtualTryOnModal } from "@/components/optical/VirtualTryOnModal";
import { LensCustomizerModal } from "@/components/optical/LensCustomizerModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { SearchModal } from "@/components/pages/SearchModal";
import { OrderSuccessModal } from "@/components/cart/OrderSuccessModal";
import { OrderTrackingModal } from "@/components/pages/OrderTrackingModal";
import { WhatsAppWidget } from "@/components/widgets/WhatsAppWidget";

import { getCatalogProducts, ALL_FALLBACK_PRODUCTS } from "@/lib/productsService";
import { Product, SelectedLensConfig, Order } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addCustomLensToCart, addToCartDirect, closeCart } = useCart();
  const { openTrackingModal } = useAuth();
  const { openWishlist } = useWishlist();

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

  // Backward compatibility: gracefully redirect any legacy ?page=... URLs to their canonical routes
  useEffect(() => {
    if (!searchParams) return;
    const pageParam = searchParams.get("page");
    const catParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const prodParam = searchParams.get("productId");

    if (prodParam) {
      router.replace(`/product/${prodParam}`);
      return;
    }
    if (pageParam === "shop") {
      const q = new URLSearchParams();
      if (catParam) q.set("category", catParam);
      if (brandParam) q.set("brand", brandParam);
      const str = q.toString();
      router.replace(str ? `/shop?${str}` : "/shop");
      return;
    }
    if (pageParam === "about" || pageParam === "about-us") {
      router.replace("/about-us");
      return;
    }
    if (pageParam === "privacy" || pageParam === "privacy-policy") {
      router.replace("/privacy-policy");
      return;
    }
    if (pageParam === "contact") {
      router.replace("/contact");
      return;
    }
    if (pageParam === "appointment") {
      router.replace("/appointment");
      return;
    }
    if (pageParam === "cart") {
      router.replace("/cart");
      return;
    }
  }, [searchParams, router]);

  // Modal Overlay States
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "shop") {
      router.push("/shop");
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
          onSelectCategory={(cat) => router.push(`/shop?category=${cat}`)}
          onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
          activeCategory="home"
          currentPage="home"
          onNavigate={handleNavigate}
        />

        {/* Luxury Brand Marquee Bar */}
        <BrandMarquee onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)} />

        {/* Luxury Hero Slider with Direct Route Links */}
        <HeroSlider
          onSelectSlideCategory={(cat, brand) => {
            const params = new URLSearchParams();
            if (cat) params.set("category", cat);
            if (brand) params.set("brand", brand);
            const q = params.toString();
            router.push(q ? `/shop?${q}` : "/shop");
          }}
          onOpenAiStylist={() => {
            router.push("/shop?category=sunglasses");
          }}
        />

        {/* Just Dropped / New Arrivals Carousel */}
        <JustDroppedSection
          products={products}
          onSelectProduct={handleSelectProduct}
          onViewAll={(tab) => {
            if (tab === "new") {
              router.push("/shop?category=new");
            } else {
              router.push("/shop?sort=rating");
            }
          }}
        />

        {/* Shop by Gender & Category */}
        <ShopByGender
          onSelectGender={(gender) => {
            router.push(`/shop?gender=${gender}`);
          }}
          onExploreShop={() => {
            router.push("/shop");
          }}
          onSelectCategory={(cat) => {
            router.push(`/shop?category=${cat}`);
          }}
        />

        {/* Shop by Shape (Sunglasses) */}
        <ShopByShapeSection
          category="sunglasses"
          onSelectShape={(shape, category) => {
            router.push(`/shop?category=${category || "sunglasses"}&shape=${shape}`);
          }}
          activeCategory="sunglasses"
        />

        {/* Collector's Edition Luxury Carousel */}
        <CollectorsEditionSection
          products={products}
          onSelectProduct={handleSelectProduct}
          onExploreCollection={() => {
            router.push("/shop");
          }}
        />

        {/* Shop by Shape (Eyeglasses) */}
        <ShopByShapeSection
          category="eyeglasses"
          onSelectShape={(shape, category) => {
            router.push(`/shop?category=${category || "eyeglasses"}&shape=${shape}`);
          }}
          activeCategory="eyeglasses"
        />

        {/* Trending Searches Grid */}
        <TrendingSearchesSection
          products={products}
          onSelectProduct={handleSelectProduct}
          onExploreTrending={(pillId) => {
            if (pillId === "ray-ban") {
              router.push("/shop?brand=Ray-Ban&category=sunglasses");
            } else if (pillId === "gucci") {
              router.push("/shop?brand=Gucci&category=sunglasses");
            } else if (pillId === "oakley") {
              router.push("/shop?brand=Oakley&category=sunglasses");
            } else if (pillId === "rimless") {
              router.push("/shop?rim=rimless&category=eyeglasses");
            } else if (pillId === "polarised") {
              router.push("/shop?category=sunglasses");
            } else if (pillId === "wayfarer") {
              router.push("/shop?shape=wayfarer");
            } else {
              router.push("/shop");
            }
          }}
        />

        {/* Editorial & Reels Section */}
        <BlogReelsSection
          products={products}
          onSelectProduct={handleSelectProduct}
        />

        {/* Brand Editorial & Guarantees */}
        <WordsWeLiveBySection />
        <NeedToKnowSection />
      </div>

      {/* Main Luxury Footer */}
      <Footer
        onSelectCategory={(cat) => {
          if (cat === "about") router.push("/about-us");
          else if (cat === "privacy") router.push("/privacy-policy");
          else if (cat === "contact") router.push("/contact");
          else router.push(`/shop?category=${cat}`);
        }}
        onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
        onNavigate={handleNavigate}
      />

      {/* Floating Interactive Concierge Widgets */}
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
        onNavigateShop={() => router.push("/shop")}
        onNavigateCart={() => router.push("/cart")}
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
          onSelectProduct={handleSelectProduct}
          onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2]" />}>
      <HomePageContent />
    </Suspense>
  );
}
