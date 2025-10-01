import {AddressModel} from './address.model';

export interface Doctor {
  acceptsInsurance: any;
  emergencyAvailable: any;
  bio: any;
  practiceType: any;
  yearsOfExperience: any;
  hpcsaNumber: any;
  medicalLicenseNumber: any;
  gender: any;
  dateOfBirth: any;
  phoneNumber: any;
  email: any;
  firstName: string;
  lastName: string;
  idnumber: string;
  practiceName: string;
  consultationFee: number;
  medicalField: string;
  address: AddressModel;
  doctorRegistrationNumber: string;
}
