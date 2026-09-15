"use client";

import React from "react";
import { Product } from "@/types";
import { formatINR } from "@/utils/formatters";
import { hasTryOnModel } from "@/lib/try-on/products/TryOnProductConfig";

interface FrameSelectorBarProps {
  products: Product[];
  activeProduct: Product;
  onSelectProduct: (product: Product) => void;
}

export const FrameSelectorBar: React.FC<FrameSelectorBarProps> = ({
  products,
  activeProduct,
  onSelectProduct,
}) => {
  // Only display products that actually have .glb models configured
  const tryOnAvailableProducts = products.filter(hasTryOnModel);

  if (tryOnAvailableProducts.length <= 1) {
    return null;
  }

  return (
    <div className="w-full bg-black/60 backdrop-blur-md border-t border-white/10 p-2.5 sm:p-3 overflow-x-auto scrollbar-none flex items-center gap-3">
      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-400 shrink-0 pl-1 hidden sm:inline">
        Try Other Frames:
      </span>

      <div className="flex items-center gap-2.5">
        {tryOnAvailableProducts.map((p) => {
          const isActive = p.id === activeProduct.id;
          const imgUrl =
            p.images && p.images[0]
              ? typeof p.images[0] === "string"
                ? p.images[0]
                : (p.images[0] as any).url || (p.images[0] as any).src
              : "/images/products/figma_cartier_blue_rimless.png";

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProduct(p)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer shrink-0 text-left ${
                isActive
                  ? "bg-[#2A1E17] border-[#C86A28] ring-1 ring-[#C86A28] shadow-md"
                  : "bg-white/10 hover:bg-white/20 border-white/15 text-stone-300"
              }`}
            >
              <div className="w-10 h-6 shrink-0 flex items-center justify-center bg-white/5 rounded overflow-hidden">
                <img src={imgUrl} alt={p.name} className="w-full h-full object-contain" />
              </div>
              <div className="pr-1">
                <div className={`text-[10px] font-bold truncate max-w-[110px] ${isActive ? "text-[#E59B62]" : "text-white"}`}>
                  {p.brand || "PRECISION"}
                </div>
                <div className="text-[9px] text-stone-300">
                  {formatINR(p.price)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
