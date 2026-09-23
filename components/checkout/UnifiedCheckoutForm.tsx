"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ShieldCheck,
  Check,
  User,
  LogOut,
  MapPin,
  Plus,
  Loader2,
  Clock,
  Lock,
} from "lucide-react";
import { ShippingAddress, PaymentMethod } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getEstimatedDeliveryDate, formatCurrency } from "@/lib/utils";

interface UnifiedCheckoutFormProps {
  shippingAddress: ShippingAddress;
  onAddressChange: (address: ShippingAddress) => void;
  shippingMethod: "standard" | "express";
  onShippingMethodChange: (method: "standard" | "express") => void;
  shippingRates: {
    standard: number;
    express: number;
  };
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onSubmitPay: () => void;
  isSubmitting: boolean;
  totalPayable: number;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Jammu & Kashmir",
  "Ladakh",
];

export const UnifiedCheckoutForm: React.FC<UnifiedCheckoutFormProps> = ({
  shippingAddress,
  onAddressChange,
  shippingMethod,
  onShippingMethodChange,
  shippingRates,
  paymentMethod,
  onPaymentMethodChange,
  onSubmitPay,
  isSubmitting,
  totalPayable,
}) => {
  const { user, isLoggedIn, logout, openAuthModal } = useAuth();

  // State for billing address choice
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState<Partial<ShippingAddress>>({
    firstName: "",
    lastName: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "Delhi",
    pincode: "",
  });

  // Track which saved address index is active (null means custom/new address)
  const [activeSavedAddressIdx, setActiveSavedAddressIdx] = useState<number | null>(
    user.savedAddresses && user.savedAddresses.length > 0 ? 0 : null
  );

  // Sync initial address from user or saved address
  useEffect(() => {
    if (isLoggedIn && user.savedAddresses && user.savedAddresses.length > 0) {
      const defaultAddr = user.savedAddresses[0];
      const names = (defaultAddr.fullName || user.name || "").split(" ");
      const firstName = defaultAddr.firstName || names[0] || "";
      const lastName = defaultAddr.lastName || names.slice(1).join(" ") || "";

      onAddressChange({
        ...defaultAddr,
        firstName,
        lastName,
        email: defaultAddr.email || user.email || "patron@precisionoptics.com",
        phone: defaultAddr.phone || user.phone || "+91 98100 12345",
      });
      setActiveSavedAddressIdx(0);
    }
  }, [isLoggedIn, user]);

  const handleSelectSavedAddress = (idx: number) => {
    const addr = user.savedAddresses[idx];
    if (addr) {
      const names = (addr.fullName || "").split(" ");
      const firstName = addr.firstName || names[0] || "";
      const lastName = addr.lastName || names.slice(1).join(" ") || "";

      onAddressChange({
        ...addr,
        firstName,
        lastName,
        email: addr.email || user.email || shippingAddress.email,
        phone: addr.phone || user.phone || shippingAddress.phone,
      });
      setActiveSavedAddressIdx(idx);
    }
  };

  const handleAddNewAddressMode = () => {
    setActiveSavedAddressIdx(null);
    onAddressChange({
      fullName: "",
      firstName: "",
      lastName: "",
      company: "",
      streetAddress: "",
      apartment: "",
      city: "",
      state: "Delhi",
      pincode: "",
      country: "India",
      phone: user.phone || "+91 ",
      email: user.email || "",
    });
  };

  const handleFieldChange = (field: keyof ShippingAddress, val: string) => {
    const updated = { ...shippingAddress, [field]: val };
    if (field === "firstName" || field === "lastName") {
      updated.fullName = `${updated.firstName || ""} ${updated.lastName || ""}`.trim();
    }
    onAddressChange(updated);
  };

  // Dynamic delivery date estimates
  const standardDate = getEstimatedDeliveryDate(6);
  const expressDate = getEstimatedDeliveryDate(3);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* 1. Patron Identity Bar Matching Reference [G] gaurav... */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FAF3EB] border border-[#E8DCCF] flex items-center justify-center font-serif font-bold text-sm text-[#2A1E17]">
            {isLoggedIn && user.name
              ? user.name.charAt(0).toUpperCase()
              : "P"}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900 font-sans">
              {isLoggedIn
                ? user.email || user.phone || user.name
                : "Guest Patron"}
            </div>
            <div className="text-[11px] text-stone-500">
              {isLoggedIn ? "Authenticated VIP Patron" : "Checking out as guest"}
            </div>
          </div>
        </div>

        {isLoggedIn ? (
          <button
            type="button"
            onClick={() => logout()}
            className="text-stone-400 hover:text-stone-700 p-1.5 transition-colors cursor-pointer"
            title="Sign out of patron account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal("/checkout")}
            className="text-xs font-bold text-[#C86A28] hover:underline cursor-pointer"
          >
            Sign in
          </button>
        )}
      </div>

      {/* 2. Delivery Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
            Delivery
          </h2>
          {user.savedAddresses && user.savedAddresses.length > 0 && (
            <span className="text-xs text-stone-500">
              {user.savedAddresses.length} saved address(es) available
            </span>
          )}
        </div>

        {/* Address Input Fields Grid Matching Reference Screenshot */}
        <div className="space-y-3">
          {/* Country / Region */}
          <div className="relative">
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Country/Region
            </label>
            <div className="relative">
              <select
                value={shippingAddress.country || "India"}
                onChange={(e) => handleFieldChange("country", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors appearance-none cursor-pointer"
              >
                <option value="India">India</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Singapore">Singapore</option>
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* First Name & Last Name (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="First name"
                value={shippingAddress.firstName || ""}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Last name"
                value={shippingAddress.lastName || ""}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors"
                required
              />
            </div>
          </div>

          {/* Company (optional) */}
          <div>
            <input
              type="text"
              placeholder="Company (optional)"
              value={shippingAddress.company || ""}
              onChange={(e) => handleFieldChange("company", e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors"
            />
          </div>

          {/* Street Address with Search Icon */}
          <div className="relative">
            <input
              type="text"
              placeholder="Address"
              value={shippingAddress.streetAddress || ""}
              onChange={(e) => handleFieldChange("streetAddress", e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors"
              required
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Apartment, suite, etc. (optional) */}
          <div>
            <input
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              value={shippingAddress.apartment || ""}
              onChange={(e) => handleFieldChange("apartment", e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors"
            />
          </div>

          {/* City, State, PIN code (3 Columns in Row matching reference) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <input
                type="text"
                placeholder="City"
                value={shippingAddress.city || ""}
                onChange={(e) => handleFieldChange("city", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors"
                required
              />
            </div>

            <div className="relative">
              <select
                value={shippingAddress.state || "Delhi"}
                onChange={(e) => handleFieldChange("state", e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors appearance-none cursor-pointer"
                required
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div>
              <input
                type="text"
                placeholder="PIN code"
                maxLength={6}
                value={shippingAddress.pincode || ""}
                onChange={(e) =>
                  handleFieldChange("pincode", e.target.value.replace(/\D/g, ""))
                }
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors font-mono"
                required
              />
            </div>
          </div>

          {/* Phone with Country Prefix Indicator */}
          <div className="relative">
            <input
              type="tel"
              placeholder="Phone"
              value={shippingAddress.phone || ""}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              className="w-full pl-4 pr-16 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 outline-none focus:border-stone-800 transition-colors font-mono"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-xs text-stone-400 font-bold">
              <span>+91</span>
              <span className="w-4 h-3 bg-stone-100 border border-stone-300 rounded-xs flex flex-col justify-between overflow-hidden">
                <span className="h-1 bg-amber-500" />
                <span className="h-1 bg-white" />
                <span className="h-1 bg-emerald-600" />
              </span>
            </div>
          </div>
        </div>

        {/* 3. Option to Select Saved Address (As requested by user) */}
        {isLoggedIn && user.savedAddresses && user.savedAddresses.length > 0 && (
          <div className="pt-2 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Or Choose From Saved Addresses
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {user.savedAddresses.map((addr, idx) => {
                const isSelected = activeSavedAddressIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectSavedAddress(idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all bg-white flex items-start gap-2.5 ${
                      isSelected
                        ? "border-[#1C1917] ring-1 ring-[#1C1917] shadow-2xs font-semibold"
                        : "border-stone-200 hover:border-stone-400 text-stone-600"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? "border-[#1C1917] bg-[#1C1917] text-white"
                          : "border-stone-300"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-stone-900 font-bold truncate">
                        {addr.fullName || "Primary Address"}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {addr.streetAddress}, {addr.city} {addr.pincode}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Address Option */}
              <div
                onClick={handleAddNewAddressMode}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all bg-white flex items-center gap-2 ${
                  activeSavedAddressIdx === null
                    ? "border-[#1C1917] ring-1 ring-[#1C1917] text-stone-900 font-bold"
                    : "border-dashed border-stone-300 hover:border-stone-400 text-stone-600"
                }`}
              >
                <Plus className="w-4 h-4 text-[#C86A28]" />
                <span>Enter custom address</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Shipping Method Section Matching Reference */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
          Shipping method
        </h2>

        <div className="bg-white border border-stone-300 rounded-2xl overflow-hidden divide-y divide-stone-200">
          {/* Option 1: Standard Shipping */}
          <div
            onClick={() => onShippingMethodChange("standard")}
            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
              shippingMethod === "standard" ? "bg-[#FAF7F2]/60" : "hover:bg-stone-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  shippingMethod === "standard"
                    ? "border-[#1C1917] bg-[#1C1917]"
                    : "border-stone-300"
                }`}
              >
                {shippingMethod === "standard" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-stone-900">
                  Standard (5-7 business days)
                </div>
                <div className="text-[11px] text-stone-500">
                  Ships: Tuesday - Saturday • {standardDate}
                </div>
              </div>
            </div>

            <span className="text-xs sm:text-sm font-bold text-stone-900 uppercase">
              {shippingRates.standard === 0 ? "FREE" : formatCurrency(shippingRates.standard)}
            </span>
          </div>

          {/* Option 2: Express Shipping */}
          <div
            onClick={() => onShippingMethodChange("express")}
            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
              shippingMethod === "express" ? "bg-[#FAF7F2]/60" : "hover:bg-stone-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  shippingMethod === "express"
                    ? "border-[#1C1917] bg-[#1C1917]"
                    : "border-stone-300"
                }`}
              >
                {shippingMethod === "express" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-stone-900">
                  Express Shipping (3-4 business days)
                </div>
                <div className="text-[11px] text-stone-500">
                  Ships: Tuesday - Saturday • Priority dispatch ({expressDate})
                </div>
              </div>
            </div>

            <span className="text-xs sm:text-sm font-bold text-stone-900 font-mono">
              {formatCurrency(shippingRates.express)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Payment Section Matching Reference */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
            Payment
          </h2>
          <p className="text-xs text-stone-500">
            All transactions are secure and encrypted.
          </p>
        </div>

        <div className="bg-white border border-stone-300 rounded-2xl overflow-hidden divide-y divide-stone-200">
          {/* Razorpay Secure Option (Default & Recommended) */}
          <div
            onClick={() => onPaymentMethodChange("razorpay")}
            className={`p-4 cursor-pointer transition-colors ${
              paymentMethod === "razorpay" || paymentMethod === "upi" || paymentMethod === "card"
                ? "bg-[#FAF7F2]/60"
                : "hover:bg-stone-50/50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === "razorpay" || paymentMethod === "upi" || paymentMethod === "card"
                      ? "border-[#1C1917] bg-[#1C1917]"
                      : "border-stone-300"
                  }`}
                >
                  {(paymentMethod === "razorpay" || paymentMethod === "upi" || paymentMethod === "card") && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-stone-900">
                  Razorpay Secure (UPI, Card, Int&apos;l Card, Apple Pay, NetBanking)
                </div>
              </div>

              {/* Supported Rails Visual Chips */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[9px]">
                  UPI
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-900 text-white font-bold text-[9px]">
                  VISA
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-bold text-[9px]">
                  MC
                </span>
                <span className="px-1 py-0.5 rounded bg-stone-100 text-stone-600 text-[9px] font-bold">
                  +4
                </span>
              </div>
            </div>

            {/* Expanded Explanatory Note Matching Reference */}
            {(paymentMethod === "razorpay" || paymentMethod === "upi" || paymentMethod === "card") && (
              <div className="mt-3.5 pt-3 border-t border-stone-200/80 text-xs text-stone-600 leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-stone-200">
                You will be redirected to the secure Razorpay Checkout interface (UPI QR, Google Pay, PhonePe, Cards, NetBanking, EMI) to complete your purchase.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Billing Address Choice Matching Reference */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
          Billing address
        </h2>

        <div className="bg-white border border-stone-300 rounded-2xl overflow-hidden divide-y divide-stone-200">
          <div
            onClick={() => setBillingSameAsShipping(true)}
            className={`p-4 flex items-center gap-3 cursor-pointer ${
              billingSameAsShipping ? "bg-[#FAF7F2]/60 font-semibold" : "hover:bg-stone-50/50"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                billingSameAsShipping ? "border-[#1C1917] bg-[#1C1917]" : "border-stone-300"
              }`}
            >
              {billingSameAsShipping && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <span className="text-xs sm:text-sm text-stone-900">
              Same as shipping address
            </span>
          </div>

          <div
            onClick={() => setBillingSameAsShipping(false)}
            className={`p-4 flex items-center gap-3 cursor-pointer ${
              !billingSameAsShipping ? "bg-[#FAF7F2]/60 font-semibold" : "hover:bg-stone-50/50"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                !billingSameAsShipping ? "border-[#1C1917] bg-[#1C1917]" : "border-stone-300"
              }`}
            >
              {!billingSameAsShipping && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <span className="text-xs sm:text-sm text-stone-900">
              Use a different billing address
            </span>
          </div>
        </div>

        {/* Secondary Billing Address Inputs if Different */}
        {!billingSameAsShipping && (
          <div className="p-4 bg-white border border-stone-300 rounded-2xl space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Billing First Name"
                value={billingAddress.firstName || ""}
                onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })}
                className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none"
              />
              <input
                type="text"
                placeholder="Billing Last Name"
                value={billingAddress.lastName || ""}
                onChange={(e) => setBillingAddress({ ...billingAddress, lastName: e.target.value })}
                className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Billing Street Address"
              value={billingAddress.streetAddress || ""}
              onChange={(e) => setBillingAddress({ ...billingAddress, streetAddress: e.target.value })}
              className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Billing City"
                value={billingAddress.city || ""}
                onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none"
              />
              <input
                type="text"
                placeholder="Billing PIN Code"
                value={billingAddress.pincode || ""}
                onChange={(e) => setBillingAddress({ ...billingAddress, pincode: e.target.value })}
                className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 7. Pay Now Primary Luxury CTA Button Matching Reference */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onSubmitPay}
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
            isSubmitting
              ? "bg-stone-400 text-stone-200 cursor-not-allowed shadow-none"
              : "bg-[#2A1E17] hover:bg-black text-white hover:shadow-lg"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting to Razorpay Secure...</span>
            </span>
          ) : (
            <span>Pay now</span>
          )}
        </button>
      </div>
    </div>
  );
};
