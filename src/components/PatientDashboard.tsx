import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  FileText,
  Pill,
  User,
  Clock,
  ChevronRight,
  Plus,
  LogOut,
  Home,
  Heart,
  Shield,
  Activity,
  FileCheck,
  Smartphone,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Lock,
  ClipboardList,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface PatientDashboardProps {
  user: any;
  token: string | null;
  onLogout: () => void;
  onGoBack: () => void;
}

export default function PatientDashboard({ user, token, onLogout, onGoBack }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'book' | 'appointments' | 'records' | 'prescriptions' | 'profile'>('appointments');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

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

  // States for database entities
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  // Form states for Book Appointment
  const [formData, setFormData] = useState({
    doctorName: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology',
    date: '',
    time: '',
    symptoms: ''
  });

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    gender: user?.gender || 'Male',
    password: ''
  });

  const [doctorsList, setDoctorsList] = useState<any[]>([
    { name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', availableTimes: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'] },
    { name: 'Dr. Subair Nurudeen', specialty: 'Neurology', availableTimes: ['11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM'] },
    { name: 'Dr. Elena Rostova', specialty: 'Pediatrics', availableTimes: ['08:30 AM', '10:00 AM', '12:30 PM', '02:30 PM'] },
    { name: 'Dr. Jonathan Cole', specialty: 'Orthopedics', availableTimes: ['09:30 AM', '11:30 AM', '03:00 PM', '04:00 PM'] }
  ]);

  // Load patient data
  const loadDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch appointments
      const resApt = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataApt = await resApt.json();
      if (resApt.ok && dataApt.appointments) {
        setAppointments(dataApt.appointments);
      }

      // 2. Fetch medical records
      const resRec = await fetch('/api/medical-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataRec = await resRec.json();
      if (resRec.ok && dataRec.records) {
        setRecords(dataRec.records);
      }

      // 3. Fetch prescriptions
      const resPre = await fetch('/api/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataPre = await resPre.json();
      if (resPre.ok && dataPre.prescriptions) {
        setPrescriptions(dataPre.prescriptions);
      }

      // 4. Fetch dynamic doctors list
      try {
        const resDocs = await fetch('/api/doctors');
        const dataDocs = await resDocs.json();
        if (resDocs.ok && dataDocs.doctors && dataDocs.doctors.length > 0) {
          const formatted = dataDocs.doctors.map((d: any) => ({
            name: d.name,
            specialty: d.specialty || d.specialization || 'General Medicine',
            availableTimes: d.availableTimes && d.availableTimes.length > 0 ? d.availableTimes : ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
          }));
          setDoctorsList(formatted);
          
          setFormData(prev => {
            if (!prev.doctorName || !formatted.find((f: any) => f.name === prev.doctorName)) {
              return {
                ...prev,
                doctorName: formatted[0].name,
                specialty: formatted[0].specialty,
                time: formatted[0].availableTimes[0] || '09:00 AM'
              };
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('Could not fetch dynamic doctors for patient dashboard, using preset list:', err);
      }
    } catch (err: any) {
      setErrorMsg('Failed to sync data with clinical servers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Handle doctor selection change to automatically pre-set specialty
  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docName = e.target.value;
    const matchedDoc = doctorsList.find(d => d.name === docName);
    if (matchedDoc) {
      setFormData(prev => ({
        ...prev,
        doctorName: docName,
        specialty: matchedDoc.specialty,
        time: matchedDoc.availableTimes[0]
      }));
    }
  };

  // Handle booking submission
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      setErrorMsg('Please complete all scheduling fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientName: user.name,
          patientEmail: user.email,
          doctorName: formData.doctorName,
          specialty: formData.specialty,
          date: formData.date,
          time: formData.time,
          symptoms: formData.symptoms
        })
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMsg('Appointment scheduled successfully! View live progress in clinical queue.');
        setFormData({
          doctorName: 'Dr. Sarah Jenkins',
          specialty: 'Cardiology',
          date: '',
          time: '',
          symptoms: ''
        });
        // Reload list
        loadDashboardData();
        // Redirect tab
        setTimeout(() => {
          setActiveTab('appointments');
          setSuccessMsg(null);
        }, 1500);
      } else {
        setErrorMsg(result.error || 'Failed to submit clinical appointment.');
      }
    } catch (err: any) {
      setErrorMsg('Network error while scheduling. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMsg('Personal clinical record and login settings updated successfully!');
        localStorage.setItem('medcare_user', JSON.stringify(result.user));
        // Reset password field
        setProfileData(prev => ({ ...prev, password: '' }));
      } else {
        setErrorMsg(result.error || 'Failed to update credentials.');
      }
    } catch (err: any) {
      setErrorMsg('Network exception while saving changes.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctorObj = doctorsList.find(d => d.name === formData.doctorName);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="patient-dashboard-view">
      
      {/* Dashboard Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm shadow-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onGoBack}
              className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Return to Home Screen"
              id="dashboard-header-back-btn"
            >
              <Home size={18} />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">Patient Interactive Gateway</span>
              <h1 className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-1.5 leading-tight">
                MedCare Portal 
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">Patient Mode</span>
                <span className="inline-flex items-center">
                  {dbConnected === null ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold border border-slate-200/50 animate-pulse">
                      <span className="w-1 h-1 rounded-full bg-slate-400 block" />
                      Checking DB...
                    </span>
                  ) : dbConnected ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200/50 hover:bg-emerald-100/70 transition-all cursor-help" title="Live MongoDB Connected Successfully">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse block" />
                      MongoDB Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200/50 hover:bg-amber-100/70 transition-all cursor-help" title="Using local in-memory fallback. Set up MONGODB_URI in your environment secrets to connect to live cluster.">
                      <span className="w-1 h-1 rounded-full bg-amber-500 block" />
                      Local Fallback
                    </span>
                  )}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user?.name}</p>
              <p className="text-[10px] font-mono text-slate-400 font-semibold">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'P'}
            </div>
            <button
              onClick={onLogout}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              id="dashboard-header-logout-btn"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Canvas */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-grow">
        
        {/* Profile Card Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[28px] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl shadow-blue-500/10 mb-8 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-2 text-left z-10">
            <div className="flex items-center gap-2">
              <span className="bg-white/10 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">Patient Account Verified</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
            <p className="text-white/85 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
              Manage your clinical bookings, look up doctor prescriptions, verify medical history charts, and update contact credentials.
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold rounded-xl transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer shrink-0"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Health Records
          </button>
        </div>

        {/* Dashboard Grid split into Left sidebar & Right display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Navigation Drawer */}
          <nav className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0" id="dashboard-patient-nav">
            {[
              { id: 'appointments', label: 'My Appointments', icon: Calendar, badge: appointments.length },
              { id: 'book', label: 'Book Appointment', icon: Plus },
              { id: 'records', label: 'Medical Records', icon: FileText, badge: records.length },
              { id: 'prescriptions', label: 'Prescriptions', icon: Pill, badge: prescriptions.length },
              { id: 'profile', label: 'Update Profile', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 transition-all cursor-pointer shrink-0 lg:shrink border ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/15'
                    : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200/60 hover:bg-slate-50'
                }`}
                id={`patient-nav-tab-${tab.id}`}
              >
                <span className="flex items-center gap-3">
                  <tab.icon size={16} />
                  {tab.label}
                </span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-2xl mt-4 space-y-2 hidden lg:block text-left">
              <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1">
                <Shield size={12} /> Privacy Shield
              </span>
              <p className="text-[10px] text-blue-900/70 leading-normal font-medium">
                Your medical data is protected with end-to-end cloud encryption, strictly compliant with HIPAA digital healthcare mandates.
              </p>
            </div>
          </nav>

          {/* Core Content Area */}
          <div className="lg:col-span-9 bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-8 min-h-[500px] flex flex-col justify-between shadow-sm relative" id="dashboard-patient-core">
            
            <div className="w-full">
              {/* Alert notifications area */}
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 mb-6 rounded-2xl bg-red-50 border border-red-100 text-xs text-red-600 font-bold flex items-center gap-2.5 text-left"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 font-bold flex items-center gap-2.5 text-left"
                  >
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                
                {/* === VIEW APPOINTMENTS === */}
                {activeTab === 'appointments' && (
                  <motion.div
                    key="tab-appointments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Your Clinical Appointments</h3>
                        <p className="text-xs text-slate-400 font-medium">History and live queue tracking of all your scheduled specialist assessments.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('book')}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-100 hover:scale-[1.01] cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Plus size={14} /> Book New Intake
                      </button>
                    </div>

                    {appointments.length === 0 ? (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                          <Calendar size={24} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-700">No scheduled appointments found</p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                            You don't have any appointments booked with us currently. Get started by clicking "Book Appointment"!
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('book')}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Book Your First Intake
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((apt) => {
                          const statusColors: any = {
                            'Scheduled': 'bg-indigo-50 text-indigo-600 border-indigo-100/50',
                            'Awaiting Triage': 'bg-amber-50 text-amber-600 border-amber-100/50',
                            'In Consultation': 'bg-blue-50 text-blue-600 border-blue-100/50',
                            'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                          };
                          const badgeClass = statusColors[apt.status] || 'bg-slate-50 text-slate-600 border-slate-100';

                          return (
                            <div
                              key={apt._id || apt.id}
                              className="border border-slate-150 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/30 transition-all text-left bg-white"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-slate-900">{apt.doctorName}</h4>
                                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100/80 px-2.5 py-1 rounded border border-slate-200/20">{apt.specialty}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border self-start sm:self-auto ${badgeClass}`}>
                                  {apt.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 border-t border-slate-50 pt-4 font-medium">
                                <div className="flex items-center gap-2">
                                  <Clock size={14} className="text-blue-500" />
                                  <span>Scheduled Date & Time: <strong className="text-slate-800">{apt.date} • {apt.time}</strong></span>
                                </div>
                                {apt.symptoms && (
                                  <div className="flex items-start gap-2">
                                    <ClipboardList size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                    <span>Symptoms described: <span className="italic text-slate-700">"{apt.symptoms}"</span></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* === BOOK APPOINTMENT === */}
                {activeTab === 'book' && (
                  <motion.div
                    key="tab-book"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 text-left"
                  >
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base font-bold text-slate-900">Book New Consultation</h3>
                      <p className="text-xs text-slate-400 font-medium">Schedule a physical or telehealth appointment with one of our specialized clinicians.</p>
                    </div>

                    <form onSubmit={handleBookAppointment} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        {/* Select Doctor */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Select Specialist Physician</label>
                          <select
                            value={formData.doctorName}
                            onChange={handleDoctorChange}
                            className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            {doctorsList.map((doc) => (
                              <option key={doc.name} value={doc.name}>{doc.name} ({doc.specialty})</option>
                            ))}
                          </select>
                        </div>

                        {/* Specialty Display */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Clinical Specialty</label>
                          <input
                            type="text"
                            value={formData.specialty}
                            disabled
                            className="w-full text-xs font-semibold px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                          />
                        </div>

                        {/* Booking Date */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Preferred Assessment Date</label>
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          />
                        </div>

                        {/* Preferred Time Slot */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Available Daily Slots</label>
                          <select
                            value={formData.time}
                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          >
                            <option value="">-- Choose a timeslot --</option>
                            {selectedDoctorObj?.availableTimes.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                      </div>

                      {/* Symptoms Description */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Brief Symptoms & Case History</label>
                        <textarea
                          placeholder="Please provide any relevant details of symptoms you are currently experiencing to assist clinical triage..."
                          value={formData.symptoms}
                          onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                          rows={4}
                          className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer"
                        >
                          {loading ? 'Submitting Form...' : 'Schedule Official Intake'}
                        </button>
                      </div>

                    </form>
                  </motion.div>
                )}

                {/* === VIEW MEDICAL RECORDS === */}
                {activeTab === 'records' && (
                  <motion.div
                    key="tab-records"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="text-left border-b border-slate-100 pb-4">
                      <h3 className="text-base font-bold text-slate-900">Your Diagnostic Medical Records</h3>
                      <p className="text-xs text-slate-400 font-medium">Verified physician summaries, lab panel insights, and clinical diagnostic chartings.</p>
                    </div>

                    {records.length === 0 ? (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                          <FileText size={24} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-700">No medical records uploaded yet</p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                            Your clinical lab reports and MRI charts will appear here as soon as they are uploaded by your attending physicians.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {records.map((rec) => (
                          <div
                            key={rec._id || rec.id}
                            className="border border-slate-150 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/30 transition-all text-left bg-white space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-50">
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Diagnostic Report</span>
                                <h4 className="text-sm font-bold text-slate-950 mt-1">{rec.diagnosis}</h4>
                              </div>
                              <div className="text-right text-slate-500 font-medium">
                                <p className="text-xs font-bold text-slate-800">{rec.doctorName}</p>
                                <p className="text-[10px]">{rec.specialty} • {rec.date}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Physician Assessment Notes</span>
                                <p className="text-slate-700 font-medium leading-relaxed italic">"{rec.notes || 'No custom remarks specified by the provider.'}"</p>
                              </div>
                              <div className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Prescribed Treatment / Plan</span>
                                <p className="text-slate-700 font-semibold leading-relaxed">{rec.treatment || 'Treatment under evaluation.'}</p>
                              </div>
                            </div>

                            {rec.attachments && rec.attachments.length > 0 && (
                              <div className="pt-2 flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Secured Files:</span>
                                {rec.attachments.map((file: string, fIdx: number) => (
                                  <span
                                    key={fIdx}
                                    className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/80 border border-blue-100/50 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                                    onClick={() => alert(`Opening locked file: ${file}. In production, this opens a secure decrypted file stream.`)}
                                  >
                                    <FileCheck size={12} />
                                    {file}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* === VIEW PRESCRIPTIONS === */}
                {activeTab === 'prescriptions' && (
                  <motion.div
                    key="tab-prescriptions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="text-left border-b border-slate-100 pb-4">
                      <h3 className="text-base font-bold text-slate-900">Your Pharmacy Prescriptions</h3>
                      <p className="text-xs text-slate-400 font-medium">Active drug routines, clinical dosages, and refills coordinated by your specialists.</p>
                    </div>

                    {prescriptions.length === 0 ? (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                          <Pill size={24} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-700">No active prescriptions found</p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                            Once your consultant issues pharmaceutical instructions, they will appear in this automated dosage diary.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {prescriptions.map((presc) => {
                          const isActive = presc.status === 'Active';
                          return (
                            <div
                              key={presc._id || presc.id}
                              className="border border-slate-150 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/30 transition-all text-left bg-white space-y-4"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-900">{presc.medication}</h4>
                                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200/50">{presc.dosage}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 font-semibold">{presc.doctorName} ({presc.specialty}) • Issued {presc.date}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border self-start sm:self-auto ${
                                  isActive
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                                    : 'bg-slate-100 text-slate-500 border-slate-200/50'
                                }`}>
                                  {presc.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100 font-medium">
                                <div>
                                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Frequency</p>
                                  <p className="text-slate-800 font-semibold mt-0.5">{presc.frequency}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Duration Plan</p>
                                  <p className="text-slate-800 font-semibold mt-0.5">{presc.duration}</p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Status</p>
                                  <p className="text-slate-800 font-semibold mt-0.5">{isActive ? 'Ongoing Therapy' : 'Course Completed'}</p>
                                </div>
                              </div>

                              {presc.instructions && (
                                <div className="text-xs space-y-1 font-medium leading-relaxed">
                                  <p className="text-slate-500 font-bold">Directions for Use:</p>
                                  <p className="text-slate-700 bg-blue-50/20 p-3 rounded-xl border border-blue-100/30">"{presc.instructions}"</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* === UPDATE PROFILE === */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="tab-profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 text-left"
                  >
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base font-bold text-slate-900">Personal Contact Settings</h3>
                      <p className="text-xs text-slate-400 font-medium">Update your verified HIPAA patient card, contact details, and account passwords.</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        {/* Name */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Full Name</label>
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          />
                        </div>

                        {/* Email (Read Only) */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Email Address (Read Only)</label>
                          <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="w-full text-xs font-semibold px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Phone Number</label>
                          <input
                            type="text"
                            placeholder="+1 (555) 000-0000"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                          <input
                            type="date"
                            value={profileData.dob}
                            onChange={(e) => setProfileData(prev => ({ ...prev, dob: e.target.value }))}
                            className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">Gender Identity</label>
                          <select
                            value={profileData.gender}
                            onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other / Decline to answer</option>
                          </select>
                        </div>

                        {/* Password change */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">New Password (Leave blank to keep current)</label>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={profileData.password}
                              onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
                              className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-10"
                            />
                            <Lock size={14} className="text-slate-400 absolute right-3.5 top-3.5" />
                          </div>
                        </div>

                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer"
                        >
                          {loading ? 'Saving details...' : 'Save Profile Changes'}
                        </button>
                      </div>

                    </form>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Console Footnote */}
            <div className="pt-4 border-t border-slate-100 mt-8 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 font-mono font-semibold gap-2 text-left">
              <span>SECURED PATIENT GATEWAY : ADEM-V1.0</span>
              <span>DATA COMPLIANT OVER TLS 1.3</span>
              <span>DATABASE SYNCHRONIZATION: ACTIVE</span>
            </div>

          </div>

        </div>

      </main>

      {/* Styled Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className="font-bold text-slate-300">MedCare Hospital Management System</p>
          <p className="text-[11px]">© 2026 MedCare Inc. All rights reserved. HIPAA, GDPR, & SOC2 Compliant Secure Server Infrastructure.</p>
        </div>
      </footer>

    </div>
  );
}
