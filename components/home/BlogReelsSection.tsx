"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, X, ShoppingBag, Volume2, VolumeX, Heart, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';
import { Product } from '@/types';

interface TrendingReelItem {
  id: string;
  brand?: string;
  title: string;
  subtitle?: string;
  badgeStyle?: 'stencil' | 'clean' | 'graffiti' | 'bold';
  image: string;
  videoUrl: string;
  taggedProductId?: string;
  linkUrl?: string;
  linkLabel?: string;
  instagramUrl?: string;
  likes?: string;
}

interface BlogReelsSectionProps {
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

const REEL_DURATION_MS = 10000; // 10 seconds preview per reel before advancing

const DEFAULT_REEL_ITEMS: TrendingReelItem[] = [
  {
    id: 'urban-icons',
    title: 'URBAN ICONS',
    subtitle: 'Built for the ones ahead',
    badgeStyle: 'stencil',
    image: '/images/figma/reel_urban_icons.png',
    videoUrl: '/videos/reels/urban_icons.mp4',
    linkUrl: '/shop?category=sunglasses',
    linkLabel: 'Shop Urban Icons',
    instagramUrl: 'https://www.instagram.com',
  },
  {
    id: 'titanium',
    title: 'Titanium',
    subtitle: 'The Science of Lightness',
    badgeStyle: 'clean',
    image: '/images/figma/reel_titanium.png',
    videoUrl: '/videos/reels/titanium.mp4',
    linkUrl: '/shop?category=eyeglasses',
    linkLabel: 'Shop Titanium',
    instagramUrl: 'https://www.instagram.com',
  },
  {
    id: 'streak-drip',
    title: 'DRIP',
    subtitle: 'Bold street lookbook',
    badgeStyle: 'graffiti',
    image: '/images/figma/reel_drip.png',
    videoUrl: '/videos/reels/drip.mp4',
    linkUrl: '/shop?brand=ray-ban',
    linkLabel: 'Shop Drip Series',
  },
  {
    id: 'flip-ups',
    title: 'Flip-ups',
    subtitle: 'Seamless clip-on transition',
    badgeStyle: 'bold',
    image: '/images/figma/reel_flipups.png',
    videoUrl: '/videos/reels/flipups.mp4',
    linkUrl: '/shop?category=sunglasses',
    linkLabel: 'Shop Flip-ups',
  },
];

export const BlogReelsSection: React.FC<BlogReelsSectionProps> = ({
  products = [],
  onSelectProduct,
}) => {
  const [reels, setReels] = useState<TrendingReelItem[]>(DEFAULT_REEL_ITEMS);

  // Sequential Autoplay & Viewport State
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);

