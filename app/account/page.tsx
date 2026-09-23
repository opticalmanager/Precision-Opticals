"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  FileText,
  MapPin,
  Award,
  LogOut,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Plus,
  Trash2,
  ExternalLink,
  Printer,
  Sparkles,
  Lock,
  ArrowRight,
  RotateCcw,
  X,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrderTrackingModal } from "@/components/pages/OrderTrackingModal";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ShippingAddress, PrescriptionData } from "@/types";

type AccountTab = "orders" | "prescriptions" | "addresses" | "loyalty" | "profile";

function AccountDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    isLoggedIn,
    logout,
    orders,
    loginWithPhone,
    updateUserProfile,
    saveShippingAddress,
    deleteSavedAddress,
    savePrescription,
    removePrescription,
    openTrackingModal,
  } = useAuth();

  // Tab State
  const initialTab = (searchParams.get("tab") as AccountTab) || "orders";
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab") as AccountTab;
    if (tab && ["orders", "prescriptions", "addresses", "loyalty", "profile"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Profile Edit State
  const [editName, setEditName] = useState(user.name || "");
  const [editEmail, setEditEmail] = useState(user.email || "");
  const [editPhone, setEditPhone] = useState(user.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    fullName: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
    streetAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Prescription Modal State
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [rxTitle, setRxTitle] = useState("Bespoke Clinical Rx");
  const [rxDoctor, setRxDoctor] = useState("Dr. R. K. Malhotra (Precision Optometry)");
  const [rxData, setRxData] = useState<PrescriptionData>({
    rightEye: { sph: "-1.25", cyl: "-0.50", axis: "90", add: "+1.50" },
    leftEye: { sph: "-1.50", cyl: "-0.50", axis: "85", add: "+1.50" },
    pd: "64",
  });

  // Inline Sign-In Gate State (when not logged in)
  const [gatePhone, setGatePhone] = useState("");
  const [gateOtp, setGateOtp] = useState(["", "", "", ""]);
  const [gateOtpSent, setGateOtpSent] = useState(false);
  const [gateResendTimer, setGateResendTimer] = useState(30);
  const [gateIsVerifying, setGateIsVerifying] = useState(false);
  const gateOtpInputs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gateOtpSent && gateResendTimer > 0) {
      timer = setInterval(() => setGateResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gateOtpSent, gateResendTimer]);

  const handleSendGateOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = gatePhone.replace(/\D/g, "");
    if (clean.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setGateOtpSent(true);
    setGateResendTimer(30);
    toast.success("Verification code sent!", {
      description: `4-digit OTP sent to +91 ${clean}. (Use demo code: 1234)`,
    });
    setTimeout(() => gateOtpInputs.current[0]?.focus(), 150);
  };

  const handleGateOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...gateOtp];
    updated[index] = val;
    setGateOtp(updated);

    if (val && index < 3) {
      gateOtpInputs.current[index + 1]?.focus();
    }
    if (updated.every((d) => d !== "")) {
      verifyGateOtp(updated.join(""));
    }
  };

  const verifyGateOtp = (code?: string) => {
    const full = code || gateOtp.join("");
    if (full.length !== 4) {
      toast.error("Please enter all 4 digits of the OTP");
      return;
    }
    setGateIsVerifying(true);
    setTimeout(() => {
      setGateIsVerifying(false);
      loginWithPhone(gatePhone, "Alexander Sterling");
      toast.success("Welcome back to Precision Optics Atelier");
    }, 500);
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    updateUserProfile({
      name: editName,
      email: editEmail,
      phone: editPhone,
    });
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: editName,
          email: editEmail,
          phone: editPhone,
        }),
      });
    } catch (err) {
      console.warn("Profile update warning:", err);
    }
    setTimeout(() => {
      setIsSavingProfile(false);
      toast.success("Profile details updated successfully");
    }, 300);
  };

  // Address Submit
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.streetAddress || !newAddress.city || !newAddress.pincode) {
      toast.error("Please fill all required address fields");
      return;
    }
    saveShippingAddress(newAddress);
    setIsAddressModalOpen(false);
    setNewAddress({
      fullName: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      streetAddress: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    });
    toast.success("Delivery address saved successfully");
  };

  // Prescription Submit
  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    savePrescription(rxTitle, rxData, rxDoctor);
    setIsRxModalOpen(false);
    toast.success("Prescription record archived in your clinical profile");
  };

  // If visitor is not logged in, render the luxury Patron Sign-In Gate
  if (!isLoggedIn) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-md mx-auto bg-white border border-[#EBE6DF] rounded-[28px] p-6 sm:p-10 shadow-xl text-center">
          {/* Atelier Crest */}
          <div className="w-14 h-14 rounded-full bg-[#FAF3EB] border border-[#E8DCCF] flex items-center justify-center mx-auto mb-5 text-[#C86A28]">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DCCF] text-[10px] font-extrabold uppercase tracking-widest text-[#C86A28] mb-3">
            ESTD. 1969 • ATELIER VERIFICATION
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-2">
            Patron Portal Sign In
          </h1>
          <p className="text-xs text-stone-500 mb-8 leading-relaxed">
            Please enter your registered mobile number to access your bespoke orders, certified prescriptions, and atelier privileges.
          </p>

          {!gateOtpSent ? (
            <form onSubmit={handleSendGateOtp} className="space-y-4 text-left">
              <div className="flex items-center border border-[#E8DCCF] rounded-xl overflow-hidden focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
                <div className="px-4 py-3.5 bg-stone-50 border-r border-[#E8DCCF] text-stone-700 font-bold text-sm select-none">
                  +91
                </div>
                <div className="flex-1 px-3.5 py-1.5 flex flex-col justify-center relative">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                    MOBILE NUMBER
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={gatePhone}
                    onChange={(e) => setGatePhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="98100 12345"
                    className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400"
                    autoFocus
                  />
                  {gatePhone && (
                    <button
                      type="button"
                      onClick={() => setGatePhone("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1C1917] hover:bg-black text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Get OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/shop"
                  className="text-xs text-stone-500 hover:text-[#C86A28] underline underline-offset-2 transition-colors"
                >
                  Continue Browsing Public Catalog
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-5 text-left">
              <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-2xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-500 block text-[11px]">OTP sent to</span>
                  <span className="font-bold text-stone-900">+91 {gatePhone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGateOtpSent(false);
                    setGateOtp(["", "", "", ""]);
                  }}
                  className="text-[#C86A28] font-bold hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="text-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 block mb-3">
                  ENTER 4-DIGIT VERIFICATION CODE
                </label>
                <div className="flex justify-center gap-3">
                  {gateOtp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        gateOtpInputs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleGateOtpChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !gateOtp[i] && i > 0) {
                          gateOtpInputs.current[i - 1]?.focus();
                        }
                      }}
                      className="w-12 h-14 text-center text-xl font-bold text-stone-900 bg-white border-2 border-[#E8DCCF] rounded-xl focus:border-[#C86A28] focus:ring-4 focus:ring-[#C86A28]/20 outline-none transition-all"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-stone-500 mt-3">
                  Demo Code: Enter <span className="font-bold text-[#C86A28]">1234</span> to unlock portal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => verifyGateOtp()}
                disabled={gateIsVerifying}
                className="w-full bg-[#1C1917] hover:bg-black text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {gateIsVerifying ? "Verifying..." : "Verify & Unlock Profile"}
              </button>

              <div className="text-center text-xs text-stone-600">
                {gateResendTimer > 0 ? (
                  <span>Resend in {gateResendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendGateOtp()}
                    className="text-[#C86A28] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5 pt-6 mt-6 border-t border-[#E8DCCF]/60 text-stone-500 text-[11px] text-left leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Precision Optics uses 256-bit SSL encryption. Your personal records and clinical data remain strictly protected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* 1. Patron Header Banner */}
      <div className="bg-[#FFFDF9] border border-[#E8DCCF] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Patron Monogram Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#2A1E17] text-[#FAF7F2] border-2 border-[#C86A28] flex items-center justify-center text-xl sm:text-2xl font-serif font-bold shadow-sm shrink-0">
              {user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "PO"}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  {user.name || "Alexander Sterling"}
                </h1>
                <span className="inline-flex items-center gap-1 bg-[#FAF3EB] border border-[#E8DCCF] text-[#C86A28] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  <Award className="w-3 h-3 text-[#C86A28]" /> VIP Platinum Patron
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  {user.phone || "+91 98100 12345"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  {user.email || "patron@precisionoptics.com"}
                </span>
                <span className="text-stone-400">•</span>
                <span className="text-stone-500">
                  Member since {user.joinedDate || "October 2024"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Gem Loyalty Card & Actions */}
          <div className="flex items-center gap-3">
            <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-2xl px-4 py-2.5 text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                GEM LOYALTY BALANCE
              </span>
              <div className="text-lg sm:text-xl font-bold text-[#C86A28]">
                {user.gemPoints} Points
              </div>
              <span className="text-[10px] text-stone-500">
                Worth {formatCurrency(user.gemPoints)} on next order
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                toast.success("Signed out of Precision Optics Atelier");
              }}
              className="p-3 bg-white hover:bg-stone-100 border border-[#E8DCCF] rounded-2xl text-stone-600 hover:text-red-700 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#E8DCCF]">
        {[
          { id: "orders", label: "Orders & Lab Queue", icon: Package, count: orders.length },
          { id: "prescriptions", label: "Clinical Prescriptions", icon: FileText, count: user.savedPrescriptions.length },
          { id: "addresses", label: "Delivery Addresses", icon: MapPin, count: user.savedAddresses.length },
          { id: "loyalty", label: "Gem Loyalty Privileges", icon: Award },
          { id: "profile", label: "Personal Details", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as AccountTab);
                router.replace(`/account?tab=${tab.id}`);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#2A1E17] text-[#FAF7F2] shadow-sm"
                  : "bg-white hover:bg-[#FAF3EB] text-stone-700 border border-[#E8DCCF]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#C86A28]" : "text-stone-500"}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                    isActive ? "bg-[#C86A28] text-white" : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Content Panels */}

      {/* TAB 1: ORDERS & LAB QUEUE */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Atelier Orders & Optical Laboratory Queue
            </h3>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#C86A28] hover:underline flex items-center gap-1"
            >
              <span>Explore Latest Collections</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white border border-[#EBE6DF] rounded-3xl p-10 text-center space-y-4">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="text-base font-serif font-bold text-stone-800">
                No active atelier orders found
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore our curated optical and sunglass collections crafted from Japanese titanium and Italian Mazzucchelli acetate.
              </p>
              <Link
                href="/shop"
                className="inline-block bg-[#1C1917] hover:bg-black text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition-all"
              >
                Browse Collections
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-[#EBE6DF] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:border-[#C86A28]/40"
                >
                  {/* Order Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm tracking-wide font-mono">
                          {order.trackingNumber || order.id}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            order.status === "delivered"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {order.status === "optician_assembly"
                            ? "In Lab Assembly"
                            : order.status === "quality_check"
                            ? "Quality Inspection"
                            : order.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Placed on {formatDate(order.createdAt)} • Payment Method:{" "}
                        <span className="uppercase font-semibold text-stone-700">
                          {order.paymentMethod}
                        </span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                        Total Amount
                      </span>
                      <span className="text-base font-extrabold text-stone-900">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* 5-Stage Visual Lab Stepper */}
                  <div className="bg-[#FAF7F2] border border-[#E8DCCF]/60 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-stone-600 mb-2">
                      <span className="flex items-center gap-1 text-[#C86A28]">
                        <Clock className="w-3.5 h-3.5" /> 5-Stage Lab Assembly Queue
                      </span>
                      <span>Estimated Dispatch: {order.estimatedDeliveryDate || "3-4 Business Days"}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-center text-[9px] font-bold">
                      {["Confirmed", "Lab Assembly", "Quality Check", "Dispatched", "Delivered"].map(
                        (step, idx) => {
                          const statusIndex =
                            order.status === "confirmed"
                              ? 0
                              : order.status === "optician_assembly"
                              ? 1
                              : order.status === "quality_check"
                              ? 2
                              : order.status === "dispatched"
                              ? 3
                              : 4;
                          const isDone = idx <= statusIndex;
                          return (
                            <div key={step} className="space-y-1">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  isDone ? "bg-[#C86A28]" : "bg-stone-200"
                                }`}
                              />
                              <span className={isDone ? "text-stone-900" : "text-stone-400"}>
                                {step}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Item Rows Preview */}
                  <div className="space-y-3 pt-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <img
                          src={item.product?.images?.[0] || "/images/placeholder-glasses.jpg"}
                          alt={item.product?.name || "Eyewear"}
                          className="w-14 h-11 object-contain bg-[#FAF7F2] p-1 rounded-lg border border-[#E8DCCF]"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-stone-900 truncate">
                            {item.product?.brand} — {item.product?.name}
                          </h5>
                          <p className="text-[11px] text-stone-500">
                            Color: {item.selectedColor || item.product?.color} • Qty:{" "}
                            {item.quantity}
                          </p>
                          {item.lensConfig && (
                            <span className="text-[10px] text-[#C86A28] font-semibold block">
                              Lens: {item.lensConfig.lensPackage?.name || "Bespoke Prescription Surfacing"}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-stone-900">
                          {formatCurrency(
                            ((item.product?.price || 0) + (item.lensConfig?.totalLensPrice || 0)) *
                              (item.quantity || 1)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 text-xs">
                    <button
                      type="button"
                      onClick={() => openTrackingModal(order)}
                      className="text-[#C86A28] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Track In Optical Lab</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLINICAL PRESCRIPTIONS */}
      {activeTab === "prescriptions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Certified Ophthalmic Prescriptions
              </h3>
              <p className="text-xs text-stone-500">
                Archived optical parameters (OD/OS) for instant bespoke lens mounting.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsRxModalOpen(true)}
              className="bg-[#1C1917] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Prescription</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.savedPrescriptions.map((rx) => (
              <div
                key={rx.id}
                className="bg-white border border-[#EBE6DF] rounded-2xl p-5 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{rx.title}</h4>
                    <p className="text-[11px] text-stone-500">
                      {rx.doctorName} • Verified on {rx.date}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removePrescription(rx.id);
                      toast.success("Prescription removed");
                    }}
                    className="text-stone-300 hover:text-red-600 transition-colors p-1"
                    title="Remove Prescription"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* OD / OS Clinical Table */}
                <div className="border border-[#E8DCCF] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAF7F2] text-[10px] font-extrabold uppercase tracking-wider text-stone-600 border-b border-[#E8DCCF]">
                      <tr>
                        <th className="px-3 py-2">Eye</th>
                        <th className="px-3 py-2">SPH</th>
                        <th className="px-3 py-2">CYL</th>
                        <th className="px-3 py-2">Axis</th>
                        <th className="px-3 py-2">ADD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DCCF]/60 text-stone-800 font-semibold font-mono">
                      <tr>
                        <td className="px-3 py-2 font-sans font-bold text-[#C86A28]">Right (OD)</td>
                        <td className="px-3 py-2">{rx.data.rightEye.sph || "0.00"}</td>
                        <td className="px-3 py-2">{rx.data.rightEye.cyl || "0.00"}</td>
                        <td className="px-3 py-2">{rx.data.rightEye.axis || "0"}°</td>
                        <td className="px-3 py-2">{rx.data.rightEye.add || "—"}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-sans font-bold text-[#C86A28]">Left (OS)</td>
                        <td className="px-3 py-2">{rx.data.leftEye.sph || "0.00"}</td>
                        <td className="px-3 py-2">{rx.data.leftEye.cyl || "0.00"}</td>
                        <td className="px-3 py-2">{rx.data.leftEye.axis || "0"}°</td>
                        <td className="px-3 py-2">{rx.data.leftEye.add || "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>Pupillary Distance (PD): <strong className="text-stone-900">{rx.data.pd} mm</strong></span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SAVED ADDRESSES */}
      {activeTab === "addresses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Saved Delivery Locations
              </h3>
              <p className="text-xs text-stone-500">
                Addresses utilized for express insured optical dispatch.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="bg-[#1C1917] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.savedAddresses.map((addr, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#EBE6DF] rounded-2xl p-5 shadow-xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-stone-900 text-sm">{addr.fullName}</h4>
                    {idx === 0 && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  {user.savedAddresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteSavedAddress(idx);
                        toast.success("Address removed");
                      }}
                      className="text-stone-300 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  {addr.streetAddress}, {addr.city}, {addr.state} — {addr.pincode}
                </p>
                <p className="text-xs text-stone-500">
                  Phone: <strong className="text-stone-800">{addr.phone}</strong> • Country:{" "}
                  {addr.country}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GEM LOYALTY CLUB */}
      {activeTab === "loyalty" && (
        <div className="space-y-6">
          <div className="bg-[#2A1E17] text-[#FAF7F2] rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#C86A28] bg-white/10 px-3 py-1 rounded-full inline-block">
                ESTD. 1969 • ATELIER GEM CLUB
              </span>
              <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                VIP Platinum Patron Privileges
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                As an esteemed patron of Precision Optics, every bespoke eyewear order accumulates Gem Loyalty Points directly applicable as store currency on future orders.
              </p>

              <div className="pt-2 flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    Available Balance
                  </span>
                  <span className="text-2xl font-bold text-[#C86A28]">
                    {user.gemPoints} Points
                  </span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    Redemption Value
                  </span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(user.gemPoints)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Priority Lab Corridors",
                desc: "Expedited surfacing and precision laser fitting for all Zeiss lens packages.",
              },
              {
                title: "Ultrasonic Spa Cleaning",
                desc: "Complimentary deep ultrasonic frame cleaning and nosepad refurbishment at any boutique.",
              },
              {
                title: "1-Year Lens Protection",
                desc: "Free replacement for minor lens abrasions within 12 months of purchase.",
              },
            ].map((perk, i) => (
              <div
                key={i}
                className="bg-white border border-[#EBE6DF] rounded-2xl p-5 shadow-xs space-y-2"
              >
                <Sparkles className="w-5 h-5 text-[#C86A28]" />
                <h4 className="font-bold text-stone-900 text-sm">{perk.title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PERSONAL PROFILE DETAILS */}
      {activeTab === "profile" && (
        <div className="max-w-xl bg-white border border-[#EBE6DF] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Personal Atelier Details
            </h3>
            <p className="text-xs text-stone-500">
              Update your contact credentials associated with bespoke orders and optical records.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-600 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-4 py-2.5 font-semibold text-stone-900 outline-none focus:border-[#C86A28] focus:ring-2 focus:ring-[#C86A28]/20"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-600 block mb-1">
                Mobile Number (SMS Notifications)
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-4 py-2.5 font-semibold text-stone-900 outline-none focus:border-[#C86A28] focus:ring-2 focus:ring-[#C86A28]/20"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-600 block mb-1">
                Email Address (Order Invoices)
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-4 py-2.5 font-semibold text-stone-900 outline-none focus:border-[#C86A28] focus:ring-2 focus:ring-[#C86A28]/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="bg-[#1C1917] hover:bg-black text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSavingProfile ? "Saving Changes..." : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 1: Add Shipping Address */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#EBE6DF] rounded-[24px] max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute right-5 top-5 text-stone-400 hover:text-stone-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-lg font-serif font-bold text-stone-900 mb-1">
              Add Delivery Location
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              Enter your shipping destination for optical delivery.
            </p>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-stone-600 block mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 font-semibold text-stone-900 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-stone-600 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 font-semibold text-stone-900 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-stone-600 block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.streetAddress}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, streetAddress: e.target.value })
                  }
                  placeholder="Apartment, building, street"
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 font-semibold text-stone-900 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-stone-600 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 font-semibold text-stone-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-stone-600 block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 font-semibold text-stone-900 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-stone-600 block mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 font-semibold text-stone-900 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#1C1917] hover:bg-black text-white font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Save Delivery Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Clinical Prescription */}
      {isRxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#EBE6DF] rounded-[24px] max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsRxModalOpen(false)}
              className="absolute right-5 top-5 text-stone-400 hover:text-stone-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-lg font-serif font-bold text-stone-900 mb-1">
              Add Certified Prescription
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              Enter the OD/OS parameters specified by your optometrist.
            </p>

            <form onSubmit={handleAddPrescription} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-stone-600 block mb-1">
                    Rx Title
                  </label>
                  <input
                    type="text"
                    required
                    value={rxTitle}
                    onChange={(e) => setRxTitle(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 font-semibold text-stone-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-stone-600 block mb-1">
                    Doctor / Clinic Name
                  </label>
                  <input
                    type="text"
                    required
                    value={rxDoctor}
                    onChange={(e) => setRxDoctor(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 font-semibold text-stone-900 outline-none"
                  />
                </div>
              </div>

              {/* Right Eye (OD) */}
              <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-3 space-y-2">
                <span className="font-bold text-[#C86A28] text-xs">Right Eye (OD)</span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-stone-500 block">SPH</label>
                    <input
                      type="text"
                      value={rxData.rightEye.sph}
                      onChange={(e) =>
                        setRxData({
                          ...rxData,
                          rightEye: { ...rxData.rightEye, sph: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#E8DCCF] rounded-lg py-1 px-1 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-stone-500 block">CYL</label>
                    <input
                      type="text"
                      value={rxData.rightEye.cyl}
                      onChange={(e) =>
                        setRxData({
                          ...rxData,
                          rightEye: { ...rxData.rightEye, cyl: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#E8DCCF] rounded-lg py-1 px-1 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-stone-500 block">Axis</label>
                    <input
                      type="text"
                      value={rxData.rightEye.axis}
                      onChange={(e) =>
                        setRxData({
                          ...rxData,
                          rightEye: { ...rxData.rightEye, axis: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#E8DCCF] rounded-lg py-1 px-1 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-stone-500 block">ADD</label>
                    <input
                      type="text"
                      value={rxData.rightEye.add}
                      onChange={(e) =>
                        setRxData({
                          ...rxData,
                          rightEye: { ...rxData.rightEye, add: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#E8DCCF] rounded-lg py-1 px-1 text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Left Eye (OS) */}
              <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl p-3 space-y-2">
                <span className="font-bold text-[#C86A28] text-xs">Left Eye (OS)</span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-stone-500 block">SPH</label>
                    <input
                      type="text"
                      value={rxData.leftEye.sph}
                      onChange={(e) =>
                        setRxData({
                          ...rxData,
                          leftEye: { ...rxData.leftEye, sph: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#E8DCCF] rounded-lg py-1 px-1 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-stone-500 block">CYL</label>
                    <input
                      type="text"
                      value={rxData.leftEye.cyl}
                      onChange={(e) =>
                        setRxData({
                          ...rxData,
                          leftEye: { ...rxData.leftEye, cyl: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#E8DCCF] rounded-lg py-1 px-1 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-stone-500 block">Axis</label>
                    <input
                      type="text"
                      value={rxData.leftEye.axis}
                      onChange={(e) =>
                        setRxData({
                          ...rxData,
                          leftEye: { ...rxData.leftEye, axis: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#E8DCCF] rounded-lg py-1 px-1 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-stone-500 block">ADD</label>
                    <input
                      type="text"
                      value={rxData.leftEye.add}
                      onChange={(e) =>
                        setRxData({
                          ...rxData,
                          leftEye: { ...rxData.leftEye, add: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#E8DCCF] rounded-lg py-1 px-1 text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-stone-600 block mb-1">
                  Pupillary Distance (PD) in mm
                </label>
                <input
                  type="text"
                  value={rxData.pd}
                  onChange={(e) => setRxData({ ...rxData, pd: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-xl px-3 py-2 font-semibold text-stone-900 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#1C1917] hover:bg-black text-white font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Save Prescription Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OrderTrackingModal />
    </div>
  );
}

export default function AccountPage() {
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
        <Header
          onOpenSearch={() => {}}
          onSelectCategory={(cat) => router.push(`/shop?category=${cat}`)}
          onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
          activeCategory="account"
          onNavigate={handleNavigate}
        />

        <Suspense
          fallback={
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-stone-300 border-t-[#C86A28] rounded-full animate-spin mb-3" />
              <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Loading Atelier Portal...
              </p>
            </div>
          }
        >
          <AccountDashboardContent />
        </Suspense>
      </div>

      <Footer
        onSelectCategory={(cat) => router.push(`/shop?category=${cat}`)}
        onSelectBrand={(brand) => router.push(`/shop?brand=${brand}`)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
