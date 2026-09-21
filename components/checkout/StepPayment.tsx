"use client";

import React, { useState } from "react";
import {
  QrCode,
  CreditCard,
  Building2,
  Truck,
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { PaymentMethod, ShippingAddress } from "@/types";
import { formatCurrency, getEstimatedDeliveryDate } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface StepPaymentProps {
  shippingAddress: ShippingAddress;
  onPaymentSubmit: (paymentMethod: PaymentMethod, paymentDetails?: any) => void;
  isSubmitting?: boolean;
}

export const StepPayment: React.FC<StepPaymentProps> = ({
  shippingAddress,
  onPaymentSubmit,
  isSubmitting = false,
}) => {
  const { appliedCoupon, discountAmount, applyCoupon, removeCoupon } = useCart();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
  const [selectedUpiOption, setSelectedUpiOption] = useState<"qr" | "id">("qr");
  const [upiId, setUpiId] = useState("");

  // Card accordion state
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(shippingAddress.fullName || "");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState<string>("hdfc");
  const [isOtherBanksOpen, setIsOtherBanksOpen] = useState(false);
  const [otherBankName, setOtherBankName] = useState("");

  // Voucher coupon state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput.trim().toUpperCase());
    if (success) {
      toast.success(`Coupon ${couponInput.trim().toUpperCase()} applied successfully!`);
      setIsCouponModalOpen(false);
      setCouponInput("");
    } else {
      toast.error("Invalid coupon code. Try PRECISION10 or LUXURY20");
    }
  };

  const codEstimatedDate = getEstimatedDeliveryDate(5);

  return (
    <div className="w-full space-y-6">
      {/* 1. UPI Section */}
      <div className="space-y-3">
        <h3 className="font-serif font-extrabold text-stone-900 text-sm tracking-wider uppercase">
          UPI
        </h3>

        <div
          onClick={() => setSelectedMethod("upi")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
            selectedMethod === "upi"
              ? "border-[#1C1917] ring-2 ring-[#1C1917]/10 shadow-xs"
              : "border-[#E8DCCF] hover:border-stone-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5 text-stone-800" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">UPI QR Code / VPA</h4>
                <p className="text-xs text-stone-500">
                  Scan with Google Pay, PhonePe, Paytm, or BHIM
                </p>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedMethod === "upi"
                  ? "border-[#1C1917] bg-[#1C1917] text-white"
                  : "border-stone-300"
              }`}
            >
              {selectedMethod === "upi" && <Check className="w-3 h-3" />}
            </div>
          </div>

          {/* Expanded UPI View */}
          {selectedMethod === "upi" && (
            <div className="mt-4 pt-4 border-t border-[#E8DCCF]/60 space-y-4">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUpiOption("qr");
                  }}
                  className={`pb-1 border-b-2 transition-all ${
                    selectedUpiOption === "qr"
                      ? "border-[#C86A28] text-[#C86A28] font-bold"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Scan QR Code
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUpiOption("id");
                  }}
                  className={`pb-1 border-b-2 transition-all ${
                    selectedUpiOption === "id"
                      ? "border-[#C86A28] text-[#C86A28] font-bold"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Enter UPI ID
                </button>
              </div>

              {selectedUpiOption === "qr" ? (
                <div className="bg-[#FAF7F2] p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="w-36 h-36 bg-white p-2 border border-[#E8DCCF] rounded-xl flex items-center justify-center shadow-xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=precisionoptics@hdfcbank&pn=PrecisionOptics`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-stone-800 mt-2.5">
                    Scan using any UPI App
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Google Pay • PhonePe • Paytm • BHIM
                  </span>
                </div>
              ) : (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="space-y-2"
                >
                  <div className="border border-[#E8DCCF] rounded-xl px-4 py-2 bg-white">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                      VIRTUAL PAYMENT ADDRESS (UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="mobile-number@upi / username@okhdfcbank"
                      className="w-full text-stone-900 font-semibold text-sm outline-none py-1"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    A collect request will be sent to your UPI app.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Cards Section */}
      <div className="space-y-3">
        <h3 className="font-serif font-extrabold text-stone-900 text-sm tracking-wider uppercase">
          Cards
        </h3>

        <div
          onClick={() => {
            setSelectedMethod("card");
            setIsCardExpanded(!isCardExpanded);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
            selectedMethod === "card"
              ? "border-[#1C1917] ring-2 ring-[#1C1917]/10 shadow-xs"
              : "border-[#E8DCCF] hover:border-stone-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-stone-800" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">
                  Add Credit / Debit / ATM cards
                </h4>
                <p className="text-xs text-stone-500">Visa, Mastercard, RuPay, Amex</p>
              </div>
            </div>

            <div className="text-stone-400">
              {isCardExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* Expandable Card Form */}
          {selectedMethod === "card" && isCardExpanded && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-4 pt-4 border-t border-[#E8DCCF]/60 space-y-3"
            >
              <div className="border border-[#E8DCCF] rounded-xl px-4 py-2 bg-white">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                  CARD NUMBER
                </label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => {
                    const val = e.target.value
                      .replace(/\D/g, "")
                      .replace(/(\d{4})/g, "$1 ")
                      .trim();
                    setCardNumber(val);
                  }}
                  placeholder="4532 •••• •••• 8921"
                  className="w-full text-stone-900 font-semibold text-sm outline-none py-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#E8DCCF] rounded-xl px-4 py-2 bg-white">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                    EXPIRY (MM/YY)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length >= 2) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                      setCardExpiry(val);
                    }}
                    placeholder="12/28"
                    className="w-full text-stone-900 font-semibold text-sm outline-none py-1"
                  />
                </div>

                <div className="border border-[#E8DCCF] rounded-xl px-4 py-2 bg-white">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                    placeholder="•••"
                    className="w-full text-stone-900 font-semibold text-sm outline-none py-1"
                  />
                </div>
              </div>

              <div className="border border-[#E8DCCF] rounded-xl px-4 py-2 bg-white">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                  NAME ON CARD
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Alexander Sterling"
                  className="w-full text-stone-900 font-semibold text-sm outline-none py-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Net Banking Section */}
      <div className="space-y-3">
        <h3 className="font-serif font-extrabold text-stone-900 text-sm tracking-wider uppercase">
          Net Banking
        </h3>

        <div className="bg-white border border-[#E8DCCF] rounded-2xl overflow-hidden divide-y divide-[#E8DCCF]/60">
          {[
            { id: "hdfc", name: "HDFC Bank", logo: "https://logo.clearbit.com/hdfcbank.com" },
            { id: "sbi", name: "State Bank of India (SBI)", logo: "https://logo.clearbit.com/sbi.co.in" },
            { id: "icici", name: "ICICI Bank", logo: "https://logo.clearbit.com/icicibank.com" },
            { id: "axis", name: "Axis Bank", logo: "https://logo.clearbit.com/axisbank.com" },
          ].map((bank) => (
            <div
              key={bank.id}
              onClick={() => {
                setSelectedMethod("netbanking");
                setSelectedBank(bank.id);
              }}
              className="p-3.5 flex items-center justify-between hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center font-bold text-xs text-stone-700">
                  {bank.name.slice(0, 3)}
                </div>
                <span className="font-semibold text-stone-900 text-sm">{bank.name}</span>
              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "netbanking" && selectedBank === bank.id
                    ? "border-[#1C1917] bg-[#1C1917]"
                    : "border-stone-300"
                }`}
              >
                {selectedMethod === "netbanking" && selectedBank === bank.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
          ))}

          {/* Other Banks Dropdown */}
          <div className="p-3.5 bg-stone-50/50">
            <button
              type="button"
              onClick={() => setIsOtherBanksOpen(!isOtherBanksOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-stone-700 hover:text-black cursor-pointer"
            >
              <span>Other Banks</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOtherBanksOpen ? "rotate-180" : ""}`} />
            </button>

            {isOtherBanksOpen && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {["Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda", "IndusInd Bank", "Yes Bank", "Union Bank"].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setSelectedMethod("netbanking");
                      setSelectedBank(b.toLowerCase());
                      setOtherBankName(b);
                    }}
                    className={`p-2 rounded-lg text-left transition-all border ${
                      selectedMethod === "netbanking" && selectedBank === b.toLowerCase()
                        ? "border-[#1C1917] bg-white font-bold"
                        : "border-[#E8DCCF] bg-white hover:bg-[#FAF7F2]"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Cash On Delivery Section */}
      <div className="space-y-3">
        <h3 className="font-serif font-extrabold text-stone-900 text-sm tracking-wider uppercase">
          Cash On Delivery
        </h3>

        <div
          onClick={() => setSelectedMethod("cod")}
          className={`rounded-2xl border transition-all cursor-pointer overflow-hidden bg-white ${
            selectedMethod === "cod"
              ? "border-[#1C1917] ring-2 ring-[#1C1917]/10 shadow-xs"
              : "border-[#E8DCCF] hover:border-stone-400"
          }`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-stone-800" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Cash On Delivery</h4>
                <p className="text-xs text-stone-500">
                  Pay via cash or UPI to our courier agent
                </p>
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedMethod === "cod"
                  ? "border-[#1C1917] bg-[#1C1917] text-white"
                  : "border-stone-300"
              }`}
            >
              {selectedMethod === "cod" && <Check className="w-3 h-3" />}
            </div>
          </div>

          {/* Delivery Note Banner Matching media_1789993686014.png */}
          <div className="bg-[#FFF8F0] border-t border-[#FED7AA]/60 px-4 py-2.5 flex items-center gap-2 text-xs text-[#C86A28] font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Delivery by {codEstimatedDate} for COD</span>
          </div>
        </div>
      </div>

      {/* 5. Apply Voucher Section Matching Figma */}
      <div className="pt-2">
        <div className="flex items-center justify-between p-4 bg-white border border-[#E8DCCF] rounded-2xl">
          <div className="flex items-center gap-2.5 text-stone-800">
            <Tag className="w-4 h-4 text-[#C86A28]" />
            <span className="text-xs sm:text-sm font-bold">
              {appliedCoupon ? `Applied Voucher: ${appliedCoupon}` : "Apply Atelier Gift Card or Voucher"}
            </span>
          </div>

          {appliedCoupon ? (
            <button
              type="button"
              onClick={() => {
                removeCoupon();
                toast.info("Coupon removed");
              }}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(true)}
              className="text-xs font-bold text-[#C86A28] hover:underline cursor-pointer"
            >
              Apply
            </button>
          )}
        </div>

        {/* Voucher Modal Form */}
        {isCouponModalOpen && (
          <div className="mt-3 p-4 bg-[#FAF7F2] border border-[#E8DCCF] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                ENTER PROMO CODE
              </span>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="PRECISION10"
                className="flex-1 px-3.5 py-2 bg-white border border-[#E8DCCF] rounded-xl text-sm font-bold uppercase outline-none focus:border-[#C86A28]"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#C86A28] hover:bg-[#b05a1f] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Apply
              </button>
            </form>
            <div className="text-[11px] text-stone-500">
              Available demo codes: <strong className="text-stone-800">PRECISION10</strong> (10% off), <strong className="text-stone-800">LUXURY20</strong> (20% off)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
