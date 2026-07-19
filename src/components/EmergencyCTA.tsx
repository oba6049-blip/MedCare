import React from 'react';
import { Phone, Calendar, ArrowRight, ShieldAlert, HeartPulse } from 'lucide-react';

interface EmergencyCTAProps {
  onOpenBooking: () => void;
}

export default function EmergencyCTA({ onOpenBooking }: EmergencyCTAProps) {
  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden" id="emergency-cta-section">
      {/* Background radial accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[120%] bg-blue-100/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-[32px] p-8 sm:p-12 lg:p-16 text-left relative overflow-hidden shadow-2xl border border-blue-500/10">
          
          {/* Subtle design element: overlapping wireframe grids */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute top-6 left-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-200 border border-white/10">
                <ShieldAlert size={14} className="text-red-300 shrink-0" /> Immediate Care Line
              </span>
              
              <div className="space-y-3">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Need Immediate Medical Assistance?
                </h3>
                <p className="text-sky-100 text-sm sm:text-base leading-relaxed max-w-xl">
                  Our trauma centers, acute ICU beds, and emergency dispatch squads operate 24 hours a day, 7 days a week, 365 days a year. Call now for uninterrupted emergency response.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-4 text-xs font-bold text-sky-100 pt-2">
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" /> Instant Trauma Care
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Smart ICU Fleet
                </span>
              </div>
            </div>

            {/* Right Action Call Column */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-6 w-full lg:items-end justify-center">
              
              {/* Emergency Hotline Speed dial display */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left w-full max-w-sm">
                <p className="text-xs font-bold text-sky-200 uppercase tracking-widest">24/7 Dispatch Hotline</p>
                <a
                  href="tel:+15559114357"
                  className="text-2xl sm:text-3xl font-extrabold text-white block mt-1 hover:text-sky-300 transition-colors flex items-center gap-2.5"
                  id="link-emergency-phone"
                >
                  <Phone size={24} className="text-red-300 shrink-0 fill-red-300/10 animate-bounce" /> +1 (555) 911-HELP
                </a>
                <p className="text-[10px] text-sky-100/70 mt-1">Free call within the metropolitan medical loop.</p>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <button
                  onClick={onOpenBooking}
                  className="px-6 py-4 bg-white hover:bg-sky-50 text-blue-700 font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer flex-1 text-sm"
                  id="btn-emergency-book"
                >
                  Book Appointment <Calendar size={15} />
                </button>
                <a
                  href="tel:+15559114357"
                  className="px-6 py-4 border border-white/20 hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 text-sm text-center"
                  id="btn-emergency-call"
                >
                  Call Now <Phone size={15} />
                </a>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
