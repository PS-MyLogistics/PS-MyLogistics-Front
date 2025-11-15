import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderCreationRequest, OrderCreatedResponse, Order } from '../models/order.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all orders
   */
  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/getAll`);
  }

  /**
   * Get order by ID
   */
  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  /**
   * Create a new order
   */
  createOrder(request: OrderCreationRequest): Observable<OrderCreatedResponse> {
    return this.http.post<OrderCreatedResponse>(`${this.apiUrl}/orders/create`, request)
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
        case 500:
          // Check if it's a geocoding error (customer creation error)
          if (error.error?.message?.includes('geocod') ||
              error.error?.message?.includes('address') ||
              error.error?.message?.includes('dirección')) {
            errorMessage = 'No se pudo validar la dirección del cliente. Por favor verifica que la dirección, ciudad, provincia y código postal sean correctos y correspondan a una ubicación real.';
          } else {
            errorMessage = error.error?.message || 'Error del servidor al crear el pedido.';
          }
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Update an order (for assigning dealer/vehicle)
   */
  updateOrder(orderId: string, updates: Partial<OrderCreationRequest>): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/update/${orderId}`, updates);
  }

  /**
   * Assign dealer to order
   */
  assignDealer(orderId: string, dealerId: string, vehicleId?: string): Observable<Order> {
    return this.updateOrder(orderId, { dealerId, vehicleId });
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/update/${orderId}`, { status });
  }
}
