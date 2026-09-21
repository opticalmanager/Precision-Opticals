"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  CheckoutBreadcrumbs,
  CheckoutStep,
} from "@/components/checkout/CheckoutBreadcrumbs";
import { CheckoutBillDetails } from "@/components/checkout/CheckoutBillDetails";
import { StepLoginSignup } from "@/components/checkout/StepLoginSignup";
import { StepShippingAddress } from "@/components/checkout/StepShippingAddress";
import { StepPayment } from "@/components/checkout/StepPayment";
import { StepOrderSummary } from "@/components/checkout/StepOrderSummary";
import { Order, PaymentMethod, ShippingAddress } from "@/types";
import { generateTrackingId, getEstimatedDeliveryDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    items,
    rawSubtotal,
    discountAmount,
    grandTotal,
    appliedCoupon,
    includeCleaningKit,
    clearCart,
  } = useCart();
  const { user, isLoggedIn, isGuest, setGuestCheckout, saveOrder } = useAuth();

  // Initial step based on auth status
  const initialStep: CheckoutStep = isLoggedIn || isGuest ? "address" : "login";
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(initialStep);

  // Selected or created shipping address
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(
    user.savedAddresses[0] || {
      fullName: user.name || "Alexander Sterling",
      phone: user.phone || "+91 98100 12345",
      email: user.email || "alexander@precisionoptics.com",
      streetAddress: "173, Harkesh Nagar",
      city: "Faridabad",
      state: "Haryana",
      pincode: "121003",
      country: "India",
    }
  );

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // If user logs in while on login step, advance to address
  useEffect(() => {
    if (isLoggedIn && currentStep === "login") {
      setCurrentStep("address");
    }
  }, [isLoggedIn, currentStep]);

  // Check which steps are reachable
  const canNavigateTo = (step: CheckoutStep): boolean => {
    if (step === "login") return true;
    if (step === "address") return isLoggedIn || isGuest;
    if (step === "payment") return (isLoggedIn || isGuest) && Boolean(shippingAddress.streetAddress);
    if (step === "summary") return Boolean(confirmedOrder);
    return false;
  };

  const handleStepClick = (step: CheckoutStep) => {
    if (canNavigateTo(step)) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Step 1: Login/Signup Success
  const handleLoginSuccess = () => {
    setCurrentStep("address");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 1: Guest Checkout
  const handleCheckoutAsGuest = () => {
    setGuestCheckout(true);
    setCurrentStep("address");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2: Shipping Address Saved & Proceed
  const handleAddressProceed = (addr: ShippingAddress) => {
    setShippingAddress(addr);
    setCurrentStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3: Payment Submit -> Final Order Creation
  const handlePaymentSubmit = async (
    paymentMethod: PaymentMethod = "upi",
    paymentDetails?: any
  ) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmittingOrder(true);
    const trackingNumber = generateTrackingId();

    const newOrder: Order = {
      id: trackingNumber,
      trackingNumber,
      createdAt: new Date().toISOString(),
      items: [...items],
      shippingAddress: { ...shippingAddress },
      paymentMethod,
      subtotal: rawSubtotal,
      discount: discountAmount,
      couponApplied: appliedCoupon || undefined,
      cleaningKitAdded: includeCleaningKit,
      totalAmount: grandTotal,
      status: "confirmed",
      estimatedDeliveryDate: getEstimatedDeliveryDate(4),
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      saveOrder(newOrder);
      setConfirmedOrder(newOrder);
      clearCart();
      setIsSubmittingOrder(false);
      setCurrentStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });

      toast.success("Order Placed Successfully!", {
        description: `Order ${trackingNumber} registered in lab queue.`,
      });
    } catch (e) {
      console.warn("Order save fallback:", e);
      saveOrder(newOrder);
      setConfirmedOrder(newOrder);
      clearCart();
      setIsSubmittingOrder(false);
      setCurrentStep("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Empty cart state (only when not on summary step)
  if (items.length === 0 && currentStep !== "summary") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 bg-[#FAF3EB] border border-[#E8DCCF] rounded-full flex items-center justify-center text-[#C86A28] mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mb-6">
          Explore our signature luxury eyewear collections to select your designer frames and Zeiss precision lenses.
        </p>
        <Link
          href="/shop"
          className="bg-[#1C1917] hover:bg-black text-white font-bold text-xs tracking-wider uppercase px-8 py-3.5 rounded-full shadow-md transition-all active:scale-95"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      {/* 1. Breadcrumb Step Header */}
      <CheckoutBreadcrumbs
        currentStep={currentStep}
        onStepClick={handleStepClick}
        canNavigateTo={canNavigateTo}
      />

      {/* 2. Main Step Content Grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {currentStep === "summary" && confirmedOrder ? (
          /* Step 4: Summary View (Full Width) */
          <StepOrderSummary
            order={confirmedOrder}
            onContinueShopping={() => router.push("/shop")}
          />
        ) : (
          /* Steps 1, 2, 3: 2-Column Responsive Layout Matching Figma */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: Active Step Panel */}
            <div className="lg:col-span-7 xl:col-span-8">
              {currentStep === "login" && (
                <StepLoginSignup
                  onSuccess={handleLoginSuccess}
                  onCheckoutAsGuest={handleCheckoutAsGuest}
                />
              )}

              {currentStep === "address" && (
                <StepShippingAddress
                  onBack={() => {
                    if (isLoggedIn) {
                      router.push("/cart");
                    } else {
                      setCurrentStep("login");
                    }
                  }}
                  onProceed={handleAddressProceed}
                />
              )}

              {currentStep === "payment" && (
                <StepPayment
                  shippingAddress={shippingAddress}
                  onPaymentSubmit={handlePaymentSubmit}
                  isSubmitting={isSubmittingOrder}
                />
              )}
            </div>

            {/* Right Column: Deliver to Card (if on payment) + Bill Details Card */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              
              {/* Deliver to Card matching media_1789993686014.png */}
              {currentStep === "payment" && (
                <div className="bg-white border border-[#EBE6DF] rounded-[24px] p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-sm">
                      Deliver to {shippingAddress.fullName?.split(" ")[0] || "Customer"}
                    </h4>
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Next day delivery
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {shippingAddress.streetAddress}, {shippingAddress.pincode}, {shippingAddress.city?.toUpperCase()}, {shippingAddress.state?.toUpperCase()}, IN
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentStep("address")}
                    className="text-xs font-bold text-[#C86A28] hover:underline pt-1 block cursor-pointer"
                  >
                    Change Delivery Address
                  </button>
                </div>
              )}

              {/* Bill Details Summary Card */}
              <CheckoutBillDetails
                subtotal={rawSubtotal}
                discount={discountAmount}
                shippingFee={0}
                totalPayable={grandTotal}
                showCtaButton={currentStep === "payment"}
                ctaText={`${formatCurrency(grandTotal)} • Pay Now`}
                onCtaClick={() => handlePaymentSubmit("upi")}
                isSubmitting={isSubmittingOrder}
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    if (page === "home") router.push("/");
    else if (page === "shop") router.push("/shop");
    else if (page === "cart") router.push("/cart");
    else if (page === "contact") router.push("/contact");
    else if (page === "appointment") router.push("/appointment");
    else if (page === "about") router.push("/about-us");
    else if (page === "privacy") router.push("/privacy-policy");
    else router.push(`/${page}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2A1E17] flex flex-col justify-between selection:bg-[#C86A28] selection:text-white">
      <div>
        {/* Luxury Header */}
        <Header
          onOpenSearch={() => {}}
          onSelectCategory={(cat) => router.push(`/shop?category=${cat}`)}
          onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
          activeCategory="cart"
          currentPage="cart"
          onNavigate={handleNavigate}
        />

        {/* Dynamic Checkout Body */}
        <Suspense
          fallback={
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-stone-300 border-t-[#C86A28] rounded-full animate-spin mb-3" />
              <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Loading Secure Checkout...
              </p>
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </div>

      {/* Minimal Checkout Footer Matching Screenshot media_1789993663629.png */}
      <footer className="w-full bg-[#FAF7F2] border-t border-[#E8DCCF] py-6 text-xs text-stone-500 select-none">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2025 Precision Optics Atelier Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-stone-600 font-medium">
            <Link href="/privacy-policy" className="hover:text-stone-900 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-stone-900 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/about-us" className="hover:text-stone-900 transition-colors">
              Prescription Verification Guarantee
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
