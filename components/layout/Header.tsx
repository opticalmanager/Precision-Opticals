"use client";

import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown, ChevronRight, Glasses, Calendar, Phone } from 'lucide-react';
import { LUXURY_BRANDS } from '@/data/brands';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAiStylist?: () => void;
  onSelectCategory: (category: string) => void;
  onSelectBrand: (brandId: string) => void;
  activeCategory: string;
  currentPage?: 'home' | 'shop' | 'contact' | 'appointment' | 'wishlist';
  onNavigate?: (page: 'home' | 'shop' | 'contact' | 'appointment' | 'wishlist') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenAiStylist,
  onSelectCategory,
  onSelectBrand,
  activeCategory,
  currentPage = 'home',
  onNavigate
}) => {
  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const handleNavClick = (category?: string, page: 'home' | 'shop' | 'contact' | 'appointment' | 'wishlist' = 'shop') => {
    if (page === 'contact' || page === 'appointment' || page === 'wishlist') {
      if (onNavigate) {
        onNavigate(page);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'home') {
      if (onNavigate) {
        onNavigate('home');
      }
      if (category === 'about') {
        setTimeout(() => {
          const aboutElem = document.getElementById('about-us');
          if (aboutElem) {
            aboutElem.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (onNavigate) {
      onNavigate('shop');
    }
    if (category) {
      onSelectCategory(category);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF3EB] border-b border-[#E8DCCF]">
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex-1 flex items-center justify-start gap-3">
          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-stone-800 hover:text-black focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={onOpenSearch}
              className="p-1 text-stone-800 hover:text-black focus:outline-none cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Brand Logo */}
        <div className="shrink-0 flex justify-center text-center py-0.5">
          <button
            onClick={() => handleNavClick('all', 'home')}
            className="inline-flex items-center justify-center group focus:outline-none cursor-pointer"
            aria-label="Precision Optics Home"
          >
            <img
              src="/images/precision-optics-logo.png"
              alt="Precision Optics"
              className="h-8 sm:h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </button>
        </div>

        {/* Right Top Actions */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4 text-[10px] tracking-widest font-medium text-stone-800">
          <button
            onClick={onOpenSearch}
            className="hidden lg:flex items-center gap-1 hover:text-orange-600 focus:outline-none uppercase cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>SEARCH</span>
          </button>

          {/* APPOINTMENT BUTTON */}
          <button
            onClick={() => handleNavClick('all', 'appointment')}
            className={`hidden sm:flex items-center gap-1 hover:text-orange-600 focus:outline-none uppercase cursor-pointer ${
              currentPage === 'appointment' ? 'text-orange-600 font-bold' : ''
            }`}
            title="Book Eye Test Appointment"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-700" />
            <span className="hidden md:inline">APPOINTMENT</span>
          </button>

          {/* WISHLIST BUTTON */}
          <button
            onClick={() => handleNavClick('all', 'wishlist')}
            className="hidden sm:flex items-center gap-1 hover:text-orange-600 focus:outline-none uppercase relative cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-3.5 h-3.5 text-stone-700" />
            <span className="hidden md:inline">WISHLIST</span>
            {wishlistCount > 0 && (
              <span className="bg-orange-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-sans">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* CART BUTTON */}
          <button
            onClick={openCart}
            className="flex items-center gap-1.5 focus:outline-none uppercase relative bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-full transition-colors shadow-sm text-[10px] font-bold cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
            <span className="font-extrabold tracking-wider">CART ({cartCount})</span>
          </button>
        </div>
      </div>

      {/* Main Nav Items (Desktop) */}
      <nav className="hidden lg:block border-t border-[#E8DCCF] bg-[#FAF3EB]">
        <div className="max-w-7xl mx-auto px-4 relative">
          <ul className="flex items-center justify-center space-x-6 text-[10.5px] tracking-[0.12em] font-medium uppercase text-stone-800">
            
            {/* 1. NEW ARRIVALS */}
            <li
              className="py-2.5 group"
              onMouseEnter={() => setHoveredMenu('new-arrivals')}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <button
                onClick={() => handleNavClick('new', 'shop')}
                className={`hover:text-orange-600 font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  currentPage === 'shop' && activeCategory === 'new' ? 'text-orange-600 font-bold border-b-2 border-orange-600 pb-0.5' : ''
                }`}
              >
                <span>NEW ARRIVALS</span>
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform" />
              </button>

              {/* Megamenu dropdown */}
              {hoveredMenu === 'new-arrivals' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] max-w-[calc(100vw-2rem)] bg-[#FFFDF9] border border-[#E8DCCF] shadow-xl p-5 grid grid-cols-3 gap-6 text-left normal-case tracking-normal z-50 rounded-b-md text-xs mt-0.5">
                  <div>
                    <h4 className="font-serif font-bold text-[11px] tracking-widest uppercase text-stone-900 mb-2 border-b border-stone-200 pb-1">
                      SHOP NEW
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-stone-700">
                      <li>
                        <button onClick={() => handleNavClick('sunglasses', 'shop')} className="hover:text-orange-600 font-medium cursor-pointer">
                          New Sunglasses
                        </button>
                      </li>
                      <li>
                        <button onClick={() => handleNavClick('eyeglasses', 'shop')} className="hover:text-orange-600 font-medium cursor-pointer">
                          New Eyeglasses
                        </button>
                      </li>
                      <li>
                        <button onClick={() => handleNavClick('meta-smart', 'shop')} className="hover:text-orange-600 font-medium cursor-pointer">
                          New Meta Smart Glasses
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-[11px] tracking-widest uppercase text-stone-900 mb-2 border-b border-stone-200 pb-1">
                      NEW THIS WEEK
                    </h4>
                    <ul className="space-y-1 text-[11px] text-stone-700">
                      {['GAST Milano', 'Jacques Marie Mage', 'T Henri', 'Off-White', 'Tom Ford', 'Gucci', 'Lindberg'].map((brand) => (
                        <li key={brand}>
                          <button
                            onClick={() => {
                              onSelectBrand(brand.toLowerCase().replace(/\s+/g, '-'));
                              if (onNavigate) onNavigate('shop');
                              setHoveredMenu(null);
                            }}
                            className="hover:text-orange-600 transition-colors cursor-pointer"
                          >
                            {brand}
                          </button>
                        </li>
                      ))}
                      <li className="pt-1.5">
                        <button onClick={() => handleNavClick('new', 'shop')} className="text-orange-600 font-bold text-[10px] underline cursor-pointer">
                          View All New Arrivals →
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-orange-100/60 p-2.5 rounded-md border border-orange-200/80 flex flex-col justify-between">
                    <img
                      src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80"
                      alt="Featured Lindberg"
                      className="w-full h-28 object-cover rounded-xs mb-1.5"
                    />
                    <div>
                      <span className="text-[9px] tracking-widest uppercase font-serif text-orange-600 font-bold">FEATURED BRAND</span>
                      <h5 className="font-serif font-bold text-xs text-stone-900">LINDBERG TITANIUM</h5>
                      <p className="text-[10px] text-stone-600 leading-tight mt-0.5">Visionary screwless Titanium frames.</p>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* 2. META (Image Logo) */}
            <li className="py-2.5 flex items-center">
              <button
                onClick={() => handleNavClick('meta-smart', 'shop')}
                className={`hover:opacity-75 transition-opacity flex items-center cursor-pointer ${
                  currentPage === 'shop' && activeCategory === 'meta-smart' ? 'border-b-2 border-orange-600 pb-0.5' : ''
                }`}
                title="Meta Smart Glasses"
              >
                <img
                  src="/images/meta-logo.png"
                  alt="Meta"
                  className="h-[14px] sm:h-[15px] w-auto object-contain"
                />
              </button>
            </li>

            {/* 3. EYEGLASSES */}
            <li
              className="py-2.5 group"
              onMouseEnter={() => setHoveredMenu('eyewear')}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <button
                onClick={() => handleNavClick('eyeglasses', 'shop')}
                className={`hover:text-orange-600 transition-colors font-semibold flex items-center gap-1 cursor-pointer ${
                  currentPage === 'shop' && activeCategory === 'eyeglasses' ? 'text-orange-600 font-bold border-b-2 border-orange-600 pb-0.5' : ''
                }`}
              >
                <span>EYEGLASSES</span>
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform" />
              </button>

              {/* EYEGLASSES Megamenu Dropdown */}
              {hoveredMenu === 'eyewear' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[920px] max-w-[calc(100vw-2rem)] bg-[#FFFDF9] border border-[#E8DCCF] shadow-2xl p-6 grid grid-cols-3 gap-5 text-left normal-case tracking-normal z-50 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-200 mt-0.5">
                  {/* MEN Eyeglasses Column */}
                  <div className="space-y-3">
                    <div className="bg-[#FAF7F2] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          MEN <span className="font-normal text-stone-600 text-xs">Eyeglasses</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <span>✔</span> FREE Anti-Glare Lenses Included
                        </span>
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                        alt="Men Eyeglasses"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          brands: 'Tom Ford | Ray-Ban | GAST',
                          price: 'Starts at ₹3,000',
                          img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          brands: 'Gucci | Prada | Saint Laurent',
                          price: 'Starts at ₹4,500',
                          img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          brands: 'Lindberg | Moscot | Oliver Peoples',
                          price: 'Starts at ₹6,000',
                          img: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=200&q=80'
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNavClick('men', 'shop');
                            setHoveredMenu(null);
                          }}
                          className="w-full bg-white hover:bg-[#FAF3EB] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.img} alt={item.brands} className="w-11 h-9 object-contain rounded-lg bg-[#FAF7F2] p-1 border border-[#E8DCCF]/60" />
                            <div>
                              <div className="text-[11px] font-bold text-stone-900 leading-tight group-hover:text-[#C86A28] transition-colors">
                                {item.brands}
                              </div>
                              <div className="text-[10.5px] font-extrabold text-[#C86A28] mt-0.5">
                                {item.price}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C86A28] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* WOMEN Eyeglasses Column */}
                  <div className="space-y-3">
                    <div className="bg-[#FAF3EB] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          WOMEN <span className="font-normal text-stone-600 text-xs">Eyeglasses</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <span>✔</span> FREE Anti-Glare Lenses Included
                        </span>
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                        alt="Women Eyeglasses"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          brands: 'Prada | Gucci | Saint Laurent',
                          price: 'Starts at ₹3,500',
                          img: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          brands: 'Tom Ford | Dolce & Gabbana',
                          price: 'Starts at ₹4,000',
                          img: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          brands: 'GAST | Ray-Ban | Cartier',
                          price: 'Starts at ₹5,000',
                          img: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=200&q=80'
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNavClick('women', 'shop');
                            setHoveredMenu(null);
                          }}
                          className="w-full bg-white hover:bg-[#FAF3EB] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.img} alt={item.brands} className="w-11 h-9 object-contain rounded-lg bg-[#FAF7F2] p-1 border border-[#E8DCCF]/60" />
                            <div>
                              <div className="text-[11px] font-bold text-stone-900 leading-tight group-hover:text-[#C86A28] transition-colors">
                                {item.brands}
                              </div>
                              <div className="text-[10.5px] font-extrabold text-[#C86A28] mt-0.5">
                                {item.price}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C86A28] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COMPUTER & BLUE-CUT Eyeglasses Column */}
                  <div className="space-y-3">
                    <div className="bg-[#F5EBE1] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          COMPUTER <span className="font-normal text-stone-600 text-xs">Glasses</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <span>✔</span> 99% Blue-Cut Protection
                        </span>
                      </div>
                      <span className="w-10 h-10 rounded-full bg-stone-900 text-[#FAF3EB] font-serif font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                        Zero
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          title: 'Zero Power Computer Frames',
                          price: 'Starts at ₹1,800',
                          img: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          title: 'Anti-Glare Reading Glasses',
                          price: 'Starts at ₹2,200',
                          img: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          title: 'Digital Screen High-Index',
                          price: 'Starts at ₹2,800',
                          img: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=200&q=80'
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNavClick('eyeglasses', 'shop');
                            setHoveredMenu(null);
                          }}
                          className="w-full bg-white hover:bg-[#FAF3EB] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.img} alt={item.title} className="w-11 h-9 object-contain rounded-lg bg-[#FAF7F2] p-1 border border-[#E8DCCF]/60" />
                            <div>
                              <div className="text-[11px] font-bold text-stone-900 leading-tight group-hover:text-[#C86A28] transition-colors">
                                {item.title}
                              </div>
                              <div className="text-[10.5px] font-extrabold text-[#C86A28] mt-0.5">
                                {item.price}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C86A28] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* 4. SUNGLASSES */}
            <li
              className="py-2.5 group"
              onMouseEnter={() => setHoveredMenu('sunglasses')}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <button
                onClick={() => handleNavClick('sunglasses', 'shop')}
                className={`hover:text-orange-600 transition-colors font-semibold flex items-center gap-1 cursor-pointer ${
                  currentPage === 'shop' && activeCategory === 'sunglasses' ? 'text-orange-600 font-bold border-b-2 border-orange-600 pb-0.5' : ''
                }`}
              >
                <span>SUNGLASSES</span>
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform" />
              </button>

              {/* SUNGLASSES Megamenu Dropdown */}
              {hoveredMenu === 'sunglasses' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[920px] max-w-[calc(100vw-2rem)] bg-[#FFFDF9] border border-[#E8DCCF] shadow-2xl p-6 grid grid-cols-3 gap-5 text-left normal-case tracking-normal z-50 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-200 mt-0.5">
                  {/* MEN Sunglasses Column */}
                  <div className="space-y-3">
                    <div className="bg-[#FAF7F2] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          MEN <span className="font-normal text-stone-600 text-xs">Sunglasses</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <span>✔</span> 100% UV400 Polarized Lenses
                        </span>
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80"
                        alt="Men Sunglasses"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          brands: 'Ray-Ban | Oakley | Persol',
                          price: 'Starts at ₹3,200',
                          img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          brands: 'Tom Ford | Gucci | Prada',
                          price: 'Starts at ₹5,500',
                          img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          brands: 'Oliver Peoples | Jacques Marie Mage',
                          price: 'Starts at ₹8,500',
                          img: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=200&q=80'
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNavClick('sunglasses', 'shop');
                            setHoveredMenu(null);
                          }}
                          className="w-full bg-white hover:bg-[#FAF3EB] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.img} alt={item.brands} className="w-11 h-9 object-contain rounded-lg bg-[#FAF7F2] p-1 border border-[#E8DCCF]/60" />
                            <div>
                              <div className="text-[11px] font-bold text-stone-900 leading-tight group-hover:text-[#C86A28] transition-colors">
                                {item.brands}
                              </div>
                              <div className="text-[10.5px] font-extrabold text-[#C86A28] mt-0.5">
                                {item.price}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C86A28] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* WOMEN Sunglasses Column */}
                  <div className="space-y-3">
                    <div className="bg-[#FAF3EB] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          WOMEN <span className="font-normal text-stone-600 text-xs">Sunglasses</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <span>✔</span> 100% UV400 Polarized Lenses
                        </span>
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                        alt="Women Sunglasses"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          brands: 'Prada | Miu Miu | Saint Laurent',
                          price: 'Starts at ₹4,200',
                          img: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          brands: 'Gucci | Dolce & Gabbana | Chanel',
                          price: 'Starts at ₹6,000',
                          img: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          brands: 'Tom Ford | Celine | Dior',
                          price: 'Starts at ₹7,500',
                          img: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=200&q=80'
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNavClick('sunglasses', 'shop');
                            setHoveredMenu(null);
                          }}
                          className="w-full bg-white hover:bg-[#FAF3EB] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.img} alt={item.brands} className="w-11 h-9 object-contain rounded-lg bg-[#FAF7F2] p-1 border border-[#E8DCCF]/60" />
                            <div>
                              <div className="text-[11px] font-bold text-stone-900 leading-tight group-hover:text-[#C86A28] transition-colors">
                                {item.brands}
                              </div>
                              <div className="text-[10.5px] font-extrabold text-[#C86A28] mt-0.5">
                                {item.price}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C86A28] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LUXURY & SPORT Sunglasses Column */}
                  <div className="space-y-3">
                    <div className="bg-[#F5EBE1] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          LUXURY & SPORT <span className="font-normal text-stone-600 text-xs">Sunglasses</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <span>✔</span> Impact-Resistant Lenses
                        </span>
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=120&q=80"
                        alt="Sport Sunglasses"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          title: 'Sports & Driving Lenses',
                          price: 'Starts at ₹2,500',
                          img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          title: 'Aviators & Wayfarers',
                          price: 'Starts at ₹2,900',
                          img: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=200&q=80'
                        },
                        {
                          title: 'Oversized & Cat Eye',
                          price: 'Starts at ₹3,800',
                          img: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=200&q=80'
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNavClick('sunglasses', 'shop');
                            setHoveredMenu(null);
                          }}
                          className="w-full bg-white hover:bg-[#FAF3EB] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.img} alt={item.title} className="w-11 h-9 object-contain rounded-lg bg-[#FAF7F2] p-1 border border-[#E8DCCF]/60" />
                            <div>
                              <div className="text-[11px] font-bold text-stone-900 leading-tight group-hover:text-[#C86A28] transition-colors">
                                {item.title}
                              </div>
                              <div className="text-[10.5px] font-extrabold text-[#C86A28] mt-0.5">
                                {item.price}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C86A28] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* 5. CONTACTS */}
            <li
              className="py-2.5 group"
              onMouseEnter={() => setHoveredMenu('contacts')}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <button
                onClick={() => handleNavClick('contact-lenses', 'shop')}
                className={`hover:text-orange-600 transition-colors font-semibold flex items-center gap-1 cursor-pointer ${
                  currentPage === 'shop' && activeCategory === 'contact-lenses' ? 'text-orange-600 font-bold border-b-2 border-orange-600 pb-0.5' : ''
                }`}
              >
                <span>CONTACTS</span>
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform" />
              </button>

              {/* CONTACTS Megamenu Dropdown */}
              {hoveredMenu === 'contacts' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[920px] max-w-[calc(100vw-2rem)] bg-[#FFFDF9] border border-[#E8DCCF] shadow-2xl p-6 grid grid-cols-3 gap-5 text-left normal-case tracking-normal z-50 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-200 mt-0.5">
                  {/* CLEAR Contacts Column */}
                  <div className="space-y-3">
                    <div className="bg-[#FAF7F2] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          CLEAR <span className="font-normal text-stone-600 text-xs">Contacts</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <span>✦</span> 10% OFF with Gold
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white p-1 shadow-xs border border-[#E8DCCF] flex items-center justify-center overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=100&q=80" alt="Clear Contacts" className="w-full h-full object-cover rounded-full" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          title: 'Distance power (-ve)',
                          price: 'Starts at ₹319',
                          img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80'
                        },
                        {
                          title: 'Toric / Cylindrical',
                          price: 'Starts at ₹379',
                          img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80'
                        },
                        {
                          title: 'Multi-Focal',
                          price: 'Starts at ₹2,599',
                          img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80'
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNavClick('contact-lenses', 'shop');
                            setHoveredMenu(null);
                          }}
                          className="w-full bg-white hover:bg-[#FAF3EB] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.img} alt={item.title} className="w-9 h-9 object-cover rounded-lg bg-[#FAF7F2] p-0.5 border border-[#E8DCCF]/60" />
                            <div>
                              <div className="text-[11px] font-bold text-stone-900 leading-tight group-hover:text-[#C86A28] transition-colors">
                                {item.title}
                              </div>
                              <div className="text-[10.5px] font-extrabold text-[#C86A28] mt-0.5">
                                {item.price}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C86A28] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COLOR Contacts Column */}
                  <div className="space-y-3">
                    <div className="bg-[#FAF3EB] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          COLOR <span className="font-normal text-stone-600 text-xs">Contacts</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <span>✦</span> 10% OFF with Gold
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white p-1 shadow-xs border border-[#E8DCCF] flex items-center justify-center overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=100&q=80" alt="Color Contacts" className="w-full h-full object-cover rounded-full" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          title: 'Zero Power',
                          price: 'Starts at ₹189',
                          img: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=150&q=80'
                        },
                        {
                          title: 'With Power',
                          price: 'Starts at ₹199',
                          img: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=150&q=80'
                        },
                        {
                          title: 'Color Combos',
                          price: 'Buy 4 at the price of 3!',
                          img: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=150&q=80'
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNavClick('contact-lenses', 'shop');
                            setHoveredMenu(null);
                          }}
                          className="w-full bg-white hover:bg-[#FAF3EB] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.img} alt={item.title} className="w-9 h-9 object-cover rounded-lg bg-[#FAF7F2] p-0.5 border border-[#E8DCCF]/60" />
                            <div>
                              <div className="text-[11px] font-bold text-stone-900 leading-tight group-hover:text-[#C86A28] transition-colors">
                                {item.title}
                              </div>
                              <div className="text-[10.5px] font-extrabold text-[#C86A28] mt-0.5">
                                {item.price}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C86A28] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Solution & Accessories Column */}
                  <div className="space-y-3">
                    <div className="bg-[#F5EBE1] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          Solution & <span className="font-normal text-stone-600 text-xs">Accessories</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <span>✦</span> 10% OFF with Gold
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white p-1 shadow-xs border border-[#E8DCCF] flex items-center justify-center overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=100&q=80" alt="Lens Solution" className="w-full h-full object-cover rounded-full" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          title: 'Solution',
                          price: 'Starts at ₹149',
                          img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80'
                        },
                        {
                          title: 'Accessories',
                          price: 'Starts at ₹159',
                          img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80'
                        },
                        {
                          title: 'Travel Lens Care Kits',
                          price: 'Starts at ₹299',
                          img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80'
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNavClick('contact-lenses', 'shop');
                            setHoveredMenu(null);
                          }}
                          className="w-full bg-white hover:bg-[#FAF3EB] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-2xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.img} alt={item.title} className="w-9 h-9 object-cover rounded-lg bg-[#FAF7F2] p-0.5 border border-[#E8DCCF]/60" />
                            <div>
                              <div className="text-[11px] font-bold text-stone-900 leading-tight group-hover:text-[#C86A28] transition-colors">
                                {item.title}
                              </div>
                              <div className="text-[10.5px] font-extrabold text-[#C86A28] mt-0.5">
                                {item.price}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C86A28] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* 6. LUXURY BRANDS */}
            <li
              className="py-2.5 group"
              onMouseEnter={() => setHoveredMenu('brands')}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <button
                onClick={() => handleNavClick('all', 'shop')}
                className="hover:text-orange-600 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>LUXURY BRANDS</span>
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform" />
              </button>

              {hoveredMenu === 'brands' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[880px] max-w-[calc(100vw-2rem)] bg-white border border-[#E8DCCF] shadow-2xl p-6 grid grid-cols-12 gap-6 text-left normal-case tracking-normal z-50 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-200 mt-0.5">
                  {/* Left Brand List */}
                  <div className="col-span-4 pr-2 border-r border-stone-200">
                    <h4 className="font-serif font-black text-xs tracking-widest uppercase text-[#C86A28] mb-3 pb-1 border-b border-stone-200">
                      LUXURY BRANDS
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-800 font-sans">
                      {[
                        { name: 'Ray-Ban', id: 'ray-ban' },
                        { name: 'Dolce & Gabbana', id: 'dolce-gabbana' },
                        { name: 'Oakley', id: 'oakley' },
                        { name: 'Tom Ford', id: 'tom-ford' },
                        { name: 'Gucci', id: 'gucci' },
                        { name: 'Prada', id: 'prada' },
                        { name: 'Oliver Peoples', id: 'oliver-peoples' },
                        { name: 'Persol', id: 'persol' },
                        { name: 'Silhouette', id: 'silhouette' },
                        { name: 'Moscot', id: 'moscot' },
                        { name: 'Lindberg', id: 'lindberg' }
                      ].map((brand) => (
                        <li key={brand.id}>
                          <button
                            onClick={() => {
                              onSelectBrand(brand.id);
                              if (onNavigate) onNavigate('shop');
                              setHoveredMenu(null);
                            }}
                            className="w-full text-left font-bold text-stone-800 hover:text-[#C86A28] hover:translate-x-1 transition-all py-0.5 flex items-center justify-between group cursor-pointer"
                          >
                            <span>{brand.name}</span>
                            <span className="text-[10px] text-stone-400 group-hover:text-[#C86A28] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Featured Release Card */}
                  <div className="col-span-8 bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DCCF] flex items-center gap-6 relative overflow-hidden shadow-xs">
                    <div className="w-48 h-36 shrink-0 bg-white rounded-xl p-3 border border-stone-200 flex items-center justify-center shadow-2xs">
                      <img
                        src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80"
                        alt="Astro Diamond Bevel Frames"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-sans font-extrabold tracking-[0.2em] text-[#C86A28] uppercase block mb-1">
                        EXCLUSIVE RELEASE
                      </span>
                      <h3 className="font-serif font-extrabold text-stone-900 text-lg uppercase tracking-tight leading-tight mb-2">
                        ASTRO DIAMOND BEVEL FRAMES
                      </h3>
                      <p className="text-xs text-stone-600 font-sans leading-relaxed mb-4">
                        Japanese Beta Titanium alloy, ultra-lightweight 8.5g frame with anti-fatigue polarized UV lenses.
                      </p>
                      <button
                        onClick={() => {
                          handleNavClick('all', 'shop');
                          setHoveredMenu(null);
                        }}
                        className="bg-[#C86A28] hover:bg-[#b05a1f] text-white font-black text-[10px] tracking-widest uppercase px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        EXPLORE COLLECTION
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* 7. SALE (Image Logo) */}
            <li className="py-2.5 flex items-center">
              <button
                onClick={() => handleNavClick('sale', 'shop')}
                className="hover:scale-105 transition-transform flex items-center cursor-pointer"
                title="Sale Offers"
              >
                <img
                  src="/images/sale-logo.webp"
                  alt="Sale"
                  className="h-[22px] sm:h-[24px] w-auto object-contain"
                />
              </button>
            </li>

            {/* 8. BOOK EYE TEST */}
            <li className="py-2.5">
              <button
                onClick={() => handleNavClick('all', 'appointment')}
                className={`hover:text-orange-600 font-bold transition-colors cursor-pointer ${
                  currentPage === 'appointment' ? 'text-orange-600 border-b-2 border-orange-600 pb-0.5' : 'text-orange-600'
                }`}
              >
                BOOK EYE TEST
              </button>
            </li>

            {/* 9. CONTACT US */}
            <li className="py-2.5">
              <button
                onClick={() => handleNavClick('all', 'contact')}
                className={`hover:text-orange-600 font-semibold transition-colors cursor-pointer ${
                  currentPage === 'contact' ? 'text-orange-600 font-bold border-b-2 border-orange-600 pb-0.5' : 'text-stone-800'
                }`}
              >
                CONTACT US
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF3EB] border-t border-[#E8DCCF] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1 divide-y divide-stone-300/60 text-[11px] tracking-wider uppercase font-medium text-stone-900">
            <button
              onClick={() => {
                handleNavClick('new', 'shop');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 hover:text-orange-600 font-bold text-orange-700 cursor-pointer"
            >
              New Arrivals
            </button>
            <button
              onClick={() => {
                handleNavClick('meta-smart', 'shop');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-stone-900 font-bold flex items-center gap-2 cursor-pointer"
            >
              <img src="/images/meta-logo.png" alt="Meta" className="h-3.5 w-auto object-contain" />
              <span>Smart Glasses</span>
            </button>
            <button
              onClick={() => {
                handleNavClick('eyeglasses', 'shop');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 hover:text-orange-600 cursor-pointer"
            >
              Eyeglasses
            </button>
            <button
              onClick={() => {
                handleNavClick('sunglasses', 'shop');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 hover:text-orange-600 cursor-pointer"
            >
              Sunglasses
            </button>
            <button
              onClick={() => {
                handleNavClick('contact-lenses', 'shop');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 hover:text-orange-600 cursor-pointer"
            >
              Contacts
            </button>
            <button
              onClick={() => {
                handleNavClick('all', 'shop');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 hover:text-orange-600 cursor-pointer"
            >
              Luxury Brands
            </button>
            <button
              onClick={() => {
                handleNavClick('sale', 'shop');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 flex items-center gap-2 cursor-pointer"
            >
              <img src="/images/sale-logo.webp" alt="Sale" className="h-4 w-auto object-contain" />
              <span className="font-bold text-orange-600">Exclusive Offers</span>
            </button>
            <button
              onClick={() => {
                handleNavClick('all', 'appointment');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-stone-900 font-bold flex items-center gap-1.5 text-orange-700 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              <span>Book Eye Test</span>
            </button>
            <button
              onClick={() => {
                handleNavClick('all', 'contact');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-stone-900 font-bold flex items-center gap-1.5 text-orange-700 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-orange-600" />
              <span>Contact Us</span>
            </button>
          </div>

          <div className="pt-3 border-t border-stone-300/70">
            <span className="text-[9px] tracking-widest uppercase text-stone-600 font-semibold block mb-2">
              POPULAR BRANDS
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {['Cartier', 'Tom Ford', 'Maybach', 'GAST', 'Jacques Marie Mage', 'Lindberg'].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    onSelectBrand(b.toLowerCase().replace(/\s+/g, '-'));
                    if (onNavigate) onNavigate('shop');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-[#FFFDF9] p-1.5 rounded-sm text-stone-800 text-left border border-[#E8DCCF] font-serif cursor-pointer"
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
