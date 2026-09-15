"use client";

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  const handleSend = () => {
    const text = encodeURIComponent(
      userMsg || 'Hello Precision Optics! I would like optical advice for luxury frames and prescription lenses.'
    );
    window.open(`https://wa.me/919810012345?text=${text}`, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-30 bg-[#25D366] hover:bg-[#20bd5a] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer border-2 border-white shadow-emerald-950/30 group"
        title="Chat on WhatsApp with Precision Optics Concierge"
        aria-label="Chat on WhatsApp with Precision Optics Concierge"
      >
        <WhatsAppIcon className="w-7 h-7 text-white fill-white transition-transform group-hover:scale-105" />
      </button>

      {/* WhatsApp Chat Popover Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-80 max-w-[340px] bg-white border border-stone-200 shadow-2xl rounded-2xl overflow-hidden font-sans text-xs animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Top Bar */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shadow-xs">
                <WhatsAppIcon className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">PRECISION CONCIERGE</h4>
                <p className="text-[10px] text-emerald-200">Online • Active Master Opticians</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 transition-colors cursor-pointer"
              aria-label="Close WhatsApp chat popover"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="bg-[#ECE5DD] p-4 space-y-3 min-h-[140px] text-stone-800">
            <div className="bg-white p-3.5 rounded-lg shadow-2xs max-w-[92%] text-xs space-y-1 rounded-tl-none border border-stone-200/50">
              <p className="font-bold text-[#075E54] text-[10px] uppercase tracking-wider">PRECISION MASTER OPTICIAN</p>
              <p className="leading-relaxed text-stone-700">
                Welcome to Precision Optics (Estd. 1969). How can we assist with your frame fitting, luxury models, or custom prescription lenses today?
              </p>
              <span className="text-[9px] text-stone-400 block text-right pt-1">Just now</span>
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 flex gap-2">
            <input
              type="text"
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Ask about frames, Zeiss lenses..."
              className="flex-1 border border-stone-300 px-3 py-2 rounded-lg focus:outline-none focus:border-[#075E54] text-xs bg-white text-stone-800 placeholder:text-stone-400"
            />
            <button
              onClick={handleSend}
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              aria-label="Send message on WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
