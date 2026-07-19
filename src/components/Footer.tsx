import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Activity } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && /\S+@\S+\.\S+/.test(email)) {
      setSubmitted(true);
      setEmail('');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-16 text-left" id="app-footer">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Segment: Brand, Navigation, Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-slate-800" id="footer-top-row">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-6" id="footer-brand-column">
            <a href="#home" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
                <Activity size={22} />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                MedCare<span className="text-blue-500">HMS</span>
              </span>
            </a>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Connecting board-certified medical leaders, diagnostics, and patient records securely. Empowering unified hospital intelligence.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-2" id="footer-social-links">
              {['Twitter', 'LinkedIn', 'YouTube', 'Facebook'].map((social, idx) => (
                <button
                  onClick={() => console.log(`Redirecting securely to MedCare ${social} official feed...`)}
                  key={idx}
                  className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-blue-600 hover:text-white transition-all text-slate-400 text-xs font-bold cursor-pointer flex items-center justify-center border border-slate-800"
                  id={`btn-social-${social.toLowerCase()}`}
                >
                  {social[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-4 text-xs" id="footer-quick-links">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Quick Links</h4>
            <ul className="space-y-2.5">
              {['Home', 'Features', 'Doctors', 'About', 'Testimonials', 'Clinical Guidelines'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    onClick={(e) => {
                      // Handle scroll to element if present
                      const target = document.querySelector(`#${link.toLowerCase()}`);
                      if (target) {
                        e.preventDefault();
                        window.scrollTo({
                          top: (target as HTMLElement).offsetTop - 80,
                          behavior: 'smooth',
                        });
                      }
                    }}
                    className="hover:text-blue-500 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinical Departments Column */}
          <div className="lg:col-span-2 space-y-4 text-xs" id="footer-departments-links">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Departments</h4>
            <ul className="space-y-2.5">
              {['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Emergency Dept', 'Diagnostic Lab'].map((dept) => (
                <li key={dept}>
                  <a
                    href="#departments"
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.querySelector('#departments');
                      if (target) {
                        window.scrollTo({
                          top: (target as HTMLElement).offsetTop - 80,
                          behavior: 'smooth',
                        });
                      }
                    }}
                    className="hover:text-blue-500 transition-colors"
                  >
                    {dept}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Booking Subscribe */}
          <div className="lg:col-span-4 space-y-4" id="footer-newsletter-column">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Subscribe to Health Alerts</h4>
            <p className="text-xs text-slate-400 leading-normal">
              Join over 10,000 subscribers and receive medical break-throughs, research, and scheduling alerts.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-white placeholder-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="newsletter-email-input"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer"
                  aria-label="Subscribe button"
                  id="newsletter-submit-btn"
                >
                  <Send size={14} />
                </button>
              </div>

              {submitted && (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-fade-in" id="newsletter-success-toast">
                  <CheckCircle2 size={13} /> Secure subscription active!
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Lower Segment: Contact Details, Legal Statements & Copyright */}
        <div className="pt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-xs text-slate-400" id="footer-bottom-row">
          
          {/* Contact Details Grid */}
          <div className="space-y-3.5" id="footer-contact-block">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Hospital Address</h5>
            <div className="space-y-2">
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <span>100 Medical Plaza Loop, Suite 400, New York, NY 10016</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={16} className="text-blue-500 shrink-0" />
                <span>+1 (555) 123-0100 (Primary Operations Desk)</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={16} className="text-blue-500 shrink-0" />
                <span>operations@medcarehms.com</span>
              </p>
            </div>
          </div>

          {/* Compliance & Policy Indicators */}
          <div className="space-y-3.5" id="footer-compliance-block">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Database Compliance</h5>
            <p className="leading-relaxed text-slate-400">
              The MedCare HMS network meets full HIPAA, SOC2 Type II, and HL7 specifications. All patient-held records are end-to-end encrypted under zero-trust authorization profiles.
            </p>
          </div>

          {/* Copyright & Disclaimer */}
          <div className="space-y-3.5 md:col-span-2 lg:col-span-1" id="footer-copyright-block">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Legal Disclaimer</h5>
            <p className="leading-relaxed text-slate-400">
              All therapeutic advice, patient histories, or newsletters distributed through MedCare are for general understanding only and do not replace personalized physician diagnoses.
            </p>
          </div>

        </div>

        {/* Real Bottom License bar */}
        <div className="pt-10 mt-10 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4" id="footer-disclaimer-bar">
          <p>© {currentYear} MedCare HMS. All Rights Reserved. Built for premium clinic networks.</p>
          <div className="flex gap-4">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); console.log('HIPAA-compliant Privacy Policy details are encrypted in clinical portal logs.'); }} className="hover:underline hover:text-white transition-colors">Privacy Statement</a>
            <span>•</span>
            <a href="#terms" onClick={(e) => { e.preventDefault(); console.log('Terms of digital medical communication are registered under federal healthcare law.'); }} className="hover:underline hover:text-white transition-colors">Terms of Use</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
