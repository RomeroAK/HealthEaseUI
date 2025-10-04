export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  validUntil?: string;
}

export interface MedicalHistory {
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface PatientHealthMetrics {
  height: number;
  weight: number;
  bmi: number;
  [key: string]: any;
}

export interface Doctor {
  id: string;
  firstName: string;
  telephone: string;
  lastName: string;
  specialization: string;
  city?: string;
  province?: string;
  rating?: number;
  languages?: string[];
  gender?: string;
  [key: string]: any;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  scheduledDateTime: string;
  status: string;
  [key: string]: any;
}

export interface AppointmentSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AppointmentBookingRequest {
  doctorId: string;
  scheduledDateTime: string;
  reason: string;
}

export interface AppointmentRescheduleRequest {
  newDateTime: string;
  reason?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  recordType: string;
  createdAt: string;
  [key: string]: any;
}

export interface MedicalRecordFilter {
  doctorId?: string;
  recordType?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface MedicalRecordSummary {
  totalRecords: number;
  [key: string]: any;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicationName: string;
  status: string;
  [key: string]: any;
}

export interface PrescriptionFilter {
  doctorId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  medicationName?: string;
  limit?: number;
  offset?: number;
}

export interface PrescriptionSummary {
  totalPrescriptions: number;
  [key: string]: any;
}

export interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface DoctorSearchFilters  {
  name: string,
  specialty: string,
  practiceName: string
}

export interface DoctorSearchResult extends Doctor {
firstName: string;
lastName: string;
specialization: string;
id: string;
}


export interface PatientDashboardSummary {
  totalAppointments: number;
  upcomingAppointments: number;
  [key: string]: any;
}

export interface HealthAlert {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  patientId: string;
  rating: number;
  comment: string;
  anonymous: boolean;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  participants: string[];
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  sentAt: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
}

export interface MedicalDocument {
  id: string;
  documentType: string;
  fileName: string;
  uploadedAt: string;
  description?: string;
}

export interface NearbyDoctor extends Doctor {}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSpecialization {
  id: string;
  name: string;
  category: string;
}

export interface WorkingHours {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  isAvailable: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
  isCurrentlyStudying: boolean;
}

export interface Experience {
  position: string;
  organization: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
}

export interface ConsultationFees {
  initialConsultation: number;
  followUpConsultation: number;
  virtualConsultation?: number;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

