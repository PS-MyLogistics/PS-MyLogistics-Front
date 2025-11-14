import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.post<OrderCreatedResponse>(`${this.apiUrl}/orders/create`, request);
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
