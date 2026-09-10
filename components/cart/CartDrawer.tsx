import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ShieldCheck, Tag, ArrowRight, CheckCircle2, Plus, Sparkles, Check, ChevronRight } from 'lucide-react';
import { CartItem, Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatters';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onViewCartPage?: () => void;
  allProducts?: Product[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onViewCartPage,
  allProducts = []
}) => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    appliedCoupon,
    discountPercentage,
    applyCoupon,
    removeCoupon,
    includeCleaningKit,
    setIncludeCleaningKit,
    rawSubtotal,
    cleaningKitPrice,
    discountAmount,
    grandTotal,
    addToCartDirect
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res.message);
  };

  const crossSellProducts = allProducts.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={closeCart} />

      {/* Main Slide-over Drawer */}
      <div className="w-full max-w-md sm:max-w-lg bg-[#FAF7F2] h-full flex flex-col justify-between shadow-2xl relative z-10 border-l border-[#E8DCCF] font-sans text-[#2A1E17]">
        {/* Top Header */}
        <div className="bg-[#FAF7F2] border-b border-[#E8DCCF] px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-[#1C1917] tracking-tight uppercase">
              Shopping Bag
            </h2>
            <span className="bg-[#C85A1B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
            </span>
          </div>

          <button
            onClick={closeCart}
            className="bg-[#FAF3EB] hover:bg-stone-200 text-[#1C1917] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#E8DCCF] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-stone-700" />
            <span>Close</span>
          </button>
        </div>

        {/* Scrollable Main Items Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center mx-auto text-stone-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold uppercase text-stone-800">Your bag is empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore our handcrafted eyewear collections and find your signature frame.
              </p>
              <button
                onClick={closeCart}
                className="bg-[#2A1E17] text-white px-6 py-2.5 text-xs font-bold font-serif uppercase tracking-widest hover:bg-[#C85A1B] transition-colors cursor-pointer"
              >
                Browse Eyewear
              </button>
            </div>
          ) : (
            <>
              {/* Promotional Offer Card */}
              <div className="bg-white rounded-xl p-4 border border-[#E8DCCF] shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#C85A1B] uppercase font-serif">
                  <Sparkles className="w-4 h-4 text-[#C85A1B]" />
                  <span>Complimentary Insured Shipping Active</span>
                </div>
                <p className="text-xs text-stone-600">
                  Every order includes zero-error digital lens calibration, hard case, microfiber cloth & 1-year warranty.
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {items.map((item) => {
                  const itemLensPrice = item.lensConfig ? item.lensConfig.totalLensPrice : 0;
                  const unitPrice = item.product.price + itemLensPrice;

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-[#E8DCCF] p-4 rounded-xl shadow-2xs space-y-3"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-[#FAF7F2] border border-stone-200 p-1 flex items-center justify-center shrink-0 rounded-lg">
                          <ImageWithFallback
                            src={item.selectedVariant?.image || item.product.images[0]}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-[#C85A1B] uppercase tracking-wider block">
                                {item.product.brand}
                              </span>
                              <h4 className="font-bold text-xs sm:text-sm text-[#1C1917] truncate">
                                {item.product.name}
                              </h4>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {item.selectedColor && (
                            <span className="text-[11px] text-stone-500 block mt-0.5">
                              Color: {item.selectedColor}
                            </span>
                          )}

                          {/* Lens details badge if custom lens chosen */}
                          {item.lensConfig && item.lensConfig.lensType !== 'frame-only' ? (
                            <div className="bg-[#FAF3EB] border border-[#E8DCCF] p-2 rounded-lg text-[11px] mt-2 space-y-1">
                              <span className="font-bold text-[#C85A1B] block uppercase">
                                {item.lensConfig.lensPackage?.name || 'Custom Prescription'}
                              </span>
                              {item.lensConfig.prescription && (
                                <span className="text-stone-600 block text-[10px]">
                                  Rx: OD {item.lensConfig.prescription.rightEye.sph} / OS {item.lensConfig.prescription.leftEye.sph} • PD {item.lensConfig.prescription.pd}mm
                                </span>
                              )}
                              <span className="text-stone-700 font-bold block">
                                Lens Extra: +{formatINR(itemLensPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-400 block mt-1 uppercase font-semibold">
                              Frame Only (Demo Lenses)
                            </span>
                          )}

                          {/* Price & Quantity Controls */}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                            <span className="font-serif font-bold text-sm text-[#1C1917]">
                              {formatINR(unitPrice * item.quantity)}
                            </span>

                            <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="px-2.5 py-1 text-xs font-bold text-stone-700 hover:bg-stone-200 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-xs font-bold text-stone-900 bg-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="px-2.5 py-1 text-xs font-bold text-stone-700 hover:bg-stone-200 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lens Cleaning Kit Addon */}
              <div className="bg-white rounded-xl p-4 border border-[#E8DCCF] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-stone-900 block uppercase">
                    Anti-Fog Lens Cleaning Kit (+₹100)
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    Includes 60ml antimicrobial spray & premium microfiber cloth.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeCleaningKit}
                  onChange={(e) => setIncludeCleaningKit(e.target.checked)}
                  className="w-5 h-5 rounded border-stone-300 text-[#C85A1B] focus:ring-[#C85A1B] cursor-pointer"
                />
              </div>

              {/* Coupon Section */}
              <div className="bg-white rounded-xl p-4 border border-[#E8DCCF] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-stone-800">
                  <Tag className="w-3.5 h-3.5 text-[#C85A1B]" />
                  <span>Promo Code & Vouchers</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs">
                    <span className="font-bold text-emerald-800">
                      Code "{appliedCoupon}" applied ({discountPercentage}% Off)
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-stone-500 hover:text-rose-600 underline font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Try 'PO10' for 10% off..."
                      className="flex-1 bg-stone-50 border border-stone-300 px-3 py-2 text-xs rounded-lg uppercase focus:outline-none focus:border-[#C85A1B]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-[#2A1E17] text-white px-4 py-2 text-xs font-bold uppercase rounded-lg hover:bg-[#C85A1B] transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponFeedback && !appliedCoupon && (
                  <p className="text-[11px] text-amber-700">{couponFeedback}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom Checkout Actions */}
        {items.length > 0 && (
          <div className="bg-[#FAF7F2] border-t border-[#E8DCCF] p-5 sm:p-6 space-y-4 shrink-0 shadow-lg">
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-stone-900">{formatINR(rawSubtotal)}</span>
              </div>

              {includeCleaningKit && (
                <div className="flex justify-between text-stone-600">
                  <span>Lens Cleaning Kit</span>
                  <span className="font-bold text-stone-900">{formatINR(cleaningKitPrice)}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({discountPercentage}%)</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Insured Pan-India Delivery</span>
                <span className="text-emerald-700 font-bold uppercase">FREE</span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Grand Total</span>
                <span className="font-serif text-lg text-[#C85A1B]">{formatINR(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                closeCart();
                onProceedToCheckout();
              }}
              className="w-full bg-[#C85A1B] hover:bg-[#a84a12] text-white py-4 rounded-xl font-serif font-bold text-xs sm:text-sm uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>PROCEED TO SECURE CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onViewCartPage && (
              <button
                onClick={() => {
                  closeCart();
                  onViewCartPage();
                }}
                className="w-full text-center text-xs font-semibold text-stone-600 hover:text-[#C85A1B] transition-colors py-1 cursor-pointer"
              >
                Or View Full Cart Page →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
