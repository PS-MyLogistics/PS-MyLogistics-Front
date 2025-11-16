import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VehicleRequest, VehicleResponse } from '../models/vehicle.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all vehicles in the tenant
   */
  getAll(): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(`${this.apiUrl}/vehicles/getAll`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get vehicle by ID
   */
  getById(id: string): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.apiUrl}/vehicles/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new vehicle
   */
  create(request: VehicleRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(`${this.apiUrl}/vehicles/create`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update an existing vehicle
   */
  update(id: string, request: VehicleRequest): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.apiUrl}/vehicles/update/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a vehicle
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vehicles/delete/${id}`)
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
          errorMessage = 'Vehículo no encontrado.';
          break;
        case 409:
          errorMessage = error.error?.message || 'Ya existe un vehículo con esa placa.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Error en VehicleService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
