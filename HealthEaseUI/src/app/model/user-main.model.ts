export interface User {
  email: string;
  password: string;
  confirmPassword: string;
  idNumber: string;
  role: 'patient' | 'doctor' | 'admin';
  profileCompleted: boolean;
  isActive: boolean;
  id: number;
}
