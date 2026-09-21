"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BrandMarquee } from "@/components/layout/BrandMarquee";
import { Footer } from "@/components/layout/Footer";
import { ProductDetailPage } from "@/components/product/ProductDetailPage";
import { VirtualTryOnModal } from "@/components/optical/VirtualTryOnModal";
import { LensCustomizerModal } from "@/components/optical/LensCustomizerModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { SearchModal } from "@/components/pages/SearchModal";
import { WhatsAppWidget } from "@/components/widgets/WhatsAppWidget";
import { OrderTrackingModal } from "@/components/pages/OrderTrackingModal";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { OrderSuccessModal } from "@/components/cart/OrderSuccessModal";
import { getCatalogProducts, ALL_FALLBACK_PRODUCTS } from "@/lib/productsService";
import { Product, SelectedLensConfig, Order } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

function ProductPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawSlug = params?.slug as string;
  const slug = decodeURIComponent(rawSlug || "");

  const { addCustomLensToCart, addToCartDirect, closeCart } = useCart();
  const { openTrackingModal } = useAuth();
  const { openWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>(ALL_FALLBACK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Overlays
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [selectedVirtualTryOnProduct, setSelectedVirtualTryOnProduct] = useState<Product | null>(null);
  const [selectedLensCustomizerProduct, setSelectedLensCustomizerProduct] = useState<Product | null>(null);

  // Fetch all active products
  useEffect(() => {
    let mounted = true;
    getCatalogProducts()
      .then((data) => {
        if (mounted && data && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => console.warn("Catalog fetch error:", err))
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Match the active product by slug or ID
  const product = useMemo(() => {
    if (!slug) return null;
    return (
      products.find(
        (p) =>
          p.id.toLowerCase() === slug.toLowerCase() ||
          p.id.replace(/\s+/g, "-").toLowerCase() === slug.toLowerCase()
      ) || null
    );
  }, [slug, products]);

  // Deep link support: auto-open 3D try-on if ?tryon=true is passed
  useEffect(() => {
    if (product && searchParams?.get("tryon") === "true") {
      setSelectedVirtualTryOnProduct(product);
    }
  }, [product, searchParams]);

  const handleConfirmLensConfig = (config: SelectedLensConfig) => {
    if (!selectedLensCustomizerProduct) return;
    addCustomLensToCart(selectedLensCustomizerProduct, config);
    setSelectedLensCustomizerProduct(null);
  };

  const handleSelectProduct = (nextProduct: Product) => {
    router.push(`/product/${nextProduct.id}`);
  };

  const handleNavigate = (targetPage: string) => {
    closeCart();
    if (targetPage === "home") {
      router.push("/");
    } else if (targetPage === "shop") {
      router.push("/shop");
    } else if (targetPage === "cart") {
      router.push("/cart");
    } else if (targetPage === "appointment") {
      router.push("/appointment");
    } else if (targetPage === "about") {
      router.push("/about-us");
    } else if (targetPage === "privacy") {
      router.push("/privacy-policy");
    } else if (targetPage === "contact") {
      router.push("/contact");
    } else {
      router.push(`/${targetPage}`);
    }
  };

  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#C86A28] animate-spin mx-auto" />
          <p className="text-sm font-serif tracking-widest text-[#2A1E17] uppercase">
            Consulting Atelier Archives...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectCategory={(cat) => router.push(`/shop?category=${cat}`)}
          onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
          activeCategory="shop"
          currentPage="shop"
          onNavigate={handleNavigate}
        />
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FAF3EB] border border-[#E8DCCF] flex items-center justify-center mx-auto mb-6 text-[#C86A28]">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-serif text-[#2A1E17] mb-3">Frame Not Located</h1>
          <p className="text-sm text-[#57534D] mb-8 font-sans leading-relaxed">
            The requested bespoke eyewear reference could not be found in our current catalog or may have been retired from active production.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C86A28] hover:bg-[#A8551E] text-white text-xs font-bold tracking-widest uppercase transition-all shadow-md"
            >
              Explore Full Collection
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-[#FAF3EB] text-[#2A1E17] border border-[#E8DCCF] text-xs font-bold tracking-widest uppercase transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
        <Footer
          onSelectCategory={(cat) => router.push(`/shop?category=${cat}`)}
          onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
          onNavigate={handleNavigate}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2A1E17] selection:bg-[#C86A28] selection:text-white flex flex-col justify-between">
      <div>
        {/* Main Luxury Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectCategory={(cat) => router.push(`/shop?category=${cat}`)}
          onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
          activeCategory={product.category}
          currentPage="shop"
          onNavigate={handleNavigate}
        />

        {/* Brand Marquee Bar */}
        <BrandMarquee onSelectBrand={(b) => router.push(`/shop?brand=${b}`)} />

        {/* Product Detail Page View */}
        <ProductDetailPage
          product={product}
          onClose={() => router.push("/shop")}
          onOpenVirtualTryOn={(p) => setSelectedVirtualTryOnProduct(p)}
          onOpenLensCustomizer={(p) => setSelectedLensCustomizerProduct(p)}
          allProducts={products}
          onSelectProduct={handleSelectProduct}
          onNavigateToCart={() => router.push("/cart")}
        />
      </div>

      {/* Main Luxury Footer */}
      <Footer
        onSelectCategory={(cat) => router.push(`/shop?category=${cat}`)}
        onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
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
        onNavigateShop={() => router.push("/shop")}
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
          onSelectBrand={(b) => router.push(`/shop?brand=${b}`)}
        />
      )}
    </div>
  );
}

export default function ProductDetailPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#C86A28] animate-spin" />
        </div>
      }
    >
      <ProductPageContent />
    </Suspense>
  );
}
