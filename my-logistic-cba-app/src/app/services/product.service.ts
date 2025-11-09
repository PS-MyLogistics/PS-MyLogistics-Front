import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductResponse, ProductCreationRequest } from '../models/product.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Create a new product
   */
  createProduct(request: ProductCreationRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.apiUrl}/products/create`, request);
  }
}
