import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  username: string;
  password: string;
  tenantName: string;
}
export interface RegisterOwnerRequest {
  email: string;
  password: string;
  username: string;
  telephone: string;
  address: string;
  city: string;
  stateOrProvince: string;
  tenantName: string;
  tenantContactEmail: string;
  tenantContactPhone: string;
  tenantAddress: string;
}

export interface AuthResponse {
  token?: string;
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8081';

  register(registerData: RegisterOwnerRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData).pipe(
      tap(response => {
        if (response.success && response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginData, {
      withCredentials: true // Para manejar cookies de refreshToken
    }).pipe(
      tap(response => {
        if (response.success && response.token) {
          // Guardar token en localStorage
          localStorage.setItem('authToken', response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.clearSession();
      }),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh-token`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.success && response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  getMaskedEmail(username: string, tenantName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password/masked-email`, {
      username,
      tenantName
    }).pipe(catchError(this.handleError));
  }

  requestResetPassword(username: string, tenantName: string, email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/reset-password/request-token`, {
      username,
      tenantName,
      email
    }).pipe(catchError(this.handleError));
  }

  clearSession(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tenantName');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
