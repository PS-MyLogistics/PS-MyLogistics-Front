import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto, RegisterUserInTenantRequest, EditUserInTenantRequest } from '../models/user.model';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Get all users in the tenant
   */
  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/users/getAll`);
  }

  /**
   * Create a new internal user in the tenant
   */
  createInternalUser(request: RegisterUserInTenantRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/users/createInternalUser`, request);
  }

  /**
   * Edit an existing user in the tenant
   */
  editInternalUser(request: EditUserInTenantRequest): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.apiUrl}/users/editInternalUser`, request);
  }
}
