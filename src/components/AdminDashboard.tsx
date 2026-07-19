import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Activity,
  Calendar,
  FileText,
  Pill,
  BarChart3,
  LogOut,
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  User,
  Clock,
  AlertCircle,
  FileDown,
  Info,
  ChevronDown
} from 'lucide-react';

interface AdminDashboardProps {
  user: any;
  token: string | null;
  onLogout: () => void;
  onGoBack: () => void;
}

export default function AdminDashboard({ user, token, onLogout, onGoBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'patients' | 'doctors' | 'appointments' | 'records' | 'prescriptions' | 'reports'>('reports');
  
  // Data lists
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [reports, setReports] = useState<any>({
    summary: { patients: 0, doctors: 0, appointments: 0, medicalRecords: 0, prescriptions: 0 },
    charts: { specialties: [], status: [], demographics: [] }
  });

  // UX & UI Loading state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals / Modifying States
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [targetType, setTargetType] = useState<'patient' | 'doctor' | 'appointment' | 'record' | 'prescription' | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'patient' | 'doctor' | 'appointment' | 'record' | 'prescription';
    id: string;
    name: string;
  } | null>(null);

  // Trigger data reload
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch Core Lists
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setErrorMsg(null);

    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch('/api/admin/patients', { headers }).then(res => res.json()),
      fetch('/api/doctors').then(res => res.json()),
      fetch('/api/appointments', { headers }).then(res => res.json()),
      fetch('/api/medical-records', { headers }).then(res => res.json()),
      fetch('/api/prescriptions', { headers }).then(res => res.json()),
      fetch('/api/admin/reports', { headers }).then(res => res.json())
    ])
    .then(([patientsData, doctorsData, appointmentsData, recordsData, prescriptionsData, reportsData]) => {
      if (patientsData.patients) setPatients(patientsData.patients);
      if (doctorsData.doctors) setDoctors(doctorsData.doctors);
      if (appointmentsData.appointments) setAppointments(appointmentsData.appointments);
      if (recordsData.records) setRecords(recordsData.records);
      if (prescriptionsData.prescriptions) setPrescriptions(prescriptionsData.prescriptions);
      if (reportsData.summary) setReports(reportsData);
    })
    .catch(err => {
      console.error(err);
      setErrorMsg('Failed to load dashboard statistics or listings.');
    })
    .finally(() => {
      setLoading(false);
    });
  }, [token, reloadKey]);

  // --- Real-Time Sync & Notifications State ---
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);

  // Soft diagnostic/clinical pleasant chime (E5 -> B5 chord synth)
  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      // Pleasant high-fidelity hospital chime
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.15); // B5
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Soft notification sound skipped:", e);
    }
  };

  const removeAlert = (id: string) => {
    setLiveAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Set up SSE Event Listener for real-time updates
  useEffect(() => {
    if (!token) return;

    const streamUrl = `/api/admin/realtime-stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'connected') {
          console.log('⚡ Connected to MedCare HMS Real-Time Stream.');
          return;
        }

        // Trigger lists and reports reload immediately to reflect real-time database state
        setReloadKey(prev => prev + 1);

        if (payload.type === 'appointment_created') {
          const apt = payload.data;
          const alertId = 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
          
          setLiveAlerts(prev => [
            {
              id: alertId,
              title: 'New Appointment Booked! 📅',
              message: `${apt.patientName} booked with ${apt.doctorName} (${apt.specialty}) on ${apt.date} at ${apt.time}.`,
              type: 'info',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            ...prev
          ].slice(0, 5));

          // Play audio notification
          playChime();

          // Auto-remove alert after 8 seconds
          setTimeout(() => {
            removeAlert(alertId);
          }, 8000);
        } else if (payload.type === 'appointment_updated') {
          const apt = payload.data;
          const alertId = 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
          
          setLiveAlerts(prev => [
            {
              id: alertId,
              title: 'Appointment Status Updated 🔄',
              message: `${apt.patientName}'s appointment status changed to "${apt.status}".`,
              type: 'warning',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            ...prev
          ].slice(0, 5));

          playChime();

          setTimeout(() => {
            removeAlert(alertId);
          }, 8000);
        } else if (payload.type === 'doctor_created') {
          const doc = payload.data;
          const alertId = 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

          setLiveAlerts(prev => [
            {
              id: alertId,
              title: 'New Doctor Registered 🩺',
              message: `${doc.name} (${doc.specialty || doc.specialization}) has been added to the registry.`,
              type: 'info',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            ...prev
          ].slice(0, 5));

          playChime();

          setTimeout(() => {
            removeAlert(alertId);
          }, 8000);
        } else if (payload.type === 'doctor_deleted') {
          const alertId = 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

          setLiveAlerts(prev => [
            {
              id: alertId,
              title: 'Doctor Profile Removed 🗑️',
              message: 'A medical provider has been removed from the registry.',
              type: 'warning',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            ...prev
          ].slice(0, 5));

          playChime();

          setTimeout(() => {
            removeAlert(alertId);
          }, 8000);
        }
      } catch (err) {
        console.error('Error parsing SSE real-time payload:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE Connection interrupted, the system will auto-reconnect.', err);
    };

    return () => {
      eventSource.close();
    };
  }, [token]);

  // Toast utilities
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // Generic Submit for Create/Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !targetType || !modalType) return;

    let url = '';
    let method = 'POST';

    // Set urls based on targetType and modalType
    if (modalType === 'create') {
      if (targetType === 'patient') url = '/api/admin/patients';
      else if (targetType === 'doctor') url = '/api/admin/doctors';
      else if (targetType === 'appointment') url = '/api/admin/appointments';
      else if (targetType === 'record') url = '/api/medical-records';
      else if (targetType === 'prescription') url = '/api/prescriptions';
    } else {
      method = 'PUT';
      const itemId = formData.id || formData._id;
      if (targetType === 'patient') url = `/api/admin/patients/${itemId}`;
      else if (targetType === 'doctor') url = `/api/admin/doctors/${itemId}`;
      else if (targetType === 'appointment') url = `/api/admin/appointments/${itemId}`;
      else if (targetType === 'record') url = `/api/admin/medical-records/${itemId}`;
      else if (targetType === 'prescription') url = `/api/admin/prescriptions/${itemId}`;
    }

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server operation failed');
      }

      showSuccess(data.message || `${targetType.toUpperCase()} saved successfully!`);
      closeModal();
      setReloadKey(prev => prev + 1);
    } catch (err: any) {
      showError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async (type: 'patient' | 'doctor' | 'appointment' | 'record' | 'prescription', id: string) => {
    if (!token) return;

    let url = '';
    if (type === 'patient') url = `/api/admin/patients/${id}`;
    else if (type === 'doctor') url = `/api/admin/doctors/${id}`;
    else if (type === 'appointment') url = `/api/admin/appointments/${id}`;
    else if (type === 'record') url = `/api/admin/medical-records/${id}`;
    else if (type === 'prescription') url = `/api/admin/prescriptions/${id}`;

    try {
      setLoading(true);
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      showSuccess(data.message || `${type.toUpperCase()} deleted successfully!`);
      setReloadKey(prev => prev + 1);
    } catch (err: any) {
      showError(err.message || 'Failed to delete record');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  // Update appointment status directly
  const handleUpdateStatus = async (appointmentId: string, currentStatus: string, nextStatus: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      showSuccess(`Status changed from "${currentStatus}" to "${nextStatus}"`);
      setReloadKey(prev => prev + 1);
    } catch (err: any) {
      showError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (type: typeof targetType) => {
    setModalType('create');
    setTargetType(type);
    setFormData({});
  };

  const openEditModal = (type: typeof targetType, item: any) => {
    setModalType('edit');
    setTargetType(type);
    
    // Normalize properties for different models
    const copy = { ...item };
    if (copy._id) copy.id = copy._id; // Ensure consistent ID reference
    
    if (type === 'doctor' && Array.isArray(copy.availableTimes)) {
      copy.availableTimesStr = copy.availableTimes.join(', ');
    }
    
    setFormData(copy);
  };

  const closeModal = () => {
    setModalType(null);
    setTargetType(null);
    setFormData({});
  };

  // Filtering Lists based on SearchTerm
  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAppointments = appointments.filter(a =>
    a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecords = records.filter(r =>
    r.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.medication?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Quick stat card counts
  const totalPatients = reports?.summary?.patients || patients.length;
  const totalDoctors = reports?.summary?.doctors || doctors.length;
  const totalAppointments = reports?.summary?.appointments || appointments.length;
  const totalRecords = reports?.summary?.medicalRecords || records.length;
  const totalPrescriptions = reports?.summary?.prescriptions || prescriptions.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row font-sans antialiased" id="admin-dashboard-container">
      {/* Toast notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-medium"
            id="toast-success"
          >
            <Check size={18} />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-rose-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-medium"
            id="toast-error"
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200/80 p-6 flex flex-col justify-between" id="admin-sidebar">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-200">
                A
              </div>
              <div>
                <h2 className="font-bold text-slate-900 leading-tight">MedCare Admin</h2>
                <p className="text-xs font-semibold text-blue-600">Administrative Portal</p>
              </div>
            </div>
          </div>

          {/* Logged in admin stats */}
          <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold">
              SA
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold text-slate-800 truncate">{user?.name || "System Admin"}</h3>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || "nuddywale@yahoo.com"}</p>
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="space-y-1.5" id="admin-nav-links">
            {[
              { id: 'reports', label: 'Generate Reports', icon: BarChart3 },
              { id: 'patients', label: 'Manage Patients', icon: Users, badge: totalPatients },
              { id: 'doctors', label: 'Manage Doctors', icon: Activity, badge: totalDoctors },
              { id: 'appointments', label: 'Manage Appointments', icon: Calendar, badge: totalAppointments },
              { id: 'records', label: 'Manage Records', icon: FileText, badge: totalRecords },
              { id: 'prescriptions', label: 'Manage Prescriptions', icon: Pill, badge: totalPrescriptions }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSearchTerm('');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer font-semibold text-xs ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                  id={`tab-link-${tab.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
          <button
            onClick={onGoBack}
            className="w-full flex items-center gap-2.5 justify-center px-4 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all text-xs font-bold text-slate-700 cursor-pointer"
            id="btn-back-landing"
          >
            <ArrowLeft size={15} />
            Back to Website
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 justify-center px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all text-xs font-bold cursor-pointer"
            id="btn-admin-logout"
          >
            <LogOut size={15} />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl overflow-x-hidden" id="admin-main-stage">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'reports' && "Comprehensive analytical trends and operational audits across MedCare."}
              {activeTab === 'patients' && "Add, modify, or archive user records and medical demographics."}
              {activeTab === 'doctors' && "Staff coordination, clinical specializations, and booking hours."}
              {activeTab === 'appointments' && "Real-time calendar management, status tracking, and triage routing."}
              {activeTab === 'records' && "Authorized database of historic patient medical diagnoses and treatments."}
              {activeTab === 'prescriptions' && "Pharmacy drug scripts, dosages, active logs, and prescription fills."}
            </p>
          </div>

          {/* Action buttons based on tab */}
          {activeTab !== 'reports' && (
            <button
              onClick={() => openCreateModal(
                activeTab === 'patients' ? 'patient' :
                activeTab === 'doctors' ? 'doctor' :
                activeTab === 'appointments' ? 'appointment' :
                activeTab === 'records' ? 'record' : 'prescription'
              )}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-100"
              id="btn-add-new-item"
            >
              <Plus size={16} />
              Add New {
                activeTab === 'patients' ? 'Patient' :
                activeTab === 'doctors' ? 'Doctor' :
                activeTab === 'appointments' ? 'Appointment' :
                activeTab === 'records' ? 'Medical Record' : 'Prescription'
              }
            </button>
          )}
        </div>

        {/* Global Loading Indicator */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl flex items-center gap-3 text-xs font-semibold animate-pulse" id="admin-loading-pulse">
            <Clock size={16} className="animate-spin" />
            <span>Synchronizing workspace databases, please wait...</span>
          </div>
        )}

        {/* Search Bar - only shown for list tabs */}
        {activeTab !== 'reports' && (
          <div className="mb-6 relative" id="search-bar-wrapper">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={`Search database by keyword (name, email, specialty)...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none text-xs font-medium transition-all"
              id="admin-search-input"
            />
          </div>
        )}

        {/* TABS CONTAINER */}
        <div id="admin-tabs-content-stage">
          
          {/* 1. REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-8" id="tab-reports-view">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Total Patients', value: totalPatients, icon: Users, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Total Doctors', value: totalDoctors, icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Scheduled Appointments', value: totalAppointments, icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
                  { label: 'Medical Diagnoses', value: totalRecords, icon: FileText, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Prescriptions Issued', value: totalPrescriptions, icon: Pill, color: 'text-rose-600 bg-rose-50' }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <p className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">{stat.label}</p>
                        <p className="text-xl md:text-2xl font-black text-slate-800">{stat.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                        <Icon size={18} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graphical Visualizations Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Specialty Distribution */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Appointments by Clinical Specialty</h3>
                    <BarChart3 size={15} className="text-slate-400" />
                  </div>
                  
                  {reports?.charts?.specialties?.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">No active appointment bookings found.</div>
                  ) : (
                    <div className="space-y-4">
                      {reports.charts.specialties.map((spec: any, idx: number) => {
                        const percent = totalAppointments > 0 ? Math.round((spec.value / totalAppointments) * 100) : 0;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-700">{spec.name}</span>
                              <span className="text-slate-500">{spec.value} ({percent}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Appointment Status Counts */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Appointment Triage Status Flow</h3>
                    <Activity size={15} className="text-slate-400" />
                  </div>

                  {reports?.charts?.status?.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">No active appointments logged.</div>
                  ) : (
                    <div className="space-y-4">
                      {reports.charts.status.map((stat: any, idx: number) => {
                        const percent = totalAppointments > 0 ? Math.round((stat.value / totalAppointments) * 100) : 0;
                        const colors: any = {
                          'Completed': 'bg-emerald-500',
                          'In Consultation': 'bg-blue-500',
                          'Awaiting Triage': 'bg-amber-500',
                          'Scheduled': 'bg-indigo-500',
                          'Cancelled': 'bg-rose-500'
                        };
                        const barColor = colors[stat.name] || 'bg-slate-500';
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-700">{stat.name}</span>
                              <span className="text-slate-500">{stat.value} ({percent}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className={`${barColor} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Patient Demographics */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Patient Gender Demographics</h3>
                    <Users size={15} className="text-slate-400" />
                  </div>

                  {reports?.charts?.demographics?.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">No patient demographics available.</div>
                  ) : (
                    <div className="space-y-4">
                      {reports.charts.demographics.map((demo: any, idx: number) => {
                        const percent = totalPatients > 0 ? Math.round((demo.value / totalPatients) * 100) : 0;
                        const colors: any = {
                          'Male': 'bg-indigo-500',
                          'Female': 'bg-rose-400',
                          'Other': 'bg-slate-400'
                        };
                        const barColor = colors[demo.name] || 'bg-slate-500';
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-700">{demo.name}</span>
                              <span className="text-slate-500">{demo.value} ({percent}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className={`${barColor} h-full rounded-full transition-all duration-500`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Export Reports actions */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="bg-blue-500/40 text-[10px] font-extrabold uppercase px-2 py-1 rounded-full border border-blue-400/20">System Audits</span>
                    <h3 className="text-base font-black tracking-tight pt-1">Administrative Audit & Exports</h3>
                    <p className="text-xs text-blue-100/90 leading-relaxed font-medium">
                      Compile real-time medical, staffing, and financial triage registries. Save dynamic clinical audits to secure local file systems.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={() => alert("Simulating administrative PDF Export: MedCare_Clinical_Audit_" + new Date().toISOString().split('T')[0] + ".pdf generated successfully!")}
                      className="flex items-center gap-2 justify-center py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all font-bold text-xs cursor-pointer text-white"
                    >
                      <FileDown size={14} />
                      Export Audit PDF
                    </button>
                    <button
                      onClick={() => alert("Simulating CSV Spreadsheet Export: MedCare_Data_Registry_" + new Date().toISOString().split('T')[0] + ".csv generated successfully!")}
                      className="flex items-center gap-2 justify-center py-2.5 bg-white hover:bg-blue-50 text-blue-700 rounded-xl transition-all font-bold text-xs cursor-pointer"
                    >
                      <FileDown size={14} />
                      Export Data CSV
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. MANAGE PATIENTS TAB */}
          {activeTab === 'patients' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm" id="tab-patients-view">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="p-4 pl-6">Patient Name</th>
                      <th className="p-4">Contact Details</th>
                      <th className="p-4">Demographics</th>
                      <th className="p-4">Registered Date</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                          No patient records match the filter terms.
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((pat) => (
                        <tr key={pat.id || pat._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                {pat.name ? pat.name.substring(0, 2) : 'PT'}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{pat.name}</h4>
                                <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-tight">ID: {pat.id || pat._id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-slate-800">{pat.email}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{pat.phone || 'No phone recorded'}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-slate-800">DOB: {pat.dob || 'Not specified'}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              pat.gender?.toLowerCase() === 'male' ? 'bg-indigo-50 text-indigo-600' :
                              pat.gender?.toLowerCase() === 'female' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {pat.gender || 'Other'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 text-[10px]">
                            {pat.createdAt ? new Date(pat.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal('patient', pat)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition-all cursor-pointer"
                                title="Edit Demographics"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'patient', id: pat.id || pat._id, name: pat.name || 'this patient' })}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition-all cursor-pointer"
                                title="Delete Patient"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. MANAGE DOCTORS TAB */}
          {activeTab === 'doctors' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm" id="tab-doctors-view">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="p-4 pl-6">Doctor Name</th>
                      <th className="p-4">Clinical Specialty</th>
                      <th className="p-4">Consultation Availability</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredDoctors.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                          No doctors logged in clinical registry.
                        </td>
                      </tr>
                    ) : (
                      filteredDoctors.map((doc) => (
                        <tr key={doc.id || doc._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">
                                Dr
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{doc.name}</h4>
                                <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-tight">ID: {doc.id || doc._id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-extrabold uppercase">
                              {doc.specialty}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                              {Array.isArray(doc.availableTimes) && doc.availableTimes.length > 0 ? (
                                doc.availableTimes.map((t: string, idx: number) => (
                                  <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {t}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">No slots configured</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal('doctor', doc)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition-all cursor-pointer"
                                title="Edit Doctor"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'doctor', id: doc.id || doc._id, name: doc.name || 'this doctor' })}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition-all cursor-pointer"
                                title="Remove Doctor"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. MANAGE APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm" id="tab-appointments-view">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="p-4 pl-6">Patient</th>
                      <th className="p-4">Doctor Assignee</th>
                      <th className="p-4">Booking Details</th>
                      <th className="p-4">Symptoms / Notes</th>
                      <th className="p-4">Status & Routing</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                          No appointments matching the current parameters.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => {
                        const dateStr = apt.date ? new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                        
                        // Pick status badge styling
                        const statusColors: any = {
                          'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-100',
                          'In Consultation': 'bg-blue-50 text-blue-600 border-blue-100',
                          'Awaiting Triage': 'bg-amber-50 text-amber-600 border-amber-100',
                          'Scheduled': 'bg-indigo-50 text-indigo-600 border-indigo-100',
                          'Cancelled': 'bg-rose-50 text-rose-600 border-rose-100'
                        };
                        const statusStyle = statusColors[apt.status] || 'bg-slate-50 text-slate-600 border-slate-100';

                        return (
                          <tr key={apt.id || apt._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <h4 className="font-bold text-slate-800 text-xs">{apt.patientName}</h4>
                              <p className="text-[10px] text-slate-400 font-bold tracking-tight">{apt.patientEmail}</p>
                            </td>
                            <td className="p-4">
                              <h4 className="font-bold text-slate-800 text-xs">{apt.doctorName}</h4>
                              <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">{apt.specialty}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1 text-slate-700">
                                <Calendar size={13} className="text-slate-400" />
                                <span>{dateStr}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5">
                                <Clock size={11} />
                                <span>{apt.time}</span>
                              </div>
                            </td>
                            <td className="p-4 max-w-xs overflow-hidden text-slate-500">
                              <p className="line-clamp-2 italic">{apt.symptoms || "No symptoms logged."}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1.5">
                                <span className={`inline-flex items-center justify-center border text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${statusStyle}`}>
                                  {apt.status}
                                </span>
                                
                                {/* Quick Triage status updates */}
                                <div className="flex gap-1">
                                  {['Awaiting Triage', 'In Consultation', 'Completed'].map((nextSt) => {
                                    if (apt.status === nextSt) return null;
                                    return (
                                      <button
                                        key={nextSt}
                                        onClick={() => handleUpdateStatus(apt.id || apt._id, apt.status, nextSt)}
                                        className="text-[9px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded cursor-pointer transition-all"
                                      >
                                        To {nextSt.split(' ')[0]}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditModal('appointment', apt)}
                                  className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition-all cursor-pointer"
                                  title="Reschedule Appointment"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ type: 'appointment', id: apt.id || apt._id, name: `Appointment for ${apt.patientName} with ${apt.doctorName}` })}
                                  className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition-all cursor-pointer"
                                  title="Cancel Appointment"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. MANAGE RECORDS TAB */}
          {activeTab === 'records' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm" id="tab-records-view">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="p-4 pl-6">Patient Email</th>
                      <th className="p-4">Attending Doctor</th>
                      <th className="p-4">Diagnosis</th>
                      <th className="p-4">Treatment Protocol</th>
                      <th className="p-4">Consultation Date</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                          No clinical records found.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((rec) => (
                        <tr key={rec.id || rec._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-800">
                            {rec.patientEmail}
                          </td>
                          <td className="p-4">
                            <h4 className="font-bold text-slate-800 text-xs">{rec.doctorName}</h4>
                            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">{rec.specialty}</span>
                          </td>
                          <td className="p-4 font-bold text-rose-600">
                            {rec.diagnosis}
                          </td>
                          <td className="p-4 max-w-xs overflow-hidden text-slate-500">
                            <p className="font-medium text-slate-700 line-clamp-2">{rec.treatment || "Monitoring"}</p>
                            <p className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">{rec.notes || "No notes"}</p>
                          </td>
                          <td className="p-4 text-slate-400 text-[10px]">
                            {rec.date ? new Date(rec.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal('record', rec)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition-all cursor-pointer"
                                title="Edit Record"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'record', id: rec.id || rec._id, name: `Diagnosis of "${rec.diagnosis}"` })}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition-all cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. MANAGE PRESCRIPTIONS TAB */}
          {activeTab === 'prescriptions' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm" id="tab-prescriptions-view">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="p-4 pl-6">Patient Email</th>
                      <th className="p-4">Attending Doctor</th>
                      <th className="p-4">Medication & Dosage</th>
                      <th className="p-4">Intake Instructions</th>
                      <th className="p-4">Active Duration</th>
                      <th className="p-4">Fill Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredPrescriptions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                          No pharmaceutical logs found.
                        </td>
                      </tr>
                    ) : (
                      filteredPrescriptions.map((pr) => (
                        <tr key={pr.id || pr._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-800">
                            {pr.patientEmail}
                          </td>
                          <td className="p-4">
                            <h4 className="font-bold text-slate-800 text-xs">{pr.doctorName}</h4>
                            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">{pr.specialty}</span>
                          </td>
                          <td className="p-4">
                            <h4 className="font-black text-blue-600 text-xs">{pr.medication}</h4>
                            <span className="text-[10px] text-slate-500 font-bold">{pr.dosage} • {pr.frequency}</span>
                          </td>
                          <td className="p-4 max-w-xs overflow-hidden text-slate-500 line-clamp-2">
                            {pr.instructions || 'Take as directed.'}
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              {pr.duration}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{pr.date ? new Date(pr.date).toLocaleDateString() : 'N/A'}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              pr.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200/50'
                            }`}>
                              {pr.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal('prescription', pr)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition-all cursor-pointer"
                                title="Edit Prescription"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ type: 'prescription', id: pr.id || pr._id, name: `Prescription of ${pr.medication} for ${pr.patientEmail}` })}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition-all cursor-pointer"
                                title="Revoke Prescription"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ADMIN EDIT / CREATE MODALS */}
      <AnimatePresence>
        {modalType && targetType && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200/80 w-full max-w-xl overflow-hidden"
              id="admin-form-modal"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-800 tracking-tight text-sm uppercase">
                    {modalType === 'create' ? 'Add New' : 'Modify'} {targetType}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Please supply accurate demographic & clinical records.</p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* PATIENT FORM FIELDS */}
                {targetType === 'patient' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Patient Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Eleanor Sterling"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</label>
                        <input
                          type="email"
                          required
                          disabled={modalType === 'edit'}
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="patient@email.com"
                          className="w-full border border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Phone Contact</label>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 019-2834"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Secret Password</label>
                        <input
                          type="password"
                          required={modalType === 'create'}
                          value={formData.password || ''}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder={modalType === 'edit' ? "Leave empty to retain current" : "••••••••"}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dob || ''}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Gender Identity</label>
                        <select
                          value={formData.gender || ''}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* DOCTOR FORM FIELDS */}
                {targetType === 'doctor' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Doctor's Full Name (with Title)</label>
                        <input
                          type="text"
                          required
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Dr. Christopher Vance"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Clinical Department</label>
                        <select
                          required
                          value={formData.specialty || ''}
                          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        >
                          <option value="">Select Department Specialty</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Orthopedics">Orthopedics</option>
                          <option value="Dermatology">Dermatology</option>
                          <option value="General Medicine">General Medicine</option>
                          <option value="Emergency Medicine">Emergency Medicine</option>
                          <option value="Radiology">Radiology</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Clinical Specialization Title</label>
                        <input
                          type="text"
                          value={formData.specialization || ''}
                          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                          placeholder="e.g. Chief of Cardiology"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Experience Years</label>
                        <input
                          type="text"
                          value={formData.experience || ''}
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                          placeholder="e.g. 14 Years Experience"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Total Consulted Patients</label>
                        <input
                          type="text"
                          value={formData.patients || ''}
                          onChange={(e) => setFormData({ ...formData, patients: e.target.value })}
                          placeholder="e.g. 3,200+ Patients"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Rating (1.0 to 5.0)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={formData.rating || ''}
                          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                          placeholder="e.g. 4.9"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Profile Photo Image URL</label>
                      <input
                        type="url"
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Available Consultation Days / Times</label>
                      <input
                        type="text"
                        value={formData.availableTimesStr || ''}
                        onChange={(e) => {
                          const str = e.target.value;
                          const times = str.split(',').map(t => t.trim()).filter(Boolean);
                          setFormData({ ...formData, availableTimesStr: str, availableTimes: times });
                        }}
                        placeholder="Monday, Wednesday, Friday"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                  </>
                )}

                {/* APPOINTMENT FORM FIELDS */}
                {targetType === 'appointment' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Patient Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.patientName || ''}
                          onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                          placeholder="John Doe"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Patient Registered Email</label>
                        <input
                          type="email"
                          required
                          value={formData.patientEmail || ''}
                          onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                          placeholder="patient@email.com"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Assign Doctor</label>
                        <select
                          required
                          value={formData.doctorName || ''}
                          onChange={(e) => {
                            const name = e.target.value;
                            const matched = doctors.find(d => d.name === name);
                            setFormData({
                              ...formData,
                              doctorName: name,
                              specialty: matched ? matched.specialty : (formData.specialty || '')
                            });
                          }}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        >
                          <option value="">Select Doctor</option>
                          {doctors.map((d, idx) => (
                            <option key={idx} value={d.name}>{d.name} ({d.specialty})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Department specialty</label>
                        <input
                          type="text"
                          required
                          readOnly
                          value={formData.specialty || ''}
                          placeholder="Autogenerated specialty"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Consultation Date</label>
                        <input
                          type="date"
                          required
                          value={formData.date || ''}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Scheduled Time Slot</label>
                        <input
                          type="text"
                          required
                          value={formData.time || ''}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          placeholder="10:30 AM"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Symptoms & Diagnostics Notes</label>
                      <textarea
                        value={formData.symptoms || ''}
                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                        placeholder="Patient reports acute migraine and light sensitivity..."
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Triage Status Routing</label>
                      <select
                        value={formData.status || 'Scheduled'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Awaiting Triage">Awaiting Triage</option>
                        <option value="In Consultation">In Consultation</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </>
                )}

                {/* MEDICAL RECORD FORM FIELDS */}
                {targetType === 'record' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Patient Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.patientEmail || ''}
                        onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                        placeholder="patient@email.com"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Attending Doctor</label>
                        <select
                          required
                          value={formData.doctorName || ''}
                          onChange={(e) => {
                            const name = e.target.value;
                            const matched = doctors.find(d => d.name === name);
                            setFormData({
                              ...formData,
                              doctorName: name,
                              specialty: matched ? matched.specialty : (formData.specialty || '')
                            });
                          }}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        >
                          <option value="">Select Doctor</option>
                          {doctors.map((d, idx) => (
                            <option key={idx} value={d.name}>{d.name} ({d.specialty})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Department Specialty</label>
                        <input
                          type="text"
                          required
                          readOnly
                          value={formData.specialty || ''}
                          placeholder="Doctor specialty"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Diagnosis</label>
                        <input
                          type="text"
                          required
                          value={formData.diagnosis || ''}
                          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                          placeholder="Mild Hypertension / Coronary Spasm"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Diagnostic Consultation Date</label>
                        <input
                          type="date"
                          required
                          value={formData.date || ''}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Treatment Plan</label>
                      <textarea
                        value={formData.treatment || ''}
                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                        placeholder="Administer Beta-blockers, advise strict low-sodium dietary restrictions..."
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Administrative Notes</label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Patient to register visual strain diary for next consultation."
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                  </>
                )}

                {/* PRESCRIPTION FORM FIELDS */}
                {targetType === 'prescription' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Patient Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.patientEmail || ''}
                        onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                        placeholder="patient@email.com"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Prescribing Doctor</label>
                        <select
                          required
                          value={formData.doctorName || ''}
                          onChange={(e) => {
                            const name = e.target.value;
                            const matched = doctors.find(d => d.name === name);
                            setFormData({
                              ...formData,
                              doctorName: name,
                              specialty: matched ? matched.specialty : (formData.specialty || '')
                            });
                          }}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        >
                          <option value="">Select Doctor</option>
                          {doctors.map((d, idx) => (
                            <option key={idx} value={d.name}>{d.name} ({d.specialty})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Department Specialty</label>
                        <input
                          type="text"
                          required
                          readOnly
                          value={formData.specialty || ''}
                          placeholder="Doctor specialty"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Pharmaceutical Medication</label>
                        <input
                          type="text"
                          required
                          value={formData.medication || ''}
                          onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                          placeholder="Lisinopril 10mg"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Prescription Date</label>
                        <input
                          type="date"
                          required
                          value={formData.date || ''}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Dosage</label>
                        <input
                          type="text"
                          required
                          value={formData.dosage || ''}
                          onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                          placeholder="1 tablet"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Frequency</label>
                        <input
                          type="text"
                          required
                          value={formData.frequency || ''}
                          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                          placeholder="Daily in the morning"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Duration</label>
                        <input
                          type="text"
                          required
                          value={formData.duration || ''}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="30 days"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Pharmacy Intake Instructions</label>
                      <textarea
                        value={formData.instructions || ''}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        placeholder="Take with food. Do not consume alcohol within 2 hours of dose."
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Prescription Status</label>
                      <select
                        value={formData.status || 'Active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      >
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Modal Footer Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all text-xs font-bold cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all text-xs font-bold cursor-pointer"
                  >
                    Save & Synchronize
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
              id="delete-confirmation-modal"
            >
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center" id="delete-warning-icon">
                  <AlertCircle size={24} className="animate-bounce" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Are you sure you want to permanently delete <strong className="text-slate-800 font-extrabold">"{deleteConfirm.name}"</strong>?
                  </p>
                  <p className="text-[10px] text-rose-500 font-bold bg-rose-50 border border-rose-100/50 py-1 px-3 rounded-lg inline-block">
                    ⚠️ This action is irreversible and will remove all associated registry records.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex items-center justify-center gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setDeleteConfirm(null)}
                  className="w-1/2 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all text-xs font-bold cursor-pointer disabled:opacity-50"
                  id="btn-cancel-delete"
                >
                  Keep Record
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all text-xs font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-rose-100"
                  id="btn-confirm-delete"
                >
                  {loading ? (
                    <Clock size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Real-Time Notifications Banner */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-96 max-w-full pointer-events-none">
        <AnimatePresence>
          {liveAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex flex-col gap-1.5 relative overflow-hidden group"
            >
              {/* Glowing accent border */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500" />
              
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 text-amber-400 animate-pulse">🔔</span>
                  <span className="font-extrabold text-[11px] tracking-wider uppercase text-slate-300">
                    {alert.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{alert.time}</span>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <p className="text-xs font-semibold leading-relaxed text-slate-100">
                {alert.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
