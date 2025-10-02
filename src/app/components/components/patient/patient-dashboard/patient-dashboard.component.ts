import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../../services/authService/auth.service';
import {Appointment, Doctor, DoctorSearchCriteria, MedicalRecord} from '../../../../model/doctor.related.interfaces';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {Prescription} from '../../../../model/user.model';
import {forkJoin, Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DoctorService} from '../../../../services/doctorProfileService/doctor.service';
import {Patient} from '../../../../model/patient.model';
import {PatientServiceService} from '../../../../services/patientProfileService/patient-service.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  doctors: DoctorProfileResponseDto[] = [];
  appointments: AppointmentDto[] = [];
  user: any;
  loading = true;
  error: string | null = null;
  private userId = this.authService.currentUserIdValue;
  // Search properties
  searchType: 'all' | 'specialization' | 'license' = 'all';
  searchQuery = '';
  isSearching = false;
  searchError: string | null = null;

  constructor(private router: Router, private patientService: PatientServiceService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Fetch both doctors and appointments
    Promise.all([
      this.patientService.getAllDoctors(this.userId).toPromise(),
      this.patientService.getAllAppointments(this.userId).toPromise()
    ])
      .then(([doctorsResponse, appointmentsResponse]) => {
        // Extract doctors data from ApiResponseDto
        if (doctorsResponse?.success && doctorsResponse.data) {
          this.doctors = doctorsResponse.data as DoctorProfileResponseDto[];
        } else {
          this.doctors = [];
        }

        // Extract appointments data from ApiResponseDto
        if (appointmentsResponse?.success && appointmentsResponse.data) {
          this.appointments = appointmentsResponse.data as AppointmentDto[];
        } else {
          this.appointments = [];
        }

        this.loading = false;
      })
      .catch(err => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        console.error('Error loading dashboard data:', err);
      });
  }

  getUserId(): number {
   return this.authService.currentUserIdValue as number;
  }

  searchDoctors(): void {
    if (!this.searchQuery.trim()) {
      this.searchError = 'Please enter a search term';
      return;
    }

    this.isSearching = true;
    this.searchError = null;

    if (this.searchType === 'all') {
      // Reset to show all doctors
      this.loadAllDoctors();
    } else if (this.searchType === 'specialization') {
      this.searchBySpecialization();
    } else if (this.searchType === 'license') {
      this.searchByLicenseNumber();
    }
  }
  loadAllDoctors(): void {
    this.patientService.getAllDoctors(this.userId)
      .toPromise()
      .then(response => {
        if (response?.success && response.data) {
          this.doctors = response.data as DoctorProfileResponseDto[];
        } else {
          this.doctors = [];
        }
        this.isSearching = false;
      })
      .catch(err => {
        this.searchError = 'Failed to load doctors. Please try again.';
        this.isSearching = false;
        console.error('Error loading doctors:', err);
      });
  }


  searchBySpecialization(): void {
    this.patientService.getDoctorsBySpecialization(this.userId, this.searchQuery.trim())
      .toPromise()
      .then(response => {
        if (response?.success && response.data) {
          this.doctors = response.data as DoctorProfileResponseDto[];
          if (this.doctors.length === 0) {
            this.searchError = 'No doctors found with that specialization';
          }
        } else {
          this.searchError = response?.message || 'No doctors found';
          this.doctors = [];
        }
        this.isSearching = false;
      })
      .catch(err => {
        this.searchError = 'Failed to search doctors. Please try again.';
        this.isSearching = false;
        console.error('Error searching doctors:', err);
      });
  }

  searchByLicenseNumber(): void {
    this.patientService.getDoctorByLicenseNumber(this.userId, this.searchQuery.trim())
      .toPromise()
      .then(response => {
        if (response?.success && response.data) {
          // Since this returns a single doctor, wrap it in an array
          this.doctors = [response.data as DoctorProfileResponseDto];
        } else {
          this.searchError = response?.message || 'Doctor not found';
          this.doctors = [];
        }
        this.isSearching = false;
      })
      .catch(err => {
        this.searchError = 'Failed to find doctor. Please try again.';
        this.isSearching = false;
        console.error('Error searching doctor:', err);
      });
  }

  getAppointmentStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      SCHEDULED: 'status-scheduled',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled',
      PENDING: 'status-pending'
    };
    return statusMap[status] || 'status-default';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  bookAppointment(doctor: DoctorProfileResponseDto): void {
    console.log('redirect to patient-appointment');
    this.router.navigate(['patient', 'patient-appointments'], {
      state: { doctor, userId: this.userId }
    });
  }

  openAiAssistant(): void {
    alert('Launching AI Assistant...'); // Replace with actual logic or modal
  }


  cancelAppointment(id: number): void {
  }

  viewProfile(): void {
    this.router.navigate(['/patient-view-profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchType = 'all';
    this.searchError = null;
    this.loadAllDoctors();
  }
}

export interface DoctorProfileResponseDto {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  qualifications: string[];
  medicalSchool: string;
  practiceType: string;
  clinicAddress: AddressDto;
  hospitalAddress: AddressDto;
  isActive: boolean;
  isPrivatePractice: boolean;
  acceptedInsurance: string[];
  practiceName: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressDto {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface AppointmentDto {
  id: number;
  patient: PatientSummaryDto;
  doctor: DoctorSummaryDto;
  appointmentDate: string;
  appointmentType: string;
  status: string;
  reason: string;
}

export interface PatientSummaryDto {
  id: number;
  fullName: string;
}

export interface DoctorSummaryDto {
  id: number;
  fullName: string;
  specialization: string;
}

