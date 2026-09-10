"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export const NeedToKnowSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const items: AccordionItem[] = [
    {
      id: 'sunglasses-range',
      title: 'Range of Sunglasses',
      content: (
        <div className="space-y-3 text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">
          <p>
            Protect your eyes with style. Our sunglasses collection offers 100% UV400 protection against harmful UVA and UVB rays. Choose from polarized lenses that cut glaring reflections, gradient tint options for sophisticated city wear, and photochromic lenses that adapt seamlessly from indoors to outdoors.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-700">
            <li><strong>Popular Shapes:</strong> Aviator, Wayfarer, Round, Cat Eye, Geometric, Rectangle, and Clubmaster.</li>
            <li><strong>Premium Materials:</strong> Handcrafted Italian acetate, ultra-light grade-1 titanium, and gold-plated wireframes.</li>
            <li><strong>Prescription Power Sunglasses:</strong> Custom tailor your corrective power into high-definition sunglass lenses.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'frames-lenses-range',
      title: 'Range of Frames & Lenses',
      content: (
        <div className="space-y-3 text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">
          <p>
            Whether you prefer rimless minimalist frames, lightweight titanium wireframes, or bold full-rim acetate statement pieces, our frame catalogue caters to every face shape and aesthetic.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-white p-3 rounded-xl border border-[#E8DCCF]">
              <h5 className="font-bold text-[#1C1917] text-xs uppercase mb-1">Prescription Lens Types</h5>
              <p className="text-xs text-stone-600">Single Vision (Distance/Reading), Digital Progressives (No-line bifocals), Anti-Fatigue lenses, and High-Index ultra-thin lenses.</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#E8DCCF]">
              <h5 className="font-bold text-[#1C1917] text-xs uppercase mb-1">Advanced Coatings</h5>
              <p className="text-xs text-stone-600">Anti-reflective scratch-proof coating, hydrophobic water-repellent coating, oleophobic smudge protection, and blue-light shielding.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'contact-lenses-range',
      title: 'Range of Contact Lenses',
      content: (
        <div className="space-y-3 text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">
          <p>
            Experience ultimate freedom with high-moisture silicone hydrogel contact lenses that let your eyes breathe comfortably all day long.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-700">
            <li><strong>Modality:</strong> Daily disposables, fortnightly, monthly disposables, and extended wear lenses.</li>
            <li><strong>Specialty Lenses:</strong> Toric lenses for astigmatism, multifocal lenses for presbyopia, and natural color lenses.</li>
            <li><strong>Top Brands:</strong> Acuvue, Bausch & Lomb, Alcon Air Optix, Biofinity, and FreshLook.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'computer-glasses-range',
      title: 'Range of Computer Glasses',
      content: (
        <div className="space-y-3 text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">
          <p>
            Designed specifically for digital screen users, software professionals, gamers, and students. Our computer glasses feature specialized blue light filtering technology that blocks harmful 415-455nm high-energy visible (HEV) light emitted by laptops, smartphones, and LED monitors.
          </p>
          <p>
            Benefits include reduced eye fatigue, elimination of digital headaches, improved contrast clarity, and better sleep quality after nighttime screen usage. Available in zero-power (plain protection) as well as customized prescription powers.
          </p>
        </div>
      ),
    },
    {
      id: 'faqs',
      title: 'Frequently Asked Questions',
      content: (
        <div className="space-y-4 text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">
          <div>
            <h5 className="font-bold text-[#1C1917] text-sm mb-1">How do I submit my lens prescription?</h5>
            <p>You can upload an image of your prescription during checkout, email it to our support team, or select &quot;I will provide prescription later&quot;. Our opticians will verify your prescription before crafting your custom lenses.</p>
          </div>
          <div>
            <h5 className="font-bold text-[#1C1917] text-sm mb-1">What is the 7-day return policy?</h5>
            <p>If you are not 100% satisfied with your order, you can initiate a return or exchange within 7 days of delivery. The product must be unused in its original packaging with tags intact.</p>
          </div>
          <div>
            <h5 className="font-bold text-[#1C1917] text-sm mb-1">How do I book a Zero-Error Clinical Eye Exam?</h5>
            <p>Simply click on &quot;Book Eye Test&quot; in our header to schedule a complimentary 12-step digital refractive examination at any of our 6 luxury boutique clinics with senior optometrists.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-[#FAF7F2] py-14 sm:py-18 px-4 sm:px-6 lg:px-8 border-t border-b border-[#E8DCCF]">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header Matching Figma */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-black text-[#111111] tracking-tight font-sans mb-2">
            Need to <span className="font-serif italic font-normal text-[#C86A28]">Know</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-medium font-sans">
            Get clarity on products, prescription lenses, home testing, and orders.
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="space-y-3.5 sm:space-y-4">
          {items.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-xs border border-[#E8DCCF] overflow-hidden transition-all duration-300 hover:border-[#C86A28]/40"
              >
                {/* Accordion Header Row */}
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#FAF8F5] transition-colors focus:outline-none cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-[#1C1917] tracking-tight font-sans">
                    {item.title}
                  </span>

                  {/* Circle toggle button */}
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? 'rotate-180 bg-[#C86A28] border-[#C86A28] text-white'
                        : 'bg-[#FAF3EB] border-[#E8DCCF] text-stone-700'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Expanded Content */}
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-[#FAF3EB] bg-[#FAF8F5]/50 animate-fadeIn">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
