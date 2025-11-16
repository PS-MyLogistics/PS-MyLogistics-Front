import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TenantInfo } from '../models/tenant.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get tenant information
   */
  getTenantInfo(): Observable<TenantInfo> {
    return this.http.get<TenantInfo>(`${this.apiUrl}/tenant/info`);
  }

  /**
   * Get tenant configuration by tenant ID
   */
  getTenantConfig(tenantId: string): Observable<{ [key: string]: string }> {
    return this.http.get<{ [key: string]: string }>(`${this.apiUrl}/api/config/${tenantId}`);
  }
}
