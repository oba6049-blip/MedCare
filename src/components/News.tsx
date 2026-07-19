import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, ArrowRight, BookOpen, GraduationCap, Heart, Info, X } from 'lucide-react';
import { NEWS } from '../types';

export default function News() {
  const [showInfo, setShowInfo] = useState(false);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Hospital News':
        return BookOpen;
      case 'Health Tips':
        return Heart;
      case 'Medical Research':
        return GraduationCap;
      default:
        return BookOpen;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Hospital News':
        return 'bg-blue-50 text-blue-600 border-blue-100/50';
      case 'Health Tips':
        return 'bg-red-50 text-red-600 border-red-100/50';
      case 'Medical Research':
        return 'bg-purple-50 text-purple-600 border-purple-100/50';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <section id="news" className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-100/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16" id="news-header">
          <div className="text-left space-y-4 max-w-2xl">
            <span className="text-xs font-bold text-blue-600 bg-blue-50/60 border border-blue-100/50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Publications
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Latest Medical Insights & News
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium">
              Stay updated with clinical breakthroughs, wellness advice from our specialists, and scientific publications authored by MedCare’s research divisions.
            </p>
          </div>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="px-6 py-3 border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 font-bold text-xs rounded-full transition-all flex items-center gap-1.5 cursor-pointer self-start md:self-end bg-white"
            id="btn-all-articles"
          >
            Browse Full Library <ArrowRight size={13} />
          </button>
        </div>

        {/* State-driven inline notification replacement of alert */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-8 p-4 rounded-2xl bg-blue-50/70 border border-blue-100/80 flex items-center justify-between text-left gap-4 max-w-4xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg shrink-0">
                  <Info size={16} />
                </div>
                <p className="text-xs text-slate-700 font-semibold">
                  Our publications library houses over 2,400 indexed clinical trials and healthy living advice columns. Full articles are accessible instantly to patients.
                </p>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="news-grid">
          {NEWS.map((article, idx) => {
            const CatIcon = getCategoryIcon(article.category);
            const catColors = getCategoryColor(article.category);
            return (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="glass rounded-[26px] border border-white/50 card-shadow hover:border-slate-200 transition-all text-left flex flex-col overflow-hidden"
                id={`news-card-${article.id}`}
              >
                {/* Article Image & Zoom on hover */}
                <div className="relative aspect-[3/2] overflow-hidden border-b border-slate-100/50">
                  <img
                    src={article.image}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                  {/* Floating Category Indicator */}
                  <span className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border backdrop-blur-md bg-white/95 shadow-sm ${catColors}`}>
                    <CatIcon size={12} /> {article.category}
                  </span>
                </div>

                {/* Card Copy */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    {/* Timestamp and Read duration */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-extrabold font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {article.readTime}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium">
                      {article.summary}
                    </p>
                  </div>

                  {/* Read More Trigger Link */}
                  <div className="pt-4 border-t border-slate-100/60 flex items-center justify-between group">
                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                      Read Medical Article
                    </span>
                    <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-all group-hover:translate-x-1">
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
