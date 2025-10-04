import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {AuthService} from '../authService/auth.service';
import {
  Appointment,
  Doctor, DoctorSearchCriteria, DoctorSearchResult,
  DoctorSpecialization,
  DoctorStatistics,
  MedicalRecord,
  Medication, PatientAppointment,
  WorkingHours
} from '../../model/doctor.related.interfaces';
import {catchError, map, shareReplay, tap} from 'rxjs/operators';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Patient} from '../../model/patient.model';
import {ApiResponseDto} from '../../model/ApiResponseDto';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {


  private apiUrl = `${environment.apiUrl}/api/doctors`;
  private currentDoctorSubject = new BehaviorSubject<Doctor | null>(null);
  private doctorsCache = new Map<string, Doctor>();
  private currentDoctorId;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.currentDoctorId = this.authService.currentUserIdValue;
    this.loadCurrentDoctor();
  }

  loadCurrentDoctor(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.role === 'doctor') {
      this.getProfile().subscribe({
        next: (doctor) => {
          this.currentDoctorSubject.next(doctor);
        },
        error: (error) => {
          console.error('Error loading current patient:', error);
          this.currentDoctorSubject.next(null);
        }
      });
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Patient service error:', error);
    return throwError(error);
  }

  getProfile(): Observable<Doctor> {
    return this.http.get<ApiResponseDto>(`${this.apiUrl}/${this.currentDoctorId}/doctor/profiles/get-by-id`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data as Doctor), // 👈 Extract and cast the doctor object
      tap(doctor => this.currentDoctorSubject.next(doctor)),
      catchError(this.handleError)
    );
  }

  getDoctorProfile(doctorId: number): Observable<Doctor> {
    return this.http.get<ApiResponseDto>(`${this.apiUrl}/${doctorId}/doctor/profiles/get-by-id`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data as Doctor), // 👈 Extract and cast the doctor object
      catchError(this.handleError)
    );
  }

  updateProfile(profileData: any): Observable<Doctor> {
    return this.http.put<ApiResponseDto>( `${this.apiUrl}/${this.currentDoctorId}/doctor/profiles/update` , profileData,  {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data as Doctor),
      tap(doctor => {
        this.currentDoctorSubject.next(doctor);
      }),
      catchError(this.handleError)
    );
  }
  getAvailableTimeSlots(doctorId: number, date1: Date): void{
    const dateStr = date1.toISOString().split('T')[0];
    this.http.get<ApiResponseDto>(`${this.apiUrl}/${doctorId}/doctor/appointments/available-slots`, {
      headers: this.getHeaders(),
      params: new HttpParams().set('date', dateStr)
    }).pipe(
      map(response => response.data as string[]),
      catchError(this.handleError)
    ).subscribe({
      next: (slots) => {
        console.log('Available slots:', slots);
      },
      error: (error) => {
        console.error('Error fetching available slots:', error);
      }
    });
  }

  /**
   * Get all appointments for a doctor by doctorId
   */
  getDoctorAppointments(doctorId: string): Observable<PatientAppointment[]> {
    return this.http.get<PatientAppointment[]>(`${this.apiUrl}/${doctorId}/doctor/appointments/get-all`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Confirm a scheduled appointment by appointmentId
   */
  confirmAppointment(appointmentId: string): Observable<any> {
    // TODO: Implement API call to confirm an appointment
    return of({ success: true }); // Placeholder: returns success
  }

}
