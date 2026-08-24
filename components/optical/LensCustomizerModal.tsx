"use client";

import React, { useState } from "react";
import { X, Check, FileText, Upload, Glasses, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { Product, LensTypeOption, LensPackage, SelectedLensConfig } from "@/src/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LensCustomizerModalProps {
  product: Product;
  onClose: () => void;
  onConfirmLensConfig: (config: SelectedLensConfig) => void;
}

const LENS_PACKAGES: LensPackage[] = [
  {
    id: "standard-ar",
    name: "Standard Anti-Reflective 1.56 Index",
    description: "Crisp clarity, anti-reflective coating, anti-scratch hard coat, 100% UV400 protection.",
    price: 1500,
  },
  {
    id: "blue-block-thin",
    name: "Blue Block High Index 1.60 (Thin & Light)",
    description: "Filters digital blue light from laptops/phones, 25% thinner & lighter than standard lenses.",
    price: 2800,
    badge: "POPULAR",
  },
  {
    id: "zeiss-smartlife",
    name: "Zeiss® SmartLife Ultra-Thin 1.67",
    description: "German precision optics optimized for dynamic modern vision, 40% thinner, smudge resistant.",
    price: 5200,
    badge: "ZEISS GERMAN LAB",
  },
  {
    id: "essilor-crizal",
    name: "Essilor® Crizal Rock™ Transitions Gen 8",
    description: "Light intelligent lenses that adapt from crystal clear indoors to dark outdoors with scratch resistance.",
    price: 7500,
    badge: "PHOTOCHROMIC",
  },
];

