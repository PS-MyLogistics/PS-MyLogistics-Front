import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { DatabaseService } from './database.service';

export interface LoginRequest {
  username: string;
  password: string;
  tenantName: string;
}

export interface AuthResponse {
  token?: string;
  success: boolean;
  message?: string;
}

export interface RegisterOwnerRequest {
  email: string;
  password: string;
  username: string;
  telephone: string;
  address: string;
  city: string;
  stateOrProvince: string;
  tenantName: string;
  tenantContactEmail: string;
  tenantContactPhone: string;
  tenantAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private router: Router,
    private db: DatabaseService
  ) {}

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return from(
      this.db.usuarios
        .where('username').equals(loginData.username)
        .and(u => u.password === loginData.password && u.tenantName === loginData.tenantName)
        .first()
    ).pipe(
      delay(800),
      map(usuario => {
        if (usuario) {
          const token = this.generateToken();
          const response: AuthResponse = {
            success: true,
            token: token,
            message: 'Login exitoso'
          };

          localStorage.setItem('authToken', token);
          localStorage.setItem('currentUser', JSON.stringify({
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            role: usuario.role,
            tenantName: usuario.tenantName
          }));

          return response;
        } else {
          throw new Error('Usuario, contraseña o tenant incorrectos');
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  register(registerData: RegisterOwnerRequest): Observable<AuthResponse> {
    return from(
      this.db.usuarios
        .where('username').equals(registerData.username)
        .or('email').equals(registerData.email)
        .first()
    ).pipe(
      delay(800),
      map(async (usuarioExistente) => {
        if (usuarioExistente) {
          throw new Error('El usuario o email ya existe');
        }

        const nuevoUsuario = {
          username: registerData.username,
          password: registerData.password,
          email: registerData.email,
          tenantName: registerData.tenantName,
          telephone: registerData.telephone,
          address: registerData.address,
          city: registerData.city,
          stateOrProvince: registerData.stateOrProvince,
          role: 'OWNER',
          createdAt: new Date()
        };

        const id = await this.db.usuarios.add(nuevoUsuario);
        
        const token = this.generateToken();
        const response: AuthResponse = {
          success: true,
          token: token,
          message: 'Registro exitoso'
        };

        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify({
          id: id,
          username: nuevoUsuario.username,
          email: nuevoUsuario.email,
          role: nuevoUsuario.role,
          tenantName: nuevoUsuario.tenantName
        }));

        return response;
      }),
      map(promise => from(promise)),
      delay(1500),
      catchError(error => throwError(() => error))
    ) as any;
  }
  getMaskedEmail(username: string, tenantName: string): Observable<any> {
  return from(
    this.db.usuarios
      .where('username').equals(username)
      .and(u => u.tenantName === tenantName)
      .first()
  ).pipe(
    delay(500),
    map(usuario => {
      if (usuario) {
        // Enmascarar el email: ejemplo@email.com -> e****o@email.com
        const email = usuario.email;
        const [local, domain] = email.split('@');
        const maskedLocal = local[0] + '****' + local[local.length - 1];
        const maskedEmail = maskedLocal + '@' + domain;
        
        return {
          success: true,
          mailEncoded: maskedEmail
        };
      } else {
        throw new Error('Usuario no encontrado');
      }
    }),
    catchError(error => throwError(() => error))
  );
}

requestResetPassword(username: string, tenantName: string, email: string): Observable<void> {
  return from(
    this.db.usuarios
      .where('username').equals(username)
      .and(u => u.tenantName === tenantName && u.email === email)
      .first()
  ).pipe(
    delay(1000),
    map(usuario => {
      if (usuario) {
        // Aquí simularías el envío del email
        console.log('Email de recuperación enviado a:', email);
        alert('Se ha enviado un email de recuperación (simulado)');
      } else {
        throw new Error('Los datos no coinciden');
      }
    }),
    catchError(error => throwError(() => error))
  );
}

  logout(): Observable<AuthResponse> {
    this.clearSession();
    return from(Promise.resolve({ success: true, message: 'Logout exitoso' })).pipe(delay(500));
  }

  clearSession(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('tenantName');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private generateToken(): string {
    return 'token-' + Math.random().toString(36).substr(2) + '-' + Date.now();
  }
}