"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Sparkles,
  Award,
  Cpu,
  Glasses,
  BadgeDollarSign,
  Mail,
  Phone,
  MapPin,
  Globe2,
  Building2,
  ArrowRight,
} from "lucide-react";

interface AboutUsPageProps {
  onNavigateHome?: () => void;
  onNavigateShop?: () => void;
  onNavigateContact?: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  onNavigateHome,
  onNavigateShop,
  onNavigateContact,
}) => {
  // Image error handling with fallback to Cloudflare R2 public CDN
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImgError = (key: string) => {
    setImgErrors((prev) => ({ ...prev, [key]: true }));
  };

  const R2_BASE = "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/about";

  const getImgSrc = (key: string, localPath: string, filename: string) => {
    if (imgErrors[key]) {
      return `${R2_BASE}/${filename}`;
    }
    return localPath;
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#2A1E17] font-sans pb-24 pt-4 sm:pt-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-stone-500 font-semibold">
          <button
            onClick={() => onNavigateHome && onNavigateHome()}
            className="hover:text-[#C86A28] font-bold cursor-pointer transition-colors"
          >
            HOME
          </button>
          <span>/</span>
          <span className="text-[#C86A28] font-bold">ABOUT PRECISION OPTICS</span>
        </div>
      </div>

      {/* Main Luxury Container matching Figma 106:8153 */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#EBE6DF] p-6 sm:p-10 lg:p-14 shadow-sm space-y-16 sm:space-y-20">
          
          {/* ========================================================================= */}
          {/* SECTION 1: OUR BRAND */}
          {/* ========================================================================= */}
          <section id="our-brand" className="space-y-6 sm:space-y-8">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.08em] text-[#2A1E17] uppercase pb-4 border-b border-[#E8DCCF]">
              OUR BRAND
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Typewriter Graphic Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[390px] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DCCF] p-4 flex items-center justify-center group shadow-2xs hover:shadow-md transition-all duration-300">
                  <img
                    src={getImgSrc("typewriter", "/images/about/about_brand_typewriter.png", "about_brand_typewriter.png")}
                    alt="Precision Optics Brand Heritage Typewriter"
                    onError={() => handleImgError("typewriter")}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Right Column: 3 Paragraphs */}
              <div className="lg:col-span-7 space-y-4 text-stone-700 text-xs sm:text-[13.5px] leading-relaxed">
                <p>
                  Founded to bring uncompromising master-grade optical precision and bespoke craftsmanship to luxury eyewear, Precision Optics was born out of a relentless passion to make a true difference in the optical world. We are today one of India&apos;s fastest growing luxury eyewear destinations.
                </p>
                <p>
                  United with a vision to add authentic value into every customer&apos;s life, the founders set out to dismantle the traditional optical markup chain. By eliminating multi-tier middlemen, establishing our own high-precision state-of-the-art laboratory, and supplying directly to the consumer, we not only cut artificial retail premiums, but also delivered medical-grade optical standards supported with in-house robotic lens manufacturing and assembly ensuring 100% precision and top quality control.
                </p>
                <p>
                  With a rapidly growing patronage reaching thousands of discerning connoisseurs every month via a unique combination of a strong digital boutique and thoughtfully curated flagship ateliers, Precision Optics is revolutionizing the luxury eyewear experience across India and beyond.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 2: GREAT QUALITY */}
          {/* ========================================================================= */}
          <section id="great-quality" className="space-y-6 sm:space-y-8 pt-4">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.08em] text-[#2A1E17] uppercase pb-4 border-b border-[#E8DCCF]">
              GREAT QUALITY
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Quality Details */}
              <div className="lg:col-span-7 space-y-6 text-stone-700 text-xs sm:text-[13.5px] leading-relaxed">
                <div className="space-y-2">
                  <h3 className="font-bold text-[#2A1E17] text-sm sm:text-base font-serif">
                    Made by robots
                  </h3>
                  <p>
                    We are India&apos;s first and the only luxury brand to use advanced robotic edging techniques that deliver prescription glasses accurate to 3 decimal places (0.001mm). These machines, imported directly from Germany, ensure absolute perfection on all fronts: an automated digital sensor system that inspects lenses, determines the exact 3D pupillary geometric center, and loads the lenses for edging without the need of an abrasive finishing block.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-[#2A1E17] text-sm sm:text-base font-serif">
                    Mind of machine &amp; human craftsmanship
                  </h3>
                  <p>
                    Our master opticians and robotic technicians have zero tolerance to optical error. Every lens undergoes dual-surface laser mapping and UV400 verification, while our optical concierge team is trained to solve complex vision queries, optimize multifocal progressions, and tailor every frame to your facial anatomy.
                  </p>
                </div>
              </div>

              {/* Right Column: Robotic Arm Graphic Card */}
              <div className="lg:col-span-5 flex justify-center order-first lg:order-last">
                <div className="w-full max-w-[390px] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DCCF] p-4 flex items-center justify-center group shadow-2xs hover:shadow-md transition-all duration-300">
                  <img
                    src={getImgSrc("robot", "/images/about/about_quality_robot.png", "about_quality_robot.png")}
                    alt="Precision Optics German Robotic Accuracy 0.001mm"
                    onError={() => handleImgError("robot")}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 3: VARIETY */}
          {/* ========================================================================= */}
          <section id="variety" className="space-y-6 sm:space-y-8 pt-4">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.08em] text-[#2A1E17] uppercase pb-4 border-b border-[#E8DCCF]">
              VARIETY
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Variety Description */}
              <div className="lg:col-span-7 space-y-5 text-stone-700 text-xs sm:text-[13.5px] leading-relaxed">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#2A1E17] text-sm sm:text-base font-serif">
                    We let the numbers talk.
                  </h3>
                  <p>
                    We curate over 5,000+ exquisite styles of eyewear, which is 5 times more variety than any conventional optical retailer in India. From world-renowned heritage fashion houses like Ray-Ban, Oakley, Tom Ford, and Jacques Marie Mage to our handcrafted in-house Precision Atelier series.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#2A1E17] text-sm sm:text-base font-serif">
                    An eye for an eye
                  </h3>
                  <p>
                    From high-contrast polarized sunglasses to blue-light filtering computer glasses, photochromic transitions, and German-calibrated progressive lenses, we craft every optical solution designed to help you see the world with breathtaking clarity.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#2A1E17] text-sm sm:text-base font-serif">
                    We got the whole world
                  </h3>
                  <p>
                    Yes, it is true: we engineer eyewear tailored for men, women, teenagers, and kids — calibrated with adjustable hypoallergenic titanium nose pads and ergonomic temple curvatures engineered for all facial dimensions.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#2A1E17] text-sm sm:text-base font-serif">
                    All covered
                  </h3>
                  <p>
                    We have it all: everyday minimalist staples, boardroom authority frames, haute-couture runway sunglasses, and vintage aviators. Not just that, we update our collections each season taking inspiration from global fashion capitals and world-renowned optical designers.
                  </p>
                </div>
              </div>

              {/* Right Column: Eyewear Stack Graphic Card */}
              <div className="lg:col-span-5 flex justify-center order-first lg:order-last">
                <div className="w-full max-w-[390px] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DCCF] p-4 flex items-center justify-center group shadow-2xs hover:shadow-md transition-all duration-300">
                  <img
                    src={getImgSrc("variety", "/images/about/about_variety_stack.png", "about_variety_stack.png")}
                    alt="Precision Optics Frame Silhouette Variety"
                    onError={() => handleImgError("variety")}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 4: VALUE FOR MONEY */}
          {/* ========================================================================= */}
          <section id="value-for-money" className="space-y-6 sm:space-y-8 pt-4">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.08em] text-[#2A1E17] uppercase pb-4 border-b border-[#E8DCCF]">
              VALUE FOR MONEY
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Value Description */}
              <div className="lg:col-span-7 space-y-6 text-stone-700 text-xs sm:text-[13.5px] leading-relaxed">
                <div className="space-y-2">
                  <h3 className="font-bold text-[#2A1E17] text-sm sm:text-base font-serif">
                    Not all good things in the world are expensive
                  </h3>
                  <p>
                    Our direct-to-consumer atelier prices are significantly lower than any high-street local optician or luxury department store. Our customers enjoy transparent pricing, free digital lens coatings, and the most attractive luxury packages on prescription frames and contact lenses.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-[#2A1E17] text-sm sm:text-base font-serif">
                    No middle man. No extra cost.
                  </h3>
                  <p>
                    No middleman simply means no middle ground. Our frames and custom digital lenses come straight from our optical laboratory and European/Japanese partner workshops to you, completely eliminating distributor markups, import agents, and excessive showroom overheads.
                  </p>
                </div>
              </div>

              {/* Right Column: Value Direct Atelier Graphic Card */}
              <div className="lg:col-span-5 flex justify-center order-first lg:order-last">
                <div className="w-full max-w-[390px] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DCCF] p-4 flex items-center justify-center group shadow-2xs hover:shadow-md transition-all duration-300">
                  <img
                    src={getImgSrc("value", "/images/about/about_value_atelier.png", "about_value_atelier.png")}
                    alt="Precision Optics Direct Atelier Value"
                    onError={() => handleImgError("value")}
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 5: CONTACT US */}
          {/* ========================================================================= */}
          <section id="contact-details" className="space-y-6 pt-4">
            <div className="flex flex-row items-center justify-between pb-4 border-b border-[#E8DCCF]">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.08em] text-[#2A1E17] uppercase">
                CONTACT US
              </h2>
              {onNavigateContact && (
                <button
                  onClick={onNavigateContact}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#C86A28] hover:text-[#9F4810] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>OPEN CONTACT DESK</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Structured Company Information Key-Value Rows */}
            <div className="divide-y divide-[#F0ECE6] text-xs sm:text-sm">
              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 font-bold text-[#2A1E17]">
                  Company Name :
                </span>
                <span className="sm:col-span-8 text-stone-700 font-medium">
                  Precision Optics Private Limited
                </span>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 font-bold text-[#2A1E17]">
                  E-mail Address :
                </span>
                <div className="sm:col-span-8 flex flex-wrap gap-2 text-[#C86A28]">
                  <a
                    href="mailto:concierge@precisionoptics.in"
                    className="hover:underline font-medium"
                  >
                    concierge@precisionoptics.in
                  </a>
                  <span className="text-stone-400">/</span>
                  <a
                    href="mailto:support@precisionoptics.in"
                    className="hover:underline font-medium"
                  >
                    support@precisionoptics.in
                  </a>
                </div>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 font-bold text-[#2A1E17]">
                  Contact Number :
                </span>
                <div className="sm:col-span-8 flex flex-wrap gap-2 text-stone-800">
                  <a
                    href="tel:+919999899998"
                    className="hover:text-[#C86A28] font-medium"
                  >
                    +91 99998 99998
                  </a>
                  <span className="text-stone-400">/</span>
                  <a
                    href="tel:18006784275"
                    className="hover:text-[#C86A28] font-medium"
                  >
                    1800-OPTICS-LUX
                  </a>
                </div>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 font-bold text-[#2A1E17]">
                  Address :
                </span>
                <span className="sm:col-span-8 text-stone-700 leading-relaxed">
                  Plot No. 151, Okhla Industrial Estate, Phase III, New Delhi, 110020 &amp; Precision Optics Atelier, 100ft Road Indiranagar, Bengaluru, 560038
                </span>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-4 font-bold text-[#2A1E17]">
                  Country :
                </span>
                <span className="sm:col-span-8 text-stone-700 font-medium">
                  India
                </span>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 6: READY TO EXPERIENCE PRECISION OPTICS CTA */}
          {/* ========================================================================= */}
          <div className="rounded-2xl bg-[#FFF8F2] border border-[#F3E2D0] p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2A1E17]">
                Ready to Experience Precision Optics?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed">
                Discover over 5,000+ luxury eyewear frames handcrafted with German robotic accuracy.
              </p>
            </div>

            {onNavigateShop && (
              <button
                onClick={onNavigateShop}
                className="px-6 py-3.5 rounded-xl bg-[#C86A28] hover:bg-[#B05B1E] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0 flex items-center gap-2 group"
              >
                <span>EXPLORE CATALOG</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
