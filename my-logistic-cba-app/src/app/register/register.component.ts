import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterOwnerRequest } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="register-wrapper">
      <div class="container">
        <div class="row justify-content-center py-5">
          <div class="col-12 col-lg-10 col-xl-9">
            <div class="card shadow-lg border-0 register-card">
              <!-- Header -->
              <div class="card-header bg-gradient text-white text-center py-4">
                <div class="logo-circle-small mx-auto mb-3">
                  <img src="logo.png" alt="Logo" class="logo-img rounded-circle" />
                </div>
                <h5 class="text-black">Crea tu cuenta y empresa</h5>
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

                <!-- Información de validación de contraseña -->
                <div class="alert alert-info mb-4">
                  <strong>Requisitos de contraseña:</strong>
                  <ul class="mb-0 mt-2 small">
                    <li>Mínimo 8 caracteres</li>
                    <li>Al menos una letra minúscula</li>
                    <li>Al menos una letra mayúscula</li>
                    <li>Al menos un carácter especial</li>
                  </ul>
                </div>

                <!-- Datos de la Empresa -->
                <h5 class="mb-3 text-primary section-title">
                  <svg class="icon-section me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  Datos de la Empresa
                </h5>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="tenantName" class="form-label fw-semibold">
                      Nombre de la Empresa <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control form-control-custom"
                      id="tenantName"
                      [(ngModel)]="formData.tenantName"
                      placeholder="Mi Empresa Logística"
                      required
                      [disabled]="isLoading"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="tenantContactEmail" class="form-label fw-semibold">
                      Email de Contacto <span class="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      class="form-control form-control-custom"
                      id="tenantContactEmail"
                      [(ngModel)]="formData.tenantContactEmail"
                      placeholder="contacto@empresa.com"
                      required
                      [disabled]="isLoading"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="tenantContactPhone" class="form-label fw-semibold">
                      Teléfono de Contacto <span class="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      class="form-control form-control-custom"
                      id="tenantContactPhone"
                      [(ngModel)]="formData.tenantContactPhone"
                      placeholder="3511234567"
                      pattern="[0-9]+"
                      required
                      [disabled]="isLoading"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="tenantAddress" class="form-label fw-semibold">
                      Dirección de la Empresa <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control form-control-custom"
                      id="tenantAddress"
                      [(ngModel)]="formData.tenantAddress"
                      placeholder="Av. Principal 123"
                      required
                      [disabled]="isLoading"
                    />
                  </div>
                </div>

                <hr class="my-4 separator">

                <!-- Datos del Propietario/Usuario -->
                <h5 class="mb-3 text-primary section-title">
                  <svg class="icon-section me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Datos del Propietario
                </h5>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="username" class="form-label fw-semibold">
                      Usuario <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control form-control-custom"
                      id="username"
                      [(ngModel)]="formData.username"
                      placeholder="nombre_usuario"
                      required
                      [disabled]="isLoading"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label fw-semibold">
                      Email Personal <span class="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      class="form-control form-control-custom"
                      id="email"
                      [(ngModel)]="formData.email"
                      placeholder="tu@email.com"
                      required
                      [disabled]="isLoading"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="password" class="form-label fw-semibold">
                      Contraseña <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <input
                        [type]="showPassword ? 'text' : 'password'"
                        class="form-control form-control-custom"
                        id="password"
                        [(ngModel)]="formData.password"
                        placeholder="••••••••"
                        required
                        [disabled]="isLoading"
                      />
                      <button
                        class="btn btn-outline-secondary btn-toggle"
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
                    <div *ngIf="formData.password" class="mt-2">
                      <small [class.text-success]="isPasswordValid()" [class.text-danger]="!isPasswordValid()">
                        {{ isPasswordValid() ? '✓ Contraseña válida' : '✗ Contraseña no cumple los requisitos' }}
                      </small>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="telephone" class="form-label fw-semibold">
                      Teléfono Personal <span class="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      class="form-control form-control-custom"
                      id="telephone"
                      [(ngModel)]="formData.telephone"
                      placeholder="3511234567"
                      pattern="[0-9]+"
                      required
                      [disabled]="isLoading"
                    />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label for="address" class="form-label fw-semibold">
                      Dirección Personal <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control form-control-custom"
                      id="address"
                      [(ngModel)]="formData.address"
                      placeholder="Calle 123, Depto 4B"
                      required
                      [disabled]="isLoading"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="city" class="form-label fw-semibold">
                      Ciudad <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control form-control-custom"
                      id="city"
                      [(ngModel)]="formData.city"
                      placeholder="Córdoba"
                      required
                      [disabled]="isLoading"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="stateOrProvince" class="form-label fw-semibold">
                      Provincia/Estado <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control form-control-custom"
                      id="stateOrProvince"
                      [(ngModel)]="formData.stateOrProvince"
                      placeholder="Córdoba"
                      required
                      [disabled]="isLoading"
                    />
                  </div>
                </div>

                <!-- Términos y condiciones -->
                <div class="form-check mb-4">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="acceptTerms"
                    [(ngModel)]="acceptTerms"
                    [disabled]="isLoading"
                  />
                  <label class="form-check-label" for="acceptTerms">
                    Acepto los <a href="#" class="text-decoration-none">términos y condiciones</a> y la <a href="#" class="text-decoration-none">política de privacidad</a> <span class="text-danger">*</span>
                  </label>
                </div>

                <!-- Botón de registro -->
                <button
                  type="button"
                  class="btn btn-primary btn-lg w-100 mb-3 btn-gradient"
                  (click)="onSubmit()"
                  [disabled]="isLoading || !isFormValid()"
                >
                  <span *ngIf="!isLoading">Crear Cuenta</span>
                  <span *ngIf="isLoading">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registrando...
                  </span>
                </button>

                <!-- Login -->
                <div class="text-center">
                  <span class="text-muted">¿Ya tienes cuenta? </span>
                  <button 
                    type="button"
                    class="btn btn-link p-0 text-decoration-none"
                    (click)="goToLogin()"
                    [disabled]="isLoading"
                  >
                    Inicia sesión aquí
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
    * {
      box-sizing: border-box;
    }

    .register-wrapper {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      padding: 20px 0;
    }

    .register-wrapper::before {
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

    .register-card {
      border-radius: 1rem;
      overflow: hidden;
      position: relative;
      z-index: 10;
    }

    .bg-gradient {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
    }

    .logo-circle-small {
      width: 280px;
      height: 280px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .logo-icon-small {
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

    .icon-section {
      width: 24px;
      height: 24px;
      display: inline-block;
      vertical-align: middle;
    }

    .section-title {
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    .separator {
      border-top: 2px solid #e5e7eb;
      margin: 2rem 0;
    }

    .form-control-custom {
      padding: 12px;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-control-custom:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .input-group .form-control-custom {
      border-right: none;
    }

    .btn-toggle {
      border-left: none;
      border: 2px solid #d1d5db;
      border-left: none;
    }

    .input-group:focus-within .form-control-custom,
    .input-group:focus-within .btn-toggle {
      border-color: #2563eb;
    }

    .btn-gradient {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
      font-weight: 600;
      transition: all 0.3s ease;
      padding: 12px;
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
      border: none;
      background: none;
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

    .text-danger {
      color: #dc3545 !important;
    }

    .alert {
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      .logo-circle-small {
        width: 200px;
        height: 200px;
      }

      .logo-icon-small {
        width: 100px;
        height: 100px;
      }

      .logo-img {
        width: 180px;
        height: 180px;
      }

      .register-wrapper {
        padding: 10px 0;
      }
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  formData: RegisterOwnerRequest = {
    email: '',
    password: '',
    username: '',
    telephone: '',
    address: '',
    city: '',
    stateOrProvince: '',
    tenantName: '',
    tenantContactEmail: '',
    tenantContactPhone: '',
    tenantAddress: ''
  };

  showPassword: boolean = false;
  acceptTerms: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  isPasswordValid(): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^_&*(),.?":{}|<>]).{8,}$/;
    return passwordRegex.test(this.formData.password);
  }

  isFormValid(): boolean {
    return !!(
      this.formData.tenantName &&
      this.formData.tenantContactEmail &&
      this.formData.tenantContactPhone &&
      this.formData.tenantAddress &&
      this.formData.username &&
      this.formData.email &&
      this.formData.password &&
      this.formData.telephone &&
      this.formData.address &&
      this.formData.city &&
      this.formData.stateOrProvince &&
      this.isPasswordValid() &&
      this.acceptTerms
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor completa todos los campos requeridos correctamente';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success) {
          this.successMessage = '¡Registro exitoso! Revisa tu correo para verificar tu cuenta.';
          
          this.resetForm();
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Error al registrar la cuenta';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al registrar. Por favor intenta nuevamente.';
      }
    });
  }

  resetForm(): void {
    this.formData = {
      email: '',
      password: '',
      username: '',
      telephone: '',
      address: '',
      city: '',
      stateOrProvince: '',
      tenantName: '',
      tenantContactEmail: '',
      tenantContactPhone: '',
      tenantAddress: ''
    };
    this.acceptTerms = false;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}