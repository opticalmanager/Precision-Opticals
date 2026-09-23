"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { UnifiedCheckoutForm } from "@/components/checkout/UnifiedCheckoutForm";
import { UnifiedCheckoutSidebar } from "@/components/checkout/UnifiedCheckoutSidebar";
import { StepOrderSummary } from "@/components/checkout/StepOrderSummary";
import { Order, PaymentMethod, ShippingAddress } from "@/types";
import { generateTrackingId, getEstimatedDeliveryDate, formatCurrency } from "@/lib/utils";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { toast } from "sonner";

function CheckoutContent() {
  const router = useRouter();
  const {
    items,
    rawSubtotal,
    discountAmount,
    grandTotal,
    appliedCoupon,
    includeCleaningKit,
    clearCart,
  } = useCart();
  const { user, isLoggedIn, saveOrder } = useAuth();

  // Delivery Address State
  const initialAddress: ShippingAddress = user.savedAddresses?.[0] || {
    fullName: user.name || "Alexander Sterling",
    firstName: user.name?.split(" ")[0] || "Alexander",
    lastName: user.name?.split(" ").slice(1).join(" ") || "Sterling",
    phone: user.phone || "+91 98100 12345",
    email: user.email || "a.sterling@precisionoptics.com",
    streetAddress: "Villa 42, Magnolias Boulevard, Golf Course Road",
    apartment: "Tower 2, Suite 401",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    country: "India",
  };

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(initialAddress);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Sync address from profile when logged in
  useEffect(() => {
    if (isLoggedIn && user.savedAddresses && user.savedAddresses.length > 0) {
      const addr = user.savedAddresses[0];
      const names = (addr.fullName || user.name || "").split(" ");
      setShippingAddress({
        ...addr,
        firstName: addr.firstName || names[0] || "",
        lastName: addr.lastName || names.slice(1).join(" ") || "",
        email: addr.email || user.email || initialAddress.email,
        phone: addr.phone || user.phone || initialAddress.phone,
      });
    }
  }, [isLoggedIn, user]);

  // Shipping fees
  const shippingRates = {
    standard: 0, // FREE Standard Shipping as shown in reference
    express: 490, // Express Shipping fee
  };

  const currentShippingFee =
    shippingMethod === "standard" ? shippingRates.standard : shippingRates.express;
  const totalPayable = grandTotal + currentShippingFee;

  // Finalize order persistence helper
  const finalizeOrder = async (orderData: Partial<Order>) => {
    const trackingNumber = generateTrackingId();

    const finalOrder: Order = {
      id: trackingNumber,
      trackingNumber,
      createdAt: new Date().toISOString(),
      items: [...items],
      shippingAddress: { ...shippingAddress },
      paymentMethod: orderData.paymentMethod || selectedPaymentMethod,
      paymentId: orderData.paymentId,
      paymentDetails: orderData.paymentDetails,
      paymentStatus:
        orderData.paymentStatus ||
        (orderData.paymentMethod === "cod" ? "unpaid" : "paid"),
      subtotal: rawSubtotal,
      discount: discountAmount,
      couponApplied: appliedCoupon || undefined,
      cleaningKitAdded: includeCleaningKit,
      totalAmount: totalPayable,
      status: "confirmed",
      estimatedDeliveryDate: getEstimatedDeliveryDate(
        shippingMethod === "express" ? 3 : 6
      ),
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...finalOrder,
          shippingFee: currentShippingFee,
          totalAmount: totalPayable,
        }),
      });

      saveOrder(finalOrder);
      setConfirmedOrder(finalOrder);
      clearCart();
      setIsSubmittingOrder(false);
      window.scrollTo({ top: 0, behavior: "smooth" });

      toast.success("Order Placed Successfully!", {
        description: `Order #${trackingNumber} registered in lab queue.`,
      });
    } catch (e) {
      console.warn("Order save fallback:", e);
      saveOrder(finalOrder);
      setConfirmedOrder(finalOrder);
      clearCart();
      setIsSubmittingOrder(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Primary Action: Pay Now (Direct Razorpay Standard Checkout)
  const handlePayNow = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate delivery address fields
    const firstName = shippingAddress.firstName || shippingAddress.fullName?.split(" ")[0];
    if (!firstName?.trim()) {
      toast.error("Please enter your first name");
      return;
    }
    if (!shippingAddress.streetAddress?.trim()) {
      toast.error("Please enter your street address");
      return;
    }
    if (!shippingAddress.city?.trim()) {
      toast.error("Please enter your city");
      return;
    }
    if (!shippingAddress.pincode?.trim()) {
      toast.error("Please enter your PIN code");
      return;
    }
    if (!shippingAddress.phone?.trim()) {
      toast.error("Please enter your contact phone number");
      return;
    }

    setIsSubmittingOrder(true);
    const trackingNumber = generateTrackingId();

    // 1. Cash on Delivery Flow (if chosen)
    if (selectedPaymentMethod === "cod") {
      await finalizeOrder({
        paymentMethod: "cod",
        paymentStatus: "unpaid",
      });
      return;
    }

    // 2. Razorpay Standard Checkout Flow
    try {
      const amountInPaise = Math.round(totalPayable * 100);

      // Step A: Create order on server (validates amount >= 100 paise)
      const createRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: trackingNumber,
          notes: {
            orderNumber: trackingNumber,
            customerName:
              shippingAddress.fullName ||
              `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
            customerEmail: shippingAddress.email || user.email,
            customerPhone: shippingAddress.phone || user.phone,
            shippingMethod,
          },
        }),
      });

      const createData = await createRes.json();

      if (!createData.success) {
        setIsSubmittingOrder(false);
        toast.error("Payment Gateway Error", {
          description: createData.error || "Failed to initialize payment gateway order",
        });
        return;
      }

      // Step B: Inject Razorpay Checkout SDK
      const sdkLoaded = await loadRazorpay();
      const hasRazorpay = typeof window !== "undefined" && Boolean((window as any).Razorpay);

      if (!sdkLoaded || !hasRazorpay) {
        setIsSubmittingOrder(false);
        toast.error("Payment Gateway Unavailable", {
          description:
            "Unable to load Razorpay Checkout script. Please check your internet connection and reload the page.",
        });
        return;
      }

      // Step C: Trigger Official Razorpay Standard Checkout Modal (media_1790173604184.png)
      const options: any = {
        key: createData.keyId || "rzp_test_TfV4G6DOOj6ykQ",
        amount: amountInPaise,
        currency: createData.currency || "INR",
        name: "Precision Optics",
        description: `Boutique Order #${trackingNumber}`,
        prefill: {
          name:
            shippingAddress.fullName ||
            `${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim() ||
            user.name ||
            "Valued Patron",
          email: shippingAddress.email || user.email || "concierge@precisionoptics.in",
          contact: (shippingAddress.phone || user.phone || "").replace(/\D/g, "") || "9810012345",
        },
        theme: {
          color: "#C86A28",
          backdrop_color: "#2A1E17",
        },
        handler: async function (response: any) {
          try {
            toast.info("Verifying transaction with atelier bank...", { duration: 3000 });

            // Step D: Verify HMAC-SHA256 signature on server
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: response.razorpay_order_id || null,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature || null,
                internal_order_id: trackingNumber,
                orderId: trackingNumber,
                amount: totalPayable,
                payment_method: selectedPaymentMethod,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await finalizeOrder({
                paymentMethod: selectedPaymentMethod,
                paymentId: response.razorpay_payment_id,
                paymentStatus: "paid",
                paymentDetails: {
                  razorpay_order_id: response.razorpay_order_id || null,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature || null,
                  verified: true,
                  verifiedAt: new Date().toISOString(),
                },
              });
            } else {
              setIsSubmittingOrder(false);
              toast.error("Signature verification failed", {
                description:
                  verifyData.error ||
                  "Payment signature invalid. Please contact atelier support.",
              });
            }
          } catch (err: any) {
            setIsSubmittingOrder(false);
            toast.error("Payment verification failed", { description: err.message });
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmittingOrder(false);
            toast.info("Payment session dismissed by patron");
          },
        },
      };

      // Only pass order_id if it's an authentic Razorpay order id starting with 'order_'
      if (
        createData.order_id &&
        typeof createData.order_id === "string" &&
        createData.order_id.startsWith("order_")
      ) {
        options.order_id = createData.order_id;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setIsSubmittingOrder(false);
        toast.error("Payment Declined", {
          description:
            response.error?.description || "Transaction declined by payment network.",
        });
      });
      rzp.open();
      setIsSubmittingOrder(false);
    } catch (err: any) {
      setIsSubmittingOrder(false);
      toast.error("Payment Gateway Notice", {
        description: err.message || "Failed to initialize payment gateway.",
      });
    }
  };

  // If order confirmed, show order summary view
  if (confirmedOrder) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <StepOrderSummary
          order={confirmedOrder}
          onContinueShopping={() => router.push("/shop")}
        />
      </div>
    );
  }

  // If cart is empty
  if (items.length === 0) {
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

  // Unified 1-Page Express Checkout Grid Matching Reference Screenshot media_1790173315377.png
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Column: Delivery Form, Shipping Method, Payment, Billing, Pay now */}
        <div className="lg:col-span-7 xl:col-span-7">
          <UnifiedCheckoutForm
            shippingAddress={shippingAddress}
            onAddressChange={setShippingAddress}
            shippingMethod={shippingMethod}
            onShippingMethodChange={setShippingMethod}
            shippingRates={shippingRates}
            paymentMethod={selectedPaymentMethod}
            onPaymentMethodChange={setSelectedPaymentMethod}
            onSubmitPay={handlePayNow}
            isSubmitting={isSubmittingOrder}
            totalPayable={totalPayable}
          />
        </div>

        {/* Right Column: Order Summary Sidebar with Real Line Items & Voucher */}
        <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-8 border-t lg:border-t-0 lg:border-l border-stone-200/90 pt-8 lg:pt-0 lg:pl-10">
          <UnifiedCheckoutSidebar
            items={items}
            subtotal={rawSubtotal}
            shippingFee={currentShippingFee}
            shippingLabel={shippingMethod === "standard" ? "FREE" : "₹490"}
            discountAmount={discountAmount}
            totalPayable={totalPayable}
          />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items } = useCart();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2A1E17] flex flex-col justify-between selection:bg-[#C86A28] selection:text-white">
      <div>
        {/* Minimal Luxury Checkout Header Matching Reference Screenshot media_1790173315377.png */}
        <header className="w-full bg-[#FAF7F2] border-b border-stone-200/80 py-4 sm:py-5 px-4 sm:px-8 sticky top-0 z-30 backdrop-blur-md bg-opacity-95">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between">
            {/* Left: Back to Cart Link */}
            <Link
              href="/cart"
              className="text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Cart</span>
            </Link>

            {/* Center: Brand Wordmark (GEM OPTICIANS Style) */}
            <Link href="/" className="text-center group select-none">
              <div className="font-serif font-black tracking-[0.25em] text-base sm:text-lg text-[#2A1E17] uppercase group-hover:text-[#C86A28] transition-colors">
                Precision Optics
              </div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-stone-500 font-medium">
                Estd. 1969 • Atelier
              </div>
            </Link>

            {/* Right: Shopping Bag Icon with Badge */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-stone-200/60 text-stone-800 transition-colors"
              title="Cart items"
            >
              <ShoppingBag className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1C1917] text-white text-[10px] font-bold flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Dynamic Checkout Body */}
        <Suspense
          fallback={
            <div className="py-24 text-center flex flex-col items-center justify-center">
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

      {/* Minimal Checkout Footer Matching Reference Screenshot media_1790173315377.png */}
      <footer className="w-full bg-[#FAF7F2] border-t border-stone-200/80 py-6 text-xs text-stone-500 select-none">
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
