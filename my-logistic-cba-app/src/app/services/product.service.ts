import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductResponse, ProductCreationRequest } from '../models/product.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all products
   */
  getAll(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.apiUrl}/products/getAll`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get product by ID
   */
  getById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/products/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new product
   */
  createProduct(request: ProductCreationRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.apiUrl}/products/create`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update an existing product
   */
  updateProduct(id: string, request: Partial<ProductCreationRequest>): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/products/update/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a product
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/delete/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Check if it's a unique constraint violation for SKU
      const errorString = JSON.stringify(error.error);
      if (errorString.includes('UKQ1MAFXN973LDQ80M1IRP3MPVQ') ||
          errorString.includes('Unique index or primary key violation') ||
          errorString.includes('SKU')) {
        errorMessage = 'Ya existe un producto con ese SKU. Por favor ingresa un SKU único o déjalo vacío solo si es el primer producto sin SKU.';
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
            break;
          case 400:
            errorMessage = error.error?.message || error.error?.error || 'Datos inválidos.';
            break;
          case 401:
            errorMessage = 'No tienes autorización para realizar esta acción.';
            break;
          case 403:
            errorMessage = error.error?.message || 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            errorMessage = 'Producto no encontrado.';
            break;
          case 409:
            errorMessage = error.error?.message || 'Ya existe un producto con esos datos.';
            break;
          case 500:
            errorMessage = error.error?.message || 'Error interno del servidor. Intenta nuevamente más tarde.';
            break;
          default:
            errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
        }
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
