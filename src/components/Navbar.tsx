import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Activity, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  user?: any;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  onNavigateDashboard?: () => void;
}

export default function Navbar({ onOpenBooking, user, onLogout, onOpenAuth, onNavigateDashboard }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Departments', href: '#departments' },
    { name: 'Doctors', href: '#doctors' },
    { name: 'About', href: '#about' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'News', href: '#news' },
  ];

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setDbConnected(data.database === 'mongodb');
      })
      .catch(err => {
        console.error('Failed to fetch db status:', err);
        setDbConnected(false);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section
      const scrollPosition = window.scrollY + 120;
      for (const link of navLinks) {
        const el = document.querySelector(link.href);
        if (el) {
          const top = (el as HTMLElement).offsetTop;
          const height = (el as HTMLElement).offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(link.href.replace('#', ''));
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const offsetTop = (target as HTMLElement).offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'glass shadow-sm py-4 border-b border-slate-200/50'
            : 'bg-transparent py-6'
        }`}
        id="app-header"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo & Db Status Indicator */}
          <div className="flex items-center gap-3">
            <a
              href="#home"
              onClick={(e) => handleLinkClick(e, '#home')}
              className="flex items-center gap-2.5 group"
              id="nav-logo"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
                <Activity size={22} className="animate-pulse" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                MedCare<span className="text-blue-600">HMS</span>
              </span>
            </a>

            {/* MongoDB Connection Status Indicator */}
            <div className="hidden sm:flex items-center" id="mongodb-status-indicator">
              {dbConnected === null ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200/50 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 block" />
                  Checking DB...
                </div>
              ) : dbConnected ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50 hover:bg-emerald-100/70 transition-all cursor-help" title="Live MongoDB Connected Successfully">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block" />
                  MongoDB Connected
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/50 hover:bg-amber-100/70 transition-all cursor-help" title="Using local in-memory fallback. Set up MONGODB_URI in your environment secrets to connect to live cluster.">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block" />
                  Local DB Fallback
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5" id="desktop-nav">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/60'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                  id={`nav-item-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4" id="nav-actions">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'patient' && onNavigateDashboard && (
                  <button
                    onClick={onNavigateDashboard}
                    className="text-[13px] font-extrabold text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-98 transition-all px-4 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-100"
                    id="btn-nav-dashboard"
                  >
                    Patient Dashboard
                  </button>
                )}
                {user.role === 'admin' && onNavigateDashboard && (
                  <button
                    onClick={onNavigateDashboard}
                    className="text-[13px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-98 transition-all px-4 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100"
                    id="btn-nav-admin-dashboard"
                  >
                    Admin Dashboard
                  </button>
                )}
                <span className="text-[13px] font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block" />
                  {user.name} ({user.role.toUpperCase()})
                </span>
                <button
                  onClick={onLogout}
                  className="text-[13px] font-bold text-red-600 hover:text-red-700 transition-all py-2 px-3 flex items-center gap-1 cursor-pointer"
                  id="btn-nav-logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="text-[14px] font-bold text-slate-600 hover:text-blue-600 transition-all py-2 px-3 cursor-pointer"
                id="btn-nav-login"
              >
                Sign In / Register
              </button>
            )}
            <button
              onClick={onOpenBooking}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[14px] rounded-[20px] transition-all shadow-lg shadow-blue-200 hover:scale-[1.02] cursor-pointer"
              id="btn-nav-appointment"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile Hamburguer */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all"
            aria-label="Toggle Mobile Menu"
            id="mobile-menu-trigger"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[73px] z-30 lg:hidden border-b border-slate-100 bg-white/95 backdrop-blur-xl shadow-lg px-6 py-8"
            id="mobile-drawer"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-lg font-medium text-slate-800 hover:text-blue-600 py-1 transition-colors flex items-center justify-between"
                  id={`mobile-nav-item-${link.name.toLowerCase()}`}
                >
                  {link.name}
                  <ChevronRight size={16} className="text-slate-400" />
                </a>
              ))}

              <hr className="border-slate-100 my-2" />

              <div className="flex flex-col gap-3 pt-2">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <span className="w-full text-center py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl">
                      Logged in: {user.name} ({user.role.toUpperCase()})
                    </span>
                    {user.role === 'patient' && onNavigateDashboard && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateDashboard();
                        }}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-xs cursor-pointer text-center shadow-md shadow-blue-100"
                        id="btn-mobile-dashboard"
                      >
                        Patient Dashboard
                      </button>
                    )}
                    {user.role === 'admin' && onNavigateDashboard && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateDashboard();
                        }}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs cursor-pointer text-center shadow-md shadow-indigo-100"
                        id="btn-mobile-admin-dashboard"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all text-xs border border-red-200 cursor-pointer"
                      id="btn-mobile-logout"
                    >
                      Sign Out Account
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenAuth) onOpenAuth();
                    }}
                    className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold rounded-[20px] transition-all text-sm border border-slate-200 cursor-pointer"
                    id="btn-mobile-login"
                  >
                    Sign In / Register
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[20px] transition-all text-sm text-center shadow-lg shadow-blue-200 cursor-pointer"
                  id="btn-mobile-appointment"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
