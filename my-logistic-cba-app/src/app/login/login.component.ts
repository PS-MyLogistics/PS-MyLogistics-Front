import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
          <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <div class="card shadow-lg border-0">
              <!-- Header -->
              <div class="card-header bg-gradient text-white text-center py-4">
                <!-- Logo redondo -->
                <div class="logo-circle mx-auto mb-3">
                  <!-- Reemplaza con tu imagen: <img src="assets/logo.png" alt="Logo" class="logo-img rounded-circle" /> -->
                    <img src="logo.png" alt="Logo" class="logo-img rounded-circle" />
                </div>
                <h5 class="text-black">Ingresa a tu cuenta</h5>
              </div>

              <!-- Body -->
              <div class="card-body p-4">
                <!-- Alertas -->
                <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
                  <strong>Error:</strong> {{ errorMessage }}
                  <button type="button" class="btn-close" (click)="errorMessage = ''" aria-label="Close"></button>
                </div>

                <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
                  {{ successMessage }}
                  <button type="button" class="btn-close" (click)="successMessage = ''" aria-label="Close"></button>
                </div>

                <!-- Nombre del Tenant -->
                <div class="mb-3">
                  <label for="tenantName" class="form-label fw-semibold">Empresa / Tenant</label>
                  <div class="input-group">
                    <span class="input-group-text bg-white">
                      <svg class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      id="tenantName"
                      [(ngModel)]="tenantName"
                      placeholder="nombre-empresa"
                      required
                      [disabled]="isLoading"
                    />
                  </div>
                </div>

                <!-- Usuario -->
                <div class="mb-3">
                  <label for="username" class="form-label fw-semibold">Usuario</label>
                  <div class="input-group">
                    <span class="input-group-text bg-white">
                      <svg class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      id="username"
                      [(ngModel)]="username"
                      placeholder="tu_usuario"
                      required
                      [disabled]="isLoading"
                    />
                  </div>
                </div>

                <!-- Contraseña -->
                <div class="mb-3">
                  <label for="password" class="form-label fw-semibold">Contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text bg-white">
                      <svg class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </span>
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      [(ngModel)]="password"
                      placeholder="••••••••"
                      required
                      [disabled]="isLoading"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      (click)="togglePassword()"
                      [disabled]="isLoading"
                    >
                      <svg *ngIf="!showPassword" class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <svg *ngIf="showPassword" class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Recordarme y Olvidé contraseña -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      [(ngModel)]="rememberMe"
                      [disabled]="isLoading"
                    />
                    <label class="form-check-label" for="rememberMe">
                      Recordarme
                    </label>
                  </div>
                  <button 
                    type="button"
                    class="btn btn-link p-0 text-decoration-none"
                    (click)="forgotPassword()"
                    [disabled]="isLoading"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <!-- Botón de login -->
                <button
                  type="button"
                  class="btn btn-primary btn-lg w-100 mb-3 btn-gradient"
                  (click)="onSubmit()"
                  [disabled]="isLoading || !tenantName || !username || !password"
                >
                  <span *ngIf="!isLoading">Iniciar Sesión</span>
                  <span *ngIf="isLoading">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Iniciando sesión...
                  </span>
                </button>

                <!-- Registro -->
                <div class="text-center">
                  <span class="text-muted">¿No tienes cuenta? </span>
                  <button 
                    type="button"
                    class="btn btn-link p-0 text-decoration-none"
                    (click)="goToRegister()"
                    [disabled]="isLoading"
                  >
                    Regístrate aquí
                  </button>
                </div>
              </div>

              <!-- Footer -->
              <div class="card-footer text-center bg-light text-muted py-3">
                <small>© 2025 My Logistic. Todos los derechos reservados.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .login-wrapper::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: moveBackground 20s linear infinite;
    }

    @keyframes moveBackground {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }

    .card {
      border-radius: 1rem;
      overflow: hidden;
    }

    .bg-gradient {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
    }

    .logo-circle {
      width: 280px;
      height: 280px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .logo-icon {
      width: 140px;
      height: 140px;
      color: #2563eb;
    }

    .logo-img {
      width: 260px;
      height: 260px;
      object-fit: cover;
      padding: 10px;
    }

    .icon-input {
      width: 20px;
      height: 20px;
      color: #6c757d;
    }

    .input-group-text {
      border-right: none;
    }

    .input-group .form-control {
      border-left: none;
    }

    .input-group .form-control:focus {
      border-color: #ced4da;
      box-shadow: none;
    }

    .input-group:focus-within .input-group-text {
      border-color: #86b7fe;
    }

    .input-group:focus-within .form-control {
      border-color: #86b7fe;
    }

    .btn-gradient {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-gradient:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    }

    .btn-gradient:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-gradient:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-link {
      color: #2563eb;
      font-weight: 600;
    }

    .btn-link:hover:not(:disabled) {
      color: #1d4ed8;
    }

    .card-footer {
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .form-check-input:checked {
      background-color: #2563eb;
      border-color: #2563eb;
    }

    .shadow-lg {
      box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
    }

    .alert {
      font-size: 0.9rem;
    }

    @media (max-width: 576px) {
      .card-body {
        padding: 1.5rem !important;
      }

      .logo-circle {
        width: 200px;
        height: 200px;
      }

      .logo-icon {
        width: 100px;
        height: 100px;
      }

      .logo-img {
        width: 180px;
        height: 180px;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  tenantName: string = '';
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Validaciones
    if (!this.tenantName || !this.username || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const loginRequest: LoginRequest = {
      username: this.username,
      password: this.password,
      tenantName: this.tenantName
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success) {
          this.successMessage = 'Inicio de sesión exitoso. Redirigiendo...';
          
          // Guardar tenantName si "Recordarme" está activo
          if (this.rememberMe) {
            localStorage.setItem('tenantName', this.tenantName);
            localStorage.setItem('username', this.username);
          }
          
          // Redirigir al dashboard después de 1 segundo
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        } else {
          this.errorMessage = response.message || 'Error al iniciar sesión';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error de conexión. Verifica tus credenciales.';
      }
    });
  }

  forgotPassword(): void {
    if (!this.tenantName || !this.username) {
      this.errorMessage = 'Por favor ingresa tu empresa/tenant y usuario para recuperar tu contraseña';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Primero obtener el email enmascarado
    this.authService.getMaskedEmail(this.username, this.tenantName).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Navegar a página de recuperación de contraseña con el email enmascarado
          this.router.navigate(['/reset-password'], {
            queryParams: {
              username: this.username,
              tenantName: this.tenantName,
              maskedEmail: response.mailEncoded
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'No se pudo recuperar la información del usuario';
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  ngOnInit(): void {
    // Cargar datos guardados si existen
    const savedTenant = localStorage.getItem('tenantName');
    const savedUsername = localStorage.getItem('username');
    
    if (savedTenant && savedUsername) {
      this.tenantName = savedTenant;
      this.username = savedUsername;
      this.rememberMe = true;
    }
  }
}
