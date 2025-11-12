import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ZoneRequest, ZoneResponse } from '../models/zone.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all zones in the tenant
   */
  getAll(): Observable<ZoneResponse[]> {
    return this.http.get<ZoneResponse[]>(`${this.apiUrl}/zones/getAll`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get zone by ID
   */
  getById(id: string): Observable<ZoneResponse> {
    return this.http.get<ZoneResponse>(`${this.apiUrl}/zones/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new zone
   */
  create(request: ZoneRequest): Observable<ZoneResponse> {
    return this.http.post<ZoneResponse>(`${this.apiUrl}/zones/create`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update an existing zone
   */
  update(id: string, request: ZoneRequest): Observable<ZoneResponse> {
    return this.http.put<ZoneResponse>(`${this.apiUrl}/zones/update/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a zone
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/zones/delete/${id}`)
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
          errorMessage = 'Zona no encontrada.';
          break;
        case 409:
          errorMessage = error.error?.message || 'Ya existe una zona con ese nombre.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Error en ZoneService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
