export interface AppointmentModel {
  appointmentId?: number; // Optional for creation, required for editing
  doctorId: number;
  patientId: number;
  appointmentDate: string; // ISO string or yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason: string;
  status?: string; // e.g., 'SCHEDULED', 'COMPLETED', etc.
}

