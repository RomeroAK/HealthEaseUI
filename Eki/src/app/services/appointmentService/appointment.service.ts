import { Injectable } from '@angular/core';
import {Appointment} from '../../model/doctor.related.interfaces';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {AuthService} from '../authService/auth.service';
import {catchError, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5001/api/appointments';
  private currentUserAppointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public currentUserAppointments$ = this.currentUserAppointmentsSubject.asObservable();
  public currentUserId;
  private appointmentsCache: Appointment[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.currentUserId  = this.authService.currentUserIdValue;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Appointment service error:', error);
    return throwError(error);
  }

  // =======================
  // APPOINTMENT BOOKING
  // =======================

  bookAppointment(bookingData: any): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.apiUrl}/${this.currentUserId}/appointments/book`,
      bookingData,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  getAppointment(appointmentId: string): Observable<Appointment> {
    return this.http.get<Appointment>(
      `${this.apiUrl}/${this.currentUserId}/appointments/${appointmentId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getUserAppointments(status?: string): Observable<Appointment[]> {
    let params = new HttpParams();
    if (status) { params = params.set('status', status); }

    return this.http.get<Appointment[]>(
      `${this.apiUrl}/${this.currentUserId}/appointments`,
      { headers: this.getHeaders(), params }
    ).pipe(
      tap(appointments => {
        this.appointmentsCache = appointments;
        this.currentUserAppointmentsSubject.next(appointments);
      }),
      catchError(this.handleError)
    );
  }

  getUpcomingAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/${this.currentUserId}/appointments/upcoming`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getPastAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/${this.currentUserId}/appointments/past`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  cancelAppointment(appointmentId: string, reason?: string): Observable<Appointment> {
    const body = reason ? { reason } : {};
    return this.http.put<Appointment>(
      `${this.apiUrl}/${this.currentUserId}/appointments/${appointmentId}/cancel`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  rescheduleAppointment(appointmentId: string, newDate: string, newStartTime: string): Observable<Appointment> {
    const data = { appointmentDate: newDate, startTime: newStartTime };
    return this.http.put<Appointment>(
      `${this.apiUrl}/${this.currentUserId}/appointments/${appointmentId}/reschedule`,
      data,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.clearCache()),
      catchError(this.handleError)
    );
  }

  getAvailableTimeSlots(doctorId: string, date: string): Observable<any[]> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('date', date);

    return this.http.get<any[]>(
      `${this.apiUrl}/${this.currentUserId}/appointments/available-slots`,
      { headers: this.getHeaders(), params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =======================
  // UTILITY METHODS
  // =======================

  private clearCache(): void {
    this.appointmentsCache = [];
  }

  formatAppointmentDateTime(appointment: Appointment): string {
    const date = new Date(appointment.appointmentDate);
    return `${date.toLocaleDateString()} at ${appointment.startTime}`;
  }

  isUpcoming(appointment: Appointment): boolean {
    const appointmentDate = new Date(`${appointment.appointmentDate} ${appointment.startTime}`);
    return appointmentDate > new Date();
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      SCHEDULED: '#3B82F6',
      CONFIRMED: '#10B981',
      COMPLETED: '#6B7280',
      CANCELLED: '#EF4444',
      NO_SHOW: '#F59E0B'
    };
    return colors[status] || '#7f8c8d';
  }
}
