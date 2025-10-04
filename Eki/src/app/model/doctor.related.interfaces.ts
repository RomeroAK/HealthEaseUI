export interface Doctor {
  id?: number;
  userId?: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  gender: string;
  specialization: string;
  licenseNumber: string;
  consultationFee?: number;
  acceptedInsurance?: string[];
  isPrivatePractice?: boolean;
  practiceName?: string;
  hospitalName: string;
  isActive?: boolean;
  clinicAddress?: Address;
  hospitalAddress?: Address;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface DoctorSpecialization {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
  isCurrentlyStudying: boolean;
  gpa?: number;
  honors?: string;
}

export interface Certification {
  id?: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
}

export interface WorkingHours {
  id?: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  isAvailable: boolean;
}

export interface ConsultationFees {
  initialConsultation: number;
  followUpConsultation: number;
  virtualConsultation?: number;
  emergencyConsultation?: number;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface DoctorSearchCriteria {
  name?: string;
  specialization?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  practiceName?: string;
  consultationType?: 'in_person' | 'virtual' | 'both';
  acceptsInsurance?: boolean;
  insuranceProvider?: string;
  rating?: number;
  maxFee?: number;
  emergencyAvailable?: boolean;
  gender?: string;
  languagesSpoken?: string[];
  sortBy?: 'distance' | 'rating' | 'experience' | 'fees' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DoctorSearchResult {
  doctors: Doctor[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  firstName: string;
  lastName: string;
  specialization: string;
  id: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  type: 'initial' | 'follow_up' | 'emergency' | 'virtual';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'scheduled';
  reason: string;
  notes?: string;
  fee: number;
  createdAt: Date;
  updatedAt: Date;
  doctorName: string;
}
export interface PatientAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  type: 'initial' | 'follow_up' | 'emergency' | 'virtual';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'scheduled';
  reason: string;
  notes?: string;
  fee: number;
  createdAt: Date;
  updatedAt: Date;
  patientName: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  visitDate: Date;
  chiefComplaint: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  medications: Medication[];
  tests: MedicalTest[];
  notes: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: Date;
  endDate?: Date;
}

export interface MedicalTest {
  id?: string;
  testName: string;
  testType: string;
  orderDate: Date;
  resultDate?: Date;
  result?: string;
  resultFile?: string;
  normalRange?: string;
  interpretation?: string;
}

export interface DoctorStatistics {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageRating: number;
  totalReviews: number;
  monthlyAppointments: number;
  weeklyAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  revenue: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    total: number;
  };
}
