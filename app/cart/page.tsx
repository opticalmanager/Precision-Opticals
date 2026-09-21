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
    } else if (page === "shop") {
      router.push("/shop");
    } else if (page === "contact") {
      router.push("/contact");
    } else if (page === "appointment") {
      router.push("/appointment");
    } else if (page === "about") {
      router.push("/about-us");
    } else if (page === "privacy") {
      router.push("/privacy-policy");
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
          activeCategory="cart"
          currentPage="cart"
          onNavigate={handleNavigate}
        />

        {/* Luxury Brand Marquee Bar */}
        <BrandMarquee onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)} />

        {/* Dedicated Luxury Cart Page */}
        <CartPage
          onNavigateHome={() => router.push("/")}
          onNavigateShop={() => router.push("/shop")}
          onNavigateContact={() => router.push("/contact")}
          onProceedToCheckout={() => router.push("/checkout")}
          onSelectProduct={(product) => router.push(`/product/${product.id}`)}
          allProducts={products}
        />
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

      {/* Wishlist Drawer */}
      <WishlistDrawer
        allProducts={products}
        onSelectProduct={(product) => router.push(`/product/${product.id}`)}
        onNavigateShop={() => router.push("/shop")}
        onNavigateCart={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
          onSelectProduct={(product) => router.push(`/product/${product.id}`)}
          onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
        />
      )}
    </div>
  );
}
