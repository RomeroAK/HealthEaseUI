import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {Appointment} from '../../../../model/doctor.related.interfaces';
import {AppointmentService} from '../../../../services/appointmentService/appointment.service';
import {AuthService} from '../../../../services/authService/auth.service';
import {PatientServiceService} from '../../../../services/patientProfileService/patient-service.service';

@Component({
  selector: 'app-patient-appointment',
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.css']
})
export class PatientAppointmentComponent implements OnInit {
  doctor: any;
  userId: number | undefined = this.authService.currentUserIdValue;

  // Form fields
  appointmentDate = '';
  appointmentType = 'IN_PERSON';
  reason = '';

  // Patient info (you'll need to fetch this or have it available)
  patientFirstName = '';
  patientLastName = '';
  patientPhoneNumber = '';
  patientIdNumber = '';

  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  appointmentTypes = ['IN_PERSON', 'VIRTUAL_CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'PROCEDURE', 'VACCINATION'];

  constructor(
    private router: Router,
    private patientService: PatientServiceService,
    private authService: AuthService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.doctor = navigation.extras.state.doctor;
      this.userId = navigation.extras.state.userId;
    }
  }

  ngOnInit(): void {
    if (!this.doctor) {
      // If no doctor data, redirect back to dashboard
      this.router.navigate(['/patient-dashboard']);
      return;
    }

    // Load patient info - you'll need to implement this based on your auth
    this.loadPatientInfo();
  }

  loadPatientInfo(): void {
    // TODO: Implement fetching patient info from your service
    // For now using placeholders
    this.patientFirstName = 'John';
    this.patientLastName = 'Doe';
    this.patientPhoneNumber = '1234567890';
    this.patientIdNumber = 'ID123456';
  }

  bookAppointment(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const appointmentBookingRequest: AppointmentBookingRequest = {
      appointmentInfo: {
        id: null,
        patient: {
          id: this.userId,
          firstName: this.patientFirstName,
          lastName: this.patientLastName,
          phoneNumber: this.patientPhoneNumber,
          idNumber: this.patientIdNumber
        },
        doctor: {
          id: this.doctor.id,
          firstName: this.doctor.firstName,
          lastName: this.doctor.lastName,
          licenseNumber: this.doctor.licenseNumber,
          email: this.doctor.email,
          phoneNumber: this.doctor.phoneNumber,
          practiceName: this.doctor.practiceName,
          primarySpecialization: this.doctor.specialization
        },
        appointmentDate: this.appointmentDate,
        appointmentType: this.appointmentType,
        status: 'PENDING',
        reason: this.reason
      }
    };

    this.patientService.bookAppointment(this.userId, appointmentBookingRequest)
      .toPromise()
      .then(response => {
        if (response?.success) {
          this.successMessage = 'Appointment booked successfully!';
          this.loading = false;

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            this.router.navigate(['patient', 'patient-dashboard']);
          }, 2000);
        } else {
          this.error = response?.message || 'Failed to book appointment';
          this.loading = false;
        }
      })
      .catch(err => {
        this.error = 'Failed to book appointment. Please try again.';
        this.loading = false;
        console.error('Error booking appointment:', err);
      });
  }

  validateForm(): boolean {
    if (!this.appointmentDate) {
      this.error = 'Please select an appointment date';
      return false;
    }

    if (!this.appointmentType) {
      this.error = 'Please select an appointment type';
      return false;
    }

    if (!this.reason || this.reason.trim().length < 10) {
      this.error = 'Please provide a detailed reason (at least 10 characters)';
      return false;
    }

    // Check if date is in the future
    const selectedDate = new Date(this.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.error = 'Please select a future date';
      return false;
    }

    return true;
  }

  goBack(): void {
    this.router.navigate(['patient', '/patient-dashboard']);
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}

// Interfaces
export interface AppointmentBookingRequest {
  appointmentInfo: AppointmentInfo;
}

export interface AppointmentInfo {
  id: number | null;
  patient: PatientSummaryDto;
  doctor: DoctorSummaryDto;
  appointmentDate: string;
  appointmentType: string;
  status: string;
  reason: string;
}

export interface PatientSummaryDto {
  id: number | undefined;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idNumber: string;
}

export interface DoctorSummaryDto {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  email: string;
  phoneNumber: string;
  practiceName: string;
  primarySpecialization: string;
}




