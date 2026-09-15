"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BrandMarquee } from "@/components/layout/BrandMarquee";
import { Footer } from "@/components/layout/Footer";
import { PrivacyPolicyPage } from "@/components/pages/PrivacyPolicyPage";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { SearchModal } from "@/components/pages/SearchModal";
import { WhatsAppWidget } from "@/components/widgets/WhatsAppWidget";
import { PRODUCTS } from "@/data/products";

export default function StandalonePrivacyPolicyPage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products] = useState(PRODUCTS);

  const handleNavigate = (page: string) => {
    if (page === "home") {
      router.push("/");
    } else if (page === "privacy") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "about") {
      router.push("/about-us");
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
          activeCategory="privacy"
          currentPage="privacy"
          onNavigate={handleNavigate}
        />

        {/* Luxury Brand Marquee Bar */}
        <BrandMarquee onSelectBrand={(brand) => router.push(`/?page=shop&brand=${brand}`)} />

        {/* Privacy Policy Content (Figma Node 106:7668) */}
        <PrivacyPolicyPage
          onNavigateHome={() => router.push("/")}
          onNavigateContact={() => router.push("/?page=contact")}
        />
      </div>

      {/* Main Luxury Footer */}
      <Footer
        onSelectCategory={(cat) => {
          if (cat === "privacy") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else if (cat === "about") {
            router.push("/about-us");
          } else {
            router.push(`/?page=shop&category=${cat}`);
          }
        }}
        onSelectBrand={(brand) => router.push(`/?page=shop&brand=${brand}`)}
        onNavigate={handleNavigate}
      />

      {/* Floating Interactive Concierge Widgets */}
      <WhatsAppWidget />

      {/* Cart and Wishlist Drawers */}
      <CartDrawer
        onProceedToCheckout={() => router.push("/?page=shop")}
        allProducts={products}
      />
      <WishlistDrawer />

      {isSearchOpen && (
        <SearchModal
          products={products}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={() => router.push("/?page=shop")}
          onSelectBrand={(b) => router.push(`/?page=shop&brand=${b}`)}
        />
      )}
    </div>
  );
}
