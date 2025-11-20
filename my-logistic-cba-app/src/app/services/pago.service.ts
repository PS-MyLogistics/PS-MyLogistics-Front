import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import {
  PagoResponse,
  FacturaResponse,
  CrearFacturaYPreferenciaRequest
} from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Crear factura y preferencia de pago para 1 mes
   */
  crearFacturaYPreferencia1Mes(request: CrearFacturaYPreferenciaRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.apiUrl}/api/pagos/facturaAndpreference/1Month`, request);
  }

  /**
   * Crear factura y preferencia de pago para 3 meses
   */
  crearFacturaYPreferencia3Meses(request: CrearFacturaYPreferenciaRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.apiUrl}/api/pagos/facturaAndpreference/3Month`, request);
  }

  /**
   * Crear factura y preferencia de pago para 6 meses
   */
  crearFacturaYPreferencia6Meses(request: CrearFacturaYPreferenciaRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.apiUrl}/api/pagos/facturaAndpreference/6Month`, request);
  }

  /**
   * Listar facturas
   */
  listarFacturas(estado?: string): Observable<FacturaResponse[]> {
    const params: any = {};
    if (estado) {
      params.estado = estado;
    }
    return this.http.get<FacturaResponse[]>(`${this.apiUrl}/api/facturacion`, { params });
  }

  /**
   * Obtener factura por ID
   */
  obtenerFacturaPorId(id: string): Observable<FacturaResponse> {
    return this.http.get<FacturaResponse>(`${this.apiUrl}/api/facturacion/${id}`);
  }

  /**
   * Anular factura
   */
  anularFactura(id: string): Observable<FacturaResponse> {
    return this.http.put<FacturaResponse>(`${this.apiUrl}/api/facturacion/${id}/anular`, {});
  }
}