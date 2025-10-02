import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {Observable, BehaviorSubject, throwError, forkJoin, of} from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  Doctor,
  Prescription,
  DoctorSearchFilters,
  DoctorSearchResult,
  PatientDashboardSummary,
  HealthAlert,
  DoctorReview,
  AppointmentSlot,
  AppointmentRescheduleRequest,
  MessageThread,
  Message,
  MessageAttachment,
  NotificationPreferences,
  MedicalDocument,
  FileUploadResponse,
  LocationData,
  NearbyDoctor,
  PaymentMethod,
  PatientHealthMetrics,
  MedicalRecordFilter,
  MedicalRecordSummary,
  PrescriptionFilter,
  PrescriptionSummary,
  EmergencyContact,
  Insurance
} from '../../model/user.model';
import {AuthService} from '../authService/auth.service';
import {Patient} from '../../model/patient.model';
import {Appointment, MedicalRecord} from '../../model/doctor.related.interfaces';
import {DoctorDTO} from '../../model/DoctorDTO';
import {ApiResponseDto} from '../../model/ApiResponseDto';
import {AppointmentBookingRequest} from '../../components/components/appointment/patient-appointment/patient-appointment.component';

@Injectable({
  providedIn: 'root'
})
export class PatientServiceService {

  private apiUrl = 'http://localhost:8080/api/patients';
  private apiDoctorUrl = 'http://localhost:8080/api/doctors';
  private currentPatientSubject = new BehaviorSubject<Patient | null>(null);
  public currentPatient$ = this.currentPatientSubject.asObservable();
  public currentPatientId = this.authService.currentUserIdValue;
  private token = this.authService.getToken();
  // Cache for frequently accessed data
  private doctorsCache: Map<string, Doctor> = new Map();
  private appointmentsCache: Appointment[] = [];
  private medicalRecordsCache: null;
  private prescriptionsCache: Prescription[] = [];
  private patientsCache = new Map<string, Patient>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadCurrentPatient();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  private getMultipartHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Patient service error:', error);
    return throwError(error);
  }

  // =======================
  // PROFILE MANAGEMENT
  // =======================

  loadCurrentPatient(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.role === 'patient') {
      this.getProfile().subscribe({
        next: (patient) => {
          this.currentPatientSubject.next(patient);
        },
        error: (error) => {
          console.error('Error loading current patient:', error);
          this.currentPatientSubject.next(null);
        }
      });
    }
  }

  getProfile(): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${this.currentPatientId}/patient/profile`, {
      headers: this.getHeaders()
    }).pipe(
      tap(patient => this.currentPatientSubject.next(patient)),
      catchError(this.handleError)
    );
  }
  createProfile(profileData: FormData): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/${this.currentPatientId}/patient/create/profile`, profileData, {
      headers: this.getMultipartHeaders()
    }).pipe(
      tap(patient => this.currentPatientSubject.next(patient)),
      catchError(this.handleError)
    );
  }

  updateProfile(profileData: any): Observable<Patient> {
    console.log('user id', this.currentPatientId);
    return this.http.put<Patient>(`${this.apiUrl}/${this.currentPatientId}/patient/profile`, profileData, {
      headers: this.getHeaders()
    }).pipe(
      tap(patient => {
        this.currentPatientSubject.next(patient);
        this.clearCache(); // Clear cache when profile is updated
      }),
      catchError(this.handleError)
    );
  }

  updatePersonalInfo(personalInfo: any): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${this.currentPatientId}/patient/profile/personal`, personalInfo, {
      headers: this.getHeaders()
    }).pipe(
      tap(patient => this.currentPatientSubject.next(patient)),
      catchError(this.handleError)
    );
  }

  updateMedicalInfo(medicalInfo: any): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${this.currentPatientId}/patient/profile/medical`, medicalInfo, {
      headers: this.getHeaders()
    }).pipe(
      tap(patient => this.currentPatientSubject.next(patient)),
      catchError(this.handleError)
    );
  }

  updateEmergencyContacts(contacts: EmergencyContact[]): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${this.currentPatientId}/patient/profile/emergency-contacts`,
      { emergencyContacts: contacts }, {
        headers: this.getHeaders()
      }).pipe(
      tap(patient => this.currentPatientSubject.next(patient)),
      catchError(this.handleError)
    );
  }

  updateInsuranceInfo(insurance: Insurance): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${this.currentPatientId}/patient/profile/insurance`, insurance, {
      headers: this.getHeaders()
    }).pipe(
      tap(patient => this.currentPatientSubject.next(patient)),
      catchError(this.handleError)
    );
  }

  uploadProfilePicture(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/${this.currentPatientId}/patient/profile/picture`, formData, {
      headers: this.getMultipartHeaders()
    }    ).pipe(
      catchError(this.handleError)
    );
  }

  deletePaymentMethod(paymentMethodId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${this.currentPatientId}/patient/payment-methods/${paymentMethodId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  setDefaultPaymentMethod(paymentMethodId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${this.currentPatientId}/patient/payment-methods/${paymentMethodId}/default`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
  // =======================
  // EMERGENCY & URGENT CARE
  // =======================

  requestEmergencyAssistance(emergencyType: string, location: LocationData, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/emergency/request`, {
      emergencyType, location, notes
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  findNearestHospitals(latitude: number, longitude: number, radius: number = 50): Observable<any[]> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radius', radius.toString());

    return this.http.get<any[]>(`${this.apiUrl}/${this.currentPatientId}/patient/emergency/hospitals/nearest`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  getAllDoctors(userId: number | undefined): Observable<ApiResponseDto> {
    return this.http.get<ApiResponseDto>(`${this.apiUrl}/service/${userId}/patient/doctors/get-all`);
  }

  getAllAppointments(userId: number | undefined): Observable<ApiResponseDto> {
    return this.http.get<ApiResponseDto>(`${this.apiUrl}/service/${userId}/patient/appointments/get-all`);
  }

  getDoctorsBySpecialization(userId: number | undefined, specialization: string): Observable<ApiResponseDto> {
    return this.http.get<ApiResponseDto>(`${this.apiUrl}/service/${userId}/patient/doctors/get-by-specialization/${specialization}`);
  }

  getDoctorByLicenseNumber(userId: number | undefined, licenseNumber: string): Observable<ApiResponseDto> {
    return this.http.get<ApiResponseDto>(`${this.apiUrl}/service/${userId}/patient/doctors/get-by-license/${licenseNumber}`);
  }

  getEmergencyContacts(): Observable<EmergencyContact[]> {
    return this.http.get<EmergencyContact[]>(`${this.apiUrl}/${this.currentPatientId}/patient/emergency-contacts`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  notifyEmergencyContacts(message: string, includeLocation: boolean = true): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/emergency/notify-contacts`, {
      message, includeLocation
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =======================
  // TELEHEALTH & VIRTUAL VISITS
  // =======================

  scheduleVirtualConsultation(doctorId: string, scheduledDateTime: string, consultationType: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/virtual-consultations/schedule`, {
      doctorId, scheduledDateTime, consultationType
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getVirtualConsultations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.currentPatientId}/patient/virtual-consultations`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  joinVirtualConsultation(consultationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/virtual-consultations/${consultationId}/join`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  endVirtualConsultation(consultationId: string, rating?: number, feedback?: string): Observable<any> {
    const body: any = {};
    if (rating) { body.rating = rating; }
    if (feedback) { body.feedback = feedback; }

    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/virtual-consultations/${consultationId}/end`, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =======================
  // HEALTH MONITORING & TRACKING
  // =======================

  recordVitalSigns(vitals: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/health-monitoring/vitals`, vitals, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getVitalSignsHistory(startDate?: string, endDate?: string): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) { params = params.set('startDate', startDate); }
    if (endDate) { params = params.set('endDate', endDate); }

    return this.http.get<any[]>(`${this.apiUrl}/${this.currentPatientId}/patient/health-monitoring/vitals`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  recordSymptoms(symptoms: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/health-monitoring/symptoms`, symptoms, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getSymptomHistory(startDate?: string, endDate?: string): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) { params = params.set('startDate', startDate); }
    if (endDate) { params = params.set('endDate', endDate); }

    return this.http.get<any[]>(`${this.apiUrl}/${this.currentPatientId}/patient/health-monitoring/symptoms`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  setHealthGoals(goals: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/health-monitoring/goals`, goals, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getHealthGoals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.currentPatientId}/patient/health-monitoring/goals`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateHealthGoalProgress(goalId: string, progress: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${this.currentPatientId}/patient/health-monitoring/goals/${goalId}/progress`,
      progress, {
        headers: this.getHeaders()
      }).pipe(
      catchError(this.handleError)
    );
  }

  // =======================
  // CHATBOT & AI ASSISTANCE
  // =======================

  sendChatbotMessage(message: string, context?: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/chatbot/message`, {
      message, context
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getChatbotHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.currentPatientId}/patient/chatbot/history`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  clearChatbotHistory(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${this.currentPatientId}/patient/chatbot/history`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getHealthRecommendations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.currentPatientId}/patient/ai/recommendations`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =======================
  // FAMILY & DEPENDENTS
  // =======================

  getFamilyMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.currentPatientId}/patient/family`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  addFamilyMember(familyMember: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patients/family`, familyMember, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateFamilyMember(memberId: string, updates: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${this.currentPatientId}/patient/family/${memberId}`, updates, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  removeFamilyMember(memberId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${this.currentPatientId}/patient/family/${memberId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  bookAppointmentForFamilyMember(memberId: string, bookingRequest: AppointmentBookingRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/family/${memberId}/appointments/book`,
      bookingRequest, {
        headers: this.getHeaders()
      }).pipe(
      catchError(this.handleError)
    );
  }

  // =======================
  // SEARCH & DISCOVERY
  // =======================

  searchHealthInfo(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.currentPatientId}/patient/search/health-info`, {
      headers: this.getHeaders(),
      params: new HttpParams().set('q', query)
    }).pipe(
      catchError(this.handleError)
    );
  }

  searchSpecialists(condition: string, location?: LocationData): Observable<Doctor[]> {
    let params = new HttpParams().set('condition', condition);

    if (location) {
      params = params.set('latitude', location.latitude.toString());
      params = params.set('longitude', location.longitude.toString());
    }

    return this.http.get<Doctor[]>(`${this.apiUrl}/${this.currentPatientId}/patient/search/specialists`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  getPopularDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/${this.currentPatientId}/patient/discover/popular-doctors`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getFeaturedDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/${this.currentPatientId}/patient/discover/featured-doctors`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =======================
  // REPORTS & EXPORTS
  // =======================

  generateHealthReport(reportType: string, parameters: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/reports/generate`, {
      reportType, parameters
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  downloadHealthReport(reportId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${this.currentPatientId}/patient/reports/${reportId}/download`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  exportMedicalData(format: string, dateRange?: { startDate: string; endDate: string }): Observable<Blob> {
    let params = new HttpParams().set('format', format);

    if (dateRange) {
      params = params.set('startDate', dateRange.startDate);
      params = params.set('endDate', dateRange.endDate);
    }

    return this.http.get(`${this.apiUrl}/${this.currentPatientId}/patient/export/medical-data`, {
      headers: this.getHeaders(),
      params,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =======================
  // FEEDBACK & SUPPORT
  // =======================

  submitFeedback(feedbackType: string, subject: string, message: string, rating?: number): Observable<any> {
    const body: any = { feedbackType, subject, message };
    if (rating) { body.rating = rating; }

    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/feedback`, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getSupportTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.currentPatientId}/patient/support/tickets`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  createSupportTicket(subject: string, description: string, priority: string, category: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/support/tickets`, {
      subject, description, priority, category
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateSupportTicket(ticketId: string, message: string, attachments?: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('message', message);

    if (attachments && attachments.length > 0) {
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.http.put(`${this.apiUrl}/${this.currentPatientId}/patient/support/tickets/${ticketId}`, formData, {
      headers: this.getMultipartHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =======================
  // UTILITY METHODS
  // =======================

  private clearCache(): void {
    this.doctorsCache.clear();
    this.appointmentsCache = [];
    this.medicalRecordsCache = null;
    this.prescriptionsCache = [];
  }

  private clearAppointmentsCache(): void {
    this.appointmentsCache = [];
  }

  private clearMedicalRecordsCache(): void {
    this.medicalRecordsCache = null;
  }

  private clearPrescriptionsCache(): void {
    this.prescriptionsCache = [];
  }

  // Get current patient from subject
  getCurrentPatient(): Patient | null {
    return this.currentPatientSubject.value;
  }

  // Check if patient profile is complete
  isProfileComplete(): boolean {
    const patient = this.getCurrentPatient();
    if (!patient) { return false; }

    return !!(
      patient.firstName &&
      patient.lastName &&
      patient.dateOfBirth &&
      patient.phoneNumber &&
      patient.address &&
      patient.emergencyContacts &&
      patient.emergencyContacts.length > 0
    );
  }

  // Get completion percentage
  getProfileCompletionPercentage(): number {
    const patient = this.getCurrentPatient();
    if (!patient) { return 0; }

    let completedFields = 0;
    const totalFields = 15;

    // Basic info
    if (patient.firstName) { completedFields++; }
    if (patient.lastName) { completedFields++; }
    if (patient.dateOfBirth) { completedFields++; }
    if (patient.phoneNumber) { completedFields++; }
    if (patient.idNumber) { completedFields++; }
    if (patient.address) { completedFields++; }

    // // Medical info
    // if (patient.medicalHistory?.bloodType) { completedFields++; }
    // if (patient.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0) { completedFields++; }
    // if (patient.medicalHistory?.chronicConditions && patient.medicalHistory.chronicConditions.length > 0) { completedFields++; }

    // Emergency contacts
    if (patient.emergencyContacts && patient.emergencyContacts.length > 0) { completedFields++; }

    // Insurance
    if (patient.insurance) { completedFields++; }

    // Additional fields
    if (patient.occupation) { completedFields++; }
    if (patient.preferences) { completedFields++; }

    return Math.round((completedFields / totalFields) * 100);
  }

  getProfileCompletion(): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return throwError('User not authenticated');
    }

    return this.http.get<any>(`${this.apiUrl}/patients/${currentUser.id}/profile/completion`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Download profile as PDF
   */
  downloadProfilePDF(userId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/patients/${userId}/documents/profile/pdf`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  /**
   * Get profile with detailed completion info
   */
  getProfileWithCompletion(): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return throwError('User not authenticated');
    }

    return forkJoin({
      profile: this.getProfile(),
      completion: this.getProfileCompletion()
    });
  }
  // Validate South African ID Number
  validateSAIdNumber(idNumber: string): boolean {
    if (!idNumber || idNumber.length !== 13) { return false; }

    const digits = idNumber.split('').map(Number);
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      if (i % 2 === 0) {
        sum += digits[i];
      } else {
        const doubled = digits[i] * 2;
        sum += doubled > 9 ? doubled - 9 : doubled;
      }
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[12];
  }

  // Extract info from SA ID Number
  extractInfoFromIdNumber(idNumber: string): any {
    if (!this.validateSAIdNumber(idNumber)) { return null; }

    const year: number = parseInt(idNumber.substring(0, 2), 10);
    const month: number = parseInt(idNumber.substring(2, 4), 10);
    const day: number = parseInt(idNumber.substring(4, 6), 10);
    const genderDigit: number = parseInt(idNumber.substring(6, 10), 10);
    const citizenship: number = parseInt(idNumber.substring(10, 11), 10);

    // Determine full year (assuming people are not older than 100)
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const fullYear = year + (year <= currentYear % 100 ? currentCentury : currentCentury - 100);

    return {
      dateOfBirth: new Date(fullYear, month - 1, day),
      gender: genderDigit < 5000 ? 'Female' : 'Male',
      citizenship: citizenship === 0 ? 'South African' : 'Foreign',
      age: currentYear - fullYear
    };
  }

  // Format phone number for display
  formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) { return ''; }

    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Format as South African number
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('27')) {
      return `+${cleaned.substring(0, 2)} (${cleaned.substring(2, 5)}) ${cleaned.substring(5, 8)}-${cleaned.substring(8)}`;
    }

    return phoneNumber;
  }

  // Calculate age from date of birth
  calculateAge(dateOfBirth: Date | string): number {
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Calculate BMI
  calculateBMI(height: number, weight: number): number {
    if (!height || !weight) { return 0; }
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  // Get BMI category
  getBMICategory(bmi: number): string {
    if (bmi < 18.5) { return 'Underweight'; }
    if (bmi < 25) { return 'Normal weight'; }
    if (bmi < 30) { return 'Overweight'; }
    return 'Obese';
  }

  // Format currency (South African Rand)
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  }

  // Get next appointment
  getNextAppointment(): Observable<Appointment | null> {
    return this.getUpcomingAppointments().pipe(
      map(appointments => {
        if (!appointments || appointments.length === 0) { return null; }

        // Sort by date and return the earliest
        const sorted = appointments.sort((a, b) =>
          new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
        );

        return sorted[0];
      })
    );
  }

  // Check if appointment can be cancelled
  canCancelAppointment(appointment: Appointment): boolean {
    if (!appointment || appointment.status !== 'scheduled') { return false; }

    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can cancel if appointment is more than 24 hours away
    return hoursUntilAppointment > 24;
  }

  // Check if appointment can be rescheduled
  canRescheduleAppointment(appointment: Appointment): boolean {
    if (!appointment || appointment.status !== 'scheduled') { return false; }

    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Can reschedule if appointment is more than 48 hours away
    return hoursUntilAppointment > 48;
  }

  // Get appointment status color
  getAppointmentStatusColor(status: string): string {
    switch (status) {
      case 'SCHEDULED': return '#3498db';
      case 'CONFIRMED': return '#2ecc71';
      case 'CANCELLED': return '#e74c3c';
      case 'COMPLETED': return '#95a5a6';
      case 'NO_SHOW': return '#e67e22';
      case 'RESCHEDULED': return '#f39c12';
      default: return '#7f8c8d';
    }
  }

  // Get prescription status color
  getPrescriptionStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return '#2ecc71';
      case 'FILLED': return '#3498db';
      case 'EXPIRED': return '#e74c3c';
      case 'CANCELLED': return '#95a5a6';
      default: return '#7f8c8d';
    }
  }
deleteProfilePicture(): Observable<any> {
  return this.http.delete(`${this.apiUrl}/patient/profile/picture`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

// =======================
// DOCTOR SEARCH & DISCOVERY
// =======================

searchDoctors(filters: DoctorSearchFilters): Observable<DoctorSearchResult[]> {
  let params = new HttpParams();

  if (filters.searchTerm) { params = params.set('searchTerm', filters.searchTerm); }
  if (filters.specialization) { params = params.set('specialization', filters.specialization); }
  if (filters.city) { params = params.set('city', filters.city); }
  if (filters.province) { params = params.set('province', filters.province); }
  if (filters.maxDistance) { params = params.set('maxDistance', filters.maxDistance.toString()); }
  if (filters.availableToday !== undefined) { params = params.set('availableToday', filters.availableToday.toString()); }
  if (filters.acceptsInsurance) { params = params.set('acceptsInsurance', filters.acceptsInsurance); }
  if (filters.minRating) { params = params.set('minRating', filters.minRating.toString()); }
  if (filters.maxFee) { params = params.set('maxFee', filters.maxFee.toString()); }
  if (filters.gender) { params = params.set('gender', filters.gender); }

// Handle location
  if (filters.location) {
  params = params.set('latitude', filters.location.latitude.toString());
  params = params.set('longitude', filters.location.longitude.toString());
}

// Handle arrays
  if (filters.languages && filters.languages.length > 0) {
  params = params.set('languages', filters.languages.join(','));
}

  if (filters.availableDays && filters.availableDays.length > 0) {
  params = params.set('availableDays', filters.availableDays.join(','));
}

// Handle time range
  if (filters.timeRange) {
  params = params.set('startTime', filters.timeRange.startTime);
  params = params.set('endTime', filters.timeRange.endTime);
}

  return this.http.get<DoctorSearchResult[]>(`${this.apiUrl}/${this.currentPatientId}/patient/doctors/search`, {
  headers: this.getHeaders(),
  params
}).pipe(
  catchError(this.handleError)
);
}

getDoctorById(doctorId: string): Observable<Doctor> {
  // Check cache first
  if (this.doctorsCache.has(doctorId)) {
  return new Observable(observer => {
    // tslint:disable-next-line:no-non-null-assertion
    observer.next(this.doctorsCache.get(doctorId)!);
    observer.complete();
  });
}

  return this.http.get<Doctor>(`${this.apiUrl}/patient/doctors/${doctorId}`, {
  headers: this.getHeaders()
}).pipe(
  tap(doctor => this.doctorsCache.set(doctorId, doctor)),
  catchError(this.handleError)
);
}

getNearbyDoctors(latitude: number, longitude: number, radius: number = 10): Observable<DoctorDTO[]> {
  const params = new HttpParams()
    .set('latitude', latitude.toString())
    .set('longitude', longitude.toString())
    .set('radius', radius.toString());

  return this.http.get<DoctorDTO[]>(`${this.apiUrl}/${this.currentPatientId}/patient/doctors/nearby`, {
    headers: this.getHeaders(),
    params
  }).pipe(
    catchError(this.handleError)
  );
}

getDoctorsBySpecialty(specialty: string): Observable<DoctorDTO[]> {
  return this.http.get<DoctorDTO[]>(`${this.apiUrl}/${this.currentPatientId}/doctors/profiles/search-by-specialization/${specialty}`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getRecommendedDoctors(): Observable<DoctorSearchResult[]> {
  return this.http.get<DoctorSearchResult[]>(`${this.apiUrl}/${this.currentPatientId}/patient/doctors/recommended`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

// =======================
// APPOINTMENT MANAGEMENT
// =======================

  getAppointments(status?: string, limit?: number, offset?: number): Observable<Appointment[]> {
    let params = new HttpParams();
    if (status) { params = params.set('status', status); }
    if (limit) { params = params.set('limit', limit.toString()); }
    if (offset) { params = params.set('offset', offset.toString()); }

    return this.http.get<ApiResponseDto>(`${this.apiUrl}/${this.currentPatientId}/patient/appointments`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          this.appointmentsCache = response.data;
          return response.data as Appointment[];
        } else {
          throw new Error(response.message || 'Failed to fetch appointments');
        }
      }),
      catchError(this.handleError)
    );
  }


getAppointmentById(appointmentId: string): Observable<Appointment> {
  // Check cache first
  const cachedAppointment = this.appointmentsCache.find(apt => apt.id === appointmentId);
  if (cachedAppointment) {
    return new Observable(observer => {
      observer.next(cachedAppointment);
      observer.complete();
    });
  }

  return this.http.get<Appointment>(`${this.apiUrl}/${this.currentPatientId}/patient/appointments/${appointmentId}`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getUpcomingAppointments(): Observable<Appointment[]> {
  return this.http.get<Appointment[]>(`${this.apiUrl}/${this.currentPatientId}/patient/appointments/upcoming`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getPastAppointments(): Observable<Appointment[]> {
  return this.http.get<Appointment[]>(`${this.apiUrl}/${this.currentPatientId}/patient/appointments/past`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getDoctorAvailableSlots(doctorId: string, date: string): Observable<AppointmentSlot[]> {
  const params = new HttpParams().set('date', date);

  return this.http.get<AppointmentSlot[]>(`${this.apiUrl}/${this.currentPatientId}/patient/doctors/${doctorId}/available-slots`, {
    headers: this.getHeaders(),
    params
  }).pipe(
    catchError(this.handleError)
  );
}

  bookAppointment(userId: number | undefined, appointmentRequest: AppointmentBookingRequest): Observable<ApiResponseDto> {
    return this.http.post<ApiResponseDto>(
      `${this.apiUrl}/service/${userId}/patient/appointments/book`,
      appointmentRequest
    );
  }

cancelAppointment(appointmentId: string, reason?: string): Observable<any> {
  const body = reason ? { reason } : {};

  return this.http.put(`${this.apiUrl}/${this.currentPatientId}/patient/appointments/${appointmentId}/cancel`, body, {
    headers: this.getHeaders()
  }).pipe(
    tap(() => this.clearAppointmentsCache()),
    catchError(this.handleError)
  );
}

rescheduleAppointment(appointmentId: string, rescheduleRequest: AppointmentRescheduleRequest): Observable<any> {
  return this.http.put(`${this.apiUrl}/${this.currentPatientId}/patient/appointments/${appointmentId}/reschedule`,
    rescheduleRequest, {
      headers: this.getHeaders()
    }).pipe(
    tap(() => this.clearAppointmentsCache()),
    catchError(this.handleError)
  );
}

confirmAppointmentReschedule(appointmentId: string, accept: boolean): Observable<any> {
  return this.http.put(`${this.apiUrl}/${this.currentPatientId}/patient/appointments/${appointmentId}/reschedule/confirm`,
    { accept }, {
      headers: this.getHeaders()
    }).pipe(
    tap(() => this.clearAppointmentsCache()),
    catchError(this.handleError)
  );
}

// =======================
// MEDICAL RECORDS
// =======================

// getMedicalRecords(filters?: MedicalRecordFilter): Observable<MedicalRecord> {
//   let params = new HttpParams();
//
//   if (filters) {
//     if (filters.doctorId) { params = params.set('doctorId', filters.doctorId); }
//     if (filters.recordType) { params = params.set('recordType', filters.recordType); }
//     if (filters.startDate) { params = params.set('startDate', filters.startDate); }
//     if (filters.endDate) { params = params.set('endDate', filters.endDate); }
//     if (filters.searchTerm) { params = params.set('searchTerm', filters.searchTerm); }
//     if (filters.limit) { params = params.set('limit', filters.limit.toString()); }
//     if (filters.offset) { params = params.set('offset', filters.offset.toString()); }
//   }
//
//   return this.http.get<MedicalRecord>(`${this.apiUrl}/patient/medical-records`, {
//     headers: this.getHeaders(),
//     params
//   }).pipe(
//     tap(records => this.medicalRecordsCache = records),
//     catchError(this.handleError)
//   );
// }

// getMedicalRecordById(recordId: string): Observable<MedicalRecord> {
//   // Check cache first
//   const cachedRecord = this.medicalRecordsCache.find(record => record.id === recordId);
//   if (cachedRecord) {
//     return new Observable(observer => {
//       observer.next(cachedRecord);
//       observer.complete();
//     });
//   }

//   return this.http.get<MedicalRecord>(`${this.apiUrl}/${this.currentPatientId}/patient/medical-records/${recordId}`, {
//     headers: this.getHeaders()
//   }).pipe(
//     catchError(this.handleError)
//   );
// }

getMedicalRecordsByDoctor(doctorId: string): Observable<MedicalRecord[]> {
  return this.http.get<MedicalRecord[]>(`${this.apiUrl}/${this.currentPatientId}/patient/medical-records/doctor/${doctorId}`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getMedicalRecordsSummary(): Observable<MedicalRecordSummary> {
  return this.http.get<MedicalRecordSummary>(`${this.apiUrl}/${this.currentPatientId}/patient/medical-records/summary`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

downloadMedicalRecord(recordId: string): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/${this.currentPatientId}/patient/medical-records/${recordId}/download`, {
    headers: this.getHeaders(),
    responseType: 'blob'
  }).pipe(
    catchError(this.handleError)
  );
}

shareMedicalRecord(recordId: string, doctorId: string, expiryDate?: string): Observable<any> {
  const body: any = { doctorId };
  if (expiryDate) {
  body.expiryDate = expiryDate;
}
  return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/medical-records/${recordId}/share`, body, {
  headers: this.getHeaders()
}).pipe(
  catchError(this.handleError)
);
}

// =======================
// PRESCRIPTIONS
// =======================

getPrescriptions(filters?: PrescriptionFilter): Observable<Prescription[]> {
  let params = new HttpParams();

  if (filters) {
    if (filters.doctorId) { params = params.set('doctorId', filters.doctorId); }
    if (filters.status) { params = params.set('status', filters.status); }
    if (filters.startDate) { params = params.set('startDate', filters.startDate); }
    if (filters.endDate) { params = params.set('endDate', filters.endDate); }
    if (filters.medicationName) { params = params.set('medicationName', filters.medicationName); }
    if (filters.limit) { params = params.set('limit', filters.limit.toString()); }
    if (filters.offset) { params = params.set('offset', filters.offset.toString()); }
  }

  return this.http.get<Prescription[]>(`${this.apiUrl}/${this.currentPatientId}/patient/prescriptions`, {
    headers: this.getHeaders(),
    params
  }).pipe(
    tap(prescriptions => this.prescriptionsCache = prescriptions),
    catchError(this.handleError)
  );
}

getPrescriptionById(prescriptionId: string): Observable<Prescription> {
  // Check cache first
  const cachedPrescription = this.prescriptionsCache.find(rx => rx.id === prescriptionId);
  if (cachedPrescription) {
    return new Observable(observer => {
      observer.next(cachedPrescription);
      observer.complete();
    });
  }

  return this.http.get<Prescription>(`${this.apiUrl}/${this.currentPatientId}/patient/prescriptions/${prescriptionId}`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getActivePrescriptions(): Observable<Prescription[]> {
  return this.http.get<Prescription[]>(`${this.apiUrl}/${this.currentPatientId}/patient/prescriptions/active`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getPrescriptionHistory(): Observable<Prescription[]> {
  return this.http.get<Prescription[]>(`${this.apiUrl}/${this.currentPatientId}/patient/prescriptions/history`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getPrescriptionsByDoctor(doctorId: string): Observable<Prescription[]> {
  return this.http.get<Prescription[]>(`${this.apiUrl}/${this.currentPatientId}/patient/prescriptions/doctor/${doctorId}`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getPrescriptionsSummary(): Observable<PrescriptionSummary> {
  return this.http.get<PrescriptionSummary>(`${this.apiUrl}/${this.currentPatientId}/patient/prescriptions/summary`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

markPrescriptionAsFilled(prescriptionId: string, pharmacyName?: string): Observable<any> {
  const body = pharmacyName ? { pharmacyName } : {};

  return this.http.put(`${this.apiUrl}/patient/prescriptions/${prescriptionId}/filled`, body, {
    headers: this.getHeaders()
  }).pipe(
    tap(() => this.clearPrescriptionsCache()),
    catchError(this.handleError)
  );
}

requestPrescriptionRefill(prescriptionId: string, notes?: string): Observable<any> {
  const body = notes ? { notes } : {};

  return this.http.post(`${this.apiUrl}/patient/prescriptions/${prescriptionId}/refill`, body, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

downloadPrescription(prescriptionId: string): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/${this.currentPatientId}/patient/prescriptions/${prescriptionId}/download`, {
    headers: this.getHeaders(),
    responseType: 'blob'
  }).pipe(
    catchError(this.handleError)
  );
}

// =======================
// DASHBOARD & ANALYTICS
// =======================

getDashboardSummary(): Observable<PatientDashboardSummary> {
  return this.http.get<PatientDashboardSummary>(`${this.apiUrl}/patient/dashboard/summary`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getHealthAlerts(): Observable<HealthAlert[]> {
  return this.http.get<HealthAlert[]>(`${this.apiUrl}/patient/health-alerts`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

markHealthAlertAsRead(alertId: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/patient/health-alerts/${alertId}/read`, {}, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getHealthMetrics(): Observable<PatientHealthMetrics> {
  return this.http.get<PatientHealthMetrics>(`${this.apiUrl}/patient/health-metrics`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

// =======================
// REVIEWS & RATINGS
// =======================

getDoctorReviews(doctorId: string): Observable<DoctorReview[]> {
  return this.http.get<DoctorReview[]>(`${this.apiUrl}/${this.currentPatientId}/patient/doctors/${doctorId}/reviews`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

submitDoctorReview(doctorId: string, rating: number, comment: string, anonymous: boolean = false): Observable<any> {
  return this.http.post(`${this.apiUrl}/${this.currentPatientId}/patient/doctors/${doctorId}/reviews`, {
    rating, comment, anonymous
  }, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

updateDoctorReview(reviewId: string, rating: number, comment: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/patient/reviews/${reviewId}`, {
    rating, comment
  }, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

deleteDoctorReview(reviewId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/patient/reviews/${reviewId}`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getMyReviews(): Observable<DoctorReview[]> {
  return this.http.get<DoctorReview[]>(`${this.apiUrl}/patient/my-reviews`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

// =======================
// MESSAGING & COMMUNICATION
// =======================

getMessageThreads(): Observable<MessageThread[]> {
  return this.http.get<MessageThread[]>(`${this.apiUrl}/patient/messages`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getMessageThread(threadId: string): Observable<MessageThread> {
  return this.http.get<MessageThread>(`${this.apiUrl}/patient/messages/${threadId}`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

sendMessage(recipientId: string, subject: string, content: string, isUrgent: boolean = false): Observable<any> {
  return this.http.post(`${this.apiUrl}/patient/messages/send`, {
    recipientId, subject, content, isUrgent
  }, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

replyToMessage(threadId: string, content: string, attachments?: File[]): Observable<any> {
  const formData = new FormData();
  formData.append('content', content);

  if (attachments && attachments.length > 0) {
  attachments.forEach((file, index) => {
    formData.append(`attachment_${index}`, file);
  });
}

  return this.http.post(`${this.apiUrl}/patient/messages/${threadId}/reply`, formData, {
  headers: this.getMultipartHeaders()
}).pipe(
  catchError(this.handleError)
);
}

markMessageAsRead(messageId: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/patient/messages/mark-read/${messageId}`, {}, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

deleteMessage(messageId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/patient/messages/${messageId}`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

// =======================
// DOCUMENTS & FILES
// =======================

getMedicalDocuments(): Observable<MedicalDocument[]> {
  return this.http.get<MedicalDocument[]>(`${this.apiUrl}/patients/documents`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

uploadMedicalDocument(file: File, documentType: string, description?: string): Observable<FileUploadResponse> {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);
  if (description) { formData.append('description', description); }

  return this.http.post<FileUploadResponse>(`${this.apiUrl}/patient/documents/upload`, formData, {
    headers: this.getMultipartHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

downloadMedicalDocument(documentId: string): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/patient/documents/${documentId}/download`, {
    headers: this.getHeaders(),
    responseType: 'blob'
  }).pipe(
    catchError(this.handleError)
  );
}

deleteMedicalDocument(documentId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/patient/documents/${documentId}`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

// =======================
// LOCATION & PREFERENCES
// =======================

updateLocation(locationData: LocationData): Observable<any> {
  return this.http.put(`${this.apiUrl}/${this.currentPatientId}/patient/location/update`, locationData, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getLocation(): Observable<LocationData> {
  return this.http.get<LocationData>(`${this.apiUrl}/${this.currentPatientId}/patient/location/get`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

updateNotificationPreferences(preferences: NotificationPreferences): Observable<any> {
  return this.http.put(`${this.apiUrl}/${this.currentPatientId}/patient/preferences/notifications`, preferences, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

getNotificationPreferences(): Observable<NotificationPreferences> {
  return this.http.get<NotificationPreferences>(`${this.apiUrl}/${this.currentPatientId}/patient/preferences/notifications`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

// =======================
// PAYMENT & BILLING
// =======================

getPaymentMethods(): Observable<PaymentMethod[]> {
  return this.http.get<PaymentMethod[]>(`${this.apiUrl}/patient/payment-methods`, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Observable<PaymentMethod> {
  return this.http.post<PaymentMethod>(`${this.apiUrl}/patient/payment-methods`, paymentMethod, {
    headers: this.getHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

  getPatientProfile(): Patient | null {
    // Check cache first
   return this.getCurrentPatient();
  }

  getPatientAppointments(
    patientId: number | undefined,
    status?: string,
  ): Observable<Appointment[]> {
    let params = new HttpParams();

    if (status) { params = params.set('status', status); }

    return this.http.get<Appointment[]>(`${this.apiUrl}/${patientId}/appointments`, { params }).pipe(
      map(appointments => appointments.map(apt => ({
        ...apt,
        appointmentDate: new Date(apt.appointmentDate),
        createdAt: new Date(apt.createdAt),
        updatedAt: new Date(apt.updatedAt)
      }))),
      catchError(this.handleError)
    );
  }

  // getPatientMedicalRecords(
  //   patientId: number | undefined,
  // ): Observable<MedicalRecord> {
  //   return this.http.get<MedicalRecord>(`${this.apiUrl}/${patientId}/medical-records`).pipe(
  //     map(records => records.map((record: { visitDate: string | number | Date; followUpDate: string | number | Date;
  //       createdAt: string | number | Date;
  //       updatedAt: string | number | Date;
  //       medications: any[]; tests: any[]; }) => ({
  //       ...record,
  //       visitDate: new Date(record.visitDate),
  //       followUpDate: record.followUpDate ? new Date(record.followUpDate) : undefined,
  //       createdAt: new Date(record.createdAt),
  //       updatedAt: new Date(record.updatedAt),
  //       medications: record.medications.map(med => ({
  //         ...med,
  //         startDate: new Date(med.startDate),
  //         endDate: med.endDate ? new Date(med.endDate) : undefined
  //       })),
  //       tests: record.tests.map(test => ({
  //         ...test,
  //         orderDate: new Date(test.orderDate),
  //         scheduledDate: test.scheduledDate ? new Date(test.scheduledDate) : undefined,
  //         completedDate: test.completedDate ? new Date(test.completedDate) : undefined,
  //         resultDate: test.resultDate ? new Date(test.resultDate) : undefined
  //       }))
  //     }))),
  //     catchError(this.handleError)
  //   );
  // }

  // getPatientPrescriptions(
  //   patientId: number | undefined,
  //   isActive?: boolean,
  // ): Observable<Prescription[]> {
  //   let params = new HttpParams();
  //
  //   if (isActive !== undefined) { params = params.set('isActive', isActive.toString()); }
  //
  //   return this.http.get<Prescription[]>(`${this.apiUrl}/${patientId}/prescriptions`, { params }).pipe(
  //     map(prescriptions => prescriptions.map(prescription => ({
  //       ...prescription,
  //       prescriptionDate: new Date(prescription.prescriptionDate),
  //       dispensedDate: prescription.dispensedDate ? new Date(prescription.dispensedDate) : undefined,
  //       createdAt: new Date(prescription.createdAt),
  //       updatedAt: new Date(prescription.updatedAt),
  //       medications: prescription.medications.map((med: { startDate: string | number | Date; endDate: string | number | Date; }) => ({
  //         ...med,
  //         startDate: new Date(med.startDate),
  //         endDate: med.endDate ? new Date(med.endDate) : undefined
  //       })),
  //       // tslint:disable-next-line:max-line-length
  //       refillRequests: prescription.refillRequests.map((request: { requestDate: string | number | Date;
  //         approvalDate: string | number | Date; }) => ({
  //         ...request,
  //         requestDate: new Date(request.requestDate),
  //         approvalDate: request.approvalDate ? new Date(request.approvalDate) : undefined
  //       }))
  //     }))),
  //     catchError(this.handleError)
  //   );
  // }
}
