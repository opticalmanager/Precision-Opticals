"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BrandMarquee } from "@/components/layout/BrandMarquee";
import { Footer } from "@/components/layout/Footer";
import { CartPage } from "@/components/cart/CartPage";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { SearchModal } from "@/components/pages/SearchModal";
import { GemsLoyaltyWidget } from "@/components/widgets/GemsLoyaltyWidget";
import { WhatsAppWidget } from "@/components/widgets/WhatsAppWidget";
import { PRODUCTS } from "@/data/products";
import { Product, Order } from "@/types";

export default function StandaloneCartPage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [products] = useState<Product[]>(PRODUCTS);

  const handleNavigate = (page: string) => {
    if (page === "home") {
      router.push("/");
    } else if (page === "cart") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(`/?page=${page}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2A1E17] selection:bg-[#C86A28] selection:text-white flex flex-col justify-between">
      <div>
        {/* Main Luxury Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectCategory={(cat) => router.push(`/?page=shop&category=${cat}`)}
          onSelectBrand={(brand) => router.push(`/?page=shop&brand=${brand}`)}
          activeCategory="cart"
          currentPage="cart"
          onNavigate={handleNavigate}
        />

        {/* Luxury Brand Marquee Bar */}
        <BrandMarquee onSelectBrand={(brand) => router.push(`/?page=shop&brand=${brand}`)} />

        {/* Dedicated Luxury Cart Page (Figma Node 106:7035) */}
        <CartPage
          onNavigateHome={() => router.push("/")}
          onNavigateShop={() => router.push("/?page=shop")}
          onNavigateContact={() => router.push("/?page=contact")}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
          onSelectProduct={(product) => router.push(`/?page=shop&productId=${product.id}`)}
          allProducts={products}
        />
      </div>

      {/* Main Luxury Footer */}
      <Footer
        onSelectCategory={(cat) => {
          if (cat === "about") {
            router.push("/about-us");
          } else if (cat === "privacy") {
            router.push("/privacy-policy");
          } else {
            router.push(`/?page=shop&category=${cat}`);
          }
        }}
        onSelectBrand={(brand) => router.push(`/?page=shop&brand=${brand}`)}
        onNavigate={handleNavigate}
      />

      {/* Floating Interactive Concierge Widgets */}
      <GemsLoyaltyWidget />
      <WhatsAppWidget />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        allProducts={products}
        onSelectProduct={(product) => router.push(`/?page=shop&productId=${product.id}`)}
        onNavigateShop={() => router.push("/?page=shop")}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={(order) => setConfirmedOrder(order)}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal
          products={products}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(product) => router.push(`/?page=shop&productId=${product.id}`)}
          onSelectBrand={(brand) => router.push(`/?page=shop&brand=${brand}`)}
        />
      )}
    </div>
  );
}
