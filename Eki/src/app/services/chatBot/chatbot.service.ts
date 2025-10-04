import { Injectable } from '@angular/core';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {AuthService} from '../authService/auth.service';
import { environment } from '../../../environments/environment';

export interface ChatSession {
  id: string;
  userId: number;
  sessionStart: string;
  sessionEnd?: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: string;
  content: string;
  timestamp: string;
  messageType?: string;
  metadata?: any;
}

export interface ChatbotResponse {
  message: string;
  messageType: string;
  suggestions?: string[];
  doctorRecommendations?: any[];
  homeRemedies?: string[];
  severity?: string;
  metadata?: any;
  requiresHumanIntervention?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}/api/chatbot/openai/service`;
  private currentSessionSubject = new BehaviorSubject<ChatSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();
  public currentUserId ;
  private messagesCache: ChatMessage[] = [];

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
    console.error('Chatbot service error:', error);
    return throwError(error);
  }

  // =======================
  // CHAT SESSION MANAGEMENT
  // =======================

  startChatSession(): Observable<string> {
    return this.http.get<string>(
      `${this.apiUrl}/${this.currentUserId}/ask`,
      { headers: this.getHeaders() }
    );
  }

  sendMessage(message: string, sessionId?: string): Observable<ChatbotResponse> {
    const body = { message, sessionId };
    return this.http.post<ChatbotResponse>(
      `${this.apiUrl}/${this.currentUserId}/chatbot/message`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getChatHistory(sessionId?: string): Observable<ChatMessage[]> {
    let params = new HttpParams();
    if (sessionId) { params = params.set('sessionId', sessionId); }

    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/${this.currentUserId}/chatbot/history`,
      { headers: this.getHeaders(), params }
    ).pipe(
      tap(messages => this.messagesCache = messages),
      catchError(this.handleError)
    );
  }

  endChatSession(sessionId: string): Observable<void> {
    const params = new HttpParams().set('sessionId', sessionId);
    return this.http.post<void>(
      `${this.apiUrl}/${this.currentUserId}/chatbot/end-session`,
      {},
      { headers: this.getHeaders(), params }
    ).pipe(
      tap(() => this.currentSessionSubject.next(null)),
      catchError(this.handleError)
    );
  }

  // =======================
  // UTILITY METHODS
  // =======================

  getCurrentSession(): ChatSession | null {
    return this.currentSessionSubject.value;
  }

  clearCache(): void {
    this.messagesCache = [];
  }
}
