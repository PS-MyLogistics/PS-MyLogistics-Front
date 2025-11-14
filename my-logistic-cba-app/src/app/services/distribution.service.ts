import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DistributionCreationRequest, DistributionResponse } from '../models/distribution.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Create a new distribution
   */
  createDistribution(request: DistributionCreationRequest): Observable<DistributionResponse> {
    return this.http.post<DistributionResponse>(`${this.apiUrl}/distributions`, request);
  }

  /**
   * Get all distributions
   */
  getAllDistributions(): Observable<DistributionResponse[]> {
    return this.http.get<DistributionResponse[]>(`${this.apiUrl}/distributions/getAll`);
  }

  /**
   * Get distribution by ID
   */
  getDistributionById(id: string): Observable<DistributionResponse> {
    return this.http.get<DistributionResponse>(`${this.apiUrl}/distributions/${id}`);
  }

  /**
   * Get distribution for dealer by route ID
   */
  getDistributionForDealer(id: string): Observable<DistributionResponse> {
    return this.http.get<DistributionResponse>(`${this.apiUrl}/distributions/dealer/route/${id}`);
  }

  /**
   * Optimize routes for a distribution
   */
  optimizeRoutes(distributionId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/optimization/routes/${distributionId}`, {});
  }

  /**
   * Update distribution status
   */
  updateDistributionStatus(distributionId: string, status: string): Observable<DistributionResponse> {
    return this.http.put<DistributionResponse>(`${this.apiUrl}/distributions/${distributionId}/status`, { status });
  }
}
