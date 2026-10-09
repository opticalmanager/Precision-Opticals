"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  MessageSquare,
  Smartphone,
  Mail,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Loader2,
  X,
  Sparkles,
  Award,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect") || "/account";

  const { loginWithPhone, loginWithEmail, isLoggedIn } = useAuth();

  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");

  // Zero dummy data
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeChannel, setActiveChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isSwitchingChannel, setIsSwitchingChannel] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // If already logged in, redirect to destination
  useEffect(() => {
    if (isLoggedIn) {
      router.push(returnUrl);
    }
  }, [isLoggedIn, returnUrl, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, resendTimer]);

  const handleSendOtp = async (channelPreference: "whatsapp" | "sms" = channel, e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error("Please provide your full name");
      return;
    }

    if (method === "phone") {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }

      setIsLoadingOtp(true);
      try {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: cleanPhone,
            channel: channelPreference,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          toast.error("Unable to dispatch verification code", {
            description: data.error || "Please check your mobile number and try again.",
          });
          if (data.cooldownRemaining) {
            setResendTimer(data.cooldownRemaining);
          }
          return;
        }

        const deliveredChannel = (data.channel || channelPreference) as "whatsapp" | "sms";
        setActiveChannel(deliveredChannel);
        setIsOtpSent(true);
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(data.cooldown || 60);

        if (data.fallbackUsed) {
          toast.info("WhatsApp delivery fallback active", {
            description: `Verification code dispatched via SMS to +91 ${cleanPhone.slice(-10)}.`,
          });
        } else if (deliveredChannel === "whatsapp") {
          toast.success("WhatsApp verification code sent", {
            description: `6-digit atelier code sent to your WhatsApp at +91 ${cleanPhone.slice(-10)}.`,
          });
        } else {
          toast.success("SMS verification code sent", {
            description: `6-digit code dispatched via SMS to +91 ${cleanPhone.slice(-10)}.`,
          });
        }

        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      } catch (err: any) {
        toast.error("Network error sending verification code", {
          description: err?.message || "Please check your internet connection.",
        });
      } finally {
        setIsLoadingOtp(false);
      }
    } else {
      if (!email || !email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }
      setIsLoadingOtp(true);
      try {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, mode: "email" }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.error || "Failed to dispatch email verification code");
          return;
        }
        setIsOtpSent(true);
        setResendTimer(60);
        toast.success("Verification code sent!", {
          description: `Code dispatched to ${email}`,
        });
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      } catch {
        toast.error("Failed to send verification code");
      } finally {
        setIsLoadingOtp(false);
      }
    }
  };

  const handleChannelSwitchDuringOtp = async (newChannel: "whatsapp" | "sms") => {
    const cleanPhone = phone.replace(/\D/g, "");
    setIsSwitchingChannel(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, channel: newChannel }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || `Failed to dispatch code via ${newChannel.toUpperCase()}`);
        if (data.cooldownRemaining) {
          setResendTimer(data.cooldownRemaining);
        }
        return;
      }
      setActiveChannel(newChannel);
      setResendTimer(data.cooldown || 60);
      toast.success(`Verification code dispatched via ${newChannel === "whatsapp" ? "WhatsApp" : "SMS"}`, {
        description: `Check +91 ${cleanPhone.slice(-10)} for your 6-digit atelier code.`,
      });
    } catch {
      toast.error(`Unable to connect to ${newChannel.toUpperCase()} gateway`);
    } finally {
      setIsSwitchingChannel(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split("");
      const newOtp = [...otp];
      for (let i = 0; i < digits.length; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      if (digits.length === 6) {
        verifyOtp(newOtp.join(""));
      } else {
        otpInputsRef.current[Math.min(digits.length, 5)]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (cleaned && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (cleaned && index === 5) {
      const full = newOtp.join("");
      if (full.length === 6) {
        verifyOtp(full);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const digits = pasted.split("");
    const newOtp = [...otp];
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);

    if (pasted.length === 6) {
      verifyOtp(pasted);
    } else {
      otpInputsRef.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const verifyOtp = async (codeString?: string) => {
    const fullCode = (codeString || otp.join("")).trim();
    if (fullCode.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          email,
          otp: fullCode,
          mode: method,
          name: name.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error("Verification failed", {
          description: data.error || "Invalid code. Please check the code and try again.",
        });
        setIsVerifying(false);
        return;
      }

      if (method === "phone") {
        loginWithPhone(cleanPhone, data.user, data.orders);
      } else {
        loginWithEmail(email, name.trim());
      }

      toast.success("Welcome to Precision Optics Atelier", {
        description: `Account created successfully for ${name.trim()}. Welcome bonus credited!`,
      });

      router.push(returnUrl);
    } catch {
      toast.error("Connection error during verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2]">
      <div className="w-full max-w-md bg-white border border-[#EBE6DF] rounded-[28px] p-7 sm:p-9 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Atelier Crest Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EB] border border-[#E8DCCF] text-[10px] font-extrabold uppercase tracking-widest text-[#C86A28] mb-4">
          <Award className="w-3 h-3 text-[#C86A28]" />
          <span>ESTD. 1969 • ATELIER PATRON MEMBERSHIP</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A1E17] tracking-tight mb-2">
          Join Precision Optics
        </h1>
        <p className="text-xs text-stone-500 mb-6 font-normal leading-relaxed">
          Create your atelier profile to preserve clinical optical prescriptions, access bespoke lens packages, and earn rewards.
        </p>

        {/* Welcome Perks Pill */}
        <div className="p-3 rounded-2xl bg-[#FAF3EB] border border-[#E8DCCF] mb-6 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#C86A28] shrink-0 mt-0.5" />
          <div className="text-[11px] text-stone-700 leading-snug">
            <span className="font-bold text-[#2A1E17] block mb-0.5">Patron Welcome Privileges</span>
            <span>Receive 500 Gem Loyalty Points instantly upon verification.</span>
          </div>
        </div>

        {!isOtpSent ? (
          <div className="space-y-4">
            {method === "phone" ? (
              <form onSubmit={(e) => handleSendOtp(channel, e)} className="space-y-4">
                {/* Full Name Input */}
                <div className="border border-[#E8DCCF] rounded-xl px-4 py-2 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white relative">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal py-0.5"
                    autoFocus
                  />
                </div>

                {/* Channel Selector: WhatsApp OTP (Default/Recommended) vs SMS OTP */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1.5">
                    VERIFICATION CHANNEL
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* WhatsApp Option (Primary & Pre-selected) */}
                    <button
                      type="button"
                      onClick={() => setChannel("whatsapp")}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer relative ${
                        channel === "whatsapp"
                          ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 shadow-2xs"
                          : "bg-white border-[#E8DCCF] text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          channel === "whatsapp"
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold truncate block">WhatsApp</span>
                        <span className="text-[10px] font-semibold text-emerald-700 block truncate">
                          Primary / Instant
                        </span>
                      </div>
                      {channel === "whatsapp" && (
                        <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </button>

                    {/* SMS Option */}
                    <button
                      type="button"
                      onClick={() => setChannel("sms")}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer relative ${
                        channel === "sms"
                          ? "bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 shadow-2xs"
                          : "bg-white border-[#E8DCCF] text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          channel === "sms"
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold block truncate">SMS OTP</span>
                        <span className="text-[10px] text-stone-500 block truncate">
                          Direct Mobile
                        </span>
                      </div>
                      {channel === "sms" && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile Number Input */}
                <div>
                  <div className="flex items-center border border-[#E8DCCF] rounded-xl overflow-hidden focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
                    <div className="px-4 py-3.5 bg-stone-50 border-r border-[#E8DCCF] text-stone-700 font-bold text-sm select-none flex items-center gap-1.5">
                      <span>+91</span>
                    </div>
                    <div className="flex-1 px-3.5 py-1.5 flex flex-col justify-center relative">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                        10-DIGIT MOBILE NUMBER *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        maxLength={10}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter mobile number"
                        className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal font-mono"
                      />
                      {phone && (
                        <button
                          type="button"
                          onClick={() => setPhone("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {channel === "whatsapp" ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-1.5 mt-2">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Code will be delivered directly to your WhatsApp app</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-blue-800 bg-blue-50 border border-blue-200/80 rounded-lg px-3 py-1.5 mt-2">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Code will be dispatched via standard cellular SMS</span>
                    </div>
                  )}
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={isLoadingOtp}
                  className="w-full bg-[#1C1917] hover:bg-black text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingOtp ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Dispatching Code...
                    </span>
                  ) : (
                    <>
                      {channel === "whatsapp" ? (
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-blue-300" />
                      )}
                      <span>
                        {channel === "whatsapp" ? "Register via WhatsApp OTP" : "Register via SMS OTP"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Email Auth Form */
              <form onSubmit={(e) => handleSendOtp("whatsapp", e)} className="space-y-4">
                <div className="border border-[#E8DCCF] rounded-xl px-4 py-2 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white relative">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal py-0.5"
                  />
                </div>

                <div className="border border-[#E8DCCF] rounded-xl px-4 py-2.5 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white relative">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@precisionoptics.com"
                    className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal py-1"
                    autoFocus
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoadingOtp}
                  className="w-full bg-[#1C1917] hover:bg-black text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingOtp ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <>
                      <span>Get Email Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Switch to Email option */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setMethod(method === "phone" ? "email" : "phone");
                  setIsOtpSent(false);
                }}
                className="text-xs text-stone-600 hover:text-[#C86A28] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {method === "phone" ? (
                  <>
                    <Mail className="w-3.5 h-3.5 text-stone-500" />
                    <span>Prefer email? Register with email instead</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                    <span>Back to Phone OTP (WhatsApp / SMS)</span>
                  </>
                )}
              </button>
            </div>

            {/* Switch to Sign In */}
            <div className="pt-4 border-t border-[#E8DCCF]/80 text-center">
              <p className="text-xs text-stone-600">
                Already an atelier member?{" "}
                <Link
                  href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
                  className="font-bold text-[#C86A28] hover:underline"
                >
                  Sign In to Account
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* OTP Verification Stage */
          <div className="space-y-5">
            <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">
                  {activeChannel === "whatsapp"
                    ? "WhatsApp verification code sent to"
                    : "SMS verification code sent to"}
                </span>
                <span className="font-bold text-stone-900 text-sm font-mono flex items-center gap-1.5 mt-0.5">
                  {activeChannel === "whatsapp" ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      WhatsApp
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                      SMS
                    </span>
                  )}
                  <span>{method === "phone" ? `+91 ${phone}` : email}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="text-xs font-bold text-[#C86A28] hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* 6-Digit Verification Input Boxes */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 block mb-3 text-center">
                ENTER 6-DIGIT ATELIER CODE
              </label>
              <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold text-stone-900 bg-white border-2 border-[#E8DCCF] rounded-xl focus:border-[#C86A28] focus:ring-4 focus:ring-[#C86A28]/20 outline-none transition-all font-mono"
                  />
                ))}
              </div>
              <p className="text-[11px] text-stone-500 text-center mt-3">
                {activeChannel === "whatsapp"
                  ? "Open your WhatsApp to view or copy the 6-digit code."
                  : "Check your phone messages for the 6-digit SMS code."}
              </p>
            </div>

            {/* Dynamic Channel Switcher during verification */}
            {method === "phone" && (
              <div className="text-center pt-1">
                {activeChannel === "whatsapp" ? (
                  <button
                    type="button"
                    onClick={() => handleChannelSwitchDuringOtp("sms")}
                    disabled={isSwitchingChannel}
                    className="text-xs text-stone-600 hover:text-[#C86A28] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSwitchingChannel ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Smartphone className="w-3.5 h-3.5" />
                    )}
                    <span>Didn&apos;t receive on WhatsApp? Get OTP via SMS</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleChannelSwitchDuringOtp("whatsapp")}
                    disabled={isSwitchingChannel}
                    className="text-xs text-stone-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSwitchingChannel ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>Send via WhatsApp instead</span>
                  </button>
                )}
              </div>
            )}

            {/* Verify Button & Resend Countdown */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => verifyOtp()}
                disabled={isVerifying}
                className="w-full bg-[#1C1917] hover:bg-black text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-sm transition-all duration-200 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Profile...
                  </span>
                ) : (
                  <>
                    <span>Activate Account & Enter Atelier</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex justify-center items-center text-xs text-stone-600">
                {resendTimer > 0 ? (
                  <span>
                    Resend code in <strong className="text-stone-900">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp(activeChannel)}
                    className="text-[#C86A28] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resend {activeChannel === "whatsapp" ? "WhatsApp" : "SMS"} code
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security Reassurance Notice */}
        <div className="flex items-start gap-2.5 pt-5 mt-6 border-t border-[#E8DCCF]/60 text-stone-500 text-[11px] leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Precision Optics uses 256-bit SSL encryption. Your credentials and prescription data remain strictly confidential.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C86A28]" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
