"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: string;
  brand?: string;
  title?: string;
  subtitle?: string;
  buttonText: string;
  imageUrl: string;
  cdnUrl?: string;
  linkUrl?: string;
  categoryFilter?: string;
  brandFilter?: string;
  accentColor?: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: "theo-eyewear",
    brand: "LUNA & ROSE",
    title: "DESIGNED TO STAND OUT",
    subtitle: "AVANT-GARDE HANDCRAFTED FRAMES • ARTISANAL PINK ROSE TINTS",
    buttonText: "DISCOVER COLLECTION",
    imageUrl: "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789471793256-Gemini_Generated_Image_6qgagl6qgagl6qga-clean.png",
    cdnUrl: "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789471793256-Gemini_Generated_Image_6qgagl6qgagl6qga-clean.png",
    linkUrl: "/shop",
    brandFilter: "theo",
    accentColor: "#E83E00",
  },
  {
    id: "see-beyond",
    brand: "PRECISION OPTICS",
    title: "SEE BEYOND.",
    subtitle: "TIMELESS STYLE • EVERYDAY CONFIDENCE • PREMIUM SUNGLASSES FOR EVERY YOU",
    buttonText: "SHOP NOW",
    imageUrl: "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789471880641-Gemini_Generated_Image_e6jrlde6jrlde6jr-clean.png",
    cdnUrl: "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789471880641-Gemini_Generated_Image_e6jrlde6jrlde6jr-clean.png",
    linkUrl: "/shop",
    categoryFilter: "sunglasses",
    accentColor: "#D4AF37",
  },
  {
    id: "aurora-polarized",
    brand: "AURORA POLARIZED",
    title: "UNCOMPROMISING VISION",
    subtitle: "POLARIZED SERIA • JAPANESE POLARIZED OPTICAL CLARITY",
    buttonText: "EXPLORE POLARIZED",
    imageUrl: "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789471542560-Gemini_Generated_Image_ye1wnmye1wnmye1w-clean.png",
    cdnUrl: "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789471542560-Gemini_Generated_Image_ye1wnmye1wnmye1w-clean.png",
    linkUrl: "/shop",
    categoryFilter: "sunglasses",
    accentColor: "#C86A28",
  },
  {
    id: "new-arrival-aurora",
    brand: "NEW ARRIVAL",
    title: "AURORA EYEWEAR",
    subtitle: "TITANIUM COLLECTION • PRECISION OPTICS LUXURY EYEWEAR",
    buttonText: "SHOP COLLECTION",
    imageUrl: "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789469221574-WhatsApp_Image_2026-09-15_at_10.38.57_AM.jpeg",
    cdnUrl: "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789469221574-WhatsApp_Image_2026-09-15_at_10.38.57_AM.jpeg",
    linkUrl: "/shop",
    categoryFilter: "sunglasses",
    accentColor: "#C86A28",
  },
  {
    id: "eyewear-every-you",
    brand: "EXCLUSIVE AURA",
    title: "EYEWEAR FOR EVERY YOU",
    subtitle: "STYLE THAT SPEAKS • VISION THAT LASTS • UV PROTECTION & LIGHTWEIGHT COMFORT",
    buttonText: "EXPLORE COLLECTION",
    imageUrl: "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789471671927-Gemini_Generated_Image_5f6m7b5f6m7b5f6m-clean__1_.png",
    cdnUrl: "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789471671927-Gemini_Generated_Image_5f6m7b5f6m7b5f6m-clean__1_.png",
    linkUrl: "/shop",
    categoryFilter: "sunglasses",
    accentColor: "#C86A28",
  },
];

