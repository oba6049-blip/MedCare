import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CalendarCheck2, Award, FileSpreadsheet, ShieldAlert, Sparkles, Database } from 'lucide-react';
import teamImage from '../assets/images/medical_team_1784385623774.jpg';

export default function About() {
  const highlights = [
    {
      title: '24/7 Emergency Intake',
      desc: 'Immediate trauma and acute diagnostic care with dedicated cardiac and stroke protocols.',
      icon: ShieldAlert,
      color: 'text-red-500',
      bgColor: 'bg-red-50/80',
    },
    {
      title: 'Expert Medical Team',
      desc: 'Over 500 board-certified specialists, researchers, and nursing staff working collaboratively.',
      icon: Award,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50/80',
    },
    {
      title: 'Digital Records (EMR)',
      desc: 'HL7-compliant medical records synchronized instantly across departments, pharmacies, and patients.',
      icon: FileSpreadsheet,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50/80',
    },
    {
      title: 'Smart Appointment Queuing',
      desc: 'Interactive online schedules with pre-visit intake forms and automatic calendar confirmations.',
      icon: CalendarCheck2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50/80',
    },
    {
      title: 'Secure Encrypted Database',
      desc: 'Zero-trust architecture ensuring all personal data matches stringent HIPAA and global compliance regulations.',
      icon: Database,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50/80',
    },
    {
      title: 'AI Assisted Operations',
      desc: 'Intelligent triage prediction, automated inventory checks, and pharmaceutical safety cross-referencing.',
      icon: Sparkles,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50/80',
    },
  ];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-100/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Images & Glassmorphism Decorator */}
          <div className="lg:col-span-5 relative" id="about-image-wrapper">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="relative z-10 rounded-[28px] overflow-hidden shadow-2xl border border-slate-100 aspect-[4/3] lg:aspect-[3/4]"
            >
              <img
                src={teamImage}
                alt="MedCare HMS Medical Experts Team"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </motion.div>

            {/* floating overlay box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -bottom-8 -right-8 z-20 glass p-6 rounded-[24px] card-shadow border border-white/50 max-w-xs text-left"
              id="about-floating-card"
            >
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-1">
                <ShieldCheck size={18} /> Joint Commission Approved
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                MedCare Hospital maintains Gold Seal Accreditation for patient safety, clinical standards, and sanitary excellence.
              </p>
            </motion.div>

            {/* Geometric shadow backboard */}
            <div className="absolute top-6 -left-6 w-full h-full border border-white/40 bg-blue-50/20 rounded-[28px] -z-10" />
          </div>

          {/* Right Side: Copy & List of Highlights */}
          <div className="lg:col-span-7 space-y-8 text-left" id="about-text-content">
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">
                Who We Are & What We Believe
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                An Institution Built on Trust, <br />
                Clinical Rigor & Smart Operations
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
                At MedCare HMS, we bridge clinical excellence with smart, zero-friction medical administration. Our integrated platform ensures that doctors, nurses, laboratories, and financial administrators operate as a single unified team. Wait times are minimized and safety is guaranteed.
              </p>
            </div>

            {/* Highlighted Value Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="about-highlights-grid">
              {highlights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex gap-4 p-4 rounded-[20px] hover:glass border border-transparent hover:border-white/50 hover:card-shadow transition-all text-left"
                >
                  <div className={`p-3 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center ${item.bgColor} ${item.color} shadow-sm`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