  // Modal State
  const [selectedReelIndex, setSelectedReelIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Load dynamically configured reels from admin settings
  useEffect(() => {
    fetch("/api/admin/settings?key=content")
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data?.value?.reels && Array.isArray(data.value.reels)) {
          const activeReels: TrendingReelItem[] = data.value.reels
            .filter((r: any) => r.active !== false)
            .map((r: any) => ({
              id: r.id || `reel-${Math.random()}`,
              brand: r.brand || "",
              title: r.title || "LOOKBOOK",
              subtitle: r.subtitle || "",
              badgeStyle: r.badgeStyle || "stencil",
              image: r.image || "",
              videoUrl: r.videoUrl || "",
              taggedProductId: r.taggedProductId,
              linkUrl: r.linkUrl || "",
              linkLabel: r.linkLabel || "Shop Look",
              instagramUrl: r.instagramUrl || "",
              likes: r.likes,
            }));
          if (activeReels.length > 0) {
            setReels(activeReels);
          }
        }
      })
      .catch((e) => console.warn("Failed to load reels from settings:", e));
  }, []);

  // Refs
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // Scroll indicators
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 1. Viewport Intersection Observer (Only auto-play when user is viewing the section)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting && entry.intersectionRatio >= 0.25);
      },
      { threshold: [0.1, 0.25, 0.5] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. Center active card in scroll container smoothly
  const centerCard = useCallback((index: number) => {
    const cardEl = cardRefs.current[index];
    const container = scrollRef.current;
    if (!cardEl || !container) return;

    // Check if on smaller screen or if container has overflow
    if (container.scrollWidth > container.clientWidth) {
      const cardLeft = cardEl.offsetLeft;
      const cardWidth = cardEl.clientWidth;
      const containerWidth = container.clientWidth;
      const targetScroll = cardLeft - (containerWidth / 2) + (cardWidth / 2);

      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, []);

  // 3. Play / Pause video elements on activeIndex or viewport changes
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === activeIndex && isInViewport && selectedReelIndex === null && !isUserPaused) {
        video.play().catch(() => {
          // Autoplay policy fallback (silent catch)
        });
      } else {
        video.pause();
        if (idx !== activeIndex) {
          video.currentTime = 0;
        }
      }
    });
  }, [activeIndex, isInViewport, selectedReelIndex, isUserPaused]);

  // 4. Sequential Progress Timer (auto-advances one-by-one, 10s per reel)
  useEffect(() => {
    if (!isInViewport || selectedReelIndex !== null || isHovered || isUserPaused || reels.length === 0) {
      return;
    }

    const intervalStepMs = 40;
    const increment = (intervalStepMs / REEL_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((currentIdx) => {
            const nextIdx = (currentIdx + 1) % reels.length;
            centerCard(nextIdx);
            return nextIdx;
          });
          return 0;
        }
        return prev + increment;
      });
    }, intervalStepMs);

    return () => clearInterval(timer);
  }, [isInViewport, selectedReelIndex, isHovered, isUserPaused, reels.length, centerCard]);

  // 5. Scroll progress calculation
  const updateScrollProgress = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < totalScrollable - 6);
      if (totalScrollable > 0) {
        setScrollProgress((scrollLeft / totalScrollable) * 100);
      } else {
        setScrollProgress(0);
      }
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollProgress();
    el.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);

    const timer = setTimeout(updateScrollProgress, 150);
    return () => {
      el.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      clearTimeout(timer);
    };
  }, [updateScrollProgress]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -310 : 310;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Selected reel for modal
  const selectedReel = selectedReelIndex !== null ? reels[selectedReelIndex] : null;
  const taggedProduct = selectedReel?.taggedProductId
    ? products.find((p) => p.id === selectedReel.taggedProductId)
    : undefined;

  return (
    <section
      ref={sectionRef}
      className="bg-[#FAF7F2] py-8 sm:py-10 md:py-12 border-b border-[#E8DCCF] overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-5 sm:mb-6">
          <span className="text-xs sm:text-sm font-sans font-bold tracking-[3px] text-[#C86A28] uppercase block mb-1">
            CURATED LOOKBOOKS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] tracking-tight uppercase font-sans leading-none">
            NEW &amp; TRENDING
          </h2>
          <p className="mt-1.5 text-xs sm:text-[13px] text-[#4A4A4A] tracking-[1.5px] font-medium uppercase font-sans">
            THE LATEST FRAMES, CRAFTED FOR YOUR LOOK AND LIFESTYLE.
          </p>
        </div>

        {/* Horizontal Reels Track */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex items-center justify-start sm:justify-center gap-4 sm:gap-5 overflow-x-auto scrollbar-none py-1 pb-3 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reels.map((item, index) => {
              const isActive = index === activeIndex;
              const isPassed = index < activeIndex;

              return (
                <div
                  key={item.id}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  onClick={() => setSelectedReelIndex(index)}
                  onMouseEnter={() => {
                    setIsHovered(true);
                    setActiveIndex(index);
                    setProgress(0);
                    setIsUserPaused(false);
                    const v = videoRefs.current[index];
                    if (v) {
                      v.play().catch(() => {});
                    }
                  }}
                  onMouseLeave={() => {
                    setIsHovered(false);
                  }}
                  className={`w-[215px] sm:w-[230px] md:w-[245px] shrink-0 aspect-[9/16] max-h-[435px] rounded-[20px] overflow-hidden relative group cursor-pointer shadow-md transition-all duration-300 ${
                    isActive
                      ? 'ring-2 ring-[#C86A28] shadow-2xl scale-[1.01] -translate-y-1'
                      : 'hover:shadow-xl opacity-95 hover:opacity-100 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Top Story / Reel Progress Bar Segment */}
                  <div className="absolute top-3 left-3.5 right-3.5 z-20 flex items-center gap-1.5">
                    <div className="h-1 flex-1 bg-black/40 backdrop-blur-xs rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all ease-linear rounded-full"
                        style={{
                          width: isActive ? `${progress}%` : isPassed ? '100%' : '0%',
                          transitionDuration: isActive ? '40ms' : '200ms',
                        }}
                      />
                    </div>
                  </div>

                  {/* Autoplay Video Element */}
                  <video
                    ref={(el) => { videoRefs.current[index] = el; }}
                    src={item.videoUrl}
                    poster={item.image}
                    playsInline
                    muted
                    loop
                    preload="metadata"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      isActive && isInViewport ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  />

                  {/* Fallback Master Cropped Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                      isActive && isInViewport ? 'opacity-0' : 'opacity-100'
                    }`}
                    loading="lazy"
                  />

                  {/* Play / Pause Toggle Button Overlay on Hover */}
                  <div className="absolute top-6 right-3.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isActive) {
                          setIsUserPaused(!isUserPaused);
                        } else {
                          setActiveIndex(index);
                          setIsUserPaused(false);
                          setProgress(0);
                        }
                      }}
                      className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#C86A28] transition-colors"
                      aria-label={isUserPaused && isActive ? "Play reel" : "Pause reel"}
                    >
                      {isUserPaused && isActive ? (
                        <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                      ) : (
                        <Pause className="w-3 h-3 fill-white text-white" />
                      )}
                    </button>
                  </div>

                  {/* Bottom Gradient Overlay & Details */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 pt-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent z-20 flex flex-col justify-end">
                    {item.likes && (
                      <div className="flex items-center gap-1 text-white/90 text-[11px] font-semibold mb-0.5">
                        <Heart className="w-3 h-3 text-[#C86A28] fill-[#C86A28]" />
                        <span>{item.likes}</span>
                      </div>
                    )}

                    <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider leading-tight">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-stone-300 text-[10px] line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </p>
                    )}

                    {/* Quick Shop / Destination Action & Instagram Button */}
                    <div className="mt-2 flex items-center gap-1.5 w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.linkUrl) {
                            if (item.linkUrl.startsWith('http://') || item.linkUrl.startsWith('https://')) {
                              window.open(item.linkUrl, '_blank');
                            } else {
                              window.location.href = item.linkUrl;
                            }
                          } else {
                            const prod = products.find((p) => p.id === item.taggedProductId);
                            if (prod && onSelectProduct) {
                              onSelectProduct(prod);
                            } else {
                              setSelectedReelIndex(index);
                            }
                          }
                        }}
                        className="flex-1 min-w-0 bg-[#C86A28] hover:bg-orange-700 text-white py-1.5 px-2.5 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer group-hover:scale-[1.01]"
                      >
                        <ShoppingBag className="w-3 h-3 text-white shrink-0" />
                        <span className="truncate">{item.linkLabel || 'Shop Look'}</span>
                      </button>

                      {item.instagramUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.instagramUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:brightness-110 text-white flex items-center justify-center shrink-0 shadow-md transition-all hover:scale-105 cursor-pointer"
                          title="Watch Reel on Instagram"
                          aria-label="Watch Reel on Instagram"
                        >
                          <Instagram className="w-3.5 h-3.5 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Scrollbar Indicator Bar matching Figma orange scroll */}
          {(canScrollLeft || canScrollRight) && (
            <div className="mt-6 flex items-center gap-3 max-w-md mx-auto px-4">
              <button
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                className={`transition-colors focus:outline-none cursor-pointer ${
                  canScrollLeft ? 'text-[#C86A28] hover:text-orange-700' : 'text-stone-300 cursor-not-allowed opacity-30'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Scroll progress track */}
              <div className="flex-1 h-1 bg-[#D9CDC2] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#E85D04] rounded-full transition-all duration-200"
                  style={{
                    width: '45%',
                    transform: `translateX(${scrollProgress * 1.2}%)`,
                  }}
                />
              </div>

              <button
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                className={`transition-colors focus:outline-none cursor-pointer ${
                  canScrollRight ? 'text-[#C86A28] hover:text-orange-700' : 'text-stone-300 cursor-not-allowed opacity-30'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Full Immersive Video / Reel Story Player Modal */}
      {selectedReel && selectedReelIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1917]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedReelIndex(null)}
        >
          <div
            className="bg-[#1C1917] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-[#E8DCCF]/20 flex flex-col h-[85vh] sm:h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Multi-Story Progress Bars */}
            <div className="absolute top-3 left-4 right-4 z-30 flex items-center gap-1.5">
              {reels.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedReelIndex(idx)}
                  className="h-1 flex-1 bg-white/30 backdrop-blur-xs rounded-full overflow-hidden cursor-pointer"
                >
                  <div
                    className={`h-full bg-white transition-all ${
                      idx === selectedReelIndex
                        ? 'w-full duration-500'
                        : idx < selectedReelIndex
                        ? 'w-full'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Reel Top Bar Controls */}
            <div className="absolute top-6 left-4 right-4 z-30 flex items-center justify-between text-white drop-shadow-md">
              <div className="flex items-center gap-2">
                <span className="bg-[#C86A28] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
                  {selectedReel.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-[#C86A28] transition-colors text-white cursor-pointer"
                  title={isMuted ? "Unmute sound" : "Mute sound"}
                  aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedReelIndex(null)}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-[#C86A28] transition-colors text-white cursor-pointer"
                  aria-label="Close reel viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Arrows inside Modal */}
            {selectedReelIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReelIndex((selectedReelIndex - 1 + reels.length) % reels.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#C86A28] transition-colors cursor-pointer"
                aria-label="Previous reel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {selectedReelIndex < reels.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReelIndex((selectedReelIndex + 1) % reels.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#C86A28] transition-colors cursor-pointer"
                aria-label="Next reel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Video Container */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={modalVideoRef}
                src={selectedReel.videoUrl}
                poster={selectedReel.image}
                playsInline
                autoPlay
                muted={isMuted}
                loop
                className="w-full h-full object-cover"
              />

              {/* Reel Bottom Product & Info Card */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C1917]/95 via-[#1C1917]/70 to-transparent flex flex-col justify-end p-5 sm:p-6 z-20">
                <div className="space-y-1 text-white mb-3">
                  {selectedReel.likes && (
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#C86A28] fill-[#C86A28]" />
                      <span className="text-xs font-semibold">{selectedReel.likes} likes</span>
                    </div>
                  )}
                  <h4 className="text-lg font-black uppercase tracking-wide text-white">
                    {selectedReel.title}
                  </h4>
                  {selectedReel.subtitle && (
                    <p className="text-xs text-stone-300 font-sans">
                      {selectedReel.subtitle}
                    </p>
                  )}
                </div>

                {/* Tagged Product Highlight Card */}
                {taggedProduct ? (
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img
                          src={taggedProduct.images?.[0] || selectedReel.image}
                          alt={taggedProduct.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        {taggedProduct.brand && (
                          <span className="text-[10px] text-stone-300 font-bold uppercase tracking-wider block">
                            {taggedProduct.brand}
                          </span>
                        )}
                        <h5 className="text-xs font-bold text-white line-clamp-1">
                          {taggedProduct.name}
                        </h5>
                        <span className="text-xs font-extrabold text-[#C86A28]">
                          {typeof taggedProduct.price === 'number'
                            ? `₹${taggedProduct.price.toLocaleString('en-IN')}`
                            : taggedProduct.price
                            ? `₹${taggedProduct.price}`
                            : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (onSelectProduct) {
                          onSelectProduct(taggedProduct);
                          setSelectedReelIndex(null);
                        } else if (selectedReel.linkUrl) {
                          window.location.href = selectedReel.linkUrl;
                        }
                      }}
                      className="bg-[#C86A28] hover:bg-orange-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                ) : null}

                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      const destination = selectedReel.linkUrl || (selectedReel.taggedProductId ? `/shop?id=${selectedReel.taggedProductId}` : '/shop');
                      if (destination.startsWith('http://') || destination.startsWith('https://')) {
                        window.open(destination, '_blank');
                      } else {
                        window.location.href = destination;
                      }
                      setSelectedReelIndex(null);
                    }}
                    className="flex-1 bg-[#C86A28] hover:bg-orange-700 text-white py-3.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-white shrink-0" />
                    <span className="truncate">{selectedReel.linkLabel || "SHOP FEATURED COLLECTION"}</span>
                  </button>

                  {selectedReel.instagramUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        window.open(selectedReel.instagramUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:brightness-110 text-white flex items-center justify-center shrink-0 shadow-xl transition-all hover:scale-105 cursor-pointer"
                      title="Watch Reel on Instagram"
                      aria-label="Watch Reel on Instagram"
                    >
                      <Instagram className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
