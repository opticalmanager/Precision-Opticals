import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { RatingStars } from '../common/RatingStars';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  date: string;
  text: string;
  rating: number;
}

export const WordsWeLiveBySection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Rohan Deshmukh',
      location: 'South Mumbai',
      date: '14 Jan, 2026',
      text: 'Precision Optics transformed my prescription experience. The Zeiss SmartLife progressives fitted with robotic 3D measurement eliminated all visual distortion!',
      rating: 5,
    },
    {
      id: '2',
      name: 'Dr. Ayushi Kapoor',
      location: 'New Delhi',
      date: '28 Jan, 2026',
      text: 'As an ophthalmologist myself, I appreciate their 12-step zero-error refraction protocol. The Cartier Signature C frames are authentic and exquisite.',
      rating: 5,
    },
    {
      id: '3',
      name: 'Vikramaditya Rao',
      location: 'Bengaluru',
      date: '02 Feb, 2026',
      text: 'The AI Stylist recommended the GAST Astro 53 titanium rimless frames and they fit my facial proportions impeccably. Truly bespoke optical service.',
      rating: 5,
    },
    {
      id: '4',
      name: 'Simran Jolly',
      location: 'Gurugram',
      date: '10 Feb, 2026',
      text: 'Home Eye Test service was exceptionally punctual and sterile. They brought over 80 luxury frames right to my living room.',
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

  const visibleTestimonials = testimonials.slice(currentIndex * 3, currentIndex * 3 + 3);

  return (
    <section className="bg-[#FAF7F2] py-14 px-4 sm:px-6 lg:px-8 border-t border-[#E8DCCF]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#C85A1B] uppercase block mb-1">
            CLIENT ATTESTATIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] font-serif">
            Words We <span className="italic font-normal text-[#C85A1B]">Live By</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {visibleTestimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-[#E8DCCF] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <RatingStars rating={t.rating} showScore={false} />
                <p className="text-stone-700 text-xs sm:text-sm mt-3 leading-relaxed italic font-serif">
                  "{t.text}"
                </p>
              </div>
              <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-[#1C1917] uppercase">{t.name}</h5>
                  <span className="text-[11px] text-stone-500">{t.location}</span>
                </div>
                <span className="text-[10px] text-stone-400">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
