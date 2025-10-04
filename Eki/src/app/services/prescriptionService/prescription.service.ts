import { Injectable } from '@angular/core';
import {AuthService} from '../authService/auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {Prescription} from '../../model/user.model';
import { environment } from '../../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  private apiUrl = `${environment.apiUrl}/api/prescriptions`;
  private currentUserPrescriptionsSubject = new BehaviorSubject<Prescription[]>([]);
  public currentUserPrescriptions$ = this.currentUserPrescriptionsSubject.asObservable();
  public currentUserId;
  private prescriptionsCache: Prescription[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.currentUserIdValue;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Prescription service error:', error);
    return throwError(error);
  }

// =======================
// PRESCRIPTION MANAGEMENT
// =======================

  getUserPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(
      `${this.apiUrl}/${this.currentUserId}/prescriptions`,
      {headers: this.getHeaders()}
    ).pipe(
      tap(prescriptions => {
        this.prescriptionsCache = prescriptions;
        this.currentUserPrescriptionsSubject.next(prescriptions);
      }),
      catchError(this.handleError)
    );
  }

  getPrescription(prescriptionId: string): Observable<Prescription> {
    return this.http.get<Prescription>(
      `${this.apiUrl}/${this.currentUserId}/prescriptions/${prescriptionId}`,
      {headers: this.getHeaders()}
    ).pipe(
      catchError(this.handleError)
    );
  }

  getActivePrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(
      `${this.apiUrl}/${this.currentUserId}/prescriptions/active`,
      {headers: this.getHeaders()}
    ).pipe(
      catchError(this.handleError)
    );
  }

  getPrescriptionsByAppointment(appointmentId: string): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(
      `${this.apiUrl}/${this.currentUserId}/prescriptions/appointment/${appointmentId}`,
      {headers: this.getHeaders()}
    ).pipe(
      catchError(this.handleError)
    );
  }

  downloadPrescription(prescriptionId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${this.currentUserId}/prescriptions/${prescriptionId}/download`,
      {headers: this.getHeaders(), responseType: 'blob'}
    ).pipe(
      catchError(this.handleError)
    );
  }

// =======================
// UTILITY METHODS
// =======================

  private clearCache(): void {
    this.prescriptionsCache = [];
  }

  getPrescriptionStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      ACTIVE: '#2ecc71',
      FILLED: '#3498db',
      EXPIRED: '#e74c3c',
      CANCELLED: '#95a5a6'
    };
    return colors[status] || '#7f8c8d';
  }
}
