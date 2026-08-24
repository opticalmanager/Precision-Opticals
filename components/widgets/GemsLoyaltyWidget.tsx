import React, { useState } from 'react';
import { ShoppingBag, Heart, X, Gift, Sparkles, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GemsLoyaltyWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { gemPoints } = useAuth();

  return (
    <>
      {/* Floating Gold Pill Button (Bottom Left) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-30 bg-[#C29B53] hover:bg-[#A8813C] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transition-all transform hover:scale-105 border border-amber-200/50 cursor-pointer"
        title="Precision Rewards Club"
      >
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-amber-100" />
        </div>
        <span className="font-serif font-bold text-xs tracking-widest uppercase text-white">
          REWARDS ({gemPoints} PTS)
        </span>
      </button>

      {/* Rewards Popover Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E8E2D5] max-w-md w-full p-6 shadow-2xl relative text-stone-800 rounded-xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 hover:text-amber-800 text-stone-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3 border-b border-stone-200 pb-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto border border-amber-300">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-stone-900">
                PRECISION PRIVILEGE CLUB
              </h3>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                You currently have <strong className="text-[#C85A1B] font-bold text-sm">{gemPoints} GEM Points</strong> available for lens discounts.
              </p>
            </div>

            <div className="py-4 space-y-3 text-xs font-sans">
              <div className="flex items-start gap-3 bg-white p-3 border border-stone-200 rounded-lg">
                <Gift className="w-5 h-5 text-[#C85A1B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block uppercase">EARN 10 POINTS PER ₹100 SPENT</span>
                  <span className="text-[11px] text-stone-600">Points accrue automatically with every luxury frame and lens purchase.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3 border border-stone-200 rounded-lg">
                <Sparkles className="w-5 h-5 text-[#C85A1B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block uppercase">REDEEM FOR ZEISS & ESSILOR UPGRADES</span>
                  <span className="text-[11px] text-stone-600">500 GEM Points = ₹500 instant discount on checkout with coupon code <strong>GEM10</strong>.</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-stone-900 text-white py-3 font-serif font-bold text-xs uppercase tracking-widest hover:bg-black rounded-lg cursor-pointer"
              >
                APPLY REWARDS WITH CODE "GEM10"
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
