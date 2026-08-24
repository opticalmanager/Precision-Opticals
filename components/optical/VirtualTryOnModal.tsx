"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, X, RefreshCw, ZoomIn, ZoomOut, Move, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";

interface VirtualTryOnModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const PRESET_MODELS = [
  { id: "f1", name: "Female Model (Light)", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" },
  { id: "m1", name: "Male Model (Classic)", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80" },
  { id: "f2", name: "Female Model (Elegance)", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80" },
];

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [useCamera, setUseCamera] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(PRESET_MODELS[0].img);
  const [frameScale, setFrameScale] = useState(1.0);
  const [frameY, setFrameY] = useState(0);
  const [frameX, setFrameX] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useCamera) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "user" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn("Camera permission denied or unavailable:", err);
          setUseCamera(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const activeStream = videoRef.current.srcObject as MediaStream;
        activeStream.getTracks().forEach((track) => track.stop());
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useCamera]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FAF7F2] border border-[#E8DCCF] max-w-4xl w-full my-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#2A1E17] text-white px-6 py-4 flex items-center justify-between border-b border-orange-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-[#E59B62]" />
            <div>
              <h3 className="font-serif text-sm tracking-widest uppercase font-bold text-[#E59B62]">
                PRECISION 3D VIRTUAL TRY-ON
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Stage Area */}
          <div className="md:col-span-8 bg-black rounded-xl overflow-hidden relative min-h-[380px] sm:min-h-[460px] flex items-center justify-center shadow-inner">
            {useCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <img
                src={selectedPreset}
                alt="Model Preview"
                className="w-full h-full object-cover"
              />
            )}

            {/* Frame Overlay with GPU hardware acceleration */}
            <div
              className="absolute pointer-events-none select-none flex items-center justify-center will-change-transform"
              style={{
                transform: `translate3d(${frameX}px, ${frameY}px, 0) scale(${frameScale})`,
                width: "60%",
                top: "32%",
                left: "20%",
              }}
            >
              <img
                src={typeof product.images[0] === "string" ? product.images[0] : (product.images[0] as any).src}
                alt={product.name}
                className="w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Bottom Floating Bar */}
            <div className="absolute bottom-4 inset-x-4 bg-black/60 backdrop-blur-md p-2.5 rounded-lg flex items-center justify-between text-white text-xs z-10">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setUseCamera(!useCamera)}
                className="h-8 text-[11px]"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{useCamera ? "Use Preset Photos" : "Open Live Webcam"}</span>
              </Button>

              <button
                type="button"
                onClick={() => {
                  setFrameScale(1.0);
                  setFrameX(0);
                  setFrameY(0);
                }}
                className="text-stone-300 hover:text-white flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Fit</span>
              </button>
            </div>
          </div>

          {/* Adjustments Sidebar */}
          <div className="md:col-span-4 space-y-5 text-xs font-sans">
            {!useCamera && (
              <div className="bg-white p-4 border border-[#E8DCCF] space-y-2">
                <span className="font-serif font-bold uppercase text-[11px] text-stone-900 block">
                  Select Face Profile
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedPreset(model.img)}
                      className={`rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedPreset === model.img ? "border-[#C85A1B] ring-2 ring-[#C85A1B]/20" : "border-stone-200"
                      }`}
                    >
                      <img src={model.img} alt={model.name} className="w-full h-16 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fit Adjustments */}
            <div className="bg-white p-4 border border-[#E8DCCF] space-y-3">
              <span className="font-serif font-bold uppercase text-[11px] text-stone-900 block">
                Precision Fit Adjustments
              </span>

              <div>
                <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                  <span>Frame Size / Scale</span>
                  <span>{frameScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.02"
                  value={frameScale}
                  onChange={(e) => setFrameScale(parseFloat(e.target.value))}
                  className="w-full accent-[#C85A1B]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                  <span>Nose Bridge Height (Y-Axis)</span>
                  <span>{frameY}px</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="2"
                  value={frameY}
                  onChange={(e) => setFrameY(parseInt(e.target.value))}
                  className="w-full accent-[#C85A1B]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                  <span>Horizontal Centeration (X-Axis)</span>
                  <span>{frameX}px</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="2"
                  value={frameX}
                  onChange={(e) => setFrameX(parseInt(e.target.value))}
                  className="w-full accent-[#C85A1B]"
                />
              </div>
            </div>

            {/* Direct Add CTA */}
            <Button
              type="button"
              variant="default"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full py-4 text-xs font-bold tracking-widest shadow-lg h-auto"
            >
              <ShoppingBag className="w-4 h-4 text-[#E59B62]" />
              <span>ADD THIS FRAME TO BAG</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
