"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BrandMarquee } from "@/components/layout/BrandMarquee";
import { Footer } from "@/components/layout/Footer";
import { AppointmentPage } from "@/components/pages/AppointmentPage";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WishlistDrawer } from "@/components/wishlist/WishlistDrawer";
import { SearchModal } from "@/components/pages/SearchModal";
import { WhatsAppWidget } from "@/components/widgets/WhatsAppWidget";
import { PRODUCTS } from "@/data/products";

export default function StandaloneAppointmentPage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products] = useState(PRODUCTS);

  const handleNavigate = (page: string) => {
    if (page === "home") {
      router.push("/");
    } else if (page === "appointment") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "shop") {
      router.push("/shop");
    } else if (page === "cart") {
      router.push("/cart");
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
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectCategory={(cat) => router.push(`/shop?category=${cat}`)}
          onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
          activeCategory="appointment"
          currentPage="appointment"
          onNavigate={handleNavigate}
        />
        <BrandMarquee onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)} />
        <AppointmentPage
          onNavigateHome={() => router.push("/")}
          onNavigateShop={() => router.push("/shop")}
          onNavigateContact={() => router.push("/contact")}
        />
      </div>

      <Footer
        onSelectCategory={(cat) => {
          if (cat === "appointment") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else if (cat === "about") {
            router.push("/about-us");
          } else if (cat === "privacy") {
            router.push("/privacy-policy");
          } else if (cat === "contact") {
            router.push("/contact");
          } else {
            router.push(`/shop?category=${cat}`);
          }
        }}
        onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
        onNavigate={handleNavigate}
      />

      <WhatsAppWidget />
      <CartDrawer
        onProceedToCheckout={() => router.push("/checkout")}
        allProducts={products}
      />
      <WishlistDrawer
        allProducts={products}
        onSelectProduct={(p) => router.push(`/product/${p.id}`)}
        onNavigateShop={() => router.push("/shop")}
        onNavigateCart={() => router.push("/cart")}
      />

      {isSearchOpen && (
        <SearchModal
          products={products}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(p) => router.push(`/product/${p.id}`)}
          onSelectBrand={(b) => router.push(`/shop?brand=${b}`)}
        />
      )}
    </div>
  );
}
