"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ShieldCheck, Mail, Phone, ArrowRight, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface StepLoginSignupProps {
  onSuccess: () => void;
  onCheckoutAsGuest: () => void;
}

export const StepLoginSignup: React.FC<StepLoginSignupProps> = ({
  onSuccess,
  onCheckoutAsGuest,
}) => {
  const { loginWithPhone, loginWithEmail, user } = useAuth();

  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState(user.phone?.replace("+91 ", "") || "");
  const [email, setEmail] = useState(user.email || "");
  const [name, setName] = useState(user.name || "");

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);

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

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (mode === "phone") {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }
      setIsOtpSent(true);
      setResendTimer(30);
      toast.success("Verification code sent!", {
        description: `4-digit OTP sent to +91 ${cleanPhone}. (Use demo code: 1234)`,
      });
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } else {
      if (!email || !email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }
      setIsOtpSent(true);
      setResendTimer(30);
      toast.success("Verification code sent!", {
        description: `4-digit OTP sent to ${email}. (Use demo code: 1234)`,
      });
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
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

    // Auto verify when 4 digits are filled
    if (newOtp.every((digit) => digit !== "")) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const verifyOtp = (codeString?: string) => {
    const fullCode = codeString || otp.join("");
    if (fullCode.length !== 4) {
      toast.error("Please enter all 4 digits of the OTP");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (mode === "phone") {
        loginWithPhone(phone, name || undefined);
      } else {
        loginWithEmail(email, name || undefined);
      }
      toast.success("Verified successfully!");
      onSuccess();
    }, 600);
  };

  return (
    <div className="w-full bg-white border border-[#EBE6DF] rounded-[24px] p-6 sm:p-8 lg:p-10 shadow-sm">
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-6">
        {mode === "phone" ? "Login with Phone Number" : "Login with Email Address"}
      </h2>

      {!isOtpSent ? (
        /* Form for entering Phone or Email */
        <form onSubmit={handleSendOtp} className="space-y-6">
          {mode === "phone" ? (
            <div>
              {/* Phone Input Box matching Figma media_1789993650193.png */}
              <div className="flex items-center border border-[#E8DCCF] rounded-xl overflow-hidden focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
                <div className="px-4 py-3.5 bg-stone-50 border-r border-[#E8DCCF] text-stone-700 font-bold text-sm select-none">
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
                    placeholder="98100 98765"
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
              <p className="text-xs text-stone-500 mt-2 font-normal">
                We will send an SMS with a 4-digit verification code to this number.
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
              <p className="text-xs text-stone-500 mt-2 font-normal">
                We will send a 4-digit verification code to your email inbox.
              </p>
            </div>
          )}

          {/* Action Buttons Matching Figma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <button
              type="submit"
              className="w-full bg-[#1C1917] hover:bg-black text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-sm transition-all duration-200 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2"
            >
              <span>Get OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "phone" ? "email" : "phone");
                setIsOtpSent(false);
              }}
              className="w-full bg-[#FAF3EB] hover:bg-[#F2E8DC] text-[#2A1E17] border border-[#E8DCCF] font-bold text-sm py-3.5 px-6 rounded-xl transition-all duration-200 cursor-pointer text-center"
            >
              {mode === "phone" ? "Use Email Address" : "Use Phone Number"}
            </button>
          </div>
        </form>
      ) : (
        /* OTP Verification Panel */
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 block">Verification code sent to</span>
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

          {/* 4 Digit Boxes */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 block mb-3 text-center">
              ENTER 4-DIGIT VERIFICATION CODE
            </label>
            <div className="flex justify-center gap-3 sm:gap-4">
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
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold text-stone-900 bg-white border-2 border-[#E8DCCF] rounded-xl focus:border-[#C86A28] focus:ring-4 focus:ring-[#C86A28]/20 outline-none transition-all"
                />
              ))}
            </div>
            <p className="text-[11px] text-stone-500 text-center mt-3">
              Demo Code: Enter <span className="font-bold text-[#C86A28]">1234</span> or any 4 digits to sign in instantly.
            </p>
          </div>

          {/* Verify Button & Resend */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => verifyOtp()}
              disabled={isVerifying}
              className="w-full bg-[#1C1917] hover:bg-black text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-sm transition-all duration-200 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <>
                  <span>Verify & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex justify-center items-center text-xs text-stone-600">
              {resendTimer > 0 ? (
                <span>Resend OTP in <strong className="text-stone-900">{resendTimer}s</strong></span>
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

      {/* Checkout As Guest Link Matching Figma */}
      <div className="text-center pt-8 border-t border-[#E8DCCF]/60 mt-8">
        <button
          type="button"
          onClick={onCheckoutAsGuest}
          className="text-stone-900 font-bold text-xs sm:text-sm underline underline-offset-4 hover:text-[#C86A28] transition-colors cursor-pointer"
        >
          Checkout as guest
        </button>
      </div>

      {/* In-Card Security Notice Matching Figma media_1789993650193.png */}
      <div className="flex items-start gap-2.5 pt-6 mt-6 border-t border-[#E8DCCF]/40 text-stone-500 text-[11px] leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          Precision Optics uses 256-bit SSL encryption. Your credentials and prescription data remain strictly confidential.
        </p>
      </div>
    </div>
  );
};
