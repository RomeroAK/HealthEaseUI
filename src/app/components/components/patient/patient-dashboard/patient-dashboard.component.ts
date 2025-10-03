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
  searchType: 'all' | 'specialization' | 'license'  | 'consultationFee' = 'all';
  searchQuery = '';
  isSearching = false;
  searchError: string | null = null;

  // Chatbot properties
  isChatbotOpen = false;
  chatMessages: ChatMessage[] = [];
  userMessage = '';
  isChatbotLoading = false;

  // User properties
  username  = this.authService.currentUserValue?.email;

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
    } else if (this.searchType === 'consultationFee') {
      this.searchByConsultationFee();
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

  searchByConsultationFee(): void {
    this.patientService.getDoctorsByConsultationFee(this.userId, this.searchQuery.trim())
      .toPromise()
      .then(response => {
        if (response?.success && response.data){
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
// Chatbot Methods
  initializeChatbot(): void {
    // Add welcome message
    this.chatMessages.push({
      text: 'Hello! I\'m your AI health assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    });
  }

  toggleChatbot(): void {
    this.isChatbotOpen = !this.isChatbotOpen;
  }

  closeChatbot(): void {
    this.isChatbotOpen = false;
  }

  sendMessage(): void {
    if (!this.userMessage.trim()) {
      return;
    }

    // Add user message to chat
    this.chatMessages.push({
      text: this.userMessage,
      sender: 'user',
      timestamp: new Date()
    });

    const userQuery = this.userMessage;
    this.userMessage = '';
    this.isChatbotLoading = true;

    // TODO: Replace this with your actual AI chatbot API call
    // For now, using a mock response
    setTimeout(() => {
      this.getBotResponse(userQuery);
    }, 1000);
  }

  getBotResponse(query: string): void {
    // TODO: Implement actual API call to your AI chatbot backend
    // This is a mock implementation
    let response = '';

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('appointment') || lowerQuery.includes('book')) {
      response = 'I can help you book an appointment! You can click on the \'Book Appointment\' button next to any doctor in your dashboard to schedule a visit.';
    } else if (lowerQuery.includes('doctor') || lowerQuery.includes('specialist')) {
      response = 'You can search for doctors by specialization or license number using the search bar on your dashboard. What type of specialist are you looking for?';
    } else if (lowerQuery.includes('symptom') || lowerQuery.includes('sick') || lowerQuery.includes('pain')) {
      response = 'I understand you\'re experiencing symptoms. While I can provide general information, it\'s important to consult with a healthcare professional for proper diagnosis. Would you like to book an appointment with a doctor?';
    } else if (lowerQuery.includes('prescription') || lowerQuery.includes('medication')) {
      response = 'For prescription and medication information, please consult with your doctor during an appointment. They can provide personalized medical advice based on your health history.';
    } else {
      response = 'I\'m here to help! You can ask me about booking appointments, finding doctors, or general health questions. What would you like to know?';
    }

    this.chatMessages.push({
      text: response,
      sender: 'bot',
      timestamp: new Date()
    });

    this.isChatbotLoading = false;

    // Scroll to bottom of chat
    setTimeout(() => {
      this.scrollChatToBottom();
    }, 100);
  }

  scrollChatToBottom(): void {
    const chatBody = document.querySelector('.chatbot-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  // Navigation methods
  goBack(): void {
    window.history.back();
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  cancelAppointment(id: number): void {
  }

  viewProfile(): void {
    this.router.navigate(['/patient-view-profile']);
  }

  getInitials(name: string): string {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[1].charAt(0);
    }
    return name.charAt(0);
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

export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

