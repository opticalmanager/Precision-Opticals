import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-[#E8E2D5] p-4 flex flex-col justify-between animate-pulse">
      <div className="flex justify-between items-center mb-3">
        <div className="h-4 w-12 bg-stone-200" />
        <div className="h-5 w-5 rounded-full bg-stone-200" />
      </div>
      <div className="w-full h-48 bg-stone-100 mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-16 bg-stone-200" />
        <div className="h-4 w-3/4 bg-stone-200" />
        <div className="h-4 w-1/3 bg-stone-300 font-bold" />
      </div>
    </div>
  );
};
