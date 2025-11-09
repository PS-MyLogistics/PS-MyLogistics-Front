import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Customer, CustomerCreationRequest } from '../models/customer.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all customers
   */
  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers/getAll`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get customer by ID
   */
  getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new customer
   */
  createCustomer(request: CustomerCreationRequest): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers/create`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update an existing customer
   */
  updateCustomer(id: string, request: CustomerCreationRequest): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/customers/update/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a customer
   */
  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/customers/delete/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';

    console.error('Error completo en CustomerService:', error);
    console.error('error.error:', error.error);
    console.error('error.message:', error.message);

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
          errorMessage = 'Cliente no encontrado.';
          break;
        case 409:
          errorMessage = error.error?.message || 'Ya existe un cliente con esos datos.';
          break;
        case 500:
          // Most 500 errors when creating/updating customers are geocoding errors
          // Since the backend wraps the real error in a generic message,
          // we'll show a helpful message about address validation
          errorMessage = 'No se pudo validar la dirección ingresada. Por favor verifica que la dirección, ciudad, provincia y código postal sean correctos y correspondan a una ubicación real.';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Mensaje final:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
