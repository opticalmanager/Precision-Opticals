"use client";

import React from 'react';
import { Mail, Phone, ChevronUp, Instagram, Facebook, Twitter } from 'lucide-react';

interface FooterProps {
  onSelectCategory?: (category: string) => void;
  onSelectBrand?: (brandId: string) => void;
  onNavigate?: (page: 'home' | 'shop' | 'contact' | 'appointment' | 'wishlist' | 'about' | 'privacy' | 'cart') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onSelectBrand, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const accountLinks = [
    { label: 'Our Policies', action: () => onNavigate && onNavigate('privacy') },
    { label: 'My Account', action: () => {} },
    { label: 'Create an Account', action: () => {} },
    { label: 'Neu Pass Rewards', action: () => {} },
    { label: 'Precision Circle', action: () => {} },
  ];

  const aboutLinks = [
    { label: 'About Us', action: () => onNavigate && onNavigate('about') },
    { label: 'Blog', action: () => {} },
    { label: 'Contact Us', action: () => onNavigate && onNavigate('contact') },
    { label: 'Privacy Notice', action: () => onNavigate && onNavigate('privacy') },
    { label: 'Terms & Conditions', action: () => onNavigate && onNavigate('privacy') },
    { label: 'Cyber Security Policy', action: () => onNavigate && onNavigate('privacy') },
  ];

  const usefulLinks = [
    { label: 'Store Locations', action: () => onNavigate && onNavigate('contact') },
    { label: 'Bulk Enquiry', action: () => onNavigate && onNavigate('contact') },
    { label: 'Precision Vision App', action: () => {} },
    { label: 'Hearing Aids', action: () => {} },
    { label: 'Exercise Your Rights', action: () => onNavigate && onNavigate('privacy') },
    { label: 'Glossary', action: () => {} },
    { label: 'AI Glasses Manual', action: () => {} },
  ];

  const eyeglassesLinks = [
    { label: 'Men', category: 'eyeglasses' },
    { label: 'Women', category: 'eyeglasses' },
    { label: 'Kids', category: 'kids' },
    { label: 'Fastrack', brand: 'fastrack' },
    { label: 'Rimless', category: 'eyeglasses' },
    { label: 'Titan', brand: 'titan' },
  ];

  const sunglassesLinks = [
    { label: 'Men', category: 'sunglasses' },
    { label: 'Women', category: 'sunglasses' },
    { label: 'Rimless', category: 'sunglasses' },
    { label: 'Fastrack', brand: 'fastrack' },
  ];

  const contactLensesLinks = [
    { label: 'Bausch & Lomb' },
    { label: 'Johnson & Johnson' },
    { label: 'Cooper Vision' },
  ];

  interface LinkItem {
    label: string;
    category?: string;
    brand?: string;
    action?: () => void;
  }

  const handleLinkClick = (item: LinkItem) => {
    if (item.category && onSelectCategory) {
      onSelectCategory(item.category);
    } else if (item.brand && onSelectBrand) {
      onSelectBrand(item.brand);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <footer className="bg-[#2A1E17] text-white pt-14 sm:pt-16 pb-12 sm:pb-14 border-t border-[#3D2C22] font-sans relative">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 6 Column Links Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 text-xs">
          
          {/* Column 1: ACCOUNT */}
          <div>
            <h4 className="font-bold text-[13px] text-[#E59B62] tracking-wider uppercase mb-4 font-serif">
              ACCOUNT
            </h4>
            <ul className="space-y-2.5 text-[#C4B6AA] text-[13px]">
              {accountLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: ABOUT PRECISION OPTICS */}
          <div>
            <h4 className="font-bold text-[13px] text-[#E59B62] tracking-wider uppercase mb-4 font-serif">
              ABOUT PRECISION OPTICS
            </h4>
            <ul className="space-y-2.5 text-[#C4B6AA] text-[13px]">
              {aboutLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: USEFUL LINKS */}
          <div>
            <h4 className="font-bold text-[13px] text-[#E59B62] tracking-wider uppercase mb-4 font-serif">
              USEFUL LINKS
            </h4>
            <ul className="space-y-2.5 text-[#C4B6AA] text-[13px]">
              {usefulLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: EYEGLASSES */}
          <div>
            <h4 className="font-bold text-[13px] text-[#E59B62] tracking-wider uppercase mb-4 font-serif">
              EYEGLASSES
            </h4>
            <ul className="space-y-2.5 text-[#C4B6AA] text-[13px]">
              {eyeglassesLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: SUNGLASSES */}
          <div>
            <h4 className="font-bold text-[13px] text-[#E59B62] tracking-wider uppercase mb-4 font-serif">
              SUNGLASSES
            </h4>
            <ul className="space-y-2.5 text-[#C4B6AA] text-[13px]">
              {sunglassesLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 6: CONTACT LENSES */}
          <div>
            <h4 className="font-bold text-[13px] text-[#E59B62] tracking-wider uppercase mb-4 font-serif">
              CONTACT LENSES
            </h4>
            <ul className="space-y-2.5 text-[#C4B6AA] text-[13px]">
              {contactLensesLinks.map((link, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Section Divider */}
        <div className="pt-8 border-t border-[#3D2C22] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: Brand Logo & Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-serif tracking-wider uppercase text-white">
                PRECISION
              </span>
              <span className="text-2xl font-extrabold font-sans tracking-tight text-[#C86A28]">
                OPTICS
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-[#C4B6AA]">
              <a href="mailto:cs@precisionoptics.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#C86A28]" />
                <span>cs@precisionoptics.com</span>
              </a>

              <a href="tel:18002660123" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#C86A28]" />
                <span>1800-266-0123</span>
              </a>
            </div>

            <p className="text-[11px] text-stone-400 font-normal flex items-center gap-3">
              <span>© {new Date().getFullYear()} Precision Optics Ltd. All Rights Reserved.</span>
              <span>•</span>
              <a href="/admin" className="hover:text-stone-200 transition-colors">
                Staff Portal
              </a>
            </p>
          </div>

          {/* Right Area: Social Icons & Scroll Button */}
          <div className="flex items-center gap-6">
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-stone-300 hidden sm:inline-block">
                Follow us on:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="#instagram"
                  className="w-9 h-9 rounded-full bg-[#3D2C22] hover:bg-[#C86A28] text-white flex items-center justify-center transition-all border border-[#4E392D]"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#facebook"
                  className="w-9 h-9 rounded-full bg-[#3D2C22] hover:bg-[#C86A28] text-white flex items-center justify-center transition-all border border-[#4E392D]"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#twitter"
                  className="w-9 h-9 rounded-full bg-[#3D2C22] hover:bg-[#C86A28] text-white flex items-center justify-center transition-all border border-[#4E392D]"
                  aria-label="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Scroll to Top Circle Button */}
            <div>
              <button
                onClick={scrollToTop}
                className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#2A1E17] flex items-center justify-center shadow-lg hover:bg-[#C86A28] hover:text-white transition-all transform hover:scale-105 cursor-pointer"
                aria-label="Scroll to top"
              >
                <ChevronUp className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </footer>
  );
};
