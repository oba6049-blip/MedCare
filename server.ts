import express from "express";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "medcare_fallback_jwt_secret_998811";
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());

// --- Database Connection Status ---
let dbConnected = false;
let dbError: string | null = null;

// Fallback in-memory database storage if MongoDB is not connected
const memoryDb = {
  users: [] as any[],
  appointments: [] as any[],
  medicalRecords: [] as any[],
  prescriptions: [] as any[],
  doctors: [] as any[]
};

// Default seed doctors
const DEFAULT_DOCTORS = [
  {
    name: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology',
    specialization: 'Chief of Cardiology',
    experience: '16 Years Experience',
    rating: 4.9,
    patients: '3,800+ Patients',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400',
    availableTimes: ['Monday', 'Wednesday', 'Friday']
  },
  {
    name: 'Dr. Subair Nurudeen',
    specialty: 'Neurology',
    specialization: 'Senior Neurosurgeon',
    experience: '18 Years Experience',
    rating: 5.0,
    patients: '2,400+ Patients',
    image: 'https://imgur.com/P1EQCL1.png',
    availableTimes: ['Tuesday', 'Thursday']
  },
  {
    name: 'Dr. Elena Rostova',
    specialty: 'Pediatrics',
    specialization: 'Pediatrics Specialist',
    experience: '12 Years Experience',
    rating: 4.8,
    patients: '4,100+ Patients',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400&h=400',
    availableTimes: ['Monday', 'Tuesday', 'Wednesday']
  },
  {
    name: 'Dr. Jonathan Cole',
    specialty: 'Orthopedics',
    specialization: 'Orthopedic Surgeon',
    experience: '14 Years Experience',
    rating: 4.9,
    patients: '3,200+ Patients',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400',
    availableTimes: ['Wednesday', 'Thursday', 'Friday']
  },
  {
    name: 'Dr. Amira Patel',
    specialty: 'Emergency Medicine',
    specialization: 'Emergency Medicine lead',
    experience: '10 Years Experience',
    rating: 4.9,
    patients: '5,500+ Patients',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400',
    availableTimes: ['Monday', 'Thursday', 'Saturday']
  },
  {
    name: 'Dr. Liam O\'Connor',
    specialty: 'Radiology',
    specialization: 'Interventional Radiologist',
    experience: '15 Years Experience',
    rating: 4.7,
    patients: '1,900+ Patients',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400&h=400',
    availableTimes: ['Tuesday', 'Friday']
  }
];

// Seed initial memory data
const initialHash = bcrypt.hashSync("Adewale_@09", 10);

const DEFAULT_ADMIN = {
  name: "System Admin",
  email: "nuddywale@yahoo.com",
  password: initialHash,
  role: "admin",
  createdAt: new Date()
};

memoryDb.users.push(DEFAULT_ADMIN);

// Do not seed default doctors into memoryDb to keep Manage Doctors tab free of mock data


// Schema Declarations for MongoDB
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "admin"], default: "patient" },
  phone: { type: String },
  dob: { type: String },
  gender: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = (mongoose.models.User || mongoose.model("User", userSchema)) as any;

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  doctorName: { type: String, required: true },
  specialty: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  symptoms: { type: String },
  status: { type: String, default: "Awaiting Triage" },
  createdAt: { type: Date, default: Date.now }
});

const Appointment = (mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema)) as any;

const medicalRecordSchema = new mongoose.Schema({
  patientEmail: { type: String, required: true },
  doctorName: { type: String, required: true },
  specialty: { type: String, required: true },
  date: { type: String, required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String },
  notes: { type: String },
  attachments: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const MedicalRecord = (mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", medicalRecordSchema)) as any;

const prescriptionSchema = new mongoose.Schema({
  patientEmail: { type: String, required: true },
  doctorName: { type: String, required: true },
  specialty: { type: String, required: true },
  date: { type: String, required: true },
  medication: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String },
  status: { type: String, default: "Active" }, // "Active" or "Completed"
  createdAt: { type: Date, default: Date.now }
});

const Prescription = (mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema)) as any;

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  specialization: { type: String },
  experience: { type: String },
  rating: { type: Number, default: 4.8 },
  patients: { type: String },
  image: { type: String },
  availableTimes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const Doctor = (mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema)) as any;

