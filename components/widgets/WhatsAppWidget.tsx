import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  const handleSend = () => {
    const text = encodeURIComponent(userMsg || 'Hello Precision Optics! I would like optical advice for luxury frames and prescription lenses.');
    window.open(`https://wa.me/919810012345?text=${text}`, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-30 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 cursor-pointer border-2 border-white"
        title="Chat on WhatsApp with Precision Optics Concierge"
      >
        <MessageSquare className="w-6 h-6 fill-white text-[#25D366]" />
      </button>

      {/* WhatsApp Chat Popover Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-80 bg-white border border-stone-200 shadow-2xl rounded-xl overflow-hidden font-sans text-xs animate-in slide-in-from-bottom-5 duration-200">
          {/* Top Bar */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-serif text-xs font-bold text-amber-200">
                PO
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider">PRECISION OPTICS CONCIERGE</h4>
                <p className="text-[10px] text-emerald-200">Online • Active Master Opticians</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-emerald-200 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="bg-[#ECE5DD] p-4 space-y-3 min-h-[140px] text-stone-800">
            <div className="bg-white p-3 rounded-lg shadow-2xs max-w-[90%] text-xs space-y-1">
              <p className="font-bold text-[#075E54] text-[10px] uppercase">PRECISION MASTER OPTICIAN</p>
              <p>Welcome to Precision Optics (Estd. 1969). How can we assist with your frame fitting, Cartier/Tom Ford models, or custom prescription lenses today?</p>
              <span className="text-[9px] text-stone-400 block text-right">Just now</span>
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-stone-50 border-t flex gap-2">
            <input
              type="text"
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              placeholder="Ask about Cartier, Zeiss lenses..."
              className="flex-1 border border-stone-300 p-2 rounded-md focus:outline-none focus:border-[#075E54] text-xs bg-white"
            />
            <button
              onClick={handleSend}
              className="bg-[#25D366] text-white p-2 rounded-md hover:bg-[#20bd5a] cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
