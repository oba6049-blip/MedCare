export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon identifier
  specialty: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  patients: string;
  image: string;
  availability: string[];
}

export interface HMSFeature {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  review: string;
  experience: string;
  avatar: string;
}

export interface NewsArticle {
  id: string;
  category: 'Hospital News' | 'Health Tips' | 'Medical Research';
  title: string;
  summary: string;
  date: string;
  readTime: string;
  image: string;
}

// ----------------------------------------------------
// Mock Data
// ----------------------------------------------------

export const SERVICES: Service[] = [
  {
    id: 'gen-consult',
    title: 'General Consultation',
    description: 'Comprehensive primary care, routine wellness exams, diagnostic evaluations, and personalized treatment plans for family health.',
    iconName: 'Activity',
    specialty: 'Primary Care'
  },
  {
    id: 'emergency',
    title: 'Emergency Services',
    description: '24/7 immediate trauma and acute care staffed by expert emergency physicians and equipped with advanced life-support technology.',
    iconName: 'HeartPulse',
    specialty: 'Critical Care'
  },
  {
    id: 'cardiology',
    title: 'Cardiology',
    description: 'State-of-the-art cardiovascular screening, heart failure management, interventional cardiology, and preventative cardiac care.',
    iconName: 'Heart',
    specialty: 'Heart & Vascular'
  },
  {
    id: 'orthopedics',
    title: 'Orthopedics',
    description: 'Specialized diagnosis and surgical/non-surgical treatment for bone, joint, ligament, and spine disorders, plus physical therapy.',
    iconName: 'Bone',
    specialty: 'Bones & Joints'
  },
  {
    id: 'neurology',
    title: 'Neurology',
    description: 'Comprehensive neurology care for complex brain, spinal cord, nerve, and neuromuscular disorders using precision diagnostics.',
    iconName: 'Brain',
    specialty: 'Brain & Spine'
  },
  {
    id: 'pediatrics',
    title: 'Pediatrics',
    description: 'Compassionate pediatric care, immunizations, developmental milestones monitoring, and acute childhood illness treatments.',
    iconName: 'Baby',
    specialty: 'Child Health'
  },
  {
    id: 'radiology',
    title: 'Radiology & Imaging',
    description: 'High-resolution diagnostic imaging including 3T MRI, 128-slice CT scans, 4D ultrasounds, and low-dose digital X-rays.',
    iconName: 'Scan',
    specialty: 'Diagnostics'
  },
  {
    id: 'laboratory',
    title: 'Clinical Laboratory',
    description: 'Fully automated pathology, hematology, biochemistry, and microbiology screening with rapid, cloud-integrated reporting.',
    iconName: 'FlaskConical',
    specialty: 'Diagnostics'
  },
  {
    id: 'pharmacy',
    title: 'Digital Pharmacy',
    description: 'Fully stocked, barcode-verified hospital pharmacy integrated with electronic prescriptions for maximum safety.',
    iconName: 'Pill',
    specialty: 'Medications'
  },
  {
    id: 'surgery',
    title: 'Advanced Surgery',
    description: 'Minimally invasive laparoscopic, robotic-assisted, and open surgeries performed in ultra-sterile, smart operating theaters.',
    iconName: 'Scissors',
    specialty: 'Surgical Care'
  },
  {
    id: 'icu',
    title: 'Intensive Care (ICU)',
    description: 'Continuous multi-disciplinary monitoring, advanced ventilation, and expert critical nursing care for highly sensitive patient cases.',
    iconName: 'Thermometer',
    specialty: 'Critical Care'
  },
  {
    id: 'ambulance',
    title: 'Ambulance & Transport',
    description: 'Fleet of GPS-tracked, ICU-equipped smart ambulances ensuring rapid response and uninterrupted pre-hospital critical care.',
    iconName: 'Truck',
    specialty: 'Emergency'
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: 'doc1',
    name: 'Dr. Sarah Jenkins',
    specialization: 'Chief of Cardiology',
    experience: '16 Years Experience',
    rating: 4.9,
    patients: '3,800+ Patients',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400',
    availability: ['Monday', 'Wednesday', 'Friday']
  },
  {
    id: 'doc2',
    name: 'Dr. Subair Nurudeen',
    specialization: 'Senior Neurosurgeon',
    experience: '18 Years Experience',
    rating: 5.0,
    patients: '2,400+ Patients',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400',
    availability: ['Tuesday', 'Thursday']
  },
  {
    id: 'doc3',
    name: 'Dr. Elena Rostova',
    specialization: 'Pediatrics Specialist',
    experience: '12 Years Experience',
    rating: 4.8,
    patients: '4,100+ Patients',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400&h=400',
    availability: ['Monday', 'Tuesday', 'Wednesday']
  },
  {
    id: 'doc4',
    name: 'Dr. Jonathan Cole',
    specialization: 'Orthopedic Surgeon',
    experience: '14 Years Experience',
    rating: 4.9,
    patients: '3,200+ Patients',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400',
    availability: ['Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'doc5',
    name: 'Dr. Amira Patel',
    specialization: 'Emergency Medicine lead',
    experience: '10 Years Experience',
    rating: 4.9,
    patients: '5,500+ Patients',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400',
    availability: ['Monday', 'Thursday', 'Saturday']
  },
  {
    id: 'doc6',
    name: 'Dr. Liam O\'Connor',
    specialization: 'Interventional Radiologist',
    experience: '15 Years Experience',
    rating: 4.7,
    patients: '1,900+ Patients',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400&h=400',
    availability: ['Tuesday', 'Friday']
  }
];

export const FEATURES: HMSFeature[] = [
  {
    id: 'feat-reg',
    title: 'Patient Registration',
    description: 'Instant contactless digital check-in with facial ID recognition, digital insurance consent, and pre-admission profile matching.',
    iconName: 'UserPlus'
  },
  {
    id: 'feat-sched',
    title: 'Appointment Scheduling',
    description: 'Automated queue management, smart booking recommendations, multi-doctor calendar syncing, and automated SMS reminders.',
    iconName: 'CalendarRange'
  },
  {
    id: 'feat-emr',
    title: 'Electronic Medical Records',
    description: 'Secure HL7-compliant longitudinal records featuring clinical timelines, diagnostic attachments, and medication history.',
    iconName: 'FileSpreadsheet'
  },
  {
    id: 'feat-bill',
    title: 'Billing Management',
    description: 'Consolidated itemized ledger, direct multi-payer insurance claims routing, automated split invoices, and instant digital payments.',
    iconName: 'CreditCard'
  },
  {
    id: 'feat-lab',
    title: 'Laboratory Management',
    description: 'Sample barcode tracking, equipment integration, HL7 automated result parsing, and immediate notifications via patient portals.',
    iconName: 'Beaker'
  },
  {
    id: 'feat-pharm',
    title: 'Pharmacy Management',
    description: 'Real-time drug-interaction alerts, inventory level forecasting, digital prescription fulfillment, and smart expiration monitors.',
    iconName: 'BriefcaseMedical'
  },
  {
    id: 'feat-doc-sched',
    title: 'Doctor Scheduling',
    description: 'Dynamic hospital-wide roster management, on-call rotation balancing, emergency swap requests, and timecard exports.',
    iconName: 'Clock'
  },
  {
    id: 'feat-ward',
    title: 'Ward Management',
    description: 'Interactive graphical bed mapping, occupancy level forecasts, sanitization states, and rapid nurse-call paging triggers.',
    iconName: 'Bed'
  },
  {
    id: 'feat-inv',
    title: 'Inventory Management',
    description: 'Supply chain automation, RFID asset tracking, automated purchasing triggers, and high-value equipment utilization logs.',
    iconName: 'Boxes'
  },
  {
    id: 'feat-rep',
    title: 'Reports & Analytics',
    description: 'Comprehensive business intelligence, hospital-acquired infection tracking, clinical outcome metrics, and financial reporting.',
    iconName: 'TrendingUp'
  },
  {
    id: 'feat-ai',
    title: 'AI Patient Assistant',
    description: '24/7 intelligent symptom sorting, pre-diagnosis gathering, medical terminology explanation, and follow-up appointment bookers.',
    iconName: 'Cpu'
  },
  {
    id: 'feat-cloud',
    title: 'Secure Cloud Storage',
    description: 'Zero-trust HIPAA-compliant AWS-backed medical data storage with end-to-end encryption both at rest and in transit.',
    iconName: 'ShieldAlert'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Eleanor Sterling',
    role: 'Cardiac Surgery Patient',
    rating: 5,
    review: 'The virtual consultation and prompt triage at MedCare HMS was unmatched. I received a comprehensive treatment plan within hours, and the clinical dashboard kept my family informed during my entire recovery.',
    experience: 'Excellent bypass surgery follow-up care',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 't2',
    name: 'David Chen',
    role: 'Chronic Care Patient',
    rating: 5,
    review: 'Managing my type-1 diabetes with MedCare has been a game changer. The electronic portal syncs with my wearable monitor, allowing my doctor to adjust my insulin levels without me driving in every month.',
    experience: 'Continuous glucose monitoring integration',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 't3',
    name: 'Samantha Ross',
    role: 'Mother of 2 (Pediatric Client)',
    rating: 5,
    review: 'Pediatric care here is outstanding. The digital immunization card automatically updates and sends reminders. I can ask the AI assistant simple fever questions and book quick checkups instantly.',
    experience: 'Outstanding pediatric checkup and support',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 't4',
    name: 'Marcus Brody',
    role: 'Orthopedics Rehabilitation Patient',
    rating: 4,
    review: 'Following my knee replacement, the mobile app gave me structured physical therapy videos daily. My recovery metrics were sent directly to Dr. Cole. Highly professional, modern, and caring.',
    experience: 'Structured physical therapy rehabilitation',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const NEWS: NewsArticle[] = [
  {
    id: 'n1',
    category: 'Hospital News',
    title: 'MedCare HMS Launches Robotic Cardiac Surgery Unit',
    summary: 'Our surgical wing now features the state-of-the-art DaVinci surgical system, allowing for highly complex heart operations with incisions under an inch.',
    date: 'July 14, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600&h=400'
  },
  {
    id: 'n2',
    category: 'Health Tips',
    title: 'Understanding Modern Preventive Cardiovascular Care',
    summary: 'Heart specialist Dr. Sarah Jenkins outlines five simple dietary adaptations and biometric tracking methods to reduce cardiac event risks by 70%.',
    date: 'June 28, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=600&h=400'
  },
  {
    id: 'n3',
    category: 'Medical Research',
    title: 'Clinical Study: AI Diagnostic Timelines vs Manual Triage',
    summary: 'Our primary research team publishes new findings on how machine learning algorithms accelerate pediatric emergency intake timelines by 42%.',
    date: 'May 19, 2026',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=600&h=400'
  }
];
