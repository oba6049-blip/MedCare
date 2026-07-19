import React from 'react';
import { motion } from 'motion/react';
import { Play, ArrowRight, ShieldCheck, HeartPulse, Activity, Trophy } from 'lucide-react';
import heroImage from '../assets/images/hospital_hero_1784385606861.jpg';

interface HeroProps {
  onOpenBooking: () => void;
}

export default function Hero({ onOpenBooking }: HeroProps) {
  const stats = [
    {
      id: 'stat-doc',
      value: '500+',
      label: 'Expert Doctors',
      sub: 'Board-Certified Specialists',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/70',
    },
    {
      id: 'stat-patient',
      value: '25,000+',
      label: 'Patients Healed',
      sub: 'With Successful Outcomes',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/70',
    },
    {
      id: 'stat-satisfaction',
      value: '99%',
      label: 'Satisfaction Rate',
      sub: 'Top-Rated Patient Care',
      icon: Trophy,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50/70',
    },
    {
      id: 'stat-emergency',
      value: '24/7',
      label: 'Emergency Service',
      sub: 'Instant Trauma & ICU Response',
      icon: HeartPulse,
      color: 'text-red-600',
      bgColor: 'bg-red-50/70',
    },
  ];

  const handleScrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector('#features');
    if (target) {
      window.scrollTo({
        top: (target as HTMLElement).offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center overflow-hidden hero-gradient"
    >
      {/* Background abstract gradients */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-200/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[30%] h-[30%] bg-indigo-200/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              id="hero-tag"
            >
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>Unified Hospital Intelligence
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
                id="hero-title"
              >
                Modern Hospital <span className="text-blue-600">Management</span> <br className="hidden md:inline" />
                Made Simple
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-slate-500 leading-relaxed max-w-xl font-medium"
                id="hero-description"
              >
                Manage patients, appointments, billing, pharmacy, and medical records from one intelligent, cloud-based platform. Built for premier clinics and modern hospital systems.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
              id="hero-ctas"
            >
              <button
                onClick={onOpenBooking}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[24px] text-base shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                id="btn-hero-booking"
              >
                Book Appointment{' '}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleScrollToFeatures}
                className="px-8 py-4 bg-white text-slate-900 border border-slate-200 hover:border-slate-300 font-bold rounded-[24px] transition-all flex items-center justify-center gap-2 cursor-pointer text-base hover:bg-slate-50"
                id="btn-hero-features"
              >
                Explore Features
              </button>
            </motion.div>

            {/* trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center gap-6 pt-4 border-t border-slate-100"
              id="hero-trust"
            >
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Patient Avatar"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">Trusted by 25,000+ patients</p>
                <p className="text-[11px] text-slate-500 font-medium">Rated 4.9/5 stars for medical service excellence</p>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Image (Parallax/Float effect) */}
          <div className="lg:col-span-5 relative" id="hero-image-container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 60, delay: 0.2 }}
              className="relative rounded-[32px] overflow-hidden shadow-2xl border border-slate-100/80 aspect-video lg:aspect-[4/5]"
            >
              <img
                src={heroImage}
                alt="MedCare HMS Modern Hospital Reception Lobby"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {/* Glass overlay highlight */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
            </motion.div>

            {/* floating interactive element */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-6 glass p-4 rounded-[24px] card-shadow flex items-center gap-3"
              id="hero-floating-badge"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <HeartPulse size={20} />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Status</span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Cloud Core Live
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Statistics Row Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="hero-stats">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass rounded-[24px] p-6 card-shadow flex items-start gap-4 text-left border border-white/50"
              id={stat.id}
            >
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} shrink-0`}>
                <stat.icon size={22} />
              </div>
              <div>
                <h4 className="text-3xl font-black text-slate-950 tracking-tight">{stat.value}</h4>
                <p className="text-sm font-semibold text-slate-800 mt-1">{stat.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
