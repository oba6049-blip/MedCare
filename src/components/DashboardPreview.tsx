import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  User,
  MoreVertical,
  Plus,
  ShieldCheck,
  ChevronRight,
  Database,
  Lock,
  LogOut
} from 'lucide-react';

interface DashboardPreviewProps {
  user?: any;
  token?: string | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  refetchKey?: number;
}

export default function DashboardPreview({ user, token, onOpenAuth, onLogout, refetchKey = 0 }: DashboardPreviewProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'appointments' | 'doctors' | 'notifications'>('analytics');
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Default Mock data (used when logged out or as base)
  const [mockAppointments, setMockAppointments] = useState([
    {
      id: 'apt-1',
      patient: 'Eleanor Sterling',
      doctor: 'Dr. Sarah Jenkins',
      specialty: 'Cardiology',
      time: '10:30 AM',
      status: 'In Consultation',
      statusColor: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'apt-2',
      patient: 'David Chen',
      doctor: 'Dr. Subair Nurudeen',
      specialty: 'Neurology',
      time: '11:15 AM',
      status: 'Awaiting Triage',
      statusColor: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      id: 'apt-3',
      patient: 'Samantha Ross',
      doctor: 'Dr. Elena Rostova',
      specialty: 'Pediatrics',
      time: '12:00 PM',
      status: 'Scheduled',
      statusColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      id: 'apt-4',
      patient: 'Marcus Brody',
      doctor: 'Dr. Jonathan Cole',
      specialty: 'Orthopedics',
      time: '02:30 PM',
      status: 'Completed',
      statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
  ]);

  // Real Appointments list from DB
  const [dbAppointments, setDbAppointments] = useState<any[]>([]);

  // Active appointments selected based on user status
  const appointments = token ? dbAppointments : mockAppointments;

  const [notifications, setNotifications] = useState([
    {
      id: 'not-1',
      text: 'Eleanor Sterling diagnostic cardiology scan results uploaded successfully.',
      time: '3 mins ago',
      type: 'success',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      id: 'not-2',
      text: 'ICU Bed #4 patient biometric alarm. Pulse stabilized under on-duty nurse supervision.',
      time: '12 mins ago',
      type: 'warning',
      icon: Activity,
      color: 'text-red-500 bg-red-50',
    },
    {
      id: 'not-3',
      text: 'Pharmacy alert: Barcode inventory for Insulin GLP-1 is low. Reorder triggered.',
      time: '45 mins ago',
      type: 'alert',
      icon: AlertCircle,
      color: 'text-amber-500 bg-amber-50',
    },
  ]);

  const [doctorsRoster, setDoctorsRoster] = useState([
    { name: 'Dr. Sarah Jenkins', status: 'On-duty (Active)', load: '4/6 patients', color: 'bg-emerald-500' },
    { name: 'Dr. Subair Nurudeen', status: 'In Surgery', load: 'Surgery Room A', color: 'bg-red-500' },
    { name: 'Dr. Elena Rostova', status: 'On-duty (Active)', load: '2/5 patients', color: 'bg-emerald-500' },
    { name: 'Dr. Jonathan Cole', status: 'On-Break', load: 'Returns 2:00 PM', color: 'bg-slate-400' },
  ]);

  // Fetch API status (check if MongoDB is active vs Fallback)
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(err => console.error("Error fetching db status:", err));
  }, []);

  // Fetch real appointments when logged in
  const fetchRealAppointments = async () => {
    if (!token) return;
    setLoadingDb(true);
    try {
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.appointments) {
        setDbAppointments(data.appointments);
      }
    } catch (err) {
      console.error("Failed to load appointments from server:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchRealAppointments();
  }, [token, refetchKey]);

  // Status Style Helper
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Awaiting Triage':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'In Consultation':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const handleStatusCycle = async (id: string) => {
    if (token) {
      // Real DB logic: cycle status if admin, else warn
      if (user?.role !== 'admin') {
        alert("Action restricted. Only administrative personnel can cycle patient clinical status.");
        return;
      }

      // Find current status to figure out the next in sequence
      const apt = dbAppointments.find(a => (a._id || a.id) === id);
      if (!apt) return;

      let nextStatus = 'Scheduled';
      if (apt.status === 'Scheduled') nextStatus = 'Awaiting Triage';
      else if (apt.status === 'Awaiting Triage') nextStatus = 'In Consultation';
      else if (apt.status === 'In Consultation') nextStatus = 'Completed';

      try {
        const response = await fetch(`/api/appointments/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: nextStatus })
        });
        if (response.ok) {
          fetchRealAppointments(); // reload list
        } else {
          const data = await response.json();
          alert(data.error || "Failed to update appointment status");
        }
      } catch (err) {
        console.error("Status update error:", err);
      }
    } else {
      // Logged out mockup behavior
      setMockAppointments((prev) =>
        prev.map((apt) => {
          if (apt.id === id) {
            if (apt.status === 'Scheduled') {
              return {
                ...apt,
                status: 'Awaiting Triage',
                statusColor: getStatusStyle('Awaiting Triage'),
              };
            } else if (apt.status === 'Awaiting Triage') {
              return {
                ...apt,
                status: 'In Consultation',
                statusColor: getStatusStyle('In Consultation'),
              };
            } else if (apt.status === 'In Consultation') {
              return {
                ...apt,
                status: 'Completed',
                statusColor: getStatusStyle('Completed'),
              };
            } else {
              return {
                ...apt,
                status: 'Scheduled',
                statusColor: getStatusStyle('Scheduled'),
              };
            }
          }
          return apt;
        })
      );
    }
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-55 relative overflow-hidden" id="dashboard-preview">
      {/* Background decorations */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-100/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-blue-600 bg-blue-50/60 border border-blue-100/50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            System Interface Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            The MedCare Clinical Workspace
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium">
            An elegant, responsive portal connecting clinical charts, scheduling matrices, and live financial statements in one Apple-level workspace. Click on the tabs below to play with live mock controls.
          </p>
        </div>

        {/* Dashboard Frame Container */}
        <div className="glass rounded-[32px] p-4 sm:p-6 card-shadow border border-white/50 relative" id="dashboard-container">
          
          {/* Top Window Actions Bar Decorator */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300 block" />
              <span className="w-3 h-3 rounded-full bg-slate-300 block" />
              <span className="w-3 h-3 rounded-full bg-slate-300 block" />
              <span className="text-[10px] text-slate-400 font-semibold font-mono ml-4">https://portal.medcarehms.com/dashboard</span>
            </div>
            <span className="text-[11px] text-slate-600 font-bold bg-slate-100/80 px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200/50">
              <ShieldCheck size={12} className="text-blue-600 animate-pulse" /> HIPAA Secure Gateway
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sidebar Navigation */}
            <div className="lg:col-span-3 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0" id="dashboard-sidebar">
              {[
                { id: 'analytics', label: 'Overview & Revenue', icon: Users },
                { id: 'appointments', label: 'Clinical Queue', icon: Calendar },
                { id: 'doctors', label: 'Doctor Roster', icon: Activity },
                { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between gap-3 transition-all cursor-pointer shrink-0 lg:shrink ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                  id={`dashboard-sidebar-tab-${tab.id}`}
                >
                  <span className="flex items-center gap-2.5">
                    <tab.icon size={16} />
                    {tab.label}
                  </span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right Panel Main View */}
            <div className="lg:col-span-9 bg-white/70 border border-slate-100 rounded-2xl p-6 min-h-[440px] flex flex-col justify-between text-left shadow-sm" id="dashboard-view-panel">
              <AnimatePresence mode="wait">
                
                {/* 1. ANALYTICS VIEW */}
                {activeTab === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 w-full"
                    id="dashboard-analytics-view"
                  >
                    {/* Metrics row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-1 shadow-sm">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">In-Patient Census</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-extrabold text-slate-900">1,248</span>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">+12.4%</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-1 shadow-sm">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Active Consults</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-extrabold text-slate-900">42</span>
                          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Live Queue</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-1 shadow-sm">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Daily Claims (Payer)</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-extrabold text-slate-900">$182,450</span>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">+8.1%</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart preview */}
                    <div className="bg-white border border-slate-100 p-5 rounded-xl space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Revenue Stream & Admission Analytics</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Bi-weekly breakdown comparing self-pay to commercial insurance claims.</p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-semibold">
                          <span className="flex items-center gap-1.5 text-blue-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Insurance Claim
                          </span>
                          <span className="flex items-center gap-1.5 text-indigo-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Self-Pay / Direct
                          </span>
                        </div>
                      </div>

                      {/* Mock Chart using beautiful SVG */}
                      <div className="h-40 w-full flex items-end justify-between pt-4 px-2" id="dashboard-mock-chart">
                        {[
                          { day: 'Jul 04', ins: 55, pay: 40 },
                          { day: 'Jul 06', ins: 70, pay: 45 },
                          { day: 'Jul 08', ins: 60, pay: 50 },
                          { day: 'Jul 10', ins: 85, pay: 55 },
                          { day: 'Jul 12', ins: 75, pay: 48 },
                          { day: 'Jul 14', ins: 90, pay: 65 },
                          { day: 'Jul 16', ins: 110, pay: 70 },
                        ].map((item, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 w-full">
                            <div className="flex gap-1.5 items-end h-28 w-full justify-center">
                              {/* Insurance bar */}
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${item.ins}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 }}
                                className="w-3 rounded-t-sm bg-blue-600 shadow-sm shadow-blue-500/10"
                              />
                              {/* Self-pay bar */}
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${item.pay}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 + 0.1 }}
                                className="w-3 rounded-t-sm bg-indigo-500 shadow-sm shadow-indigo-500/10"
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold">{item.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. APPOINTMENTS QUEUE VIEW */}
                {activeTab === 'appointments' && (
                  <motion.div
                    key="appointments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 w-full"
                    id="dashboard-appointments-view"
                  >
                    <div className="flex justify-between items-center pb-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Interactive Clinical Intake Queue</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Live check-in log. Click on any row badge to toggle patient clinical progress status.</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                        {appointments.length} active logs
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold text-left">
                            <th className="py-2.5 px-3">Patient</th>
                            <th className="py-2.5 px-3">Physician</th>
                            <th className="py-2.5 px-3">Specialty</th>
                            <th className="py-2.5 px-3">Time</th>
                            <th className="py-2.5 px-3 text-right">Progress Status (Click to Toggle)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {appointments.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                                No appointments found in this portal session. Click "Book Appointment" to add one!
                              </td>
                            </tr>
                          ) : (
                            appointments.map((apt) => {
                              const uniqueId = apt._id || apt.id;
                              const patName = apt.patientName || apt.patient;
                              const docName = apt.doctorName || apt.doctor;
                              const dateTimeStr = apt.date ? `${apt.date} • ${apt.time}` : apt.time;
                              const statusStyle = apt.statusColor || getStatusStyle(apt.status);

                              return (
                                <tr key={uniqueId} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3 px-3 font-bold text-slate-900">{patName}</td>
                                  <td className="py-3 px-3 text-slate-600 font-medium">{docName}</td>
                                  <td className="py-3 px-3 text-slate-500 font-medium">{apt.specialty}</td>
                                  <td className="py-3 px-3 text-slate-500 font-semibold font-mono">{dateTimeStr}</td>
                                  <td className="py-3 px-3 text-right">
                                    <button
                                      onClick={() => handleStatusCycle(uniqueId)}
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer hover:opacity-85 ${statusStyle}`}
                                    >
                                      {apt.status}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* 3. DOCTORS ROSTER */}
                {activeTab === 'doctors' && (
                  <motion.div
                    key="doctors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 w-full"
                    id="dashboard-doctors-view"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">On-Duty Clinical Specialists</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Continuous telemetry monitoring of department heads and active assignments.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {doctorsRoster.map((doc, idx) => (
                        <div key={idx} className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
                          <div className="space-y-1">
                            <h5 className="text-sm font-bold text-slate-900">{doc.name}</h5>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                              <span className={`w-2 h-2 rounded-full ${doc.color}`} /> {doc.status}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200/40">
                            {doc.load}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 4. NOTIFICATIONS VIEW */}
                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 w-full"
                    id="dashboard-notifications-view"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Event Feed</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Real-time webhook notifications. Dismiss updates as they are validated.</p>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => setNotifications([])}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <AnimatePresence>
                        {notifications.map((not) => {
                          const IconComp = not.icon;
                          return (
                            <motion.div
                              key={not.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="bg-white border border-slate-100 p-4 rounded-xl flex items-start justify-between gap-4 shadow-sm"
                            >
                              <div className="flex gap-3">
                                <div className={`p-2 rounded-lg shrink-0 ${not.color}`}>
                                  <IconComp size={16} />
                                </div>
                                <div className="space-y-0.5 text-left">
                                  <p className="text-xs text-slate-800 leading-normal font-semibold">{not.text}</p>
                                  <span className="text-[10px] text-slate-400 font-bold font-mono block">{not.time}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDismissNotification(not.id)}
                                className="text-[10px] text-slate-400 hover:text-slate-800 hover:underline cursor-pointer font-bold"
                              >
                                Clear
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      {notifications.length === 0 && (
                        <div className="py-10 text-center space-y-2">
                          <p className="text-xs text-slate-500 font-medium">No unread clinic notifications.</p>
                          <button
                            onClick={() =>
                              setNotifications([
                                {
                                  id: `not-${Math.random()}`,
                                  text: 'New appointment requested via digital patient schedule.',
                                  time: 'Just now',
                                  type: 'success',
                                  icon: CheckCircle2,
                                  color: 'text-emerald-500 bg-emerald-50',
                                },
                              ])
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold cursor-pointer hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
                          >
                            Simulate Event Trigger
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Console Footnote */}
              <div className="pt-4 border-t border-slate-100 mt-6 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 font-mono font-semibold gap-2">
                <span>SYSTEM CORE: v4.11-STABLE</span>
                <span>SECURE JWT TOKEN DEPLOYED</span>
                <span>UTC CLOUD: ONLINE</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
