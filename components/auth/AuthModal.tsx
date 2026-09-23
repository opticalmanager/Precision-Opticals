"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ShieldCheck, Mail, Phone, ArrowRight, RotateCcw, Lock, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  returnUrl?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSuccess,
  returnUrl: propReturnUrl,
}) => {
  const router = useRouter();
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithPhone,
    loginWithEmail,
    authReturnUrl,
    user,
  } = useAuth();

  const isModalVisible = propIsOpen !== undefined ? propIsOpen : isAuthModalOpen;
  const handleClose = propOnClose || closeAuthModal;
  const targetReturnUrl = propReturnUrl || authReturnUrl;

  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState(user.phone?.replace("+91 ", "") || "");
  const [email, setEmail] = useState(user.email || "");
  const [name, setName] = useState(user.name || "");

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, resendTimer]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalVisible) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalVisible, handleClose]);

  if (!isModalVisible) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (mode === "phone") {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }
      setIsLoadingOtp(true);
      try {
        await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone, mode: "phone" }),
        });
      } catch (err) {
        console.warn("send-otp error:", err);
      } finally {
        setIsLoadingOtp(false);
        setIsOtpSent(true);
        setResendTimer(30);
        toast.success("Verification code sent!", {
          description: `4-digit OTP sent to +91 ${cleanPhone}. (Use demo code: 1234)`,
        });
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      }
    } else {
      if (!email || !email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }
      setIsLoadingOtp(true);
      try {
        await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, mode: "email" }),
        });
      } catch (err) {
        console.warn("send-otp error:", err);
      } finally {
        setIsLoadingOtp(false);
        setIsOtpSent(true);
        setResendTimer(30);
        toast.success("Verification code sent!", {
          description: `4-digit OTP sent to ${email}. (Use demo code: 1234)`,
        });
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto verify when 4 digits are entered
    if (newOtp.every((digit) => digit !== "")) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (codeString?: string) => {
    const fullCode = codeString || otp.join("");
    if (fullCode.length !== 4) {
      toast.error("Please enter all 4 digits of the OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          email,
          otp: fullCode,
          mode,
          name: name || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Invalid verification code. Use demo code 1234.");
        setIsVerifying(false);
        return;
      }
    } catch (err) {
      console.warn("verify-otp error:", err);
    }

    setTimeout(() => {
      setIsVerifying(false);
      if (mode === "phone") {
        loginWithPhone(phone, name || undefined);
      } else {
        loginWithEmail(email, name || undefined);
      }
      toast.success("Welcome to Precision Optics", {
        description: `Signed in as ${name || (mode === "phone" ? `+91 ${phone}` : email)}`,
      });
      handleClose();

      if (onSuccess) {
        onSuccess();
      } else if (targetReturnUrl) {
        router.push(targetReturnUrl);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white border border-[#EBE6DF] rounded-[24px] p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Atelier Crest Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EB] border border-[#E8DCCF] text-[10px] font-extrabold uppercase tracking-widest text-[#C86A28] mb-4">
          <Lock className="w-3 h-3 text-[#C86A28]" />
          <span>ESTD. 1969 • BESPOKE ATELIER ACCESS</span>
        </div>

        {/* Modal Title */}
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-2">
          {mode === "phone" ? "Sign In with Mobile OTP" : "Sign In with Email"}
        </h2>
        <p className="text-xs text-stone-500 mb-6 font-normal">
          Access your bespoke order history, certified lens prescriptions, and atelier privileges.
        </p>

        {!isOtpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Optional Full Name Input for Personalization */}
            <div className="border border-[#E8DCCF] rounded-xl px-4 py-2 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white relative">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                FULL NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alexander Sterling"
                className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal py-0.5"
              />
            </div>

            {mode === "phone" ? (
              <div>
                {/* Phone Input Box matching Figma Reference */}
                <div className="flex items-center border border-[#E8DCCF] rounded-xl overflow-hidden focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
                  <div className="px-4 py-3 bg-stone-50 border-r border-[#E8DCCF] text-stone-700 font-bold text-sm select-none">
                    +91
                  </div>
                  <div className="flex-1 px-3.5 py-1.5 flex flex-col justify-center relative">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="98100 12345"
                      className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal"
                      autoFocus
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
                <p className="text-[11px] text-stone-500 mt-2 font-normal">
                  We will send an SMS with a 4-digit verification code to this mobile number.
                </p>
              </div>
            ) : (
              <div>
                {/* Email Input Box */}
                <div className="border border-[#E8DCCF] rounded-xl px-4 py-2 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white relative">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander@precisionoptics.com"
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
                <p className="text-[11px] text-stone-500 mt-2 font-normal">
                  We will send a 4-digit verification code to your email inbox.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <button
                type="submit"
                disabled={isLoadingOtp}
                className="w-full bg-[#1C1917] hover:bg-black text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoadingOtp ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <>
                    <span>Get OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "phone" ? "email" : "phone");
                  setIsOtpSent(false);
                }}
                className="w-full bg-[#FAF3EB] hover:bg-[#F2E8DC] text-[#2A1E17] border border-[#E8DCCF] font-bold text-xs sm:text-sm py-3 px-3 rounded-xl transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                {mode === "phone" ? (
                  <>
                    <Mail className="w-3.5 h-3.5 text-stone-600" />
                    <span>Use Email</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-3.5 h-3.5 text-stone-600" />
                    <span>Use Phone</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* OTP Verification Stage */
          <div className="space-y-5">
            <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">Verification code sent to</span>
                <span className="font-bold text-stone-900 text-sm">
                  {mode === "phone" ? `+91 ${phone}` : email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp(["", "", "", ""]);
                }}
                className="text-xs font-bold text-[#C86A28] hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* 4 Digit Verification Boxes */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 block mb-3 text-center">
                ENTER 4-DIGIT VERIFICATION CODE
              </label>
              <div className="flex justify-center gap-3">
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
                    className="w-12 h-14 text-center text-xl font-bold text-stone-900 bg-white border-2 border-[#E8DCCF] rounded-xl focus:border-[#C86A28] focus:ring-4 focus:ring-[#C86A28]/20 outline-none transition-all"
                  />
                ))}
              </div>
              <p className="text-[11px] text-stone-500 text-center mt-3">
                Demo Code: Enter <span className="font-bold text-[#C86A28]">1234</span> or any 4 digits to sign in instantly.
              </p>
            </div>

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
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <>
                    <span>Verify & Enter Atelier</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex justify-center items-center text-xs text-stone-600">
                {resendTimer > 0 ? (
                  <span>
                    Resend OTP in <strong className="text-stone-900">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-[#C86A28] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security Reassurance Notice */}
        <div className="flex items-start gap-2.5 pt-5 mt-5 border-t border-[#E8DCCF]/60 text-stone-500 text-[11px] leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Precision Optics uses 256-bit SSL encryption. Your credentials and prescription data remain strictly confidential.
          </p>
        </div>
      </div>
    </div>
  );
};
