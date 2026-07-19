import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, CheckCircle2, ShieldAlert, ArrowRight, Clock, Star } from 'lucide-react';
import { DOCTORS } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctorId?: string;
  user?: any;
  onBookingAdded?: () => void;
}

export default function BookingModal({ isOpen, onClose, preselectedDoctorId, user, onBookingAdded }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<any[]>(DOCTORS);
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    department: 'Cardiology',
    doctorId: '',
    date: '',
    timeSlot: '09:00 AM',
    symptoms: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingId, setBookingId] = useState('');

  // Fetch doctors dynamically when open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/doctors')
        .then(res => res.json())
        .then(data => {
          if (data && data.doctors && data.doctors.length > 0) {
            const mapped = data.doctors.map((d: any) => ({
              id: d.id || d._id,
              name: d.name,
              specialization: d.specialization || d.specialty || 'Clinical Specialist',
              experience: d.experience || '10 Years Experience',
              rating: d.rating || 4.8,
              patients: d.patients || '1,200+ Patients',
              image: d.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400',
              availability: d.availableTimes && d.availableTimes.length > 0 ? d.availableTimes : (d.availability || ['Monday', 'Wednesday', 'Friday'])
            }));
            setDoctors(mapped);
          } else {
            setDoctors(DOCTORS);
          }
        })
        .catch(err => {
          console.error('Failed to load doctors dynamically in BookingModal:', err);
          setDoctors(DOCTORS);
        });
    }
  }, [isOpen]);

  // Handle pre-selection of doctor & autofill logged-in user
  useEffect(() => {
    if (isOpen) {
      const initialDoctor = doctors && doctors.length > 0 ? doctors[0] : DOCTORS[0];
      const initialData = {
        patientName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        department: 'Cardiology',
        doctorId: initialDoctor.id,
        date: '',
        timeSlot: '09:00 AM',
        symptoms: '',
        termsAccepted: false,
      };

      if (preselectedDoctorId) {
        const doc = doctors.find((d) => d.id === preselectedDoctorId) || DOCTORS.find((d) => d.id === preselectedDoctorId);
        if (doc) {
          initialData.doctorId = doc.id;
          initialData.department = doc.specialization.replace('Chief of ', '').replace('Senior ', '').replace(' Specialist', '').replace(' lead', '');
        }
      }

      setFormData(initialData);
      setStep(1);
      setErrors({});
    }
  }, [preselectedDoctorId, isOpen, user, doctors]);

  if (!isOpen) return null;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.length < 8) newErrors.phone = 'Valid phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = 'Appointment date is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the healthcare terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2 && validateStep2()) {
      setIsSubmitting(true);
      try {
        const selectedDoc = doctors.find((d) => d.id === formData.doctorId) || DOCTORS.find((d) => d.id === formData.doctorId);
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            patientName: formData.patientName,
            patientEmail: formData.email,
            doctorName: selectedDoc ? selectedDoc.name : 'Unknown Doctor',
            specialty: formData.department,
            date: formData.date,
            time: formData.timeSlot,
            symptoms: formData.symptoms
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit appointment');
        }

        // Store the database ID (use last 6 chars of Mongo ID, or returned fallback)
        const displayId = data.appointment?.id || data.appointment?._id || `MC-${Math.floor(100000 + Math.random() * 900000)}`;
        setBookingId(displayId.toString().substring(Math.max(0, displayId.toString().length - 8)).toUpperCase());
        setStep(3);
        
        if (onBookingAdded) {
          onBookingAdded();
        }
      } catch (err: any) {
        console.error("Booking submission error:", err);
        setErrors({ submit: err.message || 'Server error occurred during booking. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const selectedDoc = doctors.find((d) => d.id === formData.doctorId) || DOCTORS.find((d) => d.id === formData.doctorId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          id="booking-backdrop"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-2xl overflow-hidden glass rounded-[28px] card-shadow border border-white/50 z-10"
          id="booking-modal-body"
        >
          {/* Top colored bar decoration */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            aria-label="Close booking modal"
            id="close-booking-modal"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            {/* Header */}
            {step < 3 && (
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-2">
                  <Calendar size={12} /> Live Scheduling System
                </span>
                <h3 className="text-2xl font-bold text-slate-900">Book Premium Consultation</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Connect with MedCare’s board-certified medical leaders instantly.
                </p>

                {/* Progress Indicators */}
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      1
                    </span>
                    <span className="text-xs font-medium text-slate-700">Patient Details</span>
                  </div>
                  <div className="h-px bg-slate-200 flex-1" />
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      2
                    </span>
                    <span className="text-xs font-medium text-slate-700">Doctor & Time</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Patient Information */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Patient Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.patientName ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                      placeholder="e.g. Eleanor Sterling"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      id="input-patient-name"
                    />
                  </div>
                  {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className={`w-full px-4 py-3 rounded-2xl border bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      id="input-patient-email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className={`w-full px-4 py-3 rounded-2xl border bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.phone ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      id="input-patient-phone"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Describe Symptoms / Consult Reason
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
                    placeholder="Briefly describe what symptoms you are experiencing (e.g., persistent chest pressure, joint pain, checkup)"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    id="input-patient-symptoms"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2 cursor-pointer"
                    id="btn-next-step"
                  >
                    Select Doctor & Schedule <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Choose Doctor & Date */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Medical Specialty
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      value={formData.department}
                      onChange={(e) => {
                        const dept = e.target.value;
                        // Find first doctor in that dept or fallback
                        const matchingDoc = doctors.find((d) => d.specialization && d.specialization.includes(dept)) || doctors.find((d) => d.specialty && d.specialty.includes(dept));
                        const fallbackDoc = doctors && doctors.length > 0 ? doctors[0] : DOCTORS[0];
                        setFormData({
                          ...formData,
                          department: dept,
                          doctorId: matchingDoc ? matchingDoc.id : fallbackDoc.id,
                        });
                      }}
                      id="select-department"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology & Neurosurgery</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                      <option value="Radiology">Radiology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Choose Consultant Doctor
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                      id="select-doctor"
                    >
                      {doctors.map((doc, idx) => (
                        <option key={doc.id || idx} value={doc.id}>
                          {doc.name} - {doc.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preselected Doctor Card Details */}
                {selectedDoc && (
                  <div className="flex items-center gap-4 p-3 bg-blue-50/60 rounded-2xl border border-blue-100/50">
                    <img
                      src={selectedDoc.image}
                      alt={selectedDoc.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{selectedDoc.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Star className="text-amber-500 fill-amber-500" size={12} /> {selectedDoc.rating} • {selectedDoc.experience}
                      </p>
                      <p className="text-[10px] text-blue-600 font-medium">
                        On-duty: {selectedDoc.availability.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Choose Preferred Date
                    </label>
                    <input
                      type="date"
                      min="2026-07-18"
                      className={`w-full px-4 py-3 rounded-2xl border bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                        errors.date ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      id="input-booking-date"
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Available Time Slot
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      id="select-time-slot"
                    >
                      <option value="09:00 AM">09:00 AM - Morning Slot</option>
                      <option value="10:30 AM">10:30 AM - Morning Slot</option>
                      <option value="11:45 AM">11:45 AM - Morning Slot</option>
                      <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                      <option value="03:30 PM">03:30 PM - Afternoon Slot</option>
                      <option value="04:45 PM">04:45 PM - Evening Slot</option>
                    </select>
                  </div>
                </div>

                {/* Patient Terms & HIPAA Checkbox */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                      id="checkbox-terms"
                    />
                    <span className="text-xs text-slate-500 leading-tight">
                      I agree to the privacy statement and consent to receive digital communications. I acknowledge that MedCare complies with HIPAA guidelines for protected patient health databases.
                    </span>
                  </label>
                  {errors.termsAccepted && <p className="text-red-500 text-xs mt-1">{errors.termsAccepted}</p>}
                </div>

                {errors.submit && (
                  <p className="text-red-500 text-xs mt-1 text-center font-semibold bg-red-50 p-2 rounded-xl border border-red-100">
                    {errors.submit}
                  </p>
                )}

                <div className="pt-4 flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-2xl transition-all cursor-pointer disabled:opacity-50"
                    id="btn-back-step"
                  >
                    Go Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2 cursor-pointer flex-1 justify-center disabled:opacity-50"
                    id="btn-submit-booking"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Confirm Appointment <CheckCircle2 size={16} /></>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Confirmation Screen */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6"
                id="booking-success-screen"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Appointment Scheduled!</h3>
                  <p className="text-slate-500 max-w-md mx-auto text-sm">
                    Thank you, <span className="font-semibold text-slate-800">{formData.patientName}</span>. Your slot has been secured on the clinical schedule.
                  </p>
                </div>

                {/* Details Summary Card */}
                <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100 text-left max-w-md mx-auto space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="text-xs text-slate-500">Booking ID</span>
                    <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                      {bookingId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Consultant</span>
                    <span className="font-semibold text-slate-800">{selectedDoc?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Specialty</span>
                    <span className="text-slate-700">{formData.department}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Date & Time</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={14} className="text-blue-500" /> {formData.date} at {formData.timeSlot}
                    </span>
                  </div>
                </div>

                {/* Patient Next Steps Warning Info */}
                <div className="flex gap-3 bg-amber-50/50 rounded-2xl p-4 border border-amber-100/60 text-left max-w-md mx-auto">
                  <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-amber-800 leading-normal">
                    <strong>Pre-visit Guidance:</strong> Please arrive 15 minutes before your scheduled slot for biometric verification and digital check-in. Bring any previous medical files or imaging results.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all cursor-pointer"
                  id="btn-close-success"
                >
                  Return to Home
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
