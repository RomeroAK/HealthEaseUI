import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../authService/auth.service';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

export interface PaymentRequest {
  appointmentId: string;
  amount: number;
  paymentMethod: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api/payments';
  public currentUserId = this.authService.currentUserIdValue;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Payment service error:', error);
    return throwError(error);
  }

  // =======================
  // PAYMENT MANAGEMENT
  // =======================

  initiatePayment(request: PaymentRequest): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${this.currentUserId}/payments/initiate`,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getPayment(paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(
      `${this.apiUrl}/${this.currentUserId}/payments/${paymentId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getUserPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      `${this.apiUrl}/${this.currentUserId}/payments`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getPaymentStatus(paymentId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${this.currentUserId}/payments/${paymentId}/status`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =======================
  // UTILITY METHODS
  // =======================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  }

  getPaymentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      PENDING: '#F59E0B',
      COMPLETED: '#10B981',
      FAILED: '#EF4444',
      REFUNDED: '#6B7280'
    };
    return colors[status] || '#7f8c8d';
  }
}
