import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../enviroments/enviroment';

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

export interface MaskedEmailResponse {
  success: boolean;
  mailEncoded: string;
  message?: string;
}

export interface ResetPasswordConfirmResponse {
  success: boolean;
  mailEncoded: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

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

  getMaskedEmail(username: string, tenantName: string): Observable<MaskedEmailResponse> {
    return this.http.post<MaskedEmailResponse>(`${this.apiUrl}/auth/reset-password/masked-email`, {
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

  confirmResetPassword(token: string, newPassword: string, username: string, tenantName: string): Observable<ResetPasswordConfirmResponse> {
    const requestBody = {
      token,
      newPassword,
      username,
      tenantName
    };
    console.log('AuthService - confirmResetPassword URL:', `${this.apiUrl}/auth/reset-password/confirm`);
    console.log('AuthService - confirmResetPassword request body:', requestBody);
    console.log('AuthService - Token length:', token.length);
    console.log('AuthService - Username:', username, '| TenantName:', tenantName);
    return this.http.post<ResetPasswordConfirmResponse>(`${this.apiUrl}/auth/reset-password/confirm`, requestBody)
      .pipe(catchError(this.handleError));
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
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
          break;
        case 400:
          // Bad Request - puede tener mensaje personalizado del backend
          errorMessage = error.error?.message || 'Datos inválidos. Verifica la información ingresada.';
          break;
        case 401:
          // Unauthorized - contraseña inválida u otras autenticaciones fallidas
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message && error.message.includes('Invalid password')) {
            errorMessage = 'Contraseña incorrecta. Verifica e intenta nuevamente.';
          } else {
            errorMessage = 'Credenciales inválidas. Verifica tus datos.';
          }
          break;
        case 403:
          // Forbidden - puede ser tenant pendiente de verificación
          if (error.error?.message && error.error.message.includes('pending verification')) {
            errorMessage = 'Tu cuenta está pendiente de verificación. Revisa tu correo electrónico.';
          } else {
            errorMessage = error.error?.message || 'No tienes permisos para realizar esta acción.';
          }
          break;
        case 404:
          errorMessage = error.error?.message || 'Recurso no encontrado.';
          break;
        case 409:
          // Conflict - usuario o tenant ya existe
          errorMessage = error.error?.message || 'El usuario o empresa ya existe.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;
        default:
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Error en AuthService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
