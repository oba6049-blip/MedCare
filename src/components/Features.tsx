import React from 'react';
import { motion } from 'motion/react';
import {
  UserPlus,
  CalendarRange,
  FileSpreadsheet,
  CreditCard,
  Beaker,
  BriefcaseMedical,
  Clock,
  Bed,
  Boxes,
  TrendingUp,
  Cpu,
  ShieldAlert
} from 'lucide-react';
import { FEATURES } from '../types';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  UserPlus,
  CalendarRange,
  FileSpreadsheet,
  CreditCard,
  Beaker,
  BriefcaseMedical,
  Clock,
  Bed,
  Boxes,
  TrendingUp,
  Cpu,
  ShieldAlert
};

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-100/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-100/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4" id="features-header">
          <span className="text-xs font-bold text-blue-600 bg-blue-50/60 border border-blue-100/50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            System Capability
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Comprehensive Enterprise HMS Modules
          </h2>
          <p className="text-slate-505 text-sm sm:text-base">
            Powering smart patient flows, automated diagnostics, cloud pharmacy, and itemized billing ledgers within a single HIPAA-compliant workspace.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="features-grid">
          {FEATURES.map((feat, idx) => {
            const IconComp = iconMap[feat.iconName] || Cpu;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
                whileHover={{ 
                  y: -5,
                  borderColor: 'rgba(37, 99, 235, 0.25)',
                }}
                className="glass rounded-[24px] p-6 border border-white/50 card-shadow transition-all text-left flex flex-col justify-between group"
                id={`feature-card-${feat.id}`}
              >
                <div className="space-y-4">
                  {/* Outlined Icon block */}
                  <div className="w-11 h-11 rounded-xl border border-blue-100/70 bg-white text-blue-600 flex items-center justify-center transition-all group-hover:bg-blue-50/50 shrink-0 shadow-sm shadow-blue-500/5">
                    <IconComp size={20} className="stroke-[2]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  System Verified
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
