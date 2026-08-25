"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  date: string;
  text: string;
  rating: number;
}

export const WordsWeLiveBySection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Krishnaja',
      date: '01 July, 2025',
      text: 'Entire process is very user friendly, clearly explained and patiently helped to select right frames. Overall it was a pleasant and smooth experience',
      rating: 5,
    },
    {
      id: '2',
      name: 'Prana',
      date: '01 July, 2025',
      text: 'Doubts about power are cleared and choices regarding the frame are shown as per the latest availability and feasibility.',
      rating: 5,
    },
    {
      id: '3',
      name: 'Ayushi',
      date: '02 July, 2025',
      text: 'Had a fantastic experience The team was incredibly responsive and attentive. They listened carefully to my needs',
      rating: 5,
    },
    {
      id: '4',
      name: 'Rohan',
      date: '05 July, 2025',
      text: 'Extremely impressed with the 20-step eye checkup and frame fitting. Delivery was swift and the prescription optics are razor sharp.',
      rating: 5,
    },
    {
      id: '5',
      name: 'Simran',
      date: '10 July, 2025',
      text: 'The anti-glare blue cut computer lenses eliminated my daily screen eye fatigue. Exceptional quality and comfortable frame fit!',
      rating: 5,
    },
    {
      id: '6',
      name: 'Vikram',
      date: '12 July, 2025',
      text: 'Great selection of international brands. The optometrist patiently guided me through titanium rimless options to match my face shape.',
      rating: 5,
    },
  ];

  const totalPages = Math.ceil(testimonials.length / 3);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Get current visible cards (3 per page on desktop)
  const visibleTestimonials = testimonials.slice(currentIndex * 3, currentIndex * 3 + 3);

  return (
    <section className="bg-[#FAF7F2] py-14 sm:py-18 px-4 sm:px-6 lg:px-8 border-t border-[#E8DCCF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Title */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#C86A28] uppercase block mb-1">
            CLIENT TESTIMONIALS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1C1917] tracking-tight font-sans">
            Words we <span className="font-serif italic font-normal text-[#C86A28]">live by</span>
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative group max-w-6xl mx-auto px-4 sm:px-10">
          
          {/* Left Navigation Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-0 sm:-left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#FAF3EB] hover:bg-[#C86A28] text-[#1C1917] hover:text-white border border-[#E8DCCF] flex items-center justify-center transition-all shadow-xs focus:outline-none active:scale-95 cursor-pointer"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Navigation Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-0 sm:-right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#FAF3EB] hover:bg-[#C86A28] text-[#1C1917] hover:text-white border border-[#E8DCCF] flex items-center justify-center transition-all shadow-xs focus:outline-none active:scale-95 cursor-pointer"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Review Cards Grid (3 cards desktop, 1 card mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {visibleTestimonials.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-[#E8DCCF] flex flex-col justify-between min-h-[250px] transition-all duration-300 hover:-translate-y-1 hover:border-[#C86A28]/50 hover:shadow-md"
              >
                <div>
                  {/* Avatar Icon + Star Rating Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-[#FAF3EB] flex items-center justify-center shrink-0 border border-[#E8DCCF]">
                      <svg
                        className="w-5 h-5 text-[#C86A28]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-0.5 text-[#C86A28]">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#C86A28] text-[#C86A28]" />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-sans mb-6">
                    "{item.text}"
                  </p>
                </div>

                {/* Author Name in Serif Italic + Date */}
                <div className="border-t border-[#FAF3EB] pt-3">
                  <h4 className="font-serif italic font-bold text-[#1C1917] text-base sm:text-lg tracking-wide">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-stone-400 font-sans tracking-wide">
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots Pill at the bottom */}
          <div className="flex justify-center mt-8">
            <div className="bg-[#FAF3EB] border border-[#E8DCCF] px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xs">
              {[...Array(totalPages)].map((_, pageIdx) => (
                <button
                  key={pageIdx}
                  onClick={() => setCurrentIndex(pageIdx)}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                    currentIndex === pageIdx
                      ? 'w-6 bg-[#C86A28]'
                      : 'w-2 bg-stone-300 hover:bg-stone-400'
                  }`}
                  aria-label={`Go to slide ${pageIdx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
