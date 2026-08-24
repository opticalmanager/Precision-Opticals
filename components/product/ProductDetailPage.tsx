import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Heart,
  Glasses,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  Star,
  Check,
  Sparkles,
  ChevronRight,
  Share2,
  Camera,
  ShoppingBag,
  Ruler
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/formatters';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { RatingStars } from '../common/RatingStars';
import { ProductCard } from '../shop/ProductCard';

interface ProductDetailPageProps {
  product: Product;
  onClose: () => void;
  onOpenVirtualTryOn: (product: Product) => void;
  onOpenLensCustomizer: (product: Product) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onClose,
  onOpenVirtualTryOn,
  onOpenLensCustomizer,
  allProducts,
  onSelectProduct
}) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCartDirect } = useCart();
  const { addToast } = useToast();

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'sizing' | 'reviews'>('details');

  const saved = isWishlisted(product.id);

  const imagesToDisplay =
    product.variants && product.variants.length > 0 && product.variants[selectedVariantIdx]?.image
      ? [product.variants[selectedVariantIdx].image, ...product.images.filter((img) => img !== product.variants[selectedVariantIdx].image)]
      : product.images;

  const currentImage = imagesToDisplay[activeImgIdx] || product.images[0];

  const emiMonthly = Math.round(product.price / 3);

  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
      .slice(0, 4);
  }, [allProducts, product]);

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
      addToast('Link Copied', 'Product link copied to clipboard.', 'success');
    }
  };

  const selectedVariant = product.variants && product.variants.length > 0
    ? product.variants[selectedVariantIdx]
    : undefined;

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#2A1E17] font-sans pb-20 animate-in fade-in duration-300">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-[#FAF3EB] border-b border-[#E8DCCF] sticky top-[57px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-wider text-stone-700 hover:text-[#C85A1B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO CATALOGUE</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
            <span className="hidden sm:inline hover:text-black cursor-pointer" onClick={onClose}>Catalogue</span>
            <span className="hidden sm:inline">/</span>
            <span className="capitalize hidden sm:inline">{product.category}</span>
            <span className="hidden sm:inline">/</span>
            <span className="font-bold text-stone-900 truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 hover:text-black transition-colors cursor-pointer"
            title="Share Frame"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Product Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Gallery (Span 7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Display */}
            <div className="bg-white border border-[#E8DCCF] p-6 sm:p-12 relative flex items-center justify-center min-h-[380px] sm:min-h-[480px] shadow-xs">
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.isNewArrival && (
                  <span className="bg-[#2A1E17] text-white text-[10px] font-sans font-bold tracking-widest px-2.5 py-1 uppercase">
                    NEW ARRIVAL
                  </span>
                )}
                {product.category === 'meta-smart' && (
                  <span className="bg-[#C85A1B] text-white text-[10px] font-sans font-bold tracking-widest px-2.5 py-1 uppercase">
                    AI & SPATIAL AUDIO
                  </span>
                )}
                {product.material === '18k-gold-plated' && (
                  <span className="bg-[#8A6D3B] text-white text-[10px] font-sans font-bold tracking-widest px-2.5 py-1 uppercase">
                    18K GOLD PLATED
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id, product.name)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-[#FAF7F2] hover:bg-white border border-[#E8DCCF] text-stone-600 hover:text-rose-600 shadow-xs transition-colors cursor-pointer"
                title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${saved ? 'fill-rose-600 text-rose-600' : ''}`} />
              </button>

              <ImageWithFallback
                src={currentImage}
                alt={product.name}
                className="max-h-[340px] sm:max-h-[420px] max-w-full object-contain transform transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Thumbnails Row */}
            {imagesToDisplay.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {imagesToDisplay.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`w-20 h-20 bg-white border p-1.5 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      activeImgIdx === idx
                        ? 'border-[#C85A1B] ring-2 ring-[#C85A1B]/20'
                        : 'border-[#E8DCCF] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs sm:text-sm text-[#C85A1B] uppercase tracking-widest">
                  {product.brand}
                </span>
                <RatingStars rating={product.rating || 4.9} reviewCount={product.reviewCount || 24} />
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1E17] mt-1 uppercase tracking-tight">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-stone-500 font-serif italic mt-1">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Price Row */}
            <div className="bg-white p-4 border border-[#E8DCCF] flex items-baseline justify-between">
              <div>
                <span className="text-xs text-stone-400 uppercase font-sans tracking-wider block">Frame Price</span>
                <span className="font-serif font-bold text-2xl sm:text-3xl text-[#2A1E17]">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-stone-400 line-through ml-2">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
              </div>

              <div className="text-right text-[11px] text-stone-600 font-sans">
                <span className="text-emerald-700 font-bold block">✓ In Stock & Insured</span>
                <span>or 3 EMI of {formatINR(emiMonthly)}/mo</span>
              </div>
            </div>

            {/* Color Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Colorway: <span className="font-normal text-stone-600">{product.variants[selectedVariantIdx]?.colorName}</span>
                </span>
                <div className="flex items-center gap-2">
                  {product.variants.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantIdx(idx);
                        setActiveImgIdx(0);
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                        selectedVariantIdx === idx
                          ? 'border-[#C85A1B] ring-2 ring-[#C85A1B]/30 scale-110'
                          : 'border-stone-300 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: v.colorHex }}
                      title={v.colorName}
                    >
                      {selectedVariantIdx === idx && (
                        <Check className="w-4 h-4 text-white drop-shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => onOpenLensCustomizer(product)}
                className="w-full bg-[#2A1E17] hover:bg-[#C85A1B] text-white py-4 font-serif font-bold text-xs sm:text-sm uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Glasses className="w-5 h-5 text-[#E59B62]" />
                <span>SELECT & CUSTOMIZE LENSES</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addToCartDirect(product, selectedVariant)}
                  className="bg-white hover:bg-stone-50 border border-stone-800 text-stone-900 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>FRAME ONLY</span>
                </button>

                <button
                  onClick={() => onOpenVirtualTryOn(product)}
                  className="bg-[#FAF3EB] hover:bg-stone-200 border border-[#E8DCCF] text-stone-900 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#C85A1B]" />
                  <span>VIRTUAL TRY-ON</span>
                </button>
              </div>
            </div>

            {/* Optical Measurements Specs Card */}
            <div className="bg-white p-4 border border-[#E8DCCF] space-y-3">
              <div className="flex items-center gap-2 font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
                <Ruler className="w-4 h-4 text-[#C85A1B]" />
                <span>FRAME MEASUREMENTS & SIZING</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-sans">
                <div className="bg-[#FAF7F2] p-2 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block uppercase">Lens</span>
                  <span className="font-bold">{product.specs.lensWidth} mm</span>
                </div>
                <div className="bg-[#FAF7F2] p-2 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block uppercase">Bridge</span>
                  <span className="font-bold">{product.specs.bridgeWidth} mm</span>
                </div>
                <div className="bg-[#FAF7F2] p-2 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block uppercase">Temple</span>
                  <span className="font-bold">{product.specs.templeLength} mm</span>
                </div>
                <div className="bg-[#FAF7F2] p-2 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block uppercase">Total Width</span>
                  <span className="font-bold">{product.specs.frameWidth} mm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info Section */}
        <div className="mt-14 bg-white border border-[#E8DCCF] p-6 sm:p-8">
          <div className="flex items-center gap-6 border-b border-stone-200 pb-4 text-xs sm:text-sm font-serif font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 relative cursor-pointer ${
                activeTab === 'details' ? 'text-[#C85A1B] border-b-2 border-[#C85A1B]' : 'text-stone-500 hover:text-black'
              }`}
            >
              Description & Specifications
            </button>
            <button
              onClick={() => setActiveTab('sizing')}
              className={`pb-2 relative cursor-pointer ${
                activeTab === 'sizing' ? 'text-[#C85A1B] border-b-2 border-[#C85A1B]' : 'text-stone-500 hover:text-black'
              }`}
            >
              Prescription Options
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 relative cursor-pointer ${
                activeTab === 'reviews' ? 'text-[#C85A1B] border-b-2 border-[#C85A1B]' : 'text-stone-500 hover:text-black'
              }`}
            >
              Client Reviews ({product.reviewCount || 24})
            </button>
          </div>

          <div className="pt-6 text-xs sm:text-sm leading-relaxed text-stone-700">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-400 block uppercase text-[10px]">Shape</span>
                    <span className="font-bold capitalize">{product.shape}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block uppercase text-[10px]">Rim Construction</span>
                    <span className="font-bold capitalize">{product.rimType}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block uppercase text-[10px]">Material</span>
                    <span className="font-bold capitalize">{product.material}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block uppercase text-[10px]">Weight</span>
                    <span className="font-bold">{product.specs.weight || '24g'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sizing' && (
              <div className="space-y-3">
                <p>We craft custom prescription lenses engineered to 0.01 diopter accuracy in partnership with Carl Zeiss® and Essilor®.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Single Vision:</strong> Corrects distance or reading vision with anti-reflective clarity.</li>
                  <li><strong>Zeiss SmartLife Progressives:</strong> Smooth uninterrupted gradient from distance to smartphone reading.</li>
                  <li><strong>Blue Light Blocking:</strong> Filters harmful 415-455nm HEV wavelengths from monitors.</li>
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#FAF7F2] border border-stone-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs uppercase">Vikramaditya S.</span>
                    <RatingStars rating={5} showScore={false} />
                  </div>
                  <p className="text-xs text-stone-600 italic">"The build quality and fit of this frame is extraordinary. The titanium feels weightless on the nose bridge."</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wider mb-6">
              Complementary Luxury Frames
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  onSelectProduct={onSelectProduct}
                  onOpenVirtualTryOn={onOpenVirtualTryOn}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
