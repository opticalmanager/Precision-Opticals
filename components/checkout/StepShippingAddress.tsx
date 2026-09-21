"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Home,
  Briefcase,
  Heart,
  MapPin,
  Check,
  Plus,
  Building2,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { ShippingAddress } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface StepShippingAddressProps {
  onBack: () => void;
  onProceed: (address: ShippingAddress) => void;
}

type AddressTag = "home" | "work" | "friends" | "other";

// Common Indian Postal Directory Mapping for instant auto-population
const PINCODE_MAP: Record<string, { city: string; state: string }> = {
  "122001": { city: "Gurugram", state: "Haryana" },
  "122002": { city: "Gurugram", state: "Haryana" },
  "122003": { city: "Gurugram", state: "Haryana" },
  "122018": { city: "Gurugram", state: "Haryana" },
  "121001": { city: "Faridabad", state: "Haryana" },
  "121002": { city: "Faridabad", state: "Haryana" },
  "121003": { city: "Faridabad", state: "Haryana" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "110019": { city: "New Delhi", state: "Delhi" },
  "110024": { city: "New Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "400050": { city: "Mumbai", state: "Maharashtra" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "560034": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "201301": { city: "Noida", state: "Uttar Pradesh" },
};

export const StepShippingAddress: React.FC<StepShippingAddressProps> = ({
  onBack,
  onProceed,
}) => {
  const { user, saveShippingAddress } = useAuth();

  const [selectedSavedIndex, setSelectedSavedIndex] = useState<number>(0);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(
    user.savedAddresses.length === 0
  );

  const [addressTag, setAddressTag] = useState<AddressTag>("home");
  const [pincode, setPincode] = useState(
    user.savedAddresses[0]?.pincode || "122002"
  );
  const [houseNo, setHouseNo] = useState(
    user.savedAddresses[0]?.streetAddress.split(",")[0] || ""
  );
  const [area, setArea] = useState(
    user.savedAddresses[0]?.streetAddress.split(",").slice(1).join(",").trim() || ""
  );
  const [landmark, setLandmark] = useState("");
  const [name, setName] = useState(user.savedAddresses[0]?.fullName || user.name || "");
  const [phone, setPhone] = useState(
    user.savedAddresses[0]?.phone?.replace("+91 ", "") || user.phone?.replace("+91 ", "") || ""
  );
  const [email, setEmail] = useState(user.savedAddresses[0]?.email || user.email || "");
  const [city, setCity] = useState(user.savedAddresses[0]?.city || "Gurugram");
  const [state, setState] = useState(user.savedAddresses[0]?.state || "Haryana");

  // Auto-detect City and State on PIN code change
  useEffect(() => {
    const cleanPin = pincode.replace(/\D/g, "");
    if (cleanPin.length === 6) {
      if (PINCODE_MAP[cleanPin]) {
        setCity(PINCODE_MAP[cleanPin].city);
        setState(PINCODE_MAP[cleanPin].state);
      } else {
        // Fallback realistic lookup based on first digit of Indian PIN
        const firstDigit = cleanPin[0];
        if (firstDigit === "1") {
          setCity(city || "Delhi NCR");
          setState(state || "Delhi");
        } else if (firstDigit === "4") {
          setCity(city || "Mumbai");
          setState(state || "Maharashtra");
        } else if (firstDigit === "5") {
          setCity(city || "Bengaluru");
          setState(state || "Karnataka");
        } else if (firstDigit === "6") {
          setCity(city || "Chennai");
          setState(state || "Tamil Nadu");
        }
      }
    }
  }, [pincode, city, state]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isAddingNew && user.savedAddresses[selectedSavedIndex]) {
      onProceed(user.savedAddresses[selectedSavedIndex]);
      return;
    }

    // Validation
    if (!pincode || pincode.length < 6) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }
    if (!houseNo.trim()) {
      toast.error("Please enter House / Building details");
      return;
    }
    if (!area.trim()) {
      toast.error("Please enter Road / Area / Locality details");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your Full Name");
      return;
    }
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    const fullStreetAddress = landmark.trim()
      ? `${houseNo}, ${area} (Near: ${landmark})`
      : `${houseNo}, ${area}`;

    const formattedAddress: ShippingAddress = {
      fullName: name.trim(),
      phone: phone.startsWith("+91") ? phone : `+91 ${phone.replace(/\D/g, "")}`,
      email: email.trim(),
      streetAddress: fullStreetAddress,
      city: city || "Gurugram",
      state: state || "Haryana",
      pincode: pincode.replace(/\D/g, ""),
      country: "India",
    };

    saveShippingAddress(formattedAddress);
    onProceed(formattedAddress);
  };

  return (
    <div className="w-full bg-white border border-[#EBE6DF] rounded-[24px] p-6 sm:p-8 lg:p-10 shadow-sm">
      {/* Top Bar with Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8DCCF] flex items-center justify-center text-stone-700 hover:text-black hover:bg-[#FAF3EB] transition-colors cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
          Delivery Address
        </h2>
      </div>

      {/* Saved Addresses Selector (if available) */}
      {user.savedAddresses.length > 0 && !isAddingNew && (
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
              SAVED ADDRESSES
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="text-xs font-bold text-[#C86A28] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Address
            </button>
          </div>

          <div className="space-y-3">
            {user.savedAddresses.map((addr, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedSavedIndex(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                  selectedSavedIndex === idx
                    ? "border-[#1C1917] bg-[#FAF7F2] ring-2 ring-[#1C1917]/10"
                    : "border-[#E8DCCF] hover:border-stone-400 bg-white"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">
                      {addr.fullName}
                    </span>
                    <span className="bg-stone-200 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Home
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {addr.streetAddress}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-stone-500">
                    Phone: {addr.phone} • Email: {addr.email}
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedSavedIndex === idx
                      ? "border-[#1C1917] bg-[#1C1917] text-white"
                      : "border-stone-300"
                  }`}
                >
                  {selectedSavedIndex === idx && <Check className="w-3 h-3" />}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            className="w-full mt-4 bg-[#1C1917] hover:bg-black text-white font-bold text-sm py-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Deliver to this Address</span>
          </button>
        </div>
      )}

      {/* New Address Form (Matching media_1789993663629.png) */}
      {(isAddingNew || user.savedAddresses.length === 0) && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {user.savedAddresses.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs font-bold text-stone-600 hover:text-stone-900 underline cursor-pointer"
              >
                Use a Saved Address
              </button>
            </div>
          )}

          {/* 1. Save As Pills Matching Figma */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 block mb-2.5">
              Save as*
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: "home", label: "Home", icon: Home },
                { id: "work", label: "Work", icon: Briefcase },
                { id: "friends", label: "Friends & Family", icon: Heart },
                { id: "other", label: "Other", icon: MapPin },
              ].map((pill) => {
                const isSelected = addressTag === pill.id;
                const IconComponent = pill.icon;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setAddressTag(pill.id as AddressTag)}
                    className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1C1917] text-white shadow-sm"
                        : "bg-white border border-[#E8DCCF] text-stone-700 hover:bg-[#FAF7F2]"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Pincode Input with instant lookup */}
          <div>
            <div className="border border-[#E8DCCF] rounded-xl px-4 py-2.5 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
                PINCODE*
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                placeholder="122002"
                className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal py-0.5"
                required
              />
            </div>
            {city && state && (
              <span className="text-[11px] text-stone-500 mt-1 block pl-1">
                Region: <strong className="text-stone-800">{city}, {state}</strong>
              </span>
            )}
          </div>

          {/* 3. House No, Building Name */}
          <div className="border border-[#E8DCCF] rounded-xl px-4 py-2.5 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
              HOUSE NO, BUILDING NAME*
            </label>
            <input
              type="text"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              placeholder="Villa 42, Magnolias Boulevard"
              className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal py-0.5"
              required
            />
          </div>

          {/* 4. Road Name, Area, Locality */}
          <div className="border border-[#E8DCCF] rounded-xl px-4 py-2.5 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
              ROAD NAME, AREA, LOCALITY*
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Golf Course Road, Sector 42"
              className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal py-0.5"
              required
            />
          </div>

          {/* 5. Landmark (Optional) */}
          <div className="border border-[#E8DCCF] rounded-xl px-4 py-2.5 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
              LANDMARK (OPTIONAL)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Near Club Magnolias"
              className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal py-0.5"
            />
          </div>

          {/* 6. Name */}
          <div className="border border-[#E8DCCF] rounded-xl px-4 py-2.5 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
              NAME*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alexander Sterling"
              className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal py-0.5"
              required
            />
          </div>

          {/* 7. Phone Number */}
          <div>
            <div className="flex items-center border border-[#E8DCCF] rounded-xl overflow-hidden focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
              <div className="px-4 py-3 bg-stone-50 border-r border-[#E8DCCF] text-stone-700 font-bold text-sm select-none">
                +91
              </div>
              <div className="flex-1 px-3.5 py-1.5 flex flex-col justify-center">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                  PHONE NUMBER*
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98100 98765"
                  className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal"
                  required
                />
              </div>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 pl-1">
              Delivery person may call on this number
            </p>
          </div>

          {/* 8. Email */}
          <div className="border border-[#E8DCCF] rounded-xl px-4 py-2.5 focus-within:border-[#C86A28] focus-within:ring-2 focus-within:ring-[#C86A28]/20 transition-all bg-white">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block">
              EMAIL*
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alexander@precisionoptics.com"
              className="w-full text-stone-900 font-semibold text-sm outline-none bg-transparent placeholder:text-stone-400 placeholder:font-normal py-0.5"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-[#1C1917] hover:bg-black text-white font-bold text-sm py-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Save Address & Proceed</span>
          </button>
        </form>
      )}
    </div>
  );
};
