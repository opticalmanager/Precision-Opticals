"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown, ChevronRight, Glasses, Calendar, Phone, Check, Sparkles, User, UserCheck, LogOut, Package, FileText, MapPin, Award, ArrowRight } from 'lucide-react';
import { LUXURY_BRANDS } from '@/data/brands';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getCatalogProducts } from '@/lib/productsService';
import { Product } from '@/types';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAiStylist?: () => void;
  onSelectCategory: (category: string) => void;
  onSelectBrand: (brandId: string) => void;
  activeCategory: string;
  currentPage?: 'home' | 'shop' | 'contact' | 'appointment' | 'wishlist' | 'about' | 'privacy' | 'cart' | 'account';
  onNavigate?: (page: 'home' | 'shop' | 'contact' | 'appointment' | 'wishlist' | 'about' | 'privacy' | 'cart' | 'account') => void;
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
  const router = useRouter();
  const { cartCount, openCart, closeCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { user, isLoggedIn, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Dynamic Catalog & Showcase State
  const [allCatalogProducts, setAllCatalogProducts] = useState<Product[]>([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState<Product[]>([]);
  const [newArrivalBrands, setNewArrivalBrands] = useState<string[]>([
    'Komono',
    'Jacques Marie Mage',
    'T Henri',
    'Off White',
    'Tom Ford',
    'Alaia',
    'Gucci',
    'Montblanc',
  ]);
  const [activeBrandPreview, setActiveBrandPreview] = useState<string | null>(null);
  const [activeSunglassesBrand, setActiveSunglassesBrand] = useState<string | null>(null);
  const [activeEyewearBrand, setActiveEyewearBrand] = useState<string | null>(null);
  const [activeDirectoryBrand, setActiveDirectoryBrand] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getCatalogProducts().then((products) => {
      if (!isMounted || !products || products.length === 0) return;
      setAllCatalogProducts(products);
      const arrivals = products.filter((p) => p.isNewArrival);
      setNewArrivalProducts(arrivals);

      const allBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
      const arrivalBrands = Array.from(new Set(arrivals.map((p) => p.brand).filter(Boolean)));
      const combined = arrivalBrands.length > 0 ? arrivalBrands : allBrands;
      setNewArrivalBrands(combined.slice(0, 8));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredNewArrivalDisplay = React.useMemo(() => {
    if (activeBrandPreview) {
      const match = newArrivalProducts.find(
        (p) => p.brand?.toLowerCase() === activeBrandPreview.toLowerCase()
      );
      if (match) {
        return {
          brand: match.brand.toUpperCase(),
          title: (match.subtitle || match.name).toUpperCase(),
          image: match.images?.[0] || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
          url: `/product/${match.id}`,
        };
      }
    }

    // Default primary showcase: Ray-Ban or latest new arrival
    const defaultNewArrival = newArrivalProducts.find(
      (p) => p.brand?.toLowerCase().includes('ray-ban')
    ) || newArrivalProducts[0];

    if (defaultNewArrival) {
      return {
        brand: defaultNewArrival.brand?.toUpperCase() || 'RAY-BAN',
        title: (defaultNewArrival.subtitle || defaultNewArrival.name || 'TIMELESS ICONIC EYEWEAR').toUpperCase(),
        image: defaultNewArrival.images?.[0] || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
        url: `/product/${defaultNewArrival.id}`,
      };
    }

    return {
      brand: 'RAY-BAN',
      title: 'TIMELESS ICONIC EYEWEAR',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
      url: '/shop?brand=ray-ban',
    };
  }, [activeBrandPreview, newArrivalProducts]);

  const featuredSunglassesDisplay = React.useMemo(() => {
    if (activeSunglassesBrand) {
      const match =
        allCatalogProducts.find(
          (p) =>
            p.brand?.toLowerCase() === activeSunglassesBrand.toLowerCase() &&
            p.category === 'sunglasses'
        ) ||
        allCatalogProducts.find(
          (p) => p.brand?.toLowerCase() === activeSunglassesBrand.toLowerCase()
        );

      if (match) {
        return {
          brand: match.brand.toUpperCase(),
          title: (match.subtitle || match.name).toUpperCase(),
          image:
            match.images?.[0] ||
            'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80',
          url: `/product/${match.id}`,
        };
      }

      return {
        brand: activeSunglassesBrand.toUpperCase(),
        title: 'EXCLUSIVE SUNGLASSES COLLECTION',
        image:
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80',
        url: `/shop?category=sunglasses&brand=${activeSunglassesBrand.toLowerCase().replace(/\s+/g, '-')}`,
      };
    }

    const defaultSunMatch =
      allCatalogProducts.find(
        (p) =>
          p.brand?.toLowerCase().includes('ray-ban') && p.category === 'sunglasses'
      ) || allCatalogProducts.find((p) => p.category === 'sunglasses') || allCatalogProducts[0];

    if (defaultSunMatch) {
      return {
        brand: defaultSunMatch.brand.toUpperCase(),
        title: (defaultSunMatch.subtitle || defaultSunMatch.name || 'A STATEMENT OF TRUE CRAFTSMANSHIP').toUpperCase(),
        image:
          defaultSunMatch.images?.[0] ||
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80',
        url: `/product/${defaultSunMatch.id}`,
      };
    }

    return {
      brand: 'RAY-BAN',
      title: 'A STATEMENT OF TRUE CRAFTSMANSHIP',
      image:
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80',
      url: '/shop?category=sunglasses&brand=ray-ban',
    };
  }, [activeSunglassesBrand, allCatalogProducts]);

  const featuredEyewearDisplay = React.useMemo(() => {
    if (activeEyewearBrand) {
      const match =
        allCatalogProducts.find(
          (p) =>
            p.brand?.toLowerCase() === activeEyewearBrand.toLowerCase() &&
            p.category === 'eyeglasses'
        ) ||
        allCatalogProducts.find(
          (p) => p.brand?.toLowerCase() === activeEyewearBrand.toLowerCase()
        );

      if (match) {
        return {
          brand: match.brand.toUpperCase(),
          title: (match.subtitle || match.name).toUpperCase(),
          image:
            match.images?.[0] ||
            'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=700&q=80',
          url: `/product/${match.id}`,
        };
      }

      return {
        brand: activeEyewearBrand.toUpperCase(),
        title: 'LUXURY OPTICAL ATELIER',
        image:
          'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=700&q=80',
        url: `/shop?category=eyeglasses&brand=${activeEyewearBrand.toLowerCase().replace(/\s+/g, '-')}`,
      };
    }

    const defaultEyewearMatch =
      allCatalogProducts.find(
        (p) =>
          p.brand?.toLowerCase().includes('vogue') && p.category === 'eyeglasses'
      ) || allCatalogProducts.find((p) => p.category === 'eyeglasses') || allCatalogProducts[0];

    if (defaultEyewearMatch) {
      return {
        brand: defaultEyewearMatch.brand.toUpperCase(),
        title: (defaultEyewearMatch.subtitle || defaultEyewearMatch.name || 'PRECISION OPTICAL ATELIER').toUpperCase(),
        image:
          defaultEyewearMatch.images?.[0] ||
          'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=700&q=80',
        url: `/product/${defaultEyewearMatch.id}`,
      };
    }

    return {
      brand: 'VOGUE',
      title: 'PRECISION OPTICAL ATELIER',
      image:
        'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=700&q=80',
      url: '/shop?category=eyeglasses&brand=vogue',
    };
  }, [activeEyewearBrand, allCatalogProducts]);

  const featuredDirectoryDisplay = React.useMemo(() => {
    if (activeDirectoryBrand) {
      const match = allCatalogProducts.find(
        (p) => p.brand?.toLowerCase() === activeDirectoryBrand.toLowerCase()
      );

      if (match) {
        return {
          brand: match.brand.toUpperCase(),
          title: (match.subtitle || match.name).toUpperCase(),
          image:
            match.images?.[0] ||
            'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=700&q=80',
          url: `/product/${match.id}`,
        };
      }

      return {
        brand: activeDirectoryBrand.toUpperCase(),
        title: 'DESIGNER MAISON COLLECTION',
        image:
          'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=700&q=80',
        url: `/shop?brand=${activeDirectoryBrand.toLowerCase().replace(/\s+/g, '-')}`,
      };
    }

    const defaultDirectoryMatch =
      allCatalogProducts.find((p) => p.brand?.toLowerCase().includes('carrera')) ||
      allCatalogProducts.find((p) => p.brand?.toLowerCase().includes('ray-ban')) ||
      allCatalogProducts[0];

    if (defaultDirectoryMatch) {
      return {
        brand: defaultDirectoryMatch.brand.toUpperCase(),
        title: (defaultDirectoryMatch.subtitle || defaultDirectoryMatch.name || 'TIMELESS DESIGN & CRAFTSMANSHIP').toUpperCase(),
        image:
          defaultDirectoryMatch.images?.[0] ||
          'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=700&q=80',
        url: `/product/${defaultDirectoryMatch.id}`,
      };
    }

    return {
      brand: 'CARRERA',
      title: 'TIMELESS DESIGN & CRAFTSMANSHIP',
      image:
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=700&q=80',
      url: '/shop?brand=carrera',
    };
  }, [activeDirectoryBrand, allCatalogProducts]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuEnter = (menuKey: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setHoveredMenu(menuKey);
  };

  const handleMenuLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 220);
  };

  React.useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  const handleNavClick = (category?: string, page: 'home' | 'shop' | 'contact' | 'appointment' | 'wishlist' | 'about' | 'privacy' | 'cart' | 'account' = 'shop') => {
    if (page === 'wishlist') {
      openWishlist();
      return;
    }

    if (page === 'account') {
      if (onNavigate) onNavigate('account');
      router.push('/account');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'cart') {
      closeCart();
      if (onNavigate) onNavigate('cart');
      router.push('/cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'contact') {
      if (onNavigate) onNavigate('contact');
      router.push('/contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'appointment') {
      if (onNavigate) onNavigate('appointment');
      router.push('/appointment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'about' || category === 'about') {
      if (onNavigate) onNavigate('about');
      router.push('/about-us');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'privacy') {
      if (onNavigate) onNavigate('privacy');
      router.push('/privacy-policy');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'home') {
      if (onNavigate) onNavigate('home');
      router.push('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (onNavigate) onNavigate('shop');
    if (category && category !== 'all') {
      onSelectCategory(category);
      router.push(`/shop?category=${category}`);
    } else {
      router.push('/shop');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <button
              onClick={openWishlist}
              className="p-1 text-stone-800 hover:text-black focus:outline-none relative cursor-pointer sm:hidden"
              aria-label="Wishlist"
              title="Saved Frames"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center font-sans font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                if (isLoggedIn) {
                  router.push('/account');
                } else {
                  openAuthModal('/account');
                }
              }}
              className="p-1 text-stone-800 hover:text-black focus:outline-none relative cursor-pointer sm:hidden"
              aria-label="Account"
              title={isLoggedIn ? "My Account" : "Sign In with Mobile OTP"}
            >
              {isLoggedIn ? (
                <div className="w-4.5 h-4.5 rounded-full bg-[#2A1E17] text-[#FAF7F2] flex items-center justify-center text-[8px] font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'P'}
                </div>
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Center Brand Logo */}
        <div className="shrink-0 flex justify-center text-center py-0.5">
          <Link
            href="/"
            onClick={() => handleNavClick('all', 'home')}
            className="inline-flex items-center justify-center group focus:outline-none cursor-pointer"
            aria-label="Precision Optics Home"
          >
            <img
              src="/images/precision-optics-logo.png"
              srcSet="/images/precision-optics-logo.png 1x, /images/precision-optics-logo@2x.png 2x"
              alt="Precision Optics"
              className="h-8 sm:h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Right Top Actions */}
        <div className="flex-1 flex items-center justify-end gap-2.5 sm:gap-3.5 text-[10px] tracking-widest font-medium text-stone-800">
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
            onClick={openWishlist}
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
            onClick={() => {
              closeCart();
              handleNavClick(undefined, 'cart');
            }}
            className={`flex items-center gap-1.5 focus:outline-none uppercase relative ${
              currentPage === 'cart' ? 'bg-[#2A1E17] ring-2 ring-orange-500' : 'bg-orange-600 hover:bg-orange-700'
            } text-white px-3 py-1 rounded-full transition-colors shadow-sm text-[10px] font-bold cursor-pointer`}
            title="View Shopping Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
            <span className="font-extrabold tracking-wider">CART ({cartCount})</span>
          </button>

          {/* USER ACCOUNT / SIGN IN BUTTON & DROPDOWN (Right of Cart) */}
          {!isLoggedIn ? (
            <button
              onClick={() => openAuthModal()}
              className="flex items-center gap-1.5 hover:text-orange-600 focus:outline-none uppercase cursor-pointer py-1 px-1.5 transition-colors"
              title="Sign In with Mobile OTP"
            >
              <User className="w-3.5 h-3.5 text-stone-700" />
              <span className="hidden sm:inline font-bold">SIGN IN</span>
            </button>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 hover:text-orange-600 focus:outline-none uppercase cursor-pointer py-1 px-2 rounded-full hover:bg-[#F2E8DC] border border-[#E8DCCF]/80 transition-colors"
                title="Patron Atelier Account"
              >
                <div className="w-4.5 h-4.5 rounded-full bg-[#2A1E17] text-[#FAF7F2] flex items-center justify-center text-[9px] font-bold">
                  {user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "PO"}
                </div>
                <span className="hidden sm:inline font-bold text-stone-900 tracking-wider">
                  {user.name ? user.name.split(" ")[0].toUpperCase() : "ACCOUNT"}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-stone-500 transition-transform ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Luxury Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FAF3EB] border border-[#E8DCCF] rounded-2xl shadow-2xl p-3.5 z-50 text-left normal-case tracking-normal animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Patron Summary Card */}
                  <div className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-xl p-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#2A1E17] text-[#FAF7F2] flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "PO"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {user.name || "Alexander Sterling"}
                        </h4>
                        <p className="text-[10px] text-stone-500 truncate">
                          {user.phone || user.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#E8DCCF]/60 flex items-center justify-between text-[10px]">
                      <span className="inline-flex items-center gap-1 font-bold text-[#C86A28]">
                        <Award className="w-3 h-3 text-[#C86A28]" /> VIP Platinum
                      </span>
                      <span className="bg-[#FAF3EB] border border-[#E8DCCF] text-stone-800 px-2 py-0.5 rounded-full font-bold">
                        {user.gemPoints} Gem Pts
                      </span>
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="space-y-1 text-xs text-stone-700 font-medium">
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F2E8DC] hover:text-[#C86A28] transition-colors"
                    >
                      <User className="w-4 h-4 text-stone-500" />
                      <span>My Account & Profile</span>
                    </Link>
                    <Link
                      href="/account?tab=orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F2E8DC] hover:text-[#C86A28] transition-colors"
                    >
                      <Package className="w-4 h-4 text-stone-500" />
                      <span>My Orders & Lab Queue</span>
                    </Link>
                    <Link
                      href="/account?tab=prescriptions"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F2E8DC] hover:text-[#C86A28] transition-colors"
                    >
                      <FileText className="w-4 h-4 text-stone-500" />
                      <span>Clinical Prescriptions (OD/OS)</span>
                    </Link>
                    <Link
                      href="/account?tab=addresses"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F2E8DC] hover:text-[#C86A28] transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-stone-500" />
                      <span>Saved Delivery Addresses</span>
                    </Link>
                    <Link
                      href="/account?tab=loyalty"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#F2E8DC] hover:text-[#C86A28] transition-colors"
                    >
                      <Award className="w-4 h-4 text-stone-500" />
                      <span>Gem Loyalty Privileges</span>
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <div className="mt-2 pt-2 border-t border-[#E8DCCF]">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        toast.success("Signed out successfully");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-stone-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-stone-400 group-hover:text-red-600" />
                      <span>Sign Out of Atelier</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Nav Items (Desktop) */}
      <nav className="hidden lg:block border-t border-[#E8DCCF] bg-[#FAF3EB]">
        <div className="max-w-7xl mx-auto px-4 relative">
          <ul className="flex items-center justify-center space-x-6 text-[10.5px] tracking-[0.12em] font-medium uppercase text-stone-800">
            
            {/* 1. NEW ARRIVALS */}
            <li
              className="py-2.5 group"
              onMouseEnter={() => handleMenuEnter('new-arrivals')}
              onMouseLeave={handleMenuLeave}
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
                <div
                  onMouseEnter={() => handleMenuEnter('new-arrivals')}
                  onMouseLeave={handleMenuLeave}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[860px] max-w-[calc(100vw-2rem)] max-h-[min(85vh,720px)] overflow-y-auto bg-[#FAF3EB] border border-[#E8DCCF] shadow-2xl px-8 py-7 grid grid-cols-12 gap-8 text-left normal-case tracking-normal z-50 rounded-b-2xl text-xs animate-in fade-in slide-in-from-top-1.5 duration-200 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                >
                  {/* Left Column: SHOP NEW */}
                  <div className="col-span-3 border-r border-[#E8DCCF] pr-4">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4">
                      SHOP NEW
                    </h4>
                    <ul className="space-y-3 text-xs text-stone-700">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('sunglasses', 'shop');
                            router.push('/shop?category=sunglasses&filter=new_arrivals');
                            setHoveredMenu(null);
                          }}
                          className="hover:text-[#C86A28] font-medium transition-colors cursor-pointer text-stone-800"
                        >
                          Sunglasses
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('eyeglasses', 'shop');
                            router.push('/shop?category=eyeglasses&filter=new_arrivals');
                            setHoveredMenu(null);
                          }}
                          className="hover:text-[#C86A28] font-medium transition-colors cursor-pointer text-stone-800"
                        >
                          Eyeglasses
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Middle Column: NEW THIS WEEK */}
                  <div className="col-span-4 border-r border-[#E8DCCF] pr-4">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4">
                      NEW THIS WEEK
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {newArrivalBrands.map((brand) => {
                        const isHovered = activeBrandPreview === brand;
                        return (
                          <li key={brand}>
                            <button
                              type="button"
                              onClick={() => {
                                const bSlug = brand.toLowerCase().replace(/\s+/g, '-');
                                onSelectBrand(bSlug);
                                if (onNavigate) onNavigate('shop');
                                router.push(`/shop?brand=${bSlug}&filter=new_arrivals`);
                                setHoveredMenu(null);
                              }}
                              onMouseEnter={() => setActiveBrandPreview(brand)}
                              className={`transition-colors cursor-pointer text-left ${
                                isHovered
                                  ? 'text-[#C86A28] font-bold'
                                  : 'text-stone-700 hover:text-[#C86A28]'
                              }`}
                            >
                              {brand}
                            </button>
                          </li>
                        );
                      })}
                      <li className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('new', 'shop');
                            router.push('/shop?filter=new_arrivals');
                            setHoveredMenu(null);
                          }}
                          className="inline-flex items-center gap-1.5 text-[#C86A28] hover:text-[#b0581e] font-semibold text-[11px] tracking-wide cursor-pointer group"
                        >
                          <span>View All New Arrivals</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Right Column: Featured Showcase Card */}
                  <div className="col-span-5 flex flex-col justify-start">
                    <Link
                      href={featuredNewArrivalDisplay.url}
                      onClick={() => setHoveredMenu(null)}
                      className="group block overflow-hidden rounded-xl border border-[#E8DCCF] bg-[#FFFDF9] p-3 transition-all hover:border-[#C86A28]/40 hover:shadow-md cursor-pointer"
                    >
                      <div className="w-full aspect-[16/10] bg-[#FAF7F2] overflow-hidden rounded-lg flex items-center justify-center">
                        <img
                          src={featuredNewArrivalDisplay.image}
                          alt={featuredNewArrivalDisplay.brand}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="pt-3 pb-1 text-center">
                        <h5 className="font-serif font-bold text-xs tracking-[0.2em] text-[#2A1E17] uppercase">
                          {featuredNewArrivalDisplay.brand}
                        </h5>
                        <p className="text-[10px] tracking-[0.15em] text-stone-500 uppercase mt-0.5 font-medium">
                          {featuredNewArrivalDisplay.title}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {/* 2. META (Figma Styled Pill) */}
            <li
              className="py-2.5 group relative flex items-center"
              onMouseEnter={() => handleMenuEnter('meta-smart')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                onClick={() => handleNavClick('meta-smart', 'shop')}
                className={`border border-[#38BDF8] bg-[#F0F9FF] text-[#0284C7] hover:bg-[#E0F2FE] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-all text-[11px] font-bold tracking-wider cursor-pointer shadow-2xs ${
                  currentPage === 'shop' && activeCategory === 'meta-smart' ? 'ring-2 ring-[#0284C7]' : ''
                }`}
                title="Meta Smart Glasses"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0284C7]">
                  <path d="M12 10.5C10.5 8.5 8.5 7.5 6 7.5C2.7 7.5 0 10.2 0 13.5C0 16.8 2.7 19.5 6 19.5C9.5 19.5 11.5 16 12 14.5C12.5 16 14.5 19.5 18 19.5C21.3 19.5 24 16.8 24 13.5C24 10.2 21.3 7.5 18 7.5C15.5 7.5 13.5 8.5 12 10.5ZM6 17.5C3.8 17.5 2 15.7 2 13.5C2 11.3 3.8 9.5 6 9.5C8 9.5 9.8 10.8 10.8 12.5C9.8 14.5 8 17.5 6 17.5ZM18 17.5C16 17.5 14.2 14.5 13.2 12.5C14.2 10.8 16 9.5 18 9.5C20.2 9.5 22 11.3 22 13.5C22 15.7 20.2 17.5 18 17.5Z" />
                </svg>
                <span>META</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60 group-hover:rotate-180 transition-transform ml-0.5" />
              </button>

              {/* Meta Dropdown */}
              {hoveredMenu === 'meta-smart' && (
                <div
                  onMouseEnter={() => handleMenuEnter('meta-smart')}
                  onMouseLeave={handleMenuLeave}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-60 bg-[#FAF3EB] border border-[#E8DCCF] shadow-2xl p-4 text-left normal-case tracking-normal z-50 rounded-b-2xl text-xs animate-in fade-in slide-in-from-top-1.5 duration-200 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                >
                  <ul className="space-y-2 text-xs text-stone-700">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          handleNavClick('meta-smart', 'shop');
                          router.push('/shop?category=meta-smart&brand=ray-ban-meta');
                          setHoveredMenu(null);
                        }}
                        className="w-full text-left text-stone-800 hover:text-[#C86A28] font-medium transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-[#F2E8DC] block"
                      >
                        Ray-Ban Meta
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          handleNavClick('meta-smart', 'shop');
                          router.push('/shop?category=meta-smart&brand=oakley');
                          setHoveredMenu(null);
                        }}
                        className="w-full text-left text-stone-800 hover:text-[#C86A28] font-medium transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-[#F2E8DC] block"
                      >
                        Oakley X Meta
                      </button>
                    </li>
                    <li className="pt-2 border-t border-[#E8DCCF]">
                      <button
                        type="button"
                        onClick={() => {
                          handleNavClick('meta-smart', 'shop');
                          router.push('/shop?category=meta-smart');
                          setHoveredMenu(null);
                        }}
                        className="w-full text-left text-[#C86A28] hover:text-[#9A4C16] font-semibold text-[11px] flex items-center justify-between px-2 py-1 group cursor-pointer"
                      >
                        <span>Shop All Meta</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </li>

            {/* 3. EYEGLASSES */}
            <li
              className="py-2.5 group"
              onMouseEnter={() => handleMenuEnter('eyewear')}
              onMouseLeave={handleMenuLeave}
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
                <div
                  onMouseEnter={() => handleMenuEnter('eyewear')}
                  onMouseLeave={handleMenuLeave}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[1120px] max-w-[calc(100vw-2rem)] max-h-[min(85vh,720px)] overflow-y-auto bg-[#FAF3EB] border border-[#E8DCCF] shadow-2xl px-8 py-7 grid grid-cols-12 gap-6 text-left normal-case tracking-normal z-50 rounded-b-2xl text-xs animate-in fade-in slide-in-from-top-1.5 duration-200 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                >
                  {/* 1. BY GENDER */}
                  <div className="col-span-2 border-r border-[#E8DCCF] pr-3">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4 pb-1 border-b border-[#E8DCCF]">
                      BY GENDER
                    </h4>
                    <ul className="space-y-2 text-xs text-stone-700">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('eyeglasses', 'shop');
                            router.push('/shop?category=eyeglasses&gender=men');
                            setHoveredMenu(null);
                          }}
                          className="hover:text-[#C86A28] font-medium transition-colors cursor-pointer text-stone-800"
                        >
                          Men&apos;s frames
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('eyeglasses', 'shop');
                            router.push('/shop?category=eyeglasses&gender=women');
                            setHoveredMenu(null);
                          }}
                          className="hover:text-[#C86A28] font-medium transition-colors cursor-pointer text-stone-800"
                        >
                          Women&apos;s frames
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('eyeglasses', 'shop');
                            router.push('/shop?category=eyeglasses&gender=unisex');
                            setHoveredMenu(null);
                          }}
                          className="hover:text-[#C86A28] font-medium transition-colors cursor-pointer text-stone-800"
                        >
                          Unisex
                        </button>
                      </li>
                      <li className="pt-2 border-t border-[#E8DCCF]">
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('eyeglasses', 'shop');
                            router.push('/shop?category=eyeglasses');
                            setHoveredMenu(null);
                          }}
                          className="inline-flex items-center gap-1 text-[#C86A28] hover:text-[#9A4C16] font-semibold text-[11px] tracking-wide cursor-pointer group"
                        >
                          <span>Shop all</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 2. BY SHAPE */}
                  <div className="col-span-2 border-r border-[#E8DCCF] pr-3">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4 pb-1 border-b border-[#E8DCCF]">
                      BY SHAPE
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {[
                        { label: 'Aviator', shape: 'aviator' },
                        { label: 'Butterfly', shape: 'cat-eye' },
                        { label: 'Cat Eye', shape: 'cat-eye' },
                        { label: 'Oversized', shape: 'square' },
                        { label: 'Round', shape: 'round' },
                        { label: 'Rectangle', shape: 'rectangle' },
                      ].map((item) => (
                        <li key={item.label}>
                          <button
                            type="button"
                            onClick={() => {
                              handleNavClick('eyeglasses', 'shop');
                              router.push(`/shop?category=eyeglasses&shape=${item.shape}`);
                              setHoveredMenu(null);
                            }}
                            className="hover:text-[#C86A28] font-medium transition-colors cursor-pointer text-stone-800 text-left block w-full"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. FEATURED HOUSES */}
                  <div className="col-span-2 border-r border-[#E8DCCF] pr-3">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4 pb-1 border-b border-[#E8DCCF]">
                      FEATURED HOUSES
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {[
                        { name: 'Ray-Ban', slug: 'ray-ban', count: '500+ Styles' },
                        { name: 'Vogue Eyewear', slug: 'vogue', count: '220+ Styles' },
                        { name: 'Carrera', slug: 'carrera', count: '70+ Styles' },
                        { name: 'Emporio Armani', slug: 'emporio-armani', count: '25+ Styles' },
                      ].map((item) => {
                        const isHovered = activeEyewearBrand === item.name;
                        return (
                          <li key={item.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectBrand(item.slug);
                                if (onNavigate) onNavigate('shop');
                                router.push(`/shop?category=eyeglasses&brand=${item.slug}`);
                                setHoveredMenu(null);
                              }}
                              onMouseEnter={() => setActiveEyewearBrand(item.name)}
                              className={`transition-colors cursor-pointer text-left flex items-center justify-between w-full py-0.5 ${
                                isHovered
                                  ? 'text-[#C86A28] font-bold'
                                  : 'text-stone-700 hover:text-[#C86A28]'
                              }`}
                            >
                              <span>{item.name}</span>
                              <span className="text-[10px] text-stone-500 font-normal">{item.count}</span>
                            </button>
                          </li>
                        );
                      })}
                      <li className="pt-2 border-t border-[#E8DCCF]">
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('eyeglasses', 'shop');
                            router.push('/shop?category=eyeglasses');
                            setHoveredMenu(null);
                          }}
                          className="inline-flex items-center gap-1 text-[#C86A28] hover:text-[#9A4C16] font-semibold text-[11px] tracking-wide cursor-pointer group"
                        >
                          <span>All eyeglasses</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 4. CURATED SHAPES */}
                  <div className="col-span-2 border-r border-[#E8DCCF] pr-3">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4 pb-1 border-b border-[#E8DCCF]">
                      CURATED SHAPES
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {[
                        'Cat Eye',
                        'Rectangle',
                        'Round',
                        'Square',
                        'Aviator',
                        'Geometric',
                      ].map((shape) => {
                        const sSlug = shape.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <li key={shape}>
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigate) onNavigate('shop');
                                router.push(`/shop?category=eyeglasses&shape=${sSlug}`);
                                setHoveredMenu(null);
                              }}
                              className="transition-colors cursor-pointer text-left block w-full py-0.5 text-stone-700 hover:text-[#C86A28]"
                            >
                              {shape}
                            </button>
                          </li>
                        );
                      })}
                      <li className="pt-2 border-t border-[#E8DCCF]">
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('eyeglasses', 'shop');
                            router.push('/shop?category=eyeglasses');
                            setHoveredMenu(null);
                          }}
                          className="inline-flex items-center gap-1 text-[#C86A28] hover:text-[#9A4C16] font-semibold text-[11px] tracking-wide cursor-pointer group"
                        >
                          <span>Explore all shapes</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 5. SHOWCASE CARD */}
                  <div className="col-span-4 flex flex-col justify-start pl-2">
                    <Link
                      href={featuredEyewearDisplay.url}
                      onClick={() => setHoveredMenu(null)}
                      className="group block overflow-hidden rounded-xl border border-[#E8DCCF] bg-[#FFFDF9] p-3 transition-all hover:border-[#C86A28]/40 hover:shadow-md cursor-pointer"
                    >
                      <div className="w-full aspect-[16/10] bg-[#FAF7F2] overflow-hidden rounded-lg flex items-center justify-center">
                        <img
                          src={featuredEyewearDisplay.image}
                          alt={featuredEyewearDisplay.brand}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="pt-3 pb-1 text-center">
                        <h5 className="font-serif font-bold text-xs tracking-[0.2em] text-[#2A1E17] uppercase">
                          {featuredEyewearDisplay.brand}
                        </h5>
                        <p className="text-[10px] tracking-[0.15em] text-stone-500 uppercase mt-0.5 font-medium">
                          {featuredEyewearDisplay.title}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {/* 4. SUNGLASSES */}
            <li
              className="py-2.5 group"
              onMouseEnter={() => handleMenuEnter('sunglasses')}
              onMouseLeave={handleMenuLeave}
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
                <div
                  onMouseEnter={() => handleMenuEnter('sunglasses')}
                  onMouseLeave={handleMenuLeave}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[1120px] max-w-[calc(100vw-2rem)] max-h-[min(85vh,720px)] overflow-y-auto bg-[#FAF3EB] border border-[#E8DCCF] shadow-2xl px-8 py-7 grid grid-cols-12 gap-6 text-left normal-case tracking-normal z-50 rounded-b-2xl text-xs animate-in fade-in slide-in-from-top-1.5 duration-200 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                >
                  {/* 1. BY GENDER */}
                  <div className="col-span-2 border-r border-[#E8DCCF] pr-3">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4 pb-1 border-b border-[#E8DCCF]">
                      BY GENDER
                    </h4>
                    <ul className="space-y-2 text-xs text-stone-700">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('sunglasses', 'shop');
                            router.push('/shop?category=sunglasses&gender=men');
                            setHoveredMenu(null);
                          }}
                          className="hover:text-[#C86A28] font-medium transition-colors cursor-pointer text-stone-800"
                        >
                          Men&apos;s sunglasses
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('sunglasses', 'shop');
                            router.push('/shop?category=sunglasses&gender=women');
                            setHoveredMenu(null);
                          }}
                          className="hover:text-[#C86A28] font-medium transition-colors cursor-pointer text-stone-800"
                        >
                          Women&apos;s sunglasses
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('sunglasses', 'shop');
                            router.push('/shop?category=sunglasses&gender=unisex');
                            setHoveredMenu(null);
                          }}
                          className="hover:text-[#C86A28] font-medium transition-colors cursor-pointer text-stone-800"
                        >
                          Unisex
                        </button>
                      </li>
                      <li className="pt-2 border-t border-[#E8DCCF]">
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('sunglasses', 'shop');
                            router.push('/shop?category=sunglasses');
                            setHoveredMenu(null);
                          }}
                          className="inline-flex items-center gap-1 text-[#C86A28] hover:text-[#9A4C16] font-semibold text-[11px] tracking-wide cursor-pointer group"
                        >
                          <span>Shop all</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 2. BY SHAPE */}
                  <div className="col-span-2 border-r border-[#E8DCCF] pr-3">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4 pb-1 border-b border-[#E8DCCF]">
                      BY SHAPE
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {[
                        { label: 'Aviator', shape: 'aviator' },
                        { label: 'Butterfly', shape: 'cat-eye' },
                        { label: 'Cat eye', shape: 'cat-eye' },
                        { label: 'Oversized', shape: 'square' },
                        { label: 'Round', shape: 'round' },
                        { label: 'Rectangle', shape: 'rectangle' },
                        { label: 'Sports', shape: 'geometric' },
                      ].map((item) => (
                        <li key={item.label}>
                          <button
                            type="button"
                            onClick={() => {
                              handleNavClick('sunglasses', 'shop');
                              router.push(`/shop?category=sunglasses&shape=${item.shape}`);
                              setHoveredMenu(null);
                            }}
                            className="hover:text-[#C86A28] font-medium transition-colors cursor-pointer text-stone-800 text-left block w-full"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. FEATURED HOUSES */}
                  <div className="col-span-2 border-r border-[#E8DCCF] pr-3">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4 pb-1 border-b border-[#E8DCCF]">
                      FEATURED HOUSES
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {[
                        { name: 'Ray-Ban', slug: 'ray-ban', count: '500+ Styles' },
                        { name: 'Carrera', slug: 'carrera', count: '70+ Styles' },
                        { name: 'Vogue Eyewear', slug: 'vogue', count: '220+ Styles' },
                        { name: 'Emporio Armani', slug: 'emporio-armani', count: '25+ Styles' },
                      ].map((item) => {
                        const isHovered = activeSunglassesBrand === item.name;
                        return (
                          <li key={item.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectBrand(item.slug);
                                if (onNavigate) onNavigate('shop');
                                router.push(`/shop?category=sunglasses&brand=${item.slug}`);
                                setHoveredMenu(null);
                              }}
                              onMouseEnter={() => setActiveSunglassesBrand(item.name)}
                              className={`transition-colors cursor-pointer text-left flex items-center justify-between w-full py-0.5 ${
                                isHovered
                                  ? 'text-[#C86A28] font-bold'
                                  : 'text-stone-700 hover:text-[#C86A28]'
                              }`}
                            >
                              <span>{item.name}</span>
                              <span className="text-[10px] text-stone-500 font-normal">{item.count}</span>
                            </button>
                          </li>
                        );
                      })}
                      <li className="pt-2 border-t border-[#E8DCCF]">
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('sunglasses', 'shop');
                            router.push('/shop?category=sunglasses');
                            setHoveredMenu(null);
                          }}
                          className="inline-flex items-center gap-1 text-[#C86A28] hover:text-[#9A4C16] font-semibold text-[11px] tracking-wide cursor-pointer group"
                        >
                          <span>All sunglasses</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 4. ICONIC SILHOUETTES */}
                  <div className="col-span-2 border-r border-[#E8DCCF] pr-3">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4 pb-1 border-b border-[#E8DCCF]">
                      ICONIC SILHOUETTES
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {[
                        'Aviator',
                        'Wayfarer',
                        'Round',
                        'Rectangle',
                        'Square',
                        'Pilot',
                      ].map((shape) => {
                        const sSlug = shape.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <li key={shape}>
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigate) onNavigate('shop');
                                router.push(`/shop?category=sunglasses&shape=${sSlug}`);
                                setHoveredMenu(null);
                              }}
                              className="transition-colors cursor-pointer text-left block w-full py-0.5 text-stone-700 hover:text-[#C86A28]"
                            >
                              {shape}
                            </button>
                          </li>
                        );
                      })}
                      <li className="pt-2 border-t border-[#E8DCCF]">
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('sunglasses', 'shop');
                            router.push('/shop?category=sunglasses');
                            setHoveredMenu(null);
                          }}
                          className="inline-flex items-center gap-1 text-[#C86A28] hover:text-[#9A4C16] font-semibold text-[11px] tracking-wide cursor-pointer group"
                        >
                          <span>Explore all styles</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 5. SHOWCASE CARD */}
                  <div className="col-span-4 flex flex-col justify-start pl-2">
                    <Link
                      href={featuredSunglassesDisplay.url}
                      onClick={() => setHoveredMenu(null)}
                      className="group block overflow-hidden rounded-xl border border-[#E8DCCF] bg-[#FFFDF9] p-3 transition-all hover:border-[#C86A28]/40 hover:shadow-md cursor-pointer"
                    >
                      <div className="w-full aspect-[16/10] bg-[#FAF7F2] overflow-hidden rounded-lg flex items-center justify-center">
                        <img
                          src={featuredSunglassesDisplay.image}
                          alt={featuredSunglassesDisplay.brand}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="pt-3 pb-1 text-center">
                        <h5 className="font-serif font-bold text-xs tracking-[0.2em] text-[#2A1E17] uppercase">
                          {featuredSunglassesDisplay.brand}
                        </h5>
                        <p className="text-[10px] tracking-[0.15em] text-stone-500 uppercase mt-0.5 font-medium">
                          {featuredSunglassesDisplay.title}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {/* 5. CONTACTS */}
            <li
              className="py-2.5 group"
              onMouseEnter={() => handleMenuEnter('contacts')}
              onMouseLeave={handleMenuLeave}
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
                <div
                  onMouseEnter={() => handleMenuEnter('contacts')}
                  onMouseLeave={handleMenuLeave}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[940px] max-w-[calc(100vw-2rem)] max-h-[min(85vh,720px)] overflow-y-auto bg-[#FAF3EB] border border-[#E8DCCF] shadow-2xl p-6 grid grid-cols-3 gap-5 text-left normal-case tracking-normal z-50 rounded-b-2xl animate-in fade-in slide-in-from-top-1.5 duration-200 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                >
                  {/* CLEAR Contacts Column */}
                  <div className="space-y-3">
                    <div className="bg-[#FFFDF9] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          CLEAR <span className="font-normal text-stone-600 text-xs">Contacts</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" /> 10% OFF with Gold
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
                          className="w-full bg-white hover:bg-[#FFFDF9] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
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
                    <div className="bg-[#FFFDF9] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          COLOR <span className="font-normal text-stone-600 text-xs">Contacts</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" /> 10% OFF with Gold
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
                          className="w-full bg-white hover:bg-[#FFFDF9] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
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
                    <div className="bg-[#FFFDF9] rounded-2xl p-3.5 flex items-center justify-between border border-[#E8DCCF] shadow-xs">
                      <div>
                        <h4 className="text-stone-900 font-extrabold text-sm tracking-tight font-sans">
                          Solution & <span className="font-normal text-stone-600 text-xs">Accessories</span>
                        </h4>
                        <span className="text-[#C86A28] font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" /> 10% OFF with Gold
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
                          className="w-full bg-white hover:bg-[#FFFDF9] border border-[#E8DCCF]/80 hover:border-[#C86A28]/50 p-2.5 rounded-xl flex items-center justify-between shadow-2xs transition-all text-left group cursor-pointer"
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
              onMouseEnter={() => handleMenuEnter('brands')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                onClick={() => handleNavClick('all', 'shop')}
                className="hover:text-orange-600 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>LUXURY BRANDS</span>
                <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform" />
              </button>

              {/* LUXURY BRANDS Alphabetical Megamenu Dropdown */}
              {hoveredMenu === 'brands' && (
                <div
                  onMouseEnter={() => handleMenuEnter('brands')}
                  onMouseLeave={handleMenuLeave}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[1160px] max-w-[calc(100vw-2rem)] max-h-[min(85vh,720px)] overflow-y-auto bg-[#FAF3EB] border border-[#E8DCCF] shadow-2xl px-8 py-7 grid grid-cols-12 gap-5 text-left normal-case tracking-normal z-50 rounded-b-2xl text-xs animate-in fade-in slide-in-from-top-1.5 duration-200 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                >
                  {/* Column 1 & 2: DESIGNER EYEWEAR HOUSES */}
                  <div className="col-span-4 border-r border-[#E8DCCF] pr-4">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4 pb-1 border-b border-[#E8DCCF]">
                      DESIGNER EYEWEAR HOUSES
                    </h4>
                    <ul className="space-y-3 text-xs text-stone-700">
                      {[
                        { name: 'Ray-Ban', slug: 'ray-ban', tagline: 'Timeless Aviator & Wayfarer Icons', count: '500+ Styles' },
                        { name: 'Vogue Eyewear', slug: 'vogue', tagline: 'Chic Modern Everyday Frames', count: '220+ Styles' },
                        { name: 'Carrera', slug: 'carrera', tagline: 'Signature Racing & Pilot Silhouettes', count: '70+ Styles' },
                        { name: 'Emporio Armani', slug: 'emporio-armani', tagline: 'Milanese Contemporary Luxury', count: '25+ Styles' },
                      ].map((item) => {
                        const isHovered = activeDirectoryBrand === item.name;
                        return (
                          <li key={item.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectBrand(item.slug);
                                if (onNavigate) onNavigate('shop');
                                router.push(`/shop?brand=${item.slug}`);
                                setHoveredMenu(null);
                              }}
                              onMouseEnter={() => setActiveDirectoryBrand(item.name)}
                              className={`transition-all cursor-pointer text-left block w-full p-2 rounded-lg border ${
                                isHovered
                                  ? 'bg-white border-[#C86A28] shadow-xs'
                                  : 'bg-[#FFFDF9]/60 border-transparent hover:border-[#E8DCCF] hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-medium ${isHovered ? 'text-[#C86A28]' : 'text-stone-900'}`}>{item.name}</span>
                                <span className="text-[10px] text-stone-500">{item.count}</span>
                              </div>
                              <p className="text-[11px] text-stone-500 mt-0.5">{item.tagline}</p>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Column 3 & 4: CLINICAL CONTACT LENSES */}
                  <div className="col-span-4 border-r border-[#E8DCCF] pr-4">
                    <h4 className="font-serif font-bold text-[11px] tracking-[0.2em] uppercase text-[#8B7355] mb-4 pb-1 border-b border-[#E8DCCF]">
                      CLINICAL CONTACT LENSES
                    </h4>
                    <ul className="space-y-3 text-xs text-stone-700">
                      {[
                        { name: 'Johnson & Johnson', slug: 'johnson-johnson', tagline: 'Acuvue Oasys & 1-Day Moist', count: 'Clinical Grade' },
                        { name: 'Cooper Vision', slug: 'cooper-vision', tagline: 'Biofinity, Clariti & Proclear', count: 'Clinical Grade' },
                        { name: 'Alcon', slug: 'alcon', tagline: 'Dailies Total 1 & Air Optix HydraGlyde', count: 'Clinical Grade' },
                        { name: 'Bausch & Lomb', slug: 'bausch-lomb', tagline: 'Soflens 59 & PureVision HD', count: 'Clinical Grade' },
                      ].map((item) => {
                        const isHovered = activeDirectoryBrand === item.name;
                        return (
                          <li key={item.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectBrand(item.slug);
                                if (onNavigate) onNavigate('shop');
                                router.push(`/shop?category=contact-lenses&brand=${item.slug}`);
                                setHoveredMenu(null);
                              }}
                              onMouseEnter={() => setActiveDirectoryBrand(item.name)}
                              className={`transition-all cursor-pointer text-left block w-full p-2 rounded-lg border ${
                                isHovered
                                  ? 'bg-white border-[#C86A28] shadow-xs'
                                  : 'bg-[#FFFDF9]/60 border-transparent hover:border-[#E8DCCF] hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-medium ${isHovered ? 'text-[#C86A28]' : 'text-stone-900'}`}>{item.name}</span>
                                <span className="text-[10px] text-stone-500">{item.count}</span>
                              </div>
                              <p className="text-[11px] text-stone-500 mt-0.5">{item.tagline}</p>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Column 5: SHOWCASE CARD */}
                  <div className="col-span-4 flex flex-col justify-start pl-3">
                    <Link
                      href={featuredDirectoryDisplay.url}
                      onClick={() => setHoveredMenu(null)}
                      className="group block overflow-hidden rounded-xl border border-[#E8DCCF] bg-[#FFFDF9] p-3 transition-all hover:border-[#C86A28]/40 hover:shadow-md cursor-pointer"
                    >
                      <div className="w-full aspect-[16/10] bg-[#FAF7F2] overflow-hidden rounded-lg flex items-center justify-center">
                        <img
                          src={featuredDirectoryDisplay.image}
                          alt={featuredDirectoryDisplay.brand}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="pt-3 pb-1 text-center">
                        <h5 className="font-serif font-bold text-xs tracking-[0.2em] text-[#2A1E17] uppercase">
                          {featuredDirectoryDisplay.brand}
                        </h5>
                        <p className="text-[10px] tracking-[0.15em] text-stone-500 uppercase mt-0.5 font-medium">
                          {featuredDirectoryDisplay.title}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {/* 7. SALE (Figma Editorial Calligraphy Style) */}
            <li
              className="py-2.5 group relative flex items-center"
              onMouseEnter={() => handleMenuEnter('sale')}
              onMouseLeave={handleMenuLeave}
            >
              <button
                onClick={() => {
                  handleNavClick('sale', 'shop');
                  router.push('/shop?filter=sale');
                }}
                className="hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer py-1 px-1.5"
                title="Sale Offers"
              >
                <span className="font-serif italic font-black text-red-600 text-lg leading-none select-none">Sale</span>
                <span className="text-[9px] font-extrabold tracking-wider text-stone-900 border-b-2 border-red-500 pb-0.5 leading-none uppercase">
                  UP TO 40%
                </span>
                <ChevronDown className="w-2.5 h-2.5 text-stone-600 opacity-60 group-hover:rotate-180 transition-transform ml-0.5" />
              </button>

              {/* SALE Dropdown */}
              {hoveredMenu === 'sale' && (
                <div
                  onMouseEnter={() => handleMenuEnter('sale')}
                  onMouseLeave={handleMenuLeave}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-52 bg-[#FAF3EB] border border-[#E8DCCF] shadow-2xl p-3 text-left normal-case tracking-normal z-50 rounded-b-2xl text-xs animate-in fade-in slide-in-from-top-1.5 duration-200 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                >
                  <ul className="space-y-1 text-xs text-stone-700">
                    {[
                      { label: 'FLAT 10%', discount: 10 },
                      { label: 'FLAT 12%', discount: 12 },
                      { label: 'FLAT 15%', discount: 15 },
                      { label: 'FLAT 20%', discount: 20 },
                      { label: 'FLAT 40%', discount: 40 },
                    ].map((item) => (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={() => {
                            handleNavClick('sale', 'shop');
                            router.push(`/shop?discount=${item.discount}&filter=sale`);
                            setHoveredMenu(null);
                          }}
                          className="w-full text-left text-stone-800 hover:text-[#C86A28] font-bold tracking-wide transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-[#F2E8DC] flex items-center justify-between group"
                        >
                          <span>{item.label}</span>
                          <ArrowRight className="w-3 h-3 text-[#C86A28] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </li>
                    ))}
                    <li className="pt-2 border-t border-[#E8DCCF]">
                      <button
                        type="button"
                        onClick={() => {
                          handleNavClick('sale', 'shop');
                          router.push('/shop?filter=sale');
                          setHoveredMenu(null);
                        }}
                        className="w-full text-left text-[#C86A28] hover:text-[#9A4C16] font-semibold text-[11px] flex items-center justify-between px-2 py-1 group cursor-pointer"
                      >
                        <span>All Sale Frames</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </li>

            {/* 8. CONTACT US */}
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

            {/* 9. ABOUT US */}
            <li className="py-2.5">
              <button
                onClick={() => handleNavClick('about', 'shop')}
                className="hover:text-orange-600 font-semibold transition-colors cursor-pointer text-stone-800"
              >
                ABOUT US
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF3EB] border-t border-[#E8DCCF] px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Patron Profile / Sign In Banner */}
          {!isLoggedIn ? (
            <div className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FAF3EB] border border-[#E8DCCF] flex items-center justify-center text-stone-700">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 leading-tight">Patron Sign In</h4>
                  <p className="text-[10px] text-stone-500">Sign in with Mobile OTP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('/account');
                }}
                className="bg-[#1C1917] hover:bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-2xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#2A1E17] text-[#FAF7F2] flex items-center justify-center text-xs font-bold shadow-2xs">
                    {user.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "PO"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">{user.name || "Alexander Sterling"}</h4>
                    <span className="text-[10px] text-stone-500 block">{user.phone || user.email}</span>
                  </div>
                </div>
                <span className="bg-[#FAF3EB] border border-[#E8DCCF] text-stone-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
                  {user.gemPoints} Pts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E8DCCF]/60 text-[10px]">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-[#FAF3EB] hover:bg-[#F2E8DC] text-stone-800 font-bold py-1.5 px-2.5 rounded-lg text-center transition-colors"
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    toast.success("Signed out successfully");
                  }}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-1.5 px-2.5 rounded-lg text-center transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

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
                openWishlist();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-stone-900 font-bold flex items-center justify-between text-orange-700 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-orange-600" />
                <span>Saved Frames</span>
              </div>
              {wishlistCount > 0 && (
                <span className="bg-orange-600 text-white text-[9px] px-2 py-0.5 rounded-full font-sans">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                closeCart();
                handleNavClick(undefined, 'cart');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-stone-900 font-bold flex items-center justify-between text-orange-700 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                <span>Shopping Cart</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-orange-600 text-white text-[9px] px-2 py-0.5 rounded-full font-sans">
                  {cartCount}
                </span>
              )}
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
              {['Ray-Ban', 'Vogue', 'Carrera', 'Emporio Armani', 'Cooper Vision', 'Johnson & Johnson'].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    const bSlug = b.toLowerCase().replace(/\s+/g, '-');
                    onSelectBrand(bSlug);
                    if (onNavigate) onNavigate('shop');
                    router.push(`/shop?brand=${bSlug}`);
                    setMobileMenuOpen(false);
                  }}
                  className="bg-[#FFFDF9] p-1.5 rounded-sm text-stone-800 text-left border border-[#E8DCCF] font-serif cursor-pointer hover:border-[#C86A28] hover:text-[#C86A28] transition-colors"
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