export const LensCustomizerModal: React.FC<LensCustomizerModalProps> = ({
  product,
  onClose,
  onConfirmLensConfig,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [lensType, setLensType] = useState<LensTypeOption>("single-vision");
  const [selectedPackage, setSelectedPackage] = useState<LensPackage>(LENS_PACKAGES[1]);
  const [rxRight, setRxRight] = useState({ sph: "0.00", cyl: "0.00", axis: "0", add: "0.00" });
  const [rxLeft, setRxLeft] = useState({ sph: "0.00", cyl: "0.00", axis: "0", add: "0.00" });
  const [pdValue, setPdValue] = useState("63");
  const [prescriptionMethod, setPrescriptionMethod] = useState<"enter" | "upload" | "later">("enter");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const calculateTotalLensPrice = () => {
    if (lensType === "frame-only") return 0;
    return selectedPackage.price;
  };

  const handleFinish = () => {
    const totalLensPrice = calculateTotalLensPrice();
    const config: SelectedLensConfig = {
      lensType,
      lensPackage: lensType !== "frame-only" ? selectedPackage : undefined,
      coatings: lensType !== "frame-only" ? ["Anti-Reflective", "UV Protection"] : [],
      prescription:
        prescriptionMethod === "enter"
          ? {
              rightEye: rxRight,
              leftEye: rxLeft,
              pd: pdValue,
            }
          : prescriptionMethod === "upload"
          ? {
              rightEye: { sph: "See Upload", cyl: "0", axis: "0", add: "0" },
              leftEye: { sph: "See Upload", cyl: "0", axis: "0", add: "0" },
              pd: pdValue,
              fileName: uploadedFileName || "Prescription_Scan.jpg",
            }
          : undefined,
      totalLensPrice,
    };

    onConfirmLensConfig(config);
  };

  const grandTotal = product.price + calculateTotalLensPrice();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-[#E8DCCF] max-w-3xl w-full my-8 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#2A1E17] text-white px-6 py-4 flex items-center justify-between border-b border-orange-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full border border-[#E59B62] flex items-center justify-center font-serif text-xs font-bold text-[#E59B62]">
              PO
            </div>
            <div>
              <h3 className="font-serif text-sm tracking-widest uppercase font-bold text-[#E59B62]">
                SELECT & CUSTOMIZE OPTICAL LENSES
              </h3>
              <p className="text-[10px] text-stone-300 font-sans tracking-wider uppercase">
                {product.brand} • {product.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:text-[#E59B62] text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-[#FAF7F2] border-b border-[#E8DCCF] px-6 py-3 flex items-center justify-between shrink-0 text-xs font-serif font-bold uppercase tracking-wider">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 cursor-pointer ${step === 1 ? "text-[#C85A1B]" : "text-stone-500"}`}
          >
            <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">1</span>
            <span>Lens Type</span>
          </button>

          <span className="text-stone-300">→</span>

          <button
            onClick={() => setStep(2)}
            disabled={lensType === "frame-only"}
            className={`flex items-center gap-1.5 cursor-pointer ${step === 2 ? "text-[#C85A1B]" : "text-stone-500"} disabled:opacity-40`}
          >
            <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">2</span>
            <span>Lens Coating & Lab</span>
          </button>

          <span className="text-stone-300">→</span>

          <button
            onClick={() => setStep(3)}
            disabled={lensType === "frame-only"}
            className={`flex items-center gap-1.5 cursor-pointer ${step === 3 ? "text-[#C85A1B]" : "text-stone-500"} disabled:opacity-40`}
          >
            <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">3</span>
            <span>Prescription</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans text-stone-800">
          {/* STEP 1: Lens Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-[#1C1917] uppercase tracking-wider">
                1. Select Visual Correction Type
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "single-vision",
                    title: "Single Vision (Distance or Reading)",
                    desc: "Standard optical correction for nearsightedness (-), farsightedness (+), or astigmatism.",
                  },
                  {
                    id: "progressive",
                    title: "Zeiss Digital Progressives",
                    desc: "No-line multifocal lenses for seamless vision across distance, intermediate screens, and close reading.",
                  },
                  {
                    id: "zero-power-blue",
                    title: "Zero Power Blue-Light Screen Shield",
                    desc: "No power correction with 100% blue light blocking for software developers, gamers, and digital professionals.",
                  },
                  {
                    id: "frame-only",
                    title: "Frame Only (Demo Lenses)",
                    desc: "Receive the genuine frame with demo protective lenses to fit at your local optician.",
                  },
                ].map((typeOption) => {
                  const isSelected = lensType === typeOption.id;
                  return (
                    <div
                      key={typeOption.id}
                      onClick={() => setLensType(typeOption.id as LensTypeOption)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#C85A1B] bg-[#FAF3EB] ring-2 ring-[#C85A1B]/20 shadow-xs"
                          : "border-stone-200 bg-white hover:border-stone-400"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-bold text-stone-900 uppercase text-xs">{typeOption.title}</h5>
                          {isSelected && <Check className="w-4 h-4 text-[#C85A1B]" />}
                        </div>
                        <p className="text-stone-600 text-[11px] leading-relaxed">{typeOption.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Lens Packages */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-[#1C1917] uppercase tracking-wider">
                2. Select Optical Coating & Lab Package
              </h4>

              <div className="space-y-3">
                {LENS_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-[#C85A1B] bg-[#FAF3EB] ring-2 ring-[#C85A1B]/20 shadow-xs"
                          : "border-stone-200 bg-white hover:border-stone-400"
                      }`}
                    >
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-stone-900 uppercase text-xs">{pkg.name}</h5>
                          {pkg.badge && (
                            <span className="bg-[#C85A1B] text-white text-[9px] font-bold px-2 py-0.2 rounded uppercase">
                              {pkg.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-600 text-[11px] leading-relaxed">{pkg.description}</p>
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <span className="font-serif font-bold text-sm text-[#C85A1B]">
                          +{formatCurrency(pkg.price)}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#C85A1B] ml-auto mt-1" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Prescription Input */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-[#1C1917] uppercase tracking-wider">
                3. Submit Your Optical Prescription
              </h4>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "enter", label: "Enter Power Values" },
                  { id: "upload", label: "Upload Doctor Slip" },
                  { id: "later", label: "Submit via WhatsApp" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPrescriptionMethod(m.id as any)}
                    className={`py-2 px-3 text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                      prescriptionMethod === m.id
                        ? "bg-[#2A1E17] text-white border-[#2A1E17]"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {prescriptionMethod === "enter" && (
                <div className="bg-[#FAF7F2] p-4 border border-[#E8DCCF] space-y-4 rounded-xl">
                  {/* OD Right Eye */}
                  <div>
                    <span className="font-bold text-xs uppercase text-[#C85A1B] block mb-2">Right Eye (OD)</span>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase font-semibold">SPH</label>
                        <Input
                          value={rxRight.sph}
                          onChange={(e) => setRxRight({ ...rxRight, sph: e.target.value })}
                          className="bg-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase font-semibold">CYL</label>
                        <Input
                          value={rxRight.cyl}
                          onChange={(e) => setRxRight({ ...rxRight, cyl: e.target.value })}
                          className="bg-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase font-semibold">AXIS</label>
                        <Input
                          value={rxRight.axis}
                          onChange={(e) => setRxRight({ ...rxRight, axis: e.target.value })}
                          className="bg-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase font-semibold">ADD</label>
                        <Input
                          value={rxRight.add}
                          onChange={(e) => setRxRight({ ...rxRight, add: e.target.value })}
                          className="bg-white text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* OS Left Eye */}
                  <div>
                    <span className="font-bold text-xs uppercase text-[#C85A1B] block mb-2">Left Eye (OS)</span>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase font-semibold">SPH</label>
                        <Input
                          value={rxLeft.sph}
                          onChange={(e) => setRxLeft({ ...rxLeft, sph: e.target.value })}
                          className="bg-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase font-semibold">CYL</label>
                        <Input
                          value={rxLeft.cyl}
                          onChange={(e) => setRxLeft({ ...rxLeft, cyl: e.target.value })}
                          className="bg-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase font-semibold">AXIS</label>
                        <Input
                          value={rxLeft.axis}
                          onChange={(e) => setRxLeft({ ...rxLeft, axis: e.target.value })}
                          className="bg-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase font-semibold">ADD</label>
                        <Input
                          value={rxLeft.add}
                          onChange={(e) => setRxLeft({ ...rxLeft, add: e.target.value })}
                          className="bg-white text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PD */}
                  <div className="w-1/3">
                    <label className="text-[10px] text-stone-500 uppercase font-semibold">Pupillary Distance (PD mm)</label>
                    <Input
                      value={pdValue}
                      onChange={(e) => setPdValue(e.target.value)}
                      className="bg-white text-center"
                    />
                  </div>
                </div>
              )}

              {prescriptionMethod === "upload" && (
                <div className="border-2 border-dashed border-stone-300 p-8 text-center rounded-xl bg-stone-50 space-y-2">
                  <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="font-bold text-xs">Upload your prescription photo or PDF card</p>
                  <p className="text-[11px] text-stone-500">Supports JPG, PNG, PDF up to 10MB</p>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFileName(e.target.files[0].name);
                      }
                    }}
                    className="text-xs text-stone-600 mt-2"
                  />
                  {uploadedFileName && (
                    <span className="text-emerald-700 font-bold block mt-2 text-xs">
                      ✓ Attached: {uploadedFileName}
                    </span>
                  )}
                </div>
              )}

              {prescriptionMethod === "later" && (
                <div className="bg-[#FAF3EB] p-4 border border-[#E8DCCF] rounded-xl text-xs space-y-1">
                  <p className="font-bold text-stone-900">Submit Prescription After Ordering</p>
                  <p className="text-stone-600 text-[11px]">
                    Our clinic team will connect via WhatsApp/Phone after you place the order to verify your prescription numbers.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-[#FAF7F2] border-t border-[#E8DCCF] p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-bold block">Total Customized Price</span>
            <span className="font-serif font-bold text-base text-[#C85A1B]">{formatCurrency(grandTotal)}</span>
          </div>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="h-10"
              >
                Back
              </Button>
            )}

            {step < 3 && lensType !== "frame-only" ? (
              <Button
                type="button"
                variant="default"
                onClick={() => setStep((prev) => (prev + 1) as any)}
                className="h-10"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleFinish}
                className="h-10 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>CONFIRM & ADD TO BAG</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