// Initialize MongoDB Connection (Lazy / Safe)
async function connectToMongo() {
  if (!MONGODB_URI) {
    console.log("⚠️ MONGODB_URI is not provided. Falling back to in-memory store for development.");
    dbError = "MONGODB_URI environment variable is missing";
    return;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGODB_URI);
    dbConnected = true;
    dbError = null;
    console.log("✅ Successfully connected to MongoDB database.");

    // Seed default admin in MongoDB if it doesn't exist
    // Remove any unauthorized administrative accounts from DB
    await User.deleteMany({ role: "admin", email: { $ne: "nuddywale@yahoo.com" } });

    const adminExists = await User.findOne({ email: "nuddywale@yahoo.com" });
    if (!adminExists) {
      await User.create(DEFAULT_ADMIN);
      console.log("🌱 Seeded authorized administrator user (nuddywale@yahoo.com) to MongoDB.");
    }

    // Clean up and delete any existing default mock doctors to keep the Manage Doctors registry clean
    const mockDoctorNames = [
      'Dr. Sarah Jenkins',
      'Dr. Subair Nurudeen',
      'Dr. Elena Rostova',
      'Dr. Jonathan Cole',
      'Dr. Amira Patel',
      'Dr. Liam O\'Connor'
    ];
    await Doctor.deleteMany({ name: { $in: mockDoctorNames } });
    console.log("🧹 Cleaned up and removed all default mock doctors from MongoDB.");

    // Clean up any existing records of the old patient demo user (patient@medcare.com)
    await User.deleteMany({ email: "patient@medcare.com" });
    console.log("🧹 Cleaned up any old patient demo credentials from the database.");
  } catch (err: any) {
    dbConnected = false;
    dbError = err.message || "Failed to connect to MongoDB";
    console.error("❌ MongoDB connection error:", dbError);
  }
}

connectToMongo();

// --- Express API Routes ---

// 1. Database & System Status Endpoint
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    database: dbConnected ? "mongodb" : "in-memory-fallback",
    details: dbConnected ? "Connected to live MongoDB instance" : "Running on standard in-memory storage (unconfigured local secrets)",
    error: dbError
  });
});

// --- Server-Sent Events (SSE) Real-Time Synchronization ---
let sseClients: any[] = [];

