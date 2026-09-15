"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Heart,
  Glasses,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  MessageCircle,
  Share2,
  Camera
} from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatINR } from "@/utils/formatters";
import { ImageWithFallback } from "../common/ImageWithFallback";
import { ProductCard } from "../shop/ProductCard";
import { hasTryOnModel } from "@/lib/try-on/products/TryOnProductConfig";

interface ProductDetailPageProps {
  product: Product;
  onClose: () => void;
  onOpenVirtualTryOn: (product: Product) => void;
  onOpenLensCustomizer: (product: Product) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateToCart?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onClose,
  onOpenVirtualTryOn,
  onOpenLensCustomizer,
  allProducts,
  onSelectProduct,
  onNavigateToCart,
}) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCartDirect } = useCart();
  const { addToast } = useToast();

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Accordions state
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    about: false,
    pledge: false,
    shipping: false
  });

  const toggleAccordion = useCallback((key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const saved = isWishlisted(product.id);

  const selectedVariant =
    product.variants && product.variants.length > 0
      ? product.variants[selectedVariantIdx]
      : undefined;

  // Images list: ensure at least 4 views for smooth Figma carousel dots
  const imagesToDisplay = useMemo(() => {
    let list: string[] = [];
    if (selectedVariant?.image) {
      list.push(selectedVariant.image);
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    if (list.length === 0) {
      list.push("/images/products/figma_cartier_blue_rimless.png");
    }
    if (list.length === 1) {
      list = [list[0], list[0], list[0], list[0]];
    } else if (list.length === 2) {
      list = [list[0], list[1], list[0], list[1]];
    } else if (list.length === 3) {
      list = [list[0], list[1], list[2], list[0]];
    }
    return list;
  }, [product, selectedVariant]);

  const currentImage = imagesToDisplay[activeImgIdx] || imagesToDisplay[0];

  const handlePrevImage = useCallback(() => {
    setActiveImgIdx((prev) => (prev > 0 ? prev - 1 : imagesToDisplay.length - 1));
  }, [imagesToDisplay.length]);

  const handleNextImage = useCallback(() => {
    setActiveImgIdx((prev) => (prev < imagesToDisplay.length - 1 ? prev + 1 : 0));
  }, [imagesToDisplay.length]);

  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [allProducts, product.id]);

  const handleAddToCart = () => {
    addToCartDirect(product, selectedVariant);
    addToast(
      "Added to Cart",
      `${product.brand} - ${product.name} has been added to your shopping bag.`,
      "success"
    );
    if (onNavigateToCart) {
      onNavigateToCart();
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("FLAT12");
    setCopiedCoupon(true);
    addToast(
      "Coupon Copied",
      "Coupon code FLAT12 copied to clipboard. 12% off will be applied at checkout!",
      "success"
    );
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(
      `Hi Precision Optics, I am inquiring about ${product.brand} - ${product.name} (Price: ${formatINR(product.price)}). Could you provide live photos and styling guidance?`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
  };

  const handleWhatsAppPrescription = () => {
    const text = encodeURIComponent(
      `Hi Precision Optics, I would like to add prescription lenses (Zeiss / Essilor / Nikon) for the ${product.brand} - ${product.name}. Here is my spectacle prescription:`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${product.brand} - ${product.name}`,
          text: product.description,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast("Link Copied", "Product link copied to clipboard.", "success");
    }
  };

  const formattedMaterial = product.material
    ? product.material
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Metal";

  const formattedShape = product.shape
    ? product.shape.charAt(0).toUpperCase() + product.shape.slice(1)
    : "Aviator";

  const countryOfOrigin =
    product.brand.toLowerCase() === "cartier" || product.brand.toLowerCase() === "lindberg"
      ? "Japan / France"
      : "Italy";

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#2A1E17] font-sans antialiased selection:bg-[#C86A28] selection:text-white">
      {/* 1. Breadcrumb Trail */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-5 pb-3"
      >
        <ol className="flex items-center space-x-2 text-[11px] text-[#736B63] font-sans">
          <li>
            <button
              onClick={onClose}
              className="hover:text-[#2A1E17] transition-colors cursor-pointer"
            >
              Home
            </button>
          </li>
          <li className="text-stone-400">/</li>
          <li>
            <button
              onClick={onClose}
              className="uppercase tracking-wider hover:text-[#2A1E17] transition-colors cursor-pointer"
            >
              {product.brand}
            </button>
          </li>
          <li className="text-stone-400">/</li>
          <li
            className="font-medium text-[#2A1E17] truncate max-w-[220px] sm:max-w-md"
            aria-current="page"
          >
            {product.name}
          </li>
        </ol>
      </nav>

      {/* 2. Main Product Showcase Stage */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Gallery & Accordions (Span 7) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            {/* White Rounded Main Image Card */}
            <div className="bg-white rounded-[16px] border border-[#E8DCCF] w-full min-h-[440px] sm:min-h-[480px] lg:h-[510px] relative flex items-center justify-center p-4 sm:p-6 shadow-2xs group overflow-hidden">
              {/* Floating Wishlist Heart Button */}
              <button
                onClick={() => toggleWishlist(product.id, product.name)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E8DCCF] text-[#2A1E17] flex items-center justify-center shadow-xs transition-all duration-200 cursor-pointer hover:scale-105 z-10"
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    saved ? "fill-[#C86A28] text-[#C86A28]" : "text-stone-600 hover:text-[#C86A28]"
                  }`}
                />
              </button>

              {/* Eyewear Image with Bold Luxury Scale */}
              <div className="w-full h-full flex items-center justify-center">
                <ImageWithFallback
                  src={currentImage}
                  alt={`${product.brand} - ${product.name}`}
                  className="w-[88%] sm:w-[92%] h-auto max-h-[85%] object-contain transform transition-transform duration-500 group-hover:scale-105 select-none"
                  fallbackSrc="/images/products/figma_cartier_blue_rimless.png"
                />
              </div>
            </div>

            {/* Pagination Controls: Chevrons & Dots */}
            <div className="flex items-center justify-center gap-6 py-1 select-none">
              <button
                onClick={handlePrevImage}
                className="p-2 text-stone-600 hover:text-[#2A1E17] transition-colors cursor-pointer"
                aria-label="Previous view"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5">
                {imagesToDisplay.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      activeImgIdx === idx
                        ? "bg-[#2A1E17] scale-110"
                        : "border border-stone-400 bg-transparent hover:border-stone-700"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextImage}
                className="p-2 text-stone-600 hover:text-[#2A1E17] transition-colors cursor-pointer"
                aria-label="Next view"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Information Accordions */}
            <div className="border-t border-[#E8DCCF] divide-y divide-[#E8DCCF] pt-2">
              {/* Accordion 1: About Us */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion("about")}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[#2A1E17] hover:text-[#C86A28] transition-colors cursor-pointer"
                >
                  <span>ABOUT US</span>
                  {openAccordions.about ? (
                    <Minus className="w-4 h-4 text-stone-500" />
                  ) : (
                    <Plus className="w-4 h-4 text-stone-500" />
                  )}
                </button>
                {openAccordions.about && (
                  <div className="pt-3.5 pb-1 text-xs sm:text-sm leading-relaxed text-stone-600 font-normal animate-in fade-in duration-200">
                    Precision Optics is India&apos;s premier luxury optical boutique. Since 1998,
                    we have curated the world&apos;s most prestigious eyewear houses, delivering
                    master craftsmanship, state-of-the-art vision care, and bespoke optical solutions
                    engineered with European optical precision.
                  </div>
                )}
              </div>

              {/* Accordion 2: The Precision Pledge */}
              <div className="py-4">
                <button
                  onClick={() => toggleAccordion("pledge")}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[#2A1E17] hover:text-[#C86A28] transition-colors cursor-pointer"
                >
                  <span>THE PRECISION PLEDGE | AUTHENTICITY &amp; WARRANTY</span>
                  {openAccordions.pledge ? (
                    <Minus className="w-4 h-4 text-stone-500" />
                  ) : (
                    <Plus className="w-4 h-4 text-stone-500" />
                  )}
                </button>
                {openAccordions.pledge && (
                  <div className="pt-3.5 pb-1 text-xs sm:text-sm leading-relaxed text-stone-600 font-normal animate-in fade-in duration-200">
                    Every pair sold at Precision Optics is 100% authentic, sourced directly from
                    certified brand distributors with original certificate of authenticity, branded
                    protective hard case, microfiber cloth, and a 1-year manufacturer warranty
                    covering manufacturing defects.
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div className="py-4 border-b border-[#E8DCCF]">
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[#2A1E17] hover:text-[#C86A28] transition-colors cursor-pointer"
                >
                  <span>SHIPPING &amp; RETURNS</span>
                  {openAccordions.shipping ? (
                    <Minus className="w-4 h-4 text-stone-500" />
                  ) : (
                    <Plus className="w-4 h-4 text-stone-500" />
                  )}
                </button>
                {openAccordions.shipping && (
                  <div className="pt-3.5 pb-1 text-xs sm:text-sm leading-relaxed text-stone-600 font-normal animate-in fade-in duration-200">
                    Complimentary express insured courier delivery across India within 48 to 72 hours.
                    We offer a hassle-free 7-day exchange policy for unused frames with original
                    packaging intact. Prescription lenses are custom-manufactured to diopter
                    specifications and backed by our Vision Clarity Guarantee.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Buying Actions & Specifications (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col space-y-3.5 sm:space-y-4">
            {/* Brand & Title */}
            <div>
              <span className="font-sans text-[12px] sm:text-[13px] font-normal uppercase tracking-[0.2em] text-[#2A1E17] block mb-1">
                {product.brand}
              </span>
              <h1 className="font-sans text-[24px] sm:text-[28px] font-normal uppercase tracking-[0.03em] text-[#2A1E17] leading-[1.25]">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="font-sans text-[17px] font-normal text-[#2A1E17]">
              {formatINR(product.price)}.00 INR
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-stone-400 line-through ml-3 font-normal">
                  {formatINR(product.originalPrice)}.00 INR
                </span>
              )}
            </div>

            {/* Colorway Variant Selection (if available) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-1.5 pt-0.5">
                <span className="font-sans text-[11px] font-medium text-[#2A1E17] uppercase tracking-wider block">
                  Color:{" "}
                  <span className="font-normal text-stone-600">
                    {product.variants[selectedVariantIdx]?.colorName}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  {product.variants.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantIdx(idx);
                        setActiveImgIdx(0);
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                        selectedVariantIdx === idx
                          ? "border-[#C86A28] ring-2 ring-[#C86A28]/30 scale-110"
                          : "border-stone-300 opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: v.colorHex }}
                      title={v.colorName}
                    >
                      {selectedVariantIdx === idx && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action: ADD TO CART */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#3D312A] hover:bg-[#2A1E17] text-white py-3.5 px-6 font-sans font-medium text-[12px] sm:text-[13px] uppercase tracking-[0.16em] transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.99] text-center"
            >
              ADD TO CART
            </button>

            {/* 3D Virtual Try-On - Exclusively for products with .glb models */}
            {hasTryOnModel(product) && (
              <button
                onClick={() => onOpenVirtualTryOn(product)}
                className="w-full bg-[#FAF7F2] hover:bg-[#F4EBE1] border-2 border-[#C86A28] text-[#2A1E17] py-3.5 px-6 font-sans font-semibold text-[12px] sm:text-[13px] uppercase tracking-[0.14em] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <Camera className="w-4 h-4 text-[#C86A28]" />
                <span>3D VIRTUAL TRY-ON (LIVE MIRROR)</span>
              </button>
            )}

            {/* Secondary Action: ADD PRESCRIPTION LENSES */}
            <button
              onClick={() => onOpenLensCustomizer(product)}
              className="w-full bg-[#FAF3EB] hover:bg-[#F4E9DD] border border-[#E8DCCF] text-[#2A1E17] py-3 px-4 font-sans font-normal text-[11px] sm:text-[12px] uppercase tracking-[0.08em] transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <Glasses className="w-4 h-4 text-[#C86A28]" />
              <span>ADD PRESCRIPTION LENSES (NIKON • ZEISS • ESSILOR)</span>
            </button>

            {/* Coupon Box */}
            <div className="bg-[#FAF3EB] border border-[#E8DCCF] p-3 sm:p-3.5 flex items-center justify-between font-sans text-[12px] text-[#2A1E17]">
              <div>
                <span>Use code </span>
                <span className="font-bold text-[#C86A28]">FLAT12</span>
                <span> for 12% off your order</span>
              </div>
              <button
                onClick={handleCopyCoupon}
                className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#2A1E17] hover:text-[#C86A28] transition-colors cursor-pointer"
              >
                {copiedCoupon ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges: Fast Shipping, Secure Payment, 7-Day Exchange */}
            <div className="border border-[#E8DCCF] bg-white grid grid-cols-3 divide-x divide-[#E8DCCF] py-3 px-1 sm:px-2">
              <div className="flex flex-col items-center justify-center text-center px-1">
                <Truck className="w-5 h-5 text-[#2A1E17] mb-1" />
                <span className="font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]">
                  FAST SHIPPING
                </span>
                <span className="font-sans text-[9px] sm:text-[10px] text-stone-500 mt-0.5">Ships in 48-72 Hrs</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center px-1">
                <ShieldCheck className="w-5 h-5 text-[#2A1E17] mb-1" />
                <span className="font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]">
                  SECURE PAYMENT
                </span>
                <span className="font-sans text-[9px] sm:text-[10px] text-stone-500 mt-0.5">100% Safe Checkout</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center px-1">
                <RotateCcw className="w-5 h-5 text-[#2A1E17] mb-1" />
                <span className="font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]">
                  7-DAY EXCHANGE
                </span>
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="font-sans text-[9px] sm:text-[10px] text-stone-500 underline hover:text-[#C86A28] mt-0.5 cursor-pointer"
                >
                  View Policy
                </button>
              </div>
            </div>

            {/* WhatsApp Concierge Banner */}
            <button
              onClick={handleWhatsAppChat}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 flex items-center justify-center gap-2 font-sans font-normal text-[12px] sm:text-[13px] transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Have questions or need live pictures? Chat with us.</span>
            </button>

            {/* Rating & Reviews Row */}
            <div className="border border-[#E8DCCF] bg-white px-4 py-2 flex items-center justify-between font-sans text-[12px]">
              <div className="flex items-center gap-1.5 text-[#2A1E17]">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-[#2A1E17] text-[#2A1E17]"
                    />
                  ))}
                </div>
                <span className="font-bold ml-1">5/5</span>
              </div>
              <button
                onClick={() =>
                  addToast(
                    "Client Reviews",
                    "Over 424 certified luxury clients verified this model with a 5-star rating.",
                    "info"
                  )
                }
                className="text-stone-600 underline hover:text-[#2A1E17] transition-colors cursor-pointer"
              >
                424 reviews
              </button>
            </div>

            {/* Specifications Section: INFORMATION */}
            <div className="pt-1">
              <h2 className="font-sans text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.18em] text-[#2A1E17] mb-2">
                INFORMATION
              </h2>
              <div className="border border-[#E8DCCF] bg-white divide-y divide-[#E8DCCF] font-sans text-[11px]">
                <div className="grid grid-cols-2 px-3.5 py-2">
                  <span className="text-stone-500 font-normal">Lens Size</span>
                  <span className="font-bold text-right text-[#2A1E17]">
                    {product.specs?.lensWidth || 56} mm
                  </span>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2">
                  <span className="text-stone-500 font-normal">Nose Bridge Length</span>
                  <span className="font-bold text-right text-[#2A1E17]">
                    {product.specs?.bridgeWidth || 16} mm
                  </span>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2">
                  <span className="text-stone-500 font-normal">Temple Length</span>
                  <span className="font-bold text-right text-[#2A1E17]">
                    {product.specs?.templeLength || 140} mm
                  </span>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2">
                  <span className="text-stone-500 font-normal">Gender</span>
                  <span className="font-bold text-right text-[#2A1E17] uppercase">
                    {product.gender || "MEN"}
                  </span>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2">
                  <span className="text-stone-500 font-normal">Material</span>
                  <span className="font-bold text-right text-[#2A1E17]">
                    {formattedMaterial}
                  </span>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2">
                  <span className="text-stone-500 font-normal">Shape</span>
                  <span className="font-bold text-right text-[#2A1E17]">
                    {formattedShape}
                  </span>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2">
                  <span className="text-stone-500 font-normal">Country of Origin</span>
                  <span className="font-bold text-right text-[#2A1E17]">
                    {countryOfOrigin}
                  </span>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2">
                  <span className="text-stone-500 font-normal">Front Colour</span>
                  <span className="font-bold text-right text-[#2A1E17]">
                    {product.color || "Gunmetal Silver"} / Dark Grey Lens
                  </span>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2">
                  <span className="text-stone-500 font-normal">Temple Colour</span>
                  <span className="font-bold text-right text-[#2A1E17]">
                    {product.color || "Gunmetal Silver"} / Dark Grey Lens
                  </span>
                </div>
                <div className="grid grid-cols-2 px-3.5 py-2">
                  <span className="text-stone-500 font-normal">Lens Colour</span>
                  <span className="font-bold text-right text-[#2A1E17]">Grey</span>
                </div>

                {/* Style Tip Guidance Block */}
                <div className="px-3.5 py-2.5 bg-[#FAF7F2] text-[11px] text-stone-600 leading-relaxed font-sans">
                  <span className="font-bold text-[#2A1E17]">Style Tip: </span>
                  This shape is best suited for an{" "}
                  {product.shape === "aviator"
                    ? "oval or round"
                    : product.shape === "round"
                    ? "angular or square"
                    : product.shape === "cat-eye"
                    ? "oval or diamond"
                    : "oval or round"}{" "}
                  face while it goes well with most face shapes. To learn more, please refer to our
                  shape and style guide.
                </div>
              </div>
            </div>

            {/* Share Row */}
            <div className="flex items-center gap-4 pt-1 font-sans text-[11px] font-bold text-stone-500 uppercase tracking-widest">
              <span>SHARE</span>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <button
                  onClick={handleShare}
                  className="w-7 h-7 rounded-full bg-white border border-[#E8DCCF] flex items-center justify-center text-stone-700 hover:text-[#C86A28] hover:border-[#C86A28] transition-colors cursor-pointer"
                  title="Share on Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>

                {/* X (formerly Twitter) */}
                <button
                  onClick={handleShare}
                  className="w-7 h-7 rounded-full bg-white border border-[#E8DCCF] flex items-center justify-center text-stone-700 hover:text-[#C86A28] hover:border-[#C86A28] transition-colors cursor-pointer"
                  title="Share on X"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>

                {/* Pinterest */}
                <button
                  onClick={handleShare}
                  className="w-7 h-7 rounded-full bg-white border border-[#E8DCCF] flex items-center justify-center text-stone-700 hover:text-[#C86A28] hover:border-[#C86A28] transition-colors cursor-pointer"
                  title="Share on Pinterest"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.535.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </button>

                {/* Direct Share / Copy */}
                <button
                  onClick={handleShare}
                  className="w-7 h-7 rounded-full bg-white border border-[#E8DCCF] flex items-center justify-center text-stone-700 hover:text-[#C86A28] hover:border-[#C86A28] transition-colors cursor-pointer"
                  title="Copy link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Prescription Lenses Feature Banner */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 mt-12 sm:mt-16 mb-14">
        <div className="border border-[#E8DCCF] bg-white overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Left Column: Snellen Eye Chart (3 Columns) */}
          <div className="md:col-span-3 bg-[#F5EFE6] border-b md:border-b-0 md:border-r border-[#E8DCCF] flex flex-col justify-between p-6 sm:p-8 min-h-[220px]">
            <div className="flex items-center justify-center h-full py-4">
              <img
                src="/images/pdp-snellen.png"
                alt="Snellen Eye Chart"
                className="max-h-[220px] w-auto object-contain select-none"
              />
            </div>
            <div className="font-mono text-[10px] text-stone-500 uppercase tracking-widest text-center">
              20/20 OPTICAL CERTIFIED
            </div>
          </div>

          {/* Middle Column: Prescription Copy & WhatsApp CTA (6 Columns) */}
          <div className="md:col-span-6 bg-white p-6 sm:p-10 lg:p-12 flex flex-col items-center justify-center text-center space-y-4">
            <h2 className="font-serif text-[22px] sm:text-[26px] font-normal uppercase tracking-[0.15em] text-[#2A1E17]">
              ADD PRESCRIPTION LENSES?
            </h2>
            <p className="font-sans text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
              We offer prescription (Rx) lenses by all major companies including{" "}
              <span className="font-bold text-[#2A1E17]">Nikon, Carl Zeiss &amp; Essilor</span>.
            </p>
            <p className="font-sans text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
              Kindly get in touch with us with your spectacle prescription and we would be happy to
              deliver the glasses complete with your Rx at your doorstep.
            </p>
            <div className="pt-2">
              <button
                onClick={handleWhatsAppPrescription}
                className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-[#2A1E17] hover:text-[#C86A28] border-b border-[#2A1E17] hover:border-[#C86A28] pb-0.5 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>WHATSAPP US</span>
                <span className="text-stone-400">•</span>
              </button>
            </div>
          </div>

          {/* Right Column: Lifestyle Luxury Eyewear Photo (3 Columns) */}
          <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-[#E8DCCF] h-full min-h-[220px] relative">
            <img
              src="/images/pdp-lifestyle.jpg"
              alt="Luxury prescription sunglasses"
              className="w-full h-full object-cover object-center absolute inset-0"
            />
          </div>
        </div>
      </section>

      {/* 4. Curated Selection: YOU MAY ALSO LIKE */}
      {relatedProducts.length > 0 && (
        <section className="max-w-[1180px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="mb-6 sm:mb-8">
            <span className="font-sans text-[11px] font-bold text-[#C86A28] uppercase tracking-[0.2em] block mb-1">
              CURATED SELECTION
            </span>
            <h2 className="font-serif text-[24px] sm:text-[28px] font-normal uppercase tracking-[0.08em] text-[#2A1E17]">
              YOU MAY ALSO LIKE
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                onSelectProduct={(p) => {
                  onSelectProduct(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onOpenVirtualTryOn={onOpenVirtualTryOn}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
