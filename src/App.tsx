import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Doctors from './components/Doctors';
import Features from './components/Features';
import DashboardPreview from './components/DashboardPreview';
import Testimonials from './components/Testimonials';
import News from './components/News';
import EmergencyCTA from './components/EmergencyCTA';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import PatientDashboard from './components/PatientDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin_dashboard'>('landing');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | undefined>(undefined);
  
  // Authentication states
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  // Initialize and verify user session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('medcare_token');
    const savedUser = localStorage.getItem('medcare_user');
    
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'patient') {
          setCurrentView('dashboard');
        } else if (parsedUser.role === 'admin') {
          setCurrentView('admin_dashboard');
        }
      }

      // Verify and fetch fresh profile from database
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          // Token expired or invalid
          handleLogout();
          throw new Error('Session expired');
        }
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('medcare_user', JSON.stringify(data.user));
        }
      })
      .catch(err => {
        console.warn("Session restoration check finished:", err.message);
      });
    }
  }, []);

  const handleOpenBooking = (doctorId?: string) => {
    setPreselectedDoctorId(doctorId);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setPreselectedDoctorId(undefined);
  };

  const handleAuthSuccess = (newUser: any, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('medcare_token', newToken);
    localStorage.setItem('medcare_user', JSON.stringify(newUser));
    // Trigger list refresh
    setRefetchKey(prev => prev + 1);
    
    // Automatically switch to correct dashboard based on role
    if (newUser.role === 'patient') {
      setCurrentView('dashboard');
    } else if (newUser.role === 'admin') {
      setCurrentView('admin_dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medcare_token');
    localStorage.removeItem('medcare_user');
    setRefetchKey(prev => prev + 1);
    setCurrentView('landing');
  };

  const handleBookingAdded = () => {
    // Increment key to trigger live reload in Dashboard Preview
    setRefetchKey(prev => prev + 1);
  };

  if (currentView === 'dashboard') {
    return (
      <PatientDashboard
        user={user}
        token={token}
        onLogout={handleLogout}
        onGoBack={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'admin_dashboard') {
    return (
      <AdminDashboard
        user={user}
        token={token}
        onLogout={handleLogout}
        onGoBack={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased scroll-smooth" id="app-root-container">
      {/* Sticky Blurred Navigation Bar */}
      <Navbar 
        onOpenBooking={() => handleOpenBooking()} 
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onNavigateDashboard={() => {
          if (user && user.role === 'admin') {
            setCurrentView('admin_dashboard');
          } else {
            setCurrentView('dashboard');
          }
        }}
      />

      {/* Main Landing Sections */}
      <main id="app-main-content">
        <Hero onOpenBooking={() => handleOpenBooking()} />
        <Features />
        <Services />
        <Doctors onOpenBookingWithDoctor={(docId) => handleOpenBooking(docId)} />
        
        {/* Pass user status and live reload keys to Clinical Workspace */}
        <DashboardPreview 
          user={user}
          token={token}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          refetchKey={refetchKey}
        />
        
        <About />
        <Testimonials />
        <News />
        <EmergencyCTA onOpenBooking={() => handleOpenBooking()} />
      </main>

      {/* Multi-Column Compliant Footer */}
      <Footer />

      {/* Reusable Booking Scheduler Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        preselectedDoctorId={preselectedDoctorId}
        user={user}
        onBookingAdded={handleBookingAdded}
      />

      {/* Patient / Admin Authentication Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
