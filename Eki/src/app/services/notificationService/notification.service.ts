import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../authService/auth.service';
import {catchError, tap} from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notifications`;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public currentUserId;

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
    console.error('Notification service error:', error);
    return throwError(error);
  }

  // =======================
  // NOTIFICATION MANAGEMENT
  // =======================

  getUserNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.apiUrl}/${this.currentUserId}/notifications`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(notifications => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      }),
      catchError(this.handleError)
    );
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.apiUrl}/${this.currentUserId}/notifications/unread`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  markAsRead(notificationId: string): Observable<Notification> {
    return this.http.put<Notification>(
      `${this.apiUrl}/${this.currentUserId}/notifications/${notificationId}/read`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.getUserNotifications().subscribe()),
      catchError(this.handleError)
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${this.currentUserId}/notifications/read-all`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.getUserNotifications().subscribe()),
      catchError(this.handleError)
    );
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${this.currentUserId}/notifications/${notificationId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.getUserNotifications().subscribe()),
      catchError(this.handleError)
    );
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.apiUrl}/${this.currentUserId}/notifications/unread-count`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(result => this.unreadCountSubject.next(result.count)),
      catchError(this.handleError)
    );
  }

  // =======================
  // UTILITY METHODS
  // =======================

  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }
}
