import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, Subscription } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../enviroments/enviroment';
import { Role } from '../models/user.model';

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
  private refreshTokenSubscription?: Subscription;

  register(registerData: RegisterOwnerRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData).pipe(
      tap(response => {
        if (response.success && response.token) {
          localStorage.setItem('authToken', response.token);
          // Start automatic token refresh
          this.scheduleTokenRefresh();
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
          // Start automatic token refresh
          this.scheduleTokenRefresh();
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
        // Stop automatic token refresh before clearing session
        this.stopTokenRefresh();
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
    // Stop automatic token refresh
    this.stopTokenRefresh();
    localStorage.removeItem('authToken');
    localStorage.removeItem('tenantName');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Decode JWT token and extract payload
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get token expiration time in milliseconds from now
   * Returns null if token is invalid or already expired
   */
  private getTokenExpirationTime(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    // exp is in seconds, convert to milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    // If already expired, return null
    return timeUntilExpiration > 0 ? timeUntilExpiration : null;
  }

  /**
   * Schedule automatic token refresh
   * Refreshes 1 minute before expiration
   */
  private scheduleTokenRefresh(): void {
    // Cancel any existing refresh subscription
    this.stopTokenRefresh();

    const timeUntilExpiration = this.getTokenExpirationTime();
    if (!timeUntilExpiration) {
      return;
    }

    // Schedule refresh 1 minute (60000ms) before expiration
    // If token expires in less than 1 minute, refresh immediately
    const refreshTime = Math.max(timeUntilExpiration - 60000, 0);

    this.refreshTokenSubscription = timer(refreshTime).pipe(
      switchMap(() => this.refreshToken())
    ).subscribe({
      next: (response) => {
        if (response.success && response.token) {
          // Schedule next refresh after successful refresh
          this.scheduleTokenRefresh();
        }
      },
      error: (error) => {
        console.error('Token refresh failed:', error);
        // If refresh fails, clear session and redirect to login
        this.clearSession();
      }
    });
  }

  /**
   * Stop automatic token refresh
   */
  private stopTokenRefresh(): void {
    if (this.refreshTokenSubscription) {
      this.refreshTokenSubscription.unsubscribe();
      this.refreshTokenSubscription = undefined;
    }
  }

  /**
   * Get current user's username from token
   */
  getCurrentUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.sub || null;
  }

  /**
   * Get current user's roles from localStorage
   * Since JWT token doesn't contain roles, we store them separately
   */
  getCurrentUserRoles(): Role[] {
    const rolesStr = localStorage.getItem('userRoles');
    if (!rolesStr) return [];

    try {
      const roles = JSON.parse(rolesStr) as Role[];
      return roles;
    } catch (error) {
      console.error('Error parsing user roles:', error);
      return [];
    }
  }

  /**
   * Save user roles to localStorage
   */
  setUserRoles(roles: Role[]): void {
    localStorage.setItem('userRoles', JSON.stringify(roles));
  }

  /**
   * Check if current user has a specific role
   */
  hasRole(role: Role): boolean {
    const roles = this.getCurrentUserRoles();
    return roles.includes(role);
  }

  /**
   * Get the highest priority role for display purposes
   * Priority: SUPERADMIN > OWNER > ADMIN > DEALER
   */
  getDisplayRole(): string {
    const roles = this.getCurrentUserRoles();

    if (roles.includes(Role.SUPERADMIN)) return 'Superadministrador';
    if (roles.includes(Role.OWNER)) return 'Propietario';
    if (roles.includes(Role.ADMIN)) return 'Administrador';
    if (roles.includes(Role.DEALER)) return 'Repartidor';

    return 'Usuario';
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
