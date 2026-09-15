"use client";

import React from "react";
import { Download, RefreshCw, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoCaptureModalProps {
  imageDataUrl: string | null;
  onClose: () => void;
  onRetake: () => void;
  productName: string;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  imageDataUrl,
  onClose,
  onRetake,
  productName,
}) => {
  if (!imageDataUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = `Precision-Optics-TryOn-${productName.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-[#FAF7F2] border border-[#E8DCCF] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#2A1E17] text-white px-5 py-3.5 flex items-center justify-between border-b border-orange-500/20">
          <span className="font-serif text-xs uppercase tracking-widest text-[#E59B62] font-bold">
            Virtual Try-On Portrait
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:text-[#E59B62] text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="p-4 bg-stone-950 flex items-center justify-center">
          <div className="relative rounded-xl overflow-hidden shadow-inner max-h-[60vh]">
            <img
              src={imageDataUrl}
              alt="Try On Snapshot"
              className="w-full h-full object-contain"
            />
            {/* Watermark */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-[9px] font-serif text-[#E59B62] tracking-widest uppercase">
              PRECISION OPTICS
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-white border-t border-[#E8DCCF] flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetake}
            className="flex-1 py-3 text-xs uppercase font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Retake</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleDownload}
            className="flex-1 py-3 text-xs uppercase font-semibold bg-[#2A1E17] hover:bg-[#3D312A] text-white cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-[#E59B62] mr-1" />
            <span>Save Photo</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
