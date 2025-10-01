import {Address} from './user.model';

export interface Patient{
  insurance: boolean;
  emergencyContacts: [];
  preferences: any;
  preferredLanguage: string;
  maritalStatus: string;
  employer: string;
  gender: string;
  occupation: any;
  email: string;
  alternatePhoneNumber: any;
  phoneNumber: any;
  dateOfBirth: any;
  firstName: string;
  lastName: string;
  idNumber: string;
  address: Address;
  country: string;
  medicalAidName: string;
  medicalAidNumber: string;
  medicalHistory: [];
}
