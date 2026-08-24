import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export const NeedToKnowSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('sunglasses-range');

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const items: AccordionItem[] = [
    {
      id: 'sunglasses-range',
      title: 'Range of Luxury Sunglasses & Lens Coatings',
      content: (
        <div className="space-y-3 text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">
          <p>
            Protect your eyes with style. Our sunglasses collection offers 100% UV400 protection against UVA and UVB rays. Choose from polarized lenses that eliminate water/road glare, gradient tint options for sophisticated metropolitan wear, and Transitions Gen 8 photochromic lenses that adapt indoors and outdoors.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-700">
            <li><strong>Shapes:</strong> Aviator, Wayfarer, Round, Cat Eye, Geometric, and Rectangle.</li>
            <li><strong>Materials:</strong> Hand-sculpted Italian acetate, Japanese titanium, and 18k gold plating.</li>
            <li><strong>Prescription Sun Lenses:</strong> Convert any luxury sunglasses into your custom optical power.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'frames-lenses-range',
      title: 'Custom German & French Prescription Lens Packages',
      content: (
        <div className="space-y-3 text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">
          <p>
            Every prescription pair is robotic-surfaced to 0.01 diopter tolerance. We partner directly with Carl Zeiss® and Essilor® to ensure edge-to-edge HD clarity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-white p-3 rounded-xl border border-[#E8DCCF]">
              <h5 className="font-bold text-[#1C1917] text-xs uppercase mb-1">Prescription Lens Types</h5>
              <p className="text-xs text-stone-600">Single Vision, Zeiss SmartLife Progressives, Zero-Power Blue Light Shield, and High-Index 1.67 Ultra-Thin.</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#E8DCCF]">
              <h5 className="font-bold text-[#1C1917] text-xs uppercase mb-1">Protective Coatings</h5>
              <p className="text-xs text-stone-600">Oleophobic smudge-proof, super-hydrophobic water repellent, anti-scratch diamond hard-coat, and blue-violet block.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'faqs',
      title: 'Prescriptions, Warranty & 7-Day Exchange Policy',
      content: (
        <div className="space-y-3 text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">
          <div>
            <h5 className="font-bold text-[#1C1917] text-xs uppercase mb-1">How do I submit my prescription?</h5>
            <p>You can enter your SPH/CYL/AXIS numbers directly in our 3-step lens wizard, upload an image/PDF of your doctor slip, or choose "Submit Later" to send via WhatsApp after placing your order.</p>
          </div>
          <div>
            <h5 className="font-bold text-[#1C1917] text-xs uppercase mb-1">What is the Precision Optics Guarantee?</h5>
            <p>All frames include a 1-year manufacturer warranty and a 7-day unconditional optical fit guarantee. If your prescription does not feel comfortable, our master optometrists will re-calibrate your lenses free of charge.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-[#FAF7F2] py-14 px-4 sm:px-6 lg:px-8 border-t border-[#E8DCCF]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#C85A1B] uppercase block mb-1">
            CLINICAL KNOWLEDGE BASE
          </span>
          <h2 className="text-3xl font-bold text-[#1C1917] font-serif">
            Need to Know
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white border border-[#E8DCCF] transition-colors"
              >
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-serif font-bold text-sm sm:text-base text-[#1C1917] hover:text-[#C85A1B] transition-colors cursor-pointer"
                >
                  <span>{item.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180 text-[#C85A1B]' : 'text-stone-400'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-stone-100 animate-in fade-in duration-200">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
