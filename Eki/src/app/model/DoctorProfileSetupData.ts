export interface DoctorProfileSetupData {
  // Step 1: Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  idNumber: string;
  profilePicture?: File;

  // Step 2: Professional Information
  medicalLicenseNumber: string;
  hpcsaNumber: string;
  specializations: string[];
  yearsOfExperience: number;
  languagesSpoken: string[];
  consultationTypes: string[];

  // Step 3: Education & Qualifications
  education: {
    degree: string;
    institution: string;
    yearCompleted: number;
    country: string;
  }[];
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
  }[];

  // Step 4: Practice Information
  practiceName: string;
  practiceType: string;
  practiceAddress: string;
  city: string;
  province: string;
  postalCode: string;
  consultationFee: number;
  acceptsInsurance: boolean;
  insuranceProviders: string[];

  // Step 5: Availability & Final Details
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  bio: string;
  emergencyAvailable: boolean;
  agreedToTerms: boolean;
}
