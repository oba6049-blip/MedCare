import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  HeartPulse,
  Heart,
  Bone,
  Brain,
  Baby,
  Scan,
  FlaskConical,
  Pill,
  Scissors,
  Thermometer,
  Truck,
  ArrowRight
} from 'lucide-react';
import { SERVICES, Service } from '../types';

// Map icon names to Lucide icon components
const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Activity,
  HeartPulse,
  Heart,
  Bone,
  Brain,
  Baby,
  Scan,
  FlaskConical,
  Pill,
  Scissors,
  Thermometer,
  Truck
};

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Derive unique categories/specialties for filters
  const categories = ['All', 'Primary Care', 'Diagnostics', 'Critical Care', 'Surgical Care', 'Medications', 'Emergency'];

  const filteredServices = SERVICES.filter((service) => {
    if (selectedCategory === 'All') return true;
    return service.specialty.toLowerCase() === selectedCategory.toLowerCase() || 
           service.title.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <section id="departments" className="py-24 bg-slate-50/50 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/4 right-1/4 w-[40%] h-[40%] bg-blue-100/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4" id="services-header">
          <span className="text-xs font-bold text-blue-600 bg-blue-50/60 border border-blue-100/50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Clinical Scope
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Our Elite Hospital Services
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            MedCare houses state-of-the-art medical departments, diagnostic laboratories, and inpatient wards staffed by clinical research pioneers.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12" id="services-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-slate-50'
              }`}
              id={`service-filter-btn-${cat.toLowerCase().replace(' ', '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid with Framer Motion AnimatePresence */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          id="services-grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service, idx) => {
              const IconComp = iconMap[service.iconName] || Activity;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.02 }}
                  whileHover={{ 
                    y: -6, 
                    borderColor: 'rgba(37, 99, 235, 0.25)',
                  }}
                  key={service.id}
                  className="glass rounded-[24px] p-6 border border-white/50 card-shadow transition-all text-left flex flex-col justify-between group h-full"
                  id={`service-card-${service.id}`}
                >
                  <div className="space-y-4">
                    {/* Icon wrapper with glow on hover */}
                    <div className="h-12 w-12 rounded-2xl bg-blue-50/60 border border-blue-100/40 text-blue-600 flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white shrink-0 shadow-sm shadow-blue-500/5">
                      <IconComp size={22} className="transition-transform group-hover:scale-110" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {service.specialty}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Interactive details trigger */}
                  <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                      Learn Service Outline
                    </span>
                    <div className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center transition-all group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:translate-x-1">
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty state fallback */}
        {filteredServices.length === 0 && (
          <div className="py-20 text-center space-y-3 bg-white rounded-[28px] border border-slate-100" id="services-empty-state">
            <p className="text-sm font-semibold text-slate-800">No departments match your current filter.</p>
            <p className="text-xs text-slate-400">Try selecting "All Specialty" to view MedCare’s full medical suite.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold text-xs rounded-full cursor-pointer hover:bg-blue-100 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
