import {Address} from './user.model';
import {Certification, ConsultationFees, DoctorSpecialization, Education, WorkingHours} from './doctor.related.interfaces';

export interface DoctorDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  idNumber: string;
  profilePictureUrl?: string;

  // Professional Information
  medicalLicenseNumber: string;
  hpcsaNumber: string;
  yearsOfExperience: number;
  specializations: DoctorSpecialization[];
  subspecialties: string[];
  languagesSpoken: string[];

  // Education & Qualifications
  education: Education[];
  certifications: Certification[];

  // Practice Information
  practiceName: string;
  practiceType: 'private' | 'public' | 'clinic' | 'group' | 'academic';
  address: Address;
  consultationTypes: ('in_person' | 'virtual' | 'both')[];
  consultationFees: ConsultationFees;

  // Availability
  workingHours: WorkingHours[];
  bio?: string;
  emergencyAvailable: boolean;
  acceptsInsurance: boolean;
  acceptedInsuranceProviders: string[];
}
