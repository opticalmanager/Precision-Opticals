"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Instagram, Facebook, ArrowRight, ShieldCheck, Award, Clock } from "lucide-react";
import { LUXURY_BRANDS } from "@/src/data/brands";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onSelectBrand: (brandId: string) => void;
  onNavigate?: (page: "home" | "shop" | "contact" | "appointment" | "wishlist") => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectBrand,
  onNavigate,
}) => {
  const [emailInput, setEmailInput] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Welcome to Precision Privilege", {
      description: "You have been subscribed to exclusive private previews & optical updates.",
    });
    setEmailInput("");
  };

  const handleLinkClick = (page: "home" | "shop" | "contact" | "appointment" | "wishlist", category?: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    if (category) {
      onSelectCategory(category);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#2A1E17] text-[#FAF3EB] font-sans border-t border-orange-500/20">
      {/* Top Value Propositions */}
      <div className="border-b border-stone-800/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3A2C23] border border-[#8A6D3B] text-[#E59B62] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#E59B62]">
                100% AUTHORIZED LUXURY
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Direct official retailer for Cartier, Tom Ford, GAST, Lindberg, and Ray-Ban Meta with manufacturer warranty.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3A2C23] border border-[#8A6D3B] text-[#E59B62] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#E59B62]">
                ESTABLISHED 1969
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Over 5 decades of zero-error clinical precision, robotic lens edging, and certified German optometry labs.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3A2C23] border border-[#8A6D3B] text-[#E59B62] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#E59B62]">
                CLINICAL EYE CARE
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                12-step digital refractive exams in flagship boutiques & doorstep optician consultations across India.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 5-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-2xl font-extrabold uppercase tracking-widest text-[#E59B62]">
              PRECISION OPTICS
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Premier luxury eyewear boutique and clinical eye-care institution since 1969. Handcrafted Japanese titanium frames, Italian block acetate, and Carl Zeiss robotic progressive lens surfacing.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 max-w-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E59B62] block mb-2">
                JOIN THE PRIVILEGE CLUB (10% OFF FIRST ORDER)
              </span>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-[#1C1410] border-stone-700 text-white placeholder:text-stone-500"
                />
                <Button type="submit" variant="primary" size="default" className="shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Col 2: Eyewear Collections */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-[#E59B62] border-b border-stone-800 pb-2">
              Eyewear
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => handleLinkClick("shop", "sunglasses")}
                  className="hover:text-[#E59B62] transition-colors cursor-pointer"
                >
                  Luxury Sunglasses
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick("shop", "eyeglasses")}
                  className="hover:text-[#E59B62] transition-colors cursor-pointer"
                >
                  Prescription Eyeglasses
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick("shop", "meta-smart")}
                  className="hover:text-[#E59B62] transition-colors cursor-pointer"
                >
                  Meta Smart Glasses
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick("shop", "new")}
                  className="hover:text-[#E59B62] transition-colors cursor-pointer"
                >
                  Just Dropped 2026
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick("shop", "kids")}
                  className="hover:text-[#E59B62] transition-colors cursor-pointer"
                >
                  Kids Protective Eyewear
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Luxury Houses */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-[#E59B62] border-b border-stone-800 pb-2">
              Featured Houses
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {LUXURY_BRANDS.slice(0, 5).map((brand) => (
                <li key={brand.id}>
                  <button
                    onClick={() => {
                      onSelectBrand(brand.id);
                      if (onNavigate) onNavigate("shop");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-[#E59B62] transition-colors cursor-pointer"
                  >
                    {brand.name} ({brand.origin})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Clinics & Concierge */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-[#E59B62] border-b border-stone-800 pb-2">
              Optometry Clinics
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => handleLinkClick("appointment")}
                  className="text-[#E59B62] hover:underline font-bold cursor-pointer"
                >
                  Book 12-Step Eye Exam
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick("contact")}
                  className="hover:text-[#E59B62] transition-colors cursor-pointer"
                >
                  Flagship Store - Sector 104, Noida
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick("contact")}
                  className="hover:text-[#E59B62] transition-colors cursor-pointer"
                >
                  Boutique - DLF Golf Course, Gurugram
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick("contact")}
                  className="hover:text-[#E59B62] transition-colors cursor-pointer"
                >
                  Flagship - Indiranagar, Bengaluru
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick("contact")}
                  className="hover:text-[#E59B62] transition-colors cursor-pointer"
                >
                  Contact Master Optician
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="border-t border-stone-800 py-6 px-4 text-center text-[11px] text-stone-500 font-sans">
        <p>© 1969–2026 Precision Optics Ltd. All rights reserved. Authorized luxury retailer & ISO 9001 certified optometric laboratory.</p>
      </div>
    </footer>
  );
};
