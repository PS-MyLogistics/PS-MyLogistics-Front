import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';

export interface NotifyCustomerRequest {
  customerId: string;
  orderNumber: string;
  estimatedPosition: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Notify customer that delivery is on the way
   */
  notifyCustomerDeliveryStarting(request: NotifyCustomerRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notifications/delivery-starting`, request);
  }
}