app.get("/api/admin/realtime-stream", (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Missing token query parameter." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Action restricted to administrators." });
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: "connected", message: "Real-time sync connection established" })}\n\n`);

  const clientObj = { id: Date.now(), res };
  sseClients.push(clientObj);

  const intervalId = setInterval(() => {
    res.write(": ping\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(intervalId);
    sseClients = sseClients.filter(c => c.id !== clientObj.id);
  });
});

function broadcastSseEvent(type: string, data: any) {
  const payload = JSON.stringify({ type, data, timestamp: new Date() });
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (err) {
      console.error("Failed to write to SSE client:", err);
    }
  });
}

// 2. User Registration (Patients only)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, dob, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required fields." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (dbConnected) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "A user with this email already exists." });
      }

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "patient",
        phone,
        dob,
        gender
      });

      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        message: "Registration successful!",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          dob: newUser.dob,
          gender: newUser.gender
        }
      });
    } else {
      // In-Memory Fallback Operation
      const existing = memoryDb.users.find(u => u.email === email);
      if (existing) {
        return res.status(400).json({ error: "A user with this email already exists." });
      }

      const newUser = {
        id: "mem_" + Math.random().toString(36).substr(2, 9),
        name,
        email,
        password: hashedPassword,
        role: "patient",
        phone,
        dob,
        gender,
        createdAt: new Date()
      };

      memoryDb.users.push(newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        message: "Registration successful! (Fallback Store)",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          dob: newUser.dob,
          gender: newUser.gender
        }
      });
    }
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal server registration failure." });
  }
});

// 3. User Login (Patients & Admins)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (dbConnected) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Assert strict single administrator login constraint
      if (user.role === "admin" && user.email !== "nuddywale@yahoo.com") {
        return res.status(403).json({ error: "Access denied. Administrative access restricted." });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Authentication successful!",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          dob: user.dob,
          gender: user.gender
        }
      });
    } else {
      // In-Memory Fallback Operation
      const user = memoryDb.users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Assert strict single administrator login constraint
      if (user.role === "admin" && user.email !== "nuddywale@yahoo.com") {
        return res.status(403).json({ error: "Access denied. Administrative access restricted." });
      }

      const token = jwt.sign(
        { id: user.id || "mem_user", email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Authentication successful! (Fallback Store)",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          dob: user.dob,
          gender: user.gender
        }
      });
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server login failure." });
  }
});

// Middleware for token validation
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. Authentication token is missing." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired session token." });
    }
    req.user = decoded;
    next();
  });
}

// 4. Get Current User Profile
app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    if (dbConnected) {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      return res.json({ user });
    } else {
      const user = memoryDb.users.find(u => u.email === req.user.email);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json({ user: userWithoutPassword });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error retrieving session." });
  }
});

// 5. Submit a Patient Appointment
app.post("/api/appointments", async (req, res) => {
  try {
    const { patientName, patientEmail, doctorName, specialty, date, time, symptoms } = req.body;

    if (!patientName || !patientEmail || !doctorName || !specialty || !date || !time) {
      return res.status(400).json({ error: "Incomplete appointment form data." });
    }

    if (dbConnected) {
      const newApt = await Appointment.create({
        patientName,
        patientEmail,
        doctorName,
        specialty,
        date,
        time,
        symptoms,
        status: "Awaiting Triage"
      });
      broadcastSseEvent("appointment_created", newApt);
      return res.status(201).json({ message: "Appointment submitted successfully!", appointment: newApt });
    } else {
      const newApt = {
        id: "mem_apt_" + Math.random().toString(36).substr(2, 9),
        patientName,
        patientEmail,
        doctorName,
        specialty,
        date,
        time,
        symptoms,
        status: "Awaiting Triage",
        createdAt: new Date()
      };
      memoryDb.appointments.push(newApt);
      broadcastSseEvent("appointment_created", newApt);
      return res.status(201).json({ message: "Appointment submitted successfully! (Fallback)", appointment: newApt });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error booking appointment." });
  }
});

// 6. Retrieve Appointments (Filtered by role)
app.get("/api/appointments", authenticateToken, async (req: any, res) => {
  try {
    if (dbConnected) {
      let query = {};
      // Patients only see their own appointments; admins see all
      if (req.user.role === "patient") {
        query = { patientEmail: req.user.email };
      }
      const appointments = await Appointment.find(query).sort({ createdAt: -1 });
      return res.json({ appointments });
    } else {
      let filtered = memoryDb.appointments;
      if (req.user.role === "patient") {
        filtered = memoryDb.appointments.filter(a => a.patientEmail === req.user.email);
      }
      // sort by date descending
      filtered = [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return res.json({ appointments: filtered });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error retrieving appointments." });
  }
});

// 7. Update Appointment Status (Admin only)
app.put("/api/appointments/:id", authenticateToken, async (req: any, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Action restricted to administrators." });
    }

    const { status } = req.body;
    const { id } = req.params;

    if (dbConnected) {
      const updated = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
      if (!updated) {
        return res.status(404).json({ error: "Appointment not found." });
      }
      broadcastSseEvent("appointment_updated", updated);
      return res.json({ message: "Status updated successfully", appointment: updated });
    } else {
      const apt = memoryDb.appointments.find(a => a.id === id);
      if (!apt) {
        return res.status(404).json({ error: "Appointment not found." });
      }
      apt.status = status;
      broadcastSseEvent("appointment_updated", apt);
      return res.json({ message: "Status updated successfully (Fallback)", appointment: apt });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error modifying status." });
  }
});

// 8. Retrieve Medical Records (Filtered by role / patient email)
app.get("/api/medical-records", authenticateToken, async (req: any, res) => {
  try {
    const userEmail = req.user.email;
    const isPatient = req.user.role === "patient";

    // Build the default seeds if no records exist (to guarantee an out-of-the-box beautiful layout)
    const getSeeds = (email: string) => [
      {
        patientEmail: email,
        doctorName: "Dr. Sarah Jenkins",
        specialty: "Cardiology",
        date: "2026-06-10",
        diagnosis: "Mild Hypertension",
        treatment: "Recommended low-sodium diet and daily exercise log tracking.",
        notes: "Patient is responsive and displays excellent vitals overall. Follow up in 3 months.",
        attachments: ["Lab_Results_Blood_Panel.pdf"]
      },
      {
        patientEmail: email,
        doctorName: "Dr. Subair Nurudeen",
        specialty: "Neurology",
        date: "2026-05-18",
        diagnosis: "Tension Headaches",
        treatment: "Stress management and adequate hydration protocol.",
        notes: "Symptoms worsen during periods of high visual strain. Advised resting eyes every 45 mins.",
        attachments: ["MRI_Brain_Scan_Normal.pdf"]
      }
    ];

    if (dbConnected) {
      let query: any = {};
      if (isPatient) {
        query.patientEmail = userEmail;
      }
      let records = await MedicalRecord.find(query).sort({ date: -1 });
      
      // If none exist for patient, auto-seed them for a gorgeous demo
      if (records.length === 0 && isPatient) {
        await MedicalRecord.create(getSeeds(userEmail));
        records = await MedicalRecord.find(query).sort({ date: -1 });
      }
      return res.json({ records });
    } else {
      let filtered = memoryDb.medicalRecords;
      if (isPatient) {
        filtered = memoryDb.medicalRecords.filter(r => r.patientEmail === userEmail);
      }
      
      if (filtered.length === 0 && isPatient) {
        const seeds = getSeeds(userEmail).map((s, idx) => ({
          ...s,
          id: "mem_mr_" + idx + "_" + Math.random().toString(36).substr(2, 5),
          createdAt: new Date()
        }));
        memoryDb.medicalRecords.push(...seeds);
        filtered = memoryDb.medicalRecords.filter(r => r.patientEmail === userEmail);
      }
      return res.json({ records: filtered });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error retrieving medical records." });
  }
});

// 9. Add a Medical Record
app.post("/api/medical-records", authenticateToken, async (req: any, res) => {
  try {
    const { patientEmail, doctorName, specialty, date, diagnosis, treatment, notes, attachments } = req.body;

    if (!patientEmail || !doctorName || !specialty || !date || !diagnosis) {
      return res.status(400).json({ error: "Missing required medical record fields." });
    }

    if (dbConnected) {
      const newRecord = await MedicalRecord.create({
        patientEmail,
        doctorName,
        specialty,
        date,
        diagnosis,
        treatment,
        notes,
        attachments: attachments || []
      });
      return res.status(201).json({ message: "Medical record added successfully!", record: newRecord });
    } else {
      const newRecord = {
        id: "mem_mr_" + Math.random().toString(36).substr(2, 9),
        patientEmail,
        doctorName,
        specialty,
        date,
        diagnosis,
        treatment,
        notes,
        attachments: attachments || [],
        createdAt: new Date()
      };
      memoryDb.medicalRecords.push(newRecord);
      return res.status(201).json({ message: "Medical record added successfully! (Fallback)", record: newRecord });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error adding medical record." });
  }
});

// 10. Retrieve Prescriptions
app.get("/api/prescriptions", authenticateToken, async (req: any, res) => {
  try {
    const userEmail = req.user.email;
    const isPatient = req.user.role === "patient";

    const getSeeds = (email: string) => [
      {
        patientEmail: email,
        doctorName: "Dr. Sarah Jenkins",
        specialty: "Cardiology",
        date: "2026-06-10",
        medication: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "90 days",
        instructions: "Take in the morning with a full glass of water. Monitor blood pressure weekly.",
        status: "Active"
      },
      {
        patientEmail: email,
        doctorName: "Dr. Elena Rostova",
        specialty: "Pediatrics / General",
        date: "2026-07-02",
        medication: "Amoxicillin",
        dosage: "500mg",
        frequency: "Three times daily",
        duration: "10 days",
        instructions: "Finish the entire course. Take with meals to prevent stomach discomfort.",
        status: "Completed"
      }
    ];

    if (dbConnected) {
      let query: any = {};
      if (isPatient) {
        query.patientEmail = userEmail;
      }
      let prescriptions = await Prescription.find(query).sort({ date: -1 });

      // If none exist for patient, auto-seed them
      if (prescriptions.length === 0 && isPatient) {
        await Prescription.create(getSeeds(userEmail));
        prescriptions = await Prescription.find(query).sort({ date: -1 });
      }
      return res.json({ prescriptions });
    } else {
      let filtered = memoryDb.prescriptions;
      if (isPatient) {
        filtered = memoryDb.prescriptions.filter(p => p.patientEmail === userEmail);
      }

      if (filtered.length === 0 && isPatient) {
        const seeds = getSeeds(userEmail).map((s, idx) => ({
          ...s,
          id: "mem_pr_" + idx + "_" + Math.random().toString(36).substr(2, 5),
          createdAt: new Date()
        }));
        memoryDb.prescriptions.push(...seeds);
        filtered = memoryDb.prescriptions.filter(p => p.patientEmail === userEmail);
      }
      return res.json({ prescriptions: filtered });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error retrieving prescriptions." });
  }
});

// 11. Add a Prescription
app.post("/api/prescriptions", authenticateToken, async (req: any, res) => {
  try {
    const { patientEmail, doctorName, specialty, date, medication, dosage, frequency, duration, instructions, status } = req.body;

    if (!patientEmail || !doctorName || !specialty || !date || !medication || !dosage || !frequency || !duration) {
      return res.status(400).json({ error: "Missing required prescription fields." });
    }

    if (dbConnected) {
      const newPresc = await Prescription.create({
        patientEmail,
        doctorName,
        specialty,
        date,
        medication,
        dosage,
        frequency,
        duration,
        instructions,
        status: status || "Active"
      });
      return res.status(201).json({ message: "Prescription added successfully!", prescription: newPresc });
    } else {
      const newPresc = {
        id: "mem_pr_" + Math.random().toString(36).substr(2, 9),
        patientEmail,
        doctorName,
        specialty,
        date,
        medication,
        dosage,
        frequency,
        duration,
        instructions,
        status: status || "Active",
        createdAt: new Date()
      };
      memoryDb.prescriptions.push(newPresc);
      return res.status(201).json({ message: "Prescription added successfully! (Fallback)", prescription: newPresc });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error adding prescription." });
  }
});

// 12. Update User Profile details
app.put("/api/auth/profile", authenticateToken, async (req: any, res) => {
  try {
    const { name, phone, dob, gender, password } = req.body;
    const userId = req.user.id;

    if (dbConnected) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (dob) user.dob = dob;
      if (gender) user.gender = gender;
      
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await user.save();

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender
      };

      return res.json({ message: "Profile updated successfully!", user: userResponse });
    } else {
      const user = memoryDb.users.find(u => u.email === req.user.email);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (dob) user.dob = dob;
      if (gender) user.gender = gender;
      
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.json({ message: "Profile updated successfully! (Fallback)", user: userWithoutPassword });
    }
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ error: "Internal error updating profile details." });
  }
});

// --- ADMIN MANAGEMENT ENDPOINTS ---

// Admin-only Access Middleware
function requireAdmin(req: any, res: any, next: any) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Action restricted to administrators." });
  }
  next();
}

// 1. MANAGE PATIENTS
// Read Patients
app.get("/api/admin/patients", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    if (dbConnected) {
      const patients = await User.find({ role: "patient" }).select("-password").sort({ createdAt: -1 });
      return res.json({ patients });
    } else {
      const patients = memoryDb.users.filter(u => u.role === "patient").map(({ password, ...u }) => u);
      return res.json({ patients });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error retrieving patients." });
  }
});

// Create Patient
app.post("/api/admin/patients", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { name, email, password, phone, dob, gender } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (dbConnected) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: "Email is already taken." });

      const newPatient = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "patient",
        phone,
        dob,
        gender
      });

      const { password: _, ...patientWithoutPassword } = newPatient.toObject();
      return res.status(201).json({ message: "Patient created successfully!", patient: patientWithoutPassword });
    } else {
      const existing = memoryDb.users.find(u => u.email === email);
      if (existing) return res.status(400).json({ error: "Email is already taken." });

      const newPatient = {
        id: "mem_" + Math.random().toString(36).substr(2, 9),
        name,
        email,
        password: hashedPassword,
        role: "patient",
        phone,
        dob,
        gender,
        createdAt: new Date()
      };
      memoryDb.users.push(newPatient);

      const { password: _, ...patientWithoutPassword } = newPatient;
      return res.status(201).json({ message: "Patient created successfully!", patient: patientWithoutPassword });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error creating patient." });
  }
});

// Update Patient
app.put("/api/admin/patients/:id", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, dob, gender, password } = req.body;

    if (dbConnected) {
      const patient = await User.findById(id);
      if (!patient) return res.status(404).json({ error: "Patient not found." });

      if (name) patient.name = name;
      if (email) patient.email = email;
      if (phone) patient.phone = phone;
      if (dob) patient.dob = dob;
      if (gender) patient.gender = gender;
      if (password) {
        patient.password = await bcrypt.hash(password, 10);
      }

      await patient.save();
      const { password: _, ...patientWithoutPassword } = patient.toObject();
      return res.json({ message: "Patient updated successfully!", patient: patientWithoutPassword });
    } else {
      const patient = memoryDb.users.find(u => u.id === id);
      if (!patient) return res.status(404).json({ error: "Patient not found." });

      if (name) patient.name = name;
      if (email) patient.email = email;
      if (phone) patient.phone = phone;
      if (dob) patient.dob = dob;
      if (gender) patient.gender = gender;
      if (password) {
        patient.password = await bcrypt.hash(password, 10);
      }

      const { password: _, ...patientWithoutPassword } = patient;
      return res.json({ message: "Patient updated successfully!", patient: patientWithoutPassword });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error updating patient." });
  }
});

// Delete Patient
app.delete("/api/admin/patients/:id", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;

    if (dbConnected) {
      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Patient not found." });
      return res.json({ message: "Patient deleted successfully!" });
    } else {
      const idx = memoryDb.users.findIndex(u => u.id === id);
      if (idx === -1) return res.status(404).json({ error: "Patient not found." });
      memoryDb.users.splice(idx, 1);
      return res.json({ message: "Patient deleted successfully!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error deleting patient." });
  }
});

// 2. MANAGE DOCTORS
// Read Doctors (general get route is also useful, let's allow it)
app.get("/api/doctors", async (req, res) => {
  try {
    if (dbConnected) {
      const doctors = await Doctor.find().sort({ name: 1 });
      return res.json({ doctors });
    } else {
      return res.json({ doctors: memoryDb.doctors });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error retrieving doctors." });
  }
});

// Create Doctor
app.post("/api/admin/doctors", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { name, specialty, availableTimes, specialization, experience, rating, patients, image } = req.body;
    if (!name || !specialty) {
      return res.status(400).json({ error: "Doctor name and specialty are required." });
    }

    const fallbackImage = image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400";
    const fallbackSpecialization = specialization || `${specialty} Specialist`;
    const fallbackExperience = experience || "10 Years Experience";
    const fallbackRating = rating ? Number(rating) : 4.8;
    const fallbackPatients = patients || "1,200+ Patients";

    if (dbConnected) {
      const newDoc = await Doctor.create({
        name,
        specialty,
        availableTimes: availableTimes || [],
        specialization: fallbackSpecialization,
        experience: fallbackExperience,
        rating: fallbackRating,
        patients: fallbackPatients,
        image: fallbackImage
      });
      broadcastSseEvent("doctor_created", newDoc);
      return res.status(201).json({ message: "Doctor added successfully!", doctor: newDoc });
    } else {
      const newDoc = {
        id: "mem_doc_" + Math.random().toString(36).substr(2, 9),
        name,
        specialty,
        availableTimes: availableTimes || [],
        specialization: fallbackSpecialization,
        experience: fallbackExperience,
        rating: fallbackRating,
        patients: fallbackPatients,
        image: fallbackImage,
        createdAt: new Date()
      };
      memoryDb.doctors.push(newDoc);
      broadcastSseEvent("doctor_created", newDoc);
      return res.status(201).json({ message: "Doctor added successfully!", doctor: newDoc });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error creating doctor." });
  }
});

// Update Doctor
app.put("/api/admin/doctors/:id", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, availableTimes, specialization, experience, rating, patients, image } = req.body;

    if (dbConnected) {
      const updateData: any = {};
      if (name) updateData.name = name;
      if (specialty) updateData.specialty = specialty;
      if (availableTimes) updateData.availableTimes = availableTimes;
      if (specialization !== undefined) updateData.specialization = specialization;
      if (experience !== undefined) updateData.experience = experience;
      if (rating !== undefined) updateData.rating = Number(rating);
      if (patients !== undefined) updateData.patients = patients;
      if (image !== undefined) updateData.image = image;

      const updated = await Doctor.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ error: "Doctor not found." });
      broadcastSseEvent("doctor_updated", updated);
      return res.json({ message: "Doctor updated successfully!", doctor: updated });
    } else {
      const doc = memoryDb.doctors.find(d => d.id === id);
      if (!doc) return res.status(404).json({ error: "Doctor not found." });

      if (name) doc.name = name;
      if (specialty) doc.specialty = specialty;
      if (availableTimes) doc.availableTimes = availableTimes;
      if (specialization !== undefined) doc.specialization = specialization;
      if (experience !== undefined) doc.experience = experience;
      if (rating !== undefined) doc.rating = Number(rating);
      if (patients !== undefined) doc.patients = patients;
      if (image !== undefined) doc.image = image;

      broadcastSseEvent("doctor_updated", doc);
      return res.json({ message: "Doctor updated successfully!", doctor: doc });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error updating doctor." });
  }
});

// Delete Doctor
app.delete("/api/admin/doctors/:id", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;

    if (dbConnected) {
      const deleted = await Doctor.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Doctor not found." });
      broadcastSseEvent("doctor_deleted", { id });
      return res.json({ message: "Doctor deleted successfully!" });
    } else {
      const idx = memoryDb.doctors.findIndex(d => d.id === id);
      if (idx === -1) return res.status(404).json({ error: "Doctor not found." });
      memoryDb.doctors.splice(idx, 1);
      broadcastSseEvent("doctor_deleted", { id });
      return res.json({ message: "Doctor deleted successfully!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error deleting doctor." });
  }
});

// 3. MANAGE APPOINTMENTS
// Create Appointment (Admin)
app.post("/api/admin/appointments", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { patientName, patientEmail, doctorName, specialty, date, time, symptoms, status } = req.body;
    if (!patientName || !patientEmail || !doctorName || !specialty || !date || !time) {
      return res.status(400).json({ error: "Incomplete appointment data." });
    }

    if (dbConnected) {
      const newApt = await Appointment.create({
        patientName,
        patientEmail,
        doctorName,
        specialty,
        date,
        time,
        symptoms,
        status: status || "Scheduled"
      });
      broadcastSseEvent("appointment_created", newApt);
      return res.status(201).json({ message: "Appointment scheduled successfully!", appointment: newApt });
    } else {
      const newApt = {
        id: "mem_apt_" + Math.random().toString(36).substr(2, 9),
        patientName,
        patientEmail,
        doctorName,
        specialty,
        date,
        time,
        symptoms,
        status: status || "Scheduled",
        createdAt: new Date()
      };
      memoryDb.appointments.push(newApt);
      broadcastSseEvent("appointment_created", newApt);
      return res.status(201).json({ message: "Appointment scheduled successfully!", appointment: newApt });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error creating appointment." });
  }
});

// Edit Appointment (Admin)
app.put("/api/admin/appointments/:id", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { patientName, patientEmail, doctorName, specialty, date, time, symptoms, status } = req.body;

    if (dbConnected) {
      const updated = await Appointment.findByIdAndUpdate(
        id,
        { patientName, patientEmail, doctorName, specialty, date, time, symptoms, status },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "Appointment not found." });
      broadcastSseEvent("appointment_updated", updated);
      return res.json({ message: "Appointment updated successfully!", appointment: updated });
    } else {
      const apt = memoryDb.appointments.find(a => a.id === id);
      if (!apt) return res.status(404).json({ error: "Appointment not found." });

      if (patientName) apt.patientName = patientName;
      if (patientEmail) apt.patientEmail = patientEmail;
      if (doctorName) apt.doctorName = doctorName;
      if (specialty) apt.specialty = specialty;
      if (date) apt.date = date;
      if (time) apt.time = time;
      if (symptoms !== undefined) apt.symptoms = symptoms;
      if (status) apt.status = status;

      broadcastSseEvent("appointment_updated", apt);
      return res.json({ message: "Appointment updated successfully!", appointment: apt });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error updating appointment." });
  }
});

// Delete Appointment (Admin)
app.delete("/api/admin/appointments/:id", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;

    if (dbConnected) {
      const deleted = await Appointment.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Appointment not found." });
      broadcastSseEvent("appointment_deleted", { id });
      return res.json({ message: "Appointment deleted successfully!" });
    } else {
      const idx = memoryDb.appointments.findIndex(a => a.id === id);
      if (idx === -1) return res.status(404).json({ error: "Appointment not found." });
      memoryDb.appointments.splice(idx, 1);
      broadcastSseEvent("appointment_deleted", { id });
      return res.json({ message: "Appointment deleted successfully!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error deleting appointment." });
  }
});

// 4. MANAGE MEDICAL RECORDS
// Edit Medical Record (Admin)
app.put("/api/admin/medical-records/:id", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { patientEmail, doctorName, specialty, date, diagnosis, treatment, notes } = req.body;

    if (dbConnected) {
      const updated = await MedicalRecord.findByIdAndUpdate(
        id,
        { patientEmail, doctorName, specialty, date, diagnosis, treatment, notes },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "Medical record not found." });
      return res.json({ message: "Medical record updated successfully!", record: updated });
    } else {
      const record = memoryDb.medicalRecords.find(r => r.id === id);
      if (!record) return res.status(404).json({ error: "Medical record not found." });

      if (patientEmail) record.patientEmail = patientEmail;
      if (doctorName) record.doctorName = doctorName;
      if (specialty) record.specialty = specialty;
      if (date) record.date = date;
      if (diagnosis) record.diagnosis = diagnosis;
      if (treatment !== undefined) record.treatment = treatment;
      if (notes !== undefined) record.notes = notes;

      return res.json({ message: "Medical record updated successfully!", record });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error updating medical record." });
  }
});

// Delete Medical Record (Admin)
app.delete("/api/admin/medical-records/:id", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;

    if (dbConnected) {
      const deleted = await MedicalRecord.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Medical record not found." });
      return res.json({ message: "Medical record deleted successfully!" });
    } else {
      const idx = memoryDb.medicalRecords.findIndex(r => r.id === id);
      if (idx === -1) return res.status(404).json({ error: "Medical record not found." });
      memoryDb.medicalRecords.splice(idx, 1);
      return res.json({ message: "Medical record deleted successfully!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error deleting medical record." });
  }
});

// 5. MANAGE PRESCRIPTIONS
// Edit Prescription (Admin)
app.put("/api/admin/prescriptions/:id", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { patientEmail, doctorName, specialty, date, medication, dosage, frequency, duration, instructions, status } = req.body;

    if (dbConnected) {
      const updated = await Prescription.findByIdAndUpdate(
        id,
        { patientEmail, doctorName, specialty, date, medication, dosage, frequency, duration, instructions, status },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "Prescription not found." });
      return res.json({ message: "Prescription updated successfully!", prescription: updated });
    } else {
      const prescription = memoryDb.prescriptions.find(p => p.id === id);
      if (!prescription) return res.status(404).json({ error: "Prescription not found." });

      if (patientEmail) prescription.patientEmail = patientEmail;
      if (doctorName) prescription.doctorName = doctorName;
      if (specialty) prescription.specialty = specialty;
      if (date) prescription.date = date;
      if (medication) prescription.medication = medication;
      if (dosage) prescription.dosage = dosage;
      if (frequency) prescription.frequency = frequency;
      if (duration) prescription.duration = duration;
      if (instructions !== undefined) prescription.instructions = instructions;
      if (status) prescription.status = status;

      return res.json({ message: "Prescription updated successfully!", prescription });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error updating prescription." });
  }
});

// Delete Prescription (Admin)
app.delete("/api/admin/prescriptions/:id", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;

    if (dbConnected) {
      const deleted = await Prescription.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Prescription not found." });
      return res.json({ message: "Prescription deleted successfully!" });
    } else {
      const idx = memoryDb.prescriptions.findIndex(p => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Prescription not found." });
      memoryDb.prescriptions.splice(idx, 1);
      return res.json({ message: "Prescription deleted successfully!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error deleting prescription." });
  }
});

// 6. GENERATE REPORTS
app.get("/api/admin/reports", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    let patientsCount = 0;
    let doctorsCount = 0;
    let appointmentsCount = 0;
    let medicalRecordsCount = 0;
    let prescriptionsCount = 0;

    let appointmentList: any[] = [];
    let patientList: any[] = [];

    if (dbConnected) {
      patientsCount = await User.countDocuments({ role: "patient" });
      doctorsCount = await Doctor.countDocuments();
      appointmentsCount = await Appointment.countDocuments();
      medicalRecordsCount = await MedicalRecord.countDocuments();
      prescriptionsCount = await Prescription.countDocuments();

      appointmentList = await Appointment.find();
      patientList = await User.find({ role: "patient" }).select("gender dob createdAt");
    } else {
      patientsCount = memoryDb.users.filter(u => u.role === "patient").length;
      doctorsCount = memoryDb.doctors.length;
      appointmentsCount = memoryDb.appointments.length;
      medicalRecordsCount = memoryDb.medicalRecords.length;
      prescriptionsCount = memoryDb.prescriptions.length;

      appointmentList = memoryDb.appointments;
      patientList = memoryDb.users.filter(u => u.role === "patient");
    }

    // Process specialties bookings
    const specialtyCounts: { [key: string]: number } = {};
    // Process status distribution
    const statusCounts: { [key: string]: number } = {
      "Scheduled": 0,
      "Awaiting Triage": 0,
      "In Consultation": 0,
      "Completed": 0,
      "Cancelled": 0
    };

    appointmentList.forEach(apt => {
      const specialty = apt.specialty || "Unassigned";
      specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
      const status = apt.status || "Scheduled";
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      } else {
        statusCounts[status] = 1;
      }
    });

    // Process patient demographics
    const genderCounts: { [key: string]: number } = { Male: 0, Female: 0, Other: 0 };
    patientList.forEach(p => {
      const g = p.gender || "Other";
      const mappedGender = (g.toLowerCase() === "male" || g.toLowerCase() === "m") ? "Male" :
                           (g.toLowerCase() === "female" || g.toLowerCase() === "f") ? "Female" : "Other";
      if (genderCounts[mappedGender] !== undefined) {
        genderCounts[mappedGender]++;
      } else {
        genderCounts["Other"]++;
      }
    });

    res.json({
      summary: {
        patients: patientsCount,
        doctors: doctorsCount,
        appointments: appointmentsCount,
        medicalRecords: medicalRecordsCount,
        prescriptions: prescriptionsCount
      },
      charts: {
        specialties: Object.entries(specialtyCounts).map(([name, value]) => ({ name, value })),
        status: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
        demographics: Object.entries(genderCounts).map(([name, value]) => ({ name, value }))
      }
    });
  } catch (error) {
    console.error("Reports aggregation error:", error);
    res.status(500).json({ error: "Internal error compiling system reports." });
  }
});

// --- Vite & Client Asset Pipeline Setup ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MedCare HMS full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
