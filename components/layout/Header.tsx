"use client";

import React, { useState, useRef } from "react";
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { LUXURY_BRANDS } from "@/data/brands";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface HeaderProps {
  onOpenSearch: () => void;
  onSelectCategory: (category: string) => void;
  onSelectBrand: (brandId: string) => void;
  activeCategory: string;
  currentPage?: "home" | "shop" | "contact" | "appointment" | "wishlist";
  onNavigate?: (page: "home" | "shop" | "contact" | "appointment" | "wishlist") => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onSelectCategory,
  onSelectBrand,
  activeCategory,
  currentPage = "home",
  onNavigate,
}) => {
  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menuKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredMenu(menuKey);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 150);
  };

  const handleNavClick = (
    category?: string,
    page: "home" | "shop" | "contact" | "appointment" | "wishlist" = "shop"
  ) => {
    setMobileMenuOpen(false);
    setHoveredMenu(null);

    if (page === "contact" || page === "appointment" || page === "wishlist") {
      if (onNavigate) onNavigate(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (page === "home") {
      if (onNavigate) onNavigate("home");
      if (category === "about") {
        setTimeout(() => {
          const aboutElem = document.getElementById("about-us");
          if (aboutElem) aboutElem.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (onNavigate) onNavigate("shop");
    if (category) onSelectCategory(category);
  };

  return (
    <header 
      className="sticky top-0 z-40 w-full bg-[#F4ECE1] border-b border-[#E5DACB]/60 transition-all duration-200"
      onMouseLeave={handleMouseLeave}
    >
      {/* ────────── ROW 1: Brand Logo + Search/Cart ────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3.5 pb-2 flex items-center justify-between">
        {/* Left: Mobile Hamburger */}
        <div className="flex-1 flex items-center justify-start lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-[#332219] hover:text-[#C85A1B] focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Left spacer on desktop */}
        <div className="hidden lg:flex flex-1" />

        {/* Center: Stylized Brand Logo (Compact & refined like Gem Opticians) */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <button
            onClick={() => handleNavClick(undefined, "home")}
            className="group focus:outline-none cursor-pointer flex flex-col items-center"
          >
            {/* Custom Stylized Monogram Icon P & O Lenses */}
            <div className="flex items-center justify-center gap-0.5 mb-0.5 group-hover:scale-105 transition-transform duration-200">
              <svg width="34" height="18" viewBox="0 0 34 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="7" stroke="#C85A1B" strokeWidth="2" fill="none"/>
                <circle cx="25" cy="9" r="7" stroke="#C85A1B" strokeWidth="2" fill="none"/>
                <path d="M16 8.5C17.5 7.5 16.5 7.5 18 8.5" stroke="#C85A1B" strokeWidth="2" strokeLinecap="round"/>
                <text x="9" y="12" textAnchor="middle" fill="#C85A1B" fontSize="8" fontWeight="bold" fontFamily="sans-serif">P</text>
                <text x="25" y="12" textAnchor="middle" fill="#C85A1B" fontSize="8" fontWeight="bold" fontFamily="sans-serif">O</text>
              </svg>
            </div>

            {/* Brand Name - Rich Espresso Dark Brown like Gem Opticians */}
            <h1 className="text-[16px] sm:text-[19px] lg:text-[21px] font-bold tracking-[0.3em] text-[#2C1C13] uppercase leading-none group-hover:text-[#C85A1B] transition-colors">
              PRECISION OPTICS
            </h1>

            {/* Established Subtitle */}
            <p className="text-[9px] tracking-[0.25em] text-[#7A6658] uppercase font-bold mt-1">
              ESTD. 1969
            </p>
          </button>
        </div>

        {/* Right: Search + Cart */}
        <div className="flex-1 flex items-center justify-end gap-5">
          <button
            onClick={onOpenSearch}
            className="text-[11px] font-bold tracking-[0.18em] text-[#332219] hover:text-[#C85A1B] uppercase transition-colors cursor-pointer hidden sm:block"
          >
            SEARCH
          </button>

          {/* Mobile search icon */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-1 text-[#332219] hover:text-[#C85A1B] transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => handleNavClick(undefined, "wishlist")}
            className="relative p-1 text-[#332219] hover:text-[#C85A1B] transition-colors cursor-pointer hidden sm:block"
            title="Saved Frames"
          >
            <Heart className="w-[18px] h-[18px]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C85A1B] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={openCart}
            className="text-[11px] font-bold tracking-[0.18em] text-[#332219] hover:text-[#C85A1B] uppercase transition-colors cursor-pointer flex items-center gap-1"
            title="Shopping Bag"
          >
            <span className="hidden sm:inline">CART</span>
            <span className="hidden sm:inline">({cartCount})</span>
            <ShoppingBag className="w-4 h-4 sm:hidden" />
            {cartCount > 0 && (
              <span className="sm:hidden absolute -top-1 -right-1 bg-[#332219] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ────────── ROW 2: Main Navigation Bar ────────── */}
      <nav className="hidden lg:block bg-[#F4ECE1] relative pb-2 pt-0.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-5 xl:gap-7">
          {/* 1. NEW ARRIVALS */}
          <div
            className="py-1.5 cursor-pointer"
            onMouseEnter={() => handleMouseEnter("new")}
          >
            <button
              onClick={() => handleNavClick("new", "shop")}
              className={`text-[11.5px] xl:text-[12.5px] font-semibold tracking-[0.16em] uppercase transition-colors ${
                hoveredMenu === "new" || (currentPage === "shop" && activeCategory === "new")
                  ? "text-[#C85A1B]"
                  : "text-[#3D2C22] hover:text-[#C85A1B]"
              }`}
            >
              NEW ARRIVALS
            </button>
          </div>

          {/* 2. META LOGO (Prominent Official Meta Brand Image matching Gem Opticians 1:1) */}
          <div
            className="py-1.5 cursor-pointer flex items-center px-0.5"
            onMouseEnter={() => handleMouseEnter("meta-smart")}
          >
            <button
              onClick={() => handleNavClick("meta-smart", "shop")}
              className="transition-opacity hover:opacity-80 flex items-center cursor-pointer"
              title="Meta Smart Eyewear"
            >
              <img
                src="/images/meta_logo.png"
                alt="Meta"
                className="h-[26px] sm:h-[28px] lg:h-[30px] w-auto object-contain"
              />
            </button>
          </div>

          {/* 3. SUNGLASSES */}
          <div
            className="py-1.5 cursor-pointer"
            onMouseEnter={() => handleMouseEnter("sunglasses")}
          >
            <button
              onClick={() => handleNavClick("sunglasses", "shop")}
              className={`text-[11.5px] xl:text-[12.5px] font-semibold tracking-[0.16em] uppercase transition-colors ${
                hoveredMenu === "sunglasses" || (currentPage === "shop" && activeCategory === "sunglasses")
                  ? "text-[#C85A1B]"
                  : "text-[#3D2C22] hover:text-[#C85A1B]"
              }`}
            >
              SUNGLASSES
            </button>
          </div>

          {/* 4. EYEGLASSES */}
          <div
            className="py-1.5 cursor-pointer"
            onMouseEnter={() => handleMouseEnter("eyeglasses")}
          >
            <button
              onClick={() => handleNavClick("eyeglasses", "shop")}
              className={`text-[11.5px] xl:text-[12.5px] font-semibold tracking-[0.16em] uppercase transition-colors ${
                hoveredMenu === "eyeglasses" || (currentPage === "shop" && activeCategory === "eyeglasses")
                  ? "text-[#C85A1B]"
                  : "text-[#3D2C22] hover:text-[#C85A1B]"
              }`}
            >
              EYEGLASSES
            </button>
          </div>

          {/* 5. SHOP BY BRAND */}
          <div
            className="py-1.5 cursor-pointer"
            onMouseEnter={() => handleMouseEnter("brands")}
          >
            <button
              onClick={() => handleNavClick("all", "shop")}
              className={`text-[11.5px] xl:text-[12.5px] font-semibold tracking-[0.16em] uppercase transition-colors flex items-center gap-1 ${
                hoveredMenu === "brands" ? "text-[#C85A1B]" : "text-[#3D2C22] hover:text-[#C85A1B]"
              }`}
            >
              <span>SHOP BY BRAND</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6. SALE (Prominent Official Red Cursive Script Image) */}
          <div className="py-1.5 cursor-pointer flex items-center px-0.5">
            <button
              onClick={() => handleNavClick("sale", "shop")}
              className="transition-transform hover:scale-105 cursor-pointer flex items-center"
              title="Special Offers & Sale"
            >
              <img
                src="/images/sale_logo.png"
                alt="Sale"
                className="h-[28px] sm:h-[32px] w-auto object-contain"
              />
            </button>
          </div>

          {/* 7. KIDS */}
          <div
            className="py-1.5 cursor-pointer"
            onMouseEnter={() => handleMouseEnter("kids")}
          >
            <button
              onClick={() => handleNavClick("kids", "shop")}
              className={`text-[11.5px] xl:text-[12.5px] font-semibold tracking-[0.16em] uppercase transition-colors ${
                hoveredMenu === "kids" || (currentPage === "shop" && activeCategory === "kids")
                  ? "text-[#C85A1B]"
                  : "text-[#3D2C22] hover:text-[#C85A1B]"
              }`}
            >
              KIDS
            </button>
          </div>

          {/* 8. CONTACT LENSES */}
          <div className="py-1.5 cursor-pointer">
            <button
              onClick={() => handleNavClick(undefined, "contact")}
              className="text-[11.5px] xl:text-[12.5px] font-semibold tracking-[0.16em] uppercase text-[#3D2C22] hover:text-[#C85A1B] transition-colors"
            >
              CONTACT LENSES
            </button>
          </div>

          {/* 9. ABOUT US */}
          <div className="py-1.5 cursor-pointer">
            <button
              onClick={() => handleNavClick("about", "home")}
              className="text-[11.5px] xl:text-[12.5px] font-semibold tracking-[0.16em] uppercase text-[#3D2C22] hover:text-[#C85A1B] transition-colors"
            >
              ABOUT US
            </button>
          </div>
        </div>

        {/* ────────── FULL-WIDTH MEGA MENU DROPDOWN PANEL (Matching Gem Opticians exactly) ────────── */}
        {hoveredMenu && (
          <div
            className="absolute top-full left-0 right-0 bg-[#F4ECE1] border-t border-[#E5DACB]/80 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
              {/* MEGA MENU: SUNGLASSES */}
              {hoveredMenu === "sunglasses" && (
                <div className="grid grid-cols-5 gap-8 items-start">
                  {/* Col 1: BY GENDER */}
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      BY GENDER
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li>
                        <button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">
                          Men's frames
                        </button>
                      </li>
                      <li>
                        <button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">
                          Women's frames
                        </button>
                      </li>
                      <li>
                        <button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">
                          Unisex
                        </button>
                      </li>
                      <li className="pt-2">
                        <button onClick={() => handleNavClick("sunglasses", "shop")} className="text-[#C85A1B] font-bold hover:underline flex items-center gap-1 cursor-pointer">
                          Shop all <ArrowRight className="w-3 h-3" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Col 2: BY SHAPE */}
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      BY SHAPE
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Aviator</button></li>
                      <li><button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Wayfarer</button></li>
                      <li><button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Cat Eye</button></li>
                      <li><button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Oversized & Square</button></li>
                      <li><button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Round</button></li>
                      <li><button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Rectangle</button></li>
                    </ul>
                  </div>

                  {/* Col 3: TOP BRANDS */}
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      TOP BRANDS
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => onSelectBrand("gucci")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Gucci</button></li>
                      <li><button onClick={() => onSelectBrand("prada")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Prada</button></li>
                      <li><button onClick={() => onSelectBrand("tom")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Tom Ford</button></li>
                      <li><button onClick={() => onSelectBrand("ray")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Ray-Ban</button></li>
                      <li><button onClick={() => onSelectBrand("gast")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">GAST Milano</button></li>
                      <li><button onClick={() => onSelectBrand("theo")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Theo Belgium</button></li>
                      <li className="pt-2">
                        <button onClick={() => handleNavClick("all", "shop")} className="text-[#C85A1B] font-bold hover:underline flex items-center gap-1 cursor-pointer">
                          All brands <ArrowRight className="w-3 h-3" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Col 4: EXCLUSIVE BRANDS */}
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      EXCLUSIVE BRANDS
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => onSelectBrand("cartier")} className="hover:text-[#C85A1B] transition-colors cursor-pointer font-serif italic font-semibold">Cartier Paris</button></li>
                      <li><button onClick={() => onSelectBrand("lindberg")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Lindberg Denmark</button></li>
                      <li><button onClick={() => onSelectBrand("maybach")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Maybach 18k Gold</button></li>
                      <li><button onClick={() => onSelectBrand("jacques")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Jacques Marie Mage</button></li>
                      <li><button onClick={() => onSelectBrand("akoni")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Akoni Japan</button></li>
                      <li className="pt-2">
                        <button onClick={() => handleNavClick("all", "shop")} className="text-[#C85A1B] font-bold hover:underline flex items-center gap-1 cursor-pointer">
                          All exclusive <ArrowRight className="w-3 h-3" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Col 5: SPOTLIGHT BANNER CARD */}
                  <div className="col-span-1 bg-[#F8F2E8] border border-[#E5DACB] rounded-xl overflow-hidden p-4 text-center space-y-2 shadow-xs hover:shadow-md transition-shadow">
                    <div className="h-36 rounded-lg overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
                        alt="Cartier Haute Couture"
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-[#C85A1B] uppercase block pt-1">
                      CARTIER HAUTE COUTURE
                    </span>
                    <p className="text-[11px] font-serif font-bold text-[#2C1C13] uppercase leading-tight">
                      HAND-SCULPTED GOLD SUNWEAR
                    </p>
                    <button
                      onClick={() => onSelectBrand("cartier")}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#332219] hover:text-[#C85A1B] underline pt-1 inline-block cursor-pointer"
                    >
                      EXPLORE CARTIER
                    </button>
                  </div>
                </div>
              )}

              {/* MEGA MENU: EYEGLASSES */}
              {hoveredMenu === "eyeglasses" && (
                <div className="grid grid-cols-5 gap-8 items-start">
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      BY GENDER
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("eyeglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Men's Optical</button></li>
                      <li><button onClick={() => handleNavClick("eyeglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Women's Optical</button></li>
                      <li><button onClick={() => handleNavClick("eyeglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Unisex Frames</button></li>
                      <li className="pt-2"><button onClick={() => handleNavClick("eyeglasses", "shop")} className="text-[#C85A1B] font-bold hover:underline flex items-center gap-1 cursor-pointer">Shop all optical <ArrowRight className="w-3 h-3" /></button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      BY FRAME STYLE
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("eyeglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Rimless Titanium</button></li>
                      <li><button onClick={() => handleNavClick("eyeglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Full-Rim Acetate</button></li>
                      <li><button onClick={() => handleNavClick("eyeglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Half-Rim Surgical Steel</button></li>
                      <li><button onClick={() => handleNavClick("eyeglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Round Classic</button></li>
                      <li><button onClick={() => handleNavClick("eyeglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Rectangle Executive</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      CLINICAL BRANDS
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => onSelectBrand("lindberg")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Lindberg Denmark (2.7g)</button></li>
                      <li><button onClick={() => onSelectBrand("cartier")} className="hover:text-[#C85A1B] transition-colors cursor-pointer font-serif italic">Cartier Atelier</button></li>
                      <li><button onClick={() => onSelectBrand("mykita")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Mykita Berlin</button></li>
                      <li><button onClick={() => onSelectBrand("tom")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Tom Ford</button></li>
                      <li><button onClick={() => onSelectBrand("ray")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Ray-Ban</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      ZEISS & LENS TECH
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><span className="text-[#332219]">Single Vision HD</span></li>
                      <li><span className="text-[#332219]">Progressive 3D Corridor</span></li>
                      <li><span className="text-[#332219]">BlueLight Screen Shield</span></li>
                      <li><span className="text-[#332219]">Transitions® Photochromic</span></li>
                      <li className="pt-2"><button onClick={() => handleNavClick(undefined, "appointment")} className="text-[#C85A1B] font-bold hover:underline flex items-center gap-1 cursor-pointer">Book 12-Step Exam <ArrowRight className="w-3 h-3" /></button></li>
                    </ul>
                  </div>

                  <div className="col-span-1 bg-[#F8F2E8] border border-[#E5DACB] rounded-xl overflow-hidden p-4 text-center space-y-2 shadow-xs">
                    <div className="h-36 rounded-lg overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80"
                        alt="Zeiss Optical Precision"
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-[#C85A1B] uppercase block pt-1">
                      CLINICAL OPTOMETRY
                    </span>
                    <p className="text-[11px] font-serif font-bold text-[#2C1C13] uppercase leading-tight">
                      ZEISS 3D DIGITAL CENTERATION
                    </p>
                    <button
                      onClick={() => handleNavClick(undefined, "appointment")}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#332219] hover:text-[#C85A1B] underline pt-1 inline-block cursor-pointer"
                    >
                      BOOK CLINIC VISIT
                    </button>
                  </div>
                </div>
              )}

              {/* MEGA MENU: SHOP BY BRAND */}
              {hoveredMenu === "brands" && (
                <div className="grid grid-cols-5 gap-8 items-start">
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      HERITAGE HOUSES
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => onSelectBrand("cartier")} className="hover:text-[#C85A1B] transition-colors cursor-pointer font-serif italic font-semibold">Cartier Paris</button></li>
                      <li><button onClick={() => onSelectBrand("maybach")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Maybach 18k Gold</button></li>
                      <li><button onClick={() => onSelectBrand("jacques")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Jacques Marie Mage</button></li>
                      <li><button onClick={() => onSelectBrand("lindberg")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Lindberg Titanium</button></li>
                      <li><button onClick={() => onSelectBrand("akoni")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Akoni Japan</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      DESIGNER HOUSES
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => onSelectBrand("tom")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Tom Ford</button></li>
                      <li><button onClick={() => onSelectBrand("gucci")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Gucci</button></li>
                      <li><button onClick={() => onSelectBrand("prada")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Prada</button></li>
                      <li><button onClick={() => onSelectBrand("ray")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Ray-Ban</button></li>
                      <li><button onClick={() => onSelectBrand("gast")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">GAST Milano</button></li>
                      <li><button onClick={() => onSelectBrand("theo")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Theo Belgium</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      SPECIALTY SERIES
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("meta-smart", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Ray-Ban Meta Smart</button></li>
                      <li><button onClick={() => handleNavClick("kids", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Precision Junior Flex</button></li>
                      <li><button onClick={() => handleNavClick("new", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Bespoke Private Vault</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      BY MATERIAL
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("all", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">18k Gold Plated</button></li>
                      <li><button onClick={() => handleNavClick("all", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Japanese Beta-Titanium</button></li>
                      <li><button onClick={() => handleNavClick("all", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Mazzucchelli Acetate</button></li>
                      <li><button onClick={() => handleNavClick("all", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Natural Buffalo Horn</button></li>
                    </ul>
                  </div>

                  <div className="col-span-1 bg-[#F8F2E8] border border-[#E5DACB] rounded-xl overflow-hidden p-4 text-center space-y-2 shadow-xs">
                    <div className="h-36 rounded-lg overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80"
                        alt="Jacques Marie Mage"
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-[#C85A1B] uppercase block pt-1">
                      LIMITED ARCHIVE
                    </span>
                    <p className="text-[11px] font-serif font-bold text-[#2C1C13] uppercase leading-tight">
                      JACQUES MARIE MAGE DEALAN
                    </p>
                    <button
                      onClick={() => onSelectBrand("jacques")}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#332219] hover:text-[#C85A1B] underline pt-1 inline-block cursor-pointer"
                    >
                      VIEW ARCHIVE
                    </button>
                  </div>
                </div>
              )}

              {/* MEGA MENU: NEW ARRIVALS */}
              {hoveredMenu === "new" && (
                <div className="grid grid-cols-5 gap-8 items-start">
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      NEW COLLECTIONS
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("new", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Spring / Summer '26 Drops</button></li>
                      <li><button onClick={() => handleNavClick("new", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Collector's Edition Vault</button></li>
                      <li><button onClick={() => handleNavClick("new", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Titanium Rimless Series</button></li>
                      <li><button onClick={() => handleNavClick("new", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Fresh Gradient Tints</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      HOTTEST DROPS
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => onSelectBrand("gast")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">GAST Astro Rimless 53</button></li>
                      <li><button onClick={() => handleNavClick("meta-smart", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Ray-Ban Meta Wayfarer</button></li>
                      <li><button onClick={() => onSelectBrand("cartier")} className="hover:text-[#C85A1B] transition-colors cursor-pointer font-serif italic">Cartier CT0344O 18k</button></li>
                      <li><button onClick={() => onSelectBrand("lindberg")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Lindberg Blok 2.7g</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      CATEGORY DROPS
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">New Sunglasses</button></li>
                      <li><button onClick={() => handleNavClick("eyeglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">New Optical Frames</button></li>
                      <li><button onClick={() => handleNavClick("kids", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">New Junior Polymer</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      POPULAR SHAPES
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Geometric Titanium</button></li>
                      <li><button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Bevelled Square Acetate</button></li>
                      <li><button onClick={() => handleNavClick("sunglasses", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Rimless Aviator</button></li>
                    </ul>
                  </div>

                  <div className="col-span-1 bg-[#F8F2E8] border border-[#E5DACB] rounded-xl overflow-hidden p-4 text-center space-y-2 shadow-xs">
                    <div className="h-36 rounded-lg overflow-hidden relative">
                      <img
                        src="/images/banner_new_arrival_1785154858163.jpg"
                        alt="New Arrivals"
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-[#C85A1B] uppercase block pt-1">
                      JUST DROPPED
                    </span>
                    <p className="text-[11px] font-serif font-bold text-[#2C1C13] uppercase leading-tight">
                      SPRING / SUMMER '26 ATELIER
                    </p>
                    <button
                      onClick={() => handleNavClick("new", "shop")}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#332219] hover:text-[#C85A1B] underline pt-1 inline-block cursor-pointer"
                    >
                      DISCOVER DROPS
                    </button>
                  </div>
                </div>
              )}

              {/* MEGA MENU: META SMART */}
              {hoveredMenu === "meta-smart" && (
                <div className="grid grid-cols-5 gap-8 items-start">
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      META AI SMART GLASSES
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("meta-smart", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Wayfarer Smart Series</button></li>
                      <li><button onClick={() => handleNavClick("meta-smart", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Headliner Round Smart</button></li>
                      <li><button onClick={() => handleNavClick("meta-smart", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Transitions® Smart Lenses</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      KEY FEATURES
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><span className="text-[#332219]">Ultra-Wide 12MP Camera</span></li>
                      <li><span className="text-[#332219]">5-Mic Spatial Audio Array</span></li>
                      <li><span className="text-[#332219]">Open-Ear Audio Speakers</span></li>
                      <li><span className="text-[#332219]">Voice-Activated Meta AI</span></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      FRAME FINISHES
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("meta-smart", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Matte Black / Green</button></li>
                      <li><button onClick={() => handleNavClick("meta-smart", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Shiny Black / Clear</button></li>
                      <li><button onClick={() => handleNavClick("meta-smart", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Jeans Blue / Sapphire</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      CONNECTIVITY
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><span className="text-[#332219]">Instagram & FB Live-Stream</span></li>
                      <li><span className="text-[#332219]">Hands-Free Calling</span></li>
                      <li><span className="text-[#332219]">Charging Travel Case</span></li>
                    </ul>
                  </div>

                  <div className="col-span-1 bg-[#F8F2E8] border border-[#E5DACB] rounded-xl overflow-hidden p-4 text-center space-y-2 shadow-xs">
                    <div className="h-36 rounded-lg overflow-hidden relative">
                      <img
                        src="/images/meta_ai_glasses_1786080854572.jpg"
                        alt="Ray-Ban Meta Smart Glasses"
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-[#C85A1B] uppercase block pt-1">
                      SPATIAL AUDIO & AI
                    </span>
                    <p className="text-[11px] font-serif font-bold text-[#2C1C13] uppercase leading-tight">
                      RAY-BAN META WAYFARER
                    </p>
                    <button
                      onClick={() => handleNavClick("meta-smart", "shop")}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#332219] hover:text-[#C85A1B] underline pt-1 inline-block cursor-pointer"
                    >
                      EXPLORE META SMART
                    </button>
                  </div>
                </div>
              )}

              {/* MEGA MENU: KIDS */}
              {hoveredMenu === "kids" && (
                <div className="grid grid-cols-5 gap-8 items-start">
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      BY AGE GROUP
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("kids", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Juniors (Ages 3-7)</button></li>
                      <li><button onClick={() => handleNavClick("kids", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Pre-Teens (Ages 8-12)</button></li>
                      <li><button onClick={() => handleNavClick("kids", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Teens (Ages 13+)</button></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      PROTECTION TECH
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><span className="text-[#332219]">BlueLight Screen Shield</span></li>
                      <li><span className="text-[#332219]">100% UV400 Protection</span></li>
                      <li><span className="text-[#332219]">Myopia Progression Control</span></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      FRAME DURABILITY
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><span className="text-[#332219]">BPA-Free Memory Polymer</span></li>
                      <li><span className="text-[#332219]">360° Unbreakable Flexible Hinges</span></li>
                      <li><span className="text-[#332219]">Anti-Drop Head Strap Included</span></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#2C1C13]">
                      COLORS
                    </h3>
                    <ul className="space-y-2 text-[12px] font-medium text-[#685548]">
                      <li><button onClick={() => handleNavClick("kids", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Ocean Blue / Yellow</button></li>
                      <li><button onClick={() => handleNavClick("kids", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Berry Pink / Coral</button></li>
                      <li><button onClick={() => handleNavClick("kids", "shop")} className="hover:text-[#C85A1B] transition-colors cursor-pointer">Matte Black Active</button></li>
                    </ul>
                  </div>

                  <div className="col-span-1 bg-[#F8F2E8] border border-[#E5DACB] rounded-xl overflow-hidden p-4 text-center space-y-2 shadow-xs">
                    <div className="h-36 rounded-lg overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80"
                        alt="Precision Junior Flex"
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-[#C85A1B] uppercase block pt-1">
                      UNBREAKABLE & ACTIVE
                    </span>
                    <p className="text-[11px] font-serif font-bold text-[#2C1C13] uppercase leading-tight">
                      PRECISION JUNIOR FLEX PRO
                    </p>
                    <button
                      onClick={() => handleNavClick("kids", "shop")}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#332219] hover:text-[#C85A1B] underline pt-1 inline-block cursor-pointer"
                    >
                      EXPLORE JUNIOR
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ────────── Mobile Drawer Menu ────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F8F2E8] border-b border-[#E5DACB] px-4 py-6 space-y-4 text-xs font-bold uppercase tracking-wider">
          <div className="space-y-3 pb-4 border-b border-[#E5DACB]">
            <button
              onClick={() => handleNavClick(undefined, "home")}
              className="block w-full text-left text-[#332219] py-1 cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("new", "shop")}
              className="block w-full text-left text-[#332219] py-1 cursor-pointer"
            >
              New Arrivals
            </button>
            <button
              onClick={() => handleNavClick("sunglasses", "shop")}
              className="block w-full text-left text-[#332219] py-1 cursor-pointer"
            >
              Sunglasses
            </button>
            <button
              onClick={() => handleNavClick("eyeglasses", "shop")}
              className="block w-full text-left text-[#332219] py-1 cursor-pointer"
            >
              Eyeglasses
            </button>
            <button
              onClick={() => handleNavClick("meta-smart", "shop")}
              className="block w-full text-left text-[#332219] py-1 cursor-pointer"
            >
              Meta Smart Glasses
            </button>
            <button
              onClick={() => handleNavClick("kids", "shop")}
              className="block w-full text-left text-[#332219] py-1 cursor-pointer"
            >
              Kids
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleNavClick(undefined, "appointment")}
              className="block w-full text-left text-[#C85A1B] font-bold py-1 cursor-pointer"
            >
              Book Eye Test
            </button>
            <button
              onClick={() => handleNavClick(undefined, "contact")}
              className="block w-full text-left text-[#332219] py-1 cursor-pointer"
            >
              Store Locator
            </button>
            <button
              onClick={() => handleNavClick(undefined, "wishlist")}
              className="block w-full text-left text-[#332219] py-1 cursor-pointer"
            >
              Saved Frames ({wishlistCount})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