interface HeroSliderProps {
  onSelectSlideCategory: (category?: string, brand?: string) => void;
  onOpenAiStylist?: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onSelectSlideCategory }) => {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>(HERO_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Load dynamically configured slides from admin settings
  useEffect(() => {
    fetch("/api/admin/settings?key=content", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        let val = data?.value;
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch {}
        }
        if (data?.success && val?.heroSlides && Array.isArray(val.heroSlides)) {
          const activeSlides: Slide[] = val.heroSlides
            .filter((s: any) => s.active !== false)
            .map((s: any) => ({
              id: s.id || `slide-${Math.random()}`,
              brand: s.brand || "",
              title: s.title || s.buttonText || "",
              subtitle: s.subtitle || "",
              buttonText: s.buttonText || "SHOP NOW",
              imageUrl: s.imageUrl || s.cdnUrl || "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789471793256-Gemini_Generated_Image_6qgagl6qgagl6qga-clean.png",
              cdnUrl: s.cdnUrl || s.imageUrl || "https://pub-4770ee76ded14c04b1a8924c300214b5.r2.dev/banners/1789471793256-Gemini_Generated_Image_6qgagl6qgagl6qga-clean.png",
              linkUrl: s.linkUrl || "",
              categoryFilter: s.categoryFilter,
              brandFilter: s.brandFilter,
              accentColor: s.accentColor || "#C86A28",
            }));

          if (activeSlides.length > 0) {
            setSlides(activeSlides);
          }
        }
      })
      .catch((e) => console.warn("Failed to load hero slides from settings:", e));
  }, []);

  const slideCount = slides.length || 1;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 40;
    if (isSwipe) {
      if (distance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleImageError = (slideId: string) => {
    setImageErrors((prev) => ({ ...prev, [slideId]: true }));
  };

  const handleSlideClick = (slide: Slide) => {
    if (slide.linkUrl) {
      if (slide.linkUrl.startsWith("http://") || slide.linkUrl.startsWith("https://")) {
        window.open(slide.linkUrl, "_blank");
      } else {
        router.push(slide.linkUrl);
      }
    } else if (slide.categoryFilter || slide.brandFilter) {
      onSelectSlideCategory(slide.categoryFilter, slide.brandFilter);
      const params = new URLSearchParams();
      if (slide.categoryFilter) params.set("category", slide.categoryFilter);
      if (slide.brandFilter) params.set("brand", slide.brandFilter);
      router.push(`/shop?${params.toString()}`);
    } else {
      router.push("/shop");
    }
  };

  const safeIndex = currentSlide < slides.length ? currentSlide : 0;

  return (
    <section
      className="relative w-full bg-[#0E0C0A] overflow-hidden group select-none aspect-[1920/700] min-h-[160px] border-b border-[#2A1E17]/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Eyewear Collections"
    >
      {/* Slide Stack */}
      {slides.map((slide, idx) => {
        const isCurrent = idx === safeIndex;
        const imgSrc = imageErrors[slide.id] ? (slide.cdnUrl || slide.imageUrl) : (slide.imageUrl || slide.cdnUrl);

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isCurrent ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Ambient Background Glow (seamless luxury edge blending for ultra-wide displays) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={imgSrc}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover blur-2xl sm:blur-3xl opacity-35 scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/30" />
            </div>

            {/* Main Sharp Hero Banner Graphic (Full-bleed responsive coverage, zero gaps) */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-0">
              <img
                src={imgSrc}
                alt={slide.title || slide.buttonText || "Hero Banner"}
                onError={() => handleImageError(slide.id)}
                onClick={() => handleSlideClick(slide)}
                className="w-full h-full object-cover object-center cursor-pointer transition-transform duration-500 hover:scale-[1.008]"
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          </div>
        );
      })}

      {/* Top Right Slide Counter Badge */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-6 lg:right-10 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/15 text-[11px] font-mono tracking-widest shadow-sm">
        <span className="text-[#E59B62] font-bold">0{safeIndex + 1}</span>
        <span className="text-stone-500">/</span>
        <span className="text-stone-400">0{slideCount}</span>
      </div>

      {/* Prev / Next Navigation Glass Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2.5 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/45 hover:bg-[#C86A28] text-white/90 hover:text-white backdrop-blur-md transition-all border border-white/20 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C86A28]"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2.5 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/45 hover:bg-[#C86A28] text-white/90 hover:text-white backdrop-blur-md transition-all border border-white/20 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C86A28]"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Slide Progress Dots (Centered, Clean) */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === safeIndex
                  ? "bg-[#C86A28] w-6"
                  : "bg-white/40 w-2 hover:bg-white/75"
              }`}
              aria-label={`Navigate to Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
