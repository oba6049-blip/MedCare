import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS } from '../types';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section id="testimonials" className="py-24 bg-slate-50/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-100/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative">
        
        {/* Section Heading */}
        <div className="space-y-4 mb-14" id="testimonials-header">
          <span className="text-xs font-bold text-blue-600 bg-blue-50/60 border border-blue-100/50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Patient Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Loved & Trusted by Patients
          </h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            Discover how our digital health portal and board-certified experts combine to elevate outcomes and treatment timelines.
          </p>
        </div>

        {/* Testimonial Active Display Card with AnimatePresence */}
        <div className="relative" id="testimonials-slider-box">
          
          {/* Quote Icon */}
          <div className="absolute -top-6 left-6 text-slate-200/50 transform -scale-x-100 pointer-events-none">
            <Quote size={80} className="fill-slate-100" />
          </div>

          <div className="glass rounded-[28px] border border-white/50 p-8 sm:p-12 card-shadow text-left relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Stars and Care tag */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: current.rating }).map((_, i) => (
                      <Star key={i} size={16} className="fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-blue-500" /> {current.experience}
                  </span>
                </div>

                {/* Review Copy */}
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
                  "{current.review}"
                </p>

                {/* Bio Block */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-150">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{current.name}</h4>
                    <p className="text-xs text-slate-500">{current.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider Controls */}
          <div className="flex justify-center items-center gap-4 mt-8" id="testimonials-controls">
            <button
              onClick={handlePrev}
              className="p-3 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-all cursor-pointer shadow-sm"
              aria-label="Previous testimonial"
              id="btn-prev-testimonial"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Slider Dots indicators */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === i ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-3 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-all cursor-pointer shadow-sm"
              aria-label="Next testimonial"
              id="btn-next-testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
