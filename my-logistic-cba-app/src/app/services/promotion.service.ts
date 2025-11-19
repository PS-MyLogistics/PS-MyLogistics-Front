import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerWithLastOrder, PromotionalEmailRequest, PromotionalEmailResponse } from '../models/promotion.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private apiUrl = `${environment.apiUrl}/customers`;
  private promotionUrl = `${environment.apiUrl}/promotions`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene clientes con información de su último pedido
   * @param daysSinceLastOrder Número de días desde el último pedido (0 = todos los clientes con pedidos)
   */
  getCustomersWithLastOrder(daysSinceLastOrder: number = 0): Observable<CustomerWithLastOrder[]> {
    let params = new HttpParams();
    if (daysSinceLastOrder > 0) {
      params = params.set('daysSinceLastOrder', daysSinceLastOrder.toString());
    }

    return this.http.get<CustomerWithLastOrder[]>(`${this.apiUrl}/with-last-order`, { params });
  }

  /**
   * Envía un email promocional a una lista de clientes
   */
  sendPromotionalEmail(request: PromotionalEmailRequest): Observable<PromotionalEmailResponse> {
    return this.http.post<PromotionalEmailResponse>(`${this.promotionUrl}/send-email`, request);
  }
}
