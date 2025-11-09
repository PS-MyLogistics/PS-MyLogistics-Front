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
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Error en ProductService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
