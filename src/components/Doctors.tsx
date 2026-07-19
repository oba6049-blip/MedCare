import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, CalendarRange } from 'lucide-react';
import { DOCTORS } from '../types';

interface DoctorsProps {
  onOpenBookingWithDoctor: (doctorId: string) => void;
}

export default function Doctors({ onOpenBookingWithDoctor }: DoctorsProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [doctors, setDoctors] = useState<any[]>(DOCTORS);

  useEffect(() => {
    let active = true;
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        if (data && data.doctors && data.doctors.length > 0) {
          const mapped = data.doctors.map((d: any) => ({
            id: d.id || d._id,
            name: d.name,
            specialization: d.specialization || d.specialty || 'Clinical Specialist',
            experience: d.experience || '10 Years Experience',
            rating: d.rating || 4.8,
            patients: d.patients || '1,200+ Patients',
            image: d.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400',
            availability: d.availableTimes && d.availableTimes.length > 0 ? d.availableTimes : (d.availability || ['Monday', 'Wednesday', 'Friday'])
          }));
          setDoctors(mapped);
        } else {
          setDoctors(DOCTORS);
        }
      })
      .catch(err => {
        console.error('Failed to load doctors dynamically, using fallback preset:', err);
        if (active) {
          setDoctors(DOCTORS);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340; // Approx card width + gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="doctors" className="py-24 bg-white relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute bottom-1/4 left-1/4 w-[40%] h-[40%] bg-blue-100/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Controls Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12" id="doctors-header-row">
          <div className="text-left space-y-4 max-w-2xl">
            <span className="text-xs font-bold text-blue-600 bg-blue-50/60 border border-blue-100/50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Medical Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Meet Our Board-Certified Leaders
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Connect with leading clinical researchers, department chairs, and surgical innovators dedicated to patient-first recovery.
            </p>
          </div>

          {/* Carousel Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-end" id="doctors-carousel-triggers">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-slate-50 transition-all cursor-pointer"
              aria-label="Scroll left"
              id="btn-scroll-docs-left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-slate-50 transition-all cursor-pointer"
              aria-label="Scroll right"
              id="btn-scroll-docs-right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Sliding Doctor Cards container */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-4 px-1 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          id="doctors-carousel-container"
        >
          {doctors.map((doc, idx) => (
            <motion.div
              key={doc.id || idx}
              className="snap-start shrink-0 w-[290px] sm:w-[320px] glass rounded-[26px] border border-white/50 p-4 card-shadow transition-all group flex flex-col justify-between"
              id={`doctor-card-${doc.id || idx}`}
            >
              <div className="space-y-4">
                {/* Doctor Headshot */}
                <div className="relative rounded-[22px] overflow-hidden aspect-square border border-slate-100">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm text-xs font-bold text-slate-800">
                    <Star className="text-amber-500 fill-amber-500" size={13} /> {typeof doc.rating === 'number' ? doc.rating.toFixed(1) : parseFloat(doc.rating || '4.8').toFixed(1)}
                  </div>
                </div>

                {/* Info Text */}
                <div className="space-y-1.5 text-left px-1">
                  <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs uppercase tracking-wider">
                    <ShieldCheck size={14} /> {doc.specialization}
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                    {doc.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100/70">
                    <span className="font-medium">{doc.experience}</span>
                    <span className="font-semibold text-slate-700">{doc.patients}</span>
                  </div>
                </div>
              </div>

              {/* Action and availability footer */}
              <div className="pt-4 mt-4 border-t border-slate-100/70 text-left space-y-3 px-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <CalendarRange size={13} className="text-blue-500" />
                  Available: <span className="text-slate-800 font-semibold">{Array.isArray(doc.availability) ? doc.availability.join(', ') : doc.availability}</span>
                </div>

                <button
                  onClick={() => onOpenBookingWithDoctor(doc.id)}
                  className="w-full py-3 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold rounded-[16px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/5"
                  id={`btn-book-doctor-${doc.id || idx}`}
                >
                  Schedule Consultation <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
