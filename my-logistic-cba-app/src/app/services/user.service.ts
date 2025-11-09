import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserDto, RegisterUserInTenantRequest, EditUserInTenantRequest } from '../models/user.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all users in the tenant
   */
  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/users/getAll`);
  }

  /**
   * Get current logged-in user information
   */
  getCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/users/me`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new internal user in the tenant
   */
  createInternalUser(request: RegisterUserInTenantRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/users/createInternalUser`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Edit an existing user in the tenant
   */
  editInternalUser(request: EditUserInTenantRequest): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.apiUrl}/users/editInternalUser`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
          break;
        case 400:
          errorMessage = error.error?.message || error.error?.error || 'Datos inválidos. Verifica la información ingresada.';
          break;
        case 401:
          errorMessage = 'No tienes autorización para realizar esta acción.';
          break;
        case 403:
          errorMessage = error.error?.message || 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 409:
          errorMessage = error.error?.message || 'Ya existe un recurso con esos datos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Error en UserService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
