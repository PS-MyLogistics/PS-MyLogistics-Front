import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderCreationRequest, OrderCreatedResponse } from '../models/order.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Create a new order
   */
  createOrder(request: OrderCreationRequest): Observable<OrderCreatedResponse> {
    return this.http.post<OrderCreatedResponse>(`${this.apiUrl}/orders/create`, request);
  }
}
