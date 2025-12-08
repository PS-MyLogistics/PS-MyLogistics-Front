import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-confirm-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="confirm-reset-wrapper">
      <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
          <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <div class="card shadow-lg border-0">
              <!-- Header -->
              <div class="card-header bg-gradient text-white text-center py-4">
                <div class="logo-circle mx-auto mb-3">
                  <svg class="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                  </svg>
                </div>
                <h5 class="text-black">Restablecer Contraseña</h5>
              </div>

              <!-- Body -->
              <div class="card-body p-4">
                <!-- Alertas -->
                <div *ngIf="errorMessage" class="alert alert-dismissible fade show" role="alert"
                     [ngClass]="{
                       'alert-danger': errorType === 'error',
                       'alert-warning': errorType === 'warning'
                     }">
                  <div class="d-flex align-items-start">
                    <svg *ngIf="errorType === 'error'" class="icon-alert me-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <svg *ngIf="errorType === 'warning'" class="icon-alert me-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <div class="flex-grow-1">
                      <strong *ngIf="errorType === 'error'">Error:</strong>
                      <strong *ngIf="errorType === 'warning'">Atención:</strong>
                      {{ errorMessage }}
                    </div>
                  </div>
                  <button type="button" class="btn-close" (click)="clearError()" aria-label="Close"></button>
                </div>

                <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
                  <div class="d-flex align-items-start">
                    <svg class="icon-alert me-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <div class="flex-grow-1">{{ successMessage }}</div>
                  </div>
                  <button type="button" class="btn-close" (click)="successMessage = ''" aria-label="Close"></button>
                </div>

                <!-- Instrucciones -->
                <div class="alert alert-info mb-4">
                  <strong>Instrucciones:</strong>
                  <p class="mb-2 mt-2">Pegue el código de reseteo que recibió por correo electrónico y defina su nueva contraseña.</p>
                  <p class="mb-0"><small>El código tiene una validez de 15 minutos.</small></p>
                </div>

                <!-- Token de reseteo -->
                <div class="mb-3">
                  <label for="resetToken" class="form-label fw-semibold">Código de Reseteo <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-white">
                      <svg class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </span>
                    <textarea
                      class="form-control"
                      id="resetToken"
                      [(ngModel)]="resetToken"
                      placeholder="Pegue aquí el código JWT completo que recibió por email"
                      rows="4"
                      required
                      [disabled]="isLoading"
                    ></textarea>
                  </div>
                  <small class="text-muted">El código comienza con: eyJhbGciOi...</small>
                </div>

                <!-- Información de validación de contraseña -->
                <div class="alert alert-secondary mb-3">
                  <strong>Requisitos de contraseña:</strong>
                  <ul class="mb-0 mt-2 small">
                    <li>Mínimo 8 caracteres</li>
                    <li>Al menos una letra minúscula</li>
                    <li>Al menos una letra mayúscula</li>
                    <li>Al menos un carácter especial</li>
                  </ul>
                </div>

                <!-- Nueva contraseña -->
                <div class="mb-3">
                  <label for="newPassword" class="form-label fw-semibold">Nueva Contraseña <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-white">
                      <svg class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                      </svg>
                    </span>
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="newPassword"
                      [(ngModel)]="newPassword"
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
                  <div *ngIf="newPassword" class="mt-2">
                    <small [class.text-success]="isPasswordValid()" [class.text-danger]="!isPasswordValid()">
                      {{ isPasswordValid() ? '✓ Contraseña válida' : '✗ Contraseña no cumple los requisitos' }}
                    </small>
                  </div>
                </div>

                <!-- Confirmar contraseña -->
                <div class="mb-4">
                  <label for="confirmPassword" class="form-label fw-semibold">Confirmar Contraseña <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-white">
                      <svg class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </span>
                    <input
                      [type]="showConfirmPassword ? 'text' : 'password'"
                      class="form-control"
                      id="confirmPassword"
                      [(ngModel)]="confirmPassword"
                      placeholder="••••••••"
                      required
                      [disabled]="isLoading"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      (click)="toggleConfirmPassword()"
                      [disabled]="isLoading"
                    >
                      <svg *ngIf="!showConfirmPassword" class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <svg *ngIf="showConfirmPassword" class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    </button>
                  </div>
                  <div *ngIf="confirmPassword" class="mt-2">
                    <small [class.text-success]="passwordsMatch()" [class.text-danger]="!passwordsMatch()">
                      {{ passwordsMatch() ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden' }}
                    </small>
                  </div>
                </div>

                <!-- Botón de confirmación -->
                <button
                  type="button"
                  class="btn btn-primary btn-lg w-100 mb-3 btn-gradient"
                  (click)="onSubmit()"
                  [disabled]="isLoading || !isFormValid()"
                >
                  <span *ngIf="!isLoading">Restablecer Contraseña</span>
                  <span *ngIf="isLoading">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Procesando...
                  </span>
                </button>

                <!-- Volver al login -->
                <div class="text-center">
                  <button
                    type="button"
                    class="btn btn-link p-0 text-decoration-none"
                    (click)="goToLogin()"
                    [disabled]="isLoading"
                  >
                    ← Volver al inicio de sesión
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
    .confirm-reset-wrapper {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .confirm-reset-wrapper::before {
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
      width: 100px;
      height: 100px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .logo-icon {
      width: 50px;
      height: 50px;
      color: #2563eb;
    }

    .icon-input {
      width: 20px;
      height: 20px;
      color: #6c757d;
    }

    .icon-alert {
      width: 20px;
      height: 20px;
      margin-top: 2px;
    }

    .input-group-text {
      border-right: none;
    }

    .input-group .form-control, .input-group textarea {
      border-left: none;
    }

    .input-group .form-control:focus, .input-group textarea:focus {
      border-color: #ced4da;
      box-shadow: none;
    }

    .input-group:focus-within .input-group-text {
      border-color: #86b7fe;
    }

    .input-group:focus-within .form-control, .input-group:focus-within textarea {
      border-color: #86b7fe;
    }

    textarea.form-control {
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      resize: none;
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
        width: 80px;
        height: 80px;
      }

      .logo-icon {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class ConfirmResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetToken: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  username: string = '';
  tenantName: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  errorType: 'error' | 'warning' = 'error';
  successMessage: string = '';

  ngOnInit(): void {
    // Obtener username y tenantName de los query params
    this.route.queryParams.subscribe(params => {
      this.username = params['username'] || '';
      this.tenantName = params['tenantName'] || '';
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearError(): void {
    this.errorMessage = '';
    this.errorType = 'error';
  }

  setError(message: string, type: 'error' | 'warning' = 'error'): void {
    this.errorMessage = message;
    this.errorType = type;
  }

  isPasswordValid(): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^_&*(),.?":{}|<>]).{8,}$/;
    return passwordRegex.test(this.newPassword);
  }

  passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword && this.confirmPassword !== '';
  }

  isFormValid(): boolean {
    return !!(
      this.resetToken.trim() &&
      this.newPassword &&
      this.confirmPassword &&
      this.isPasswordValid() &&
      this.passwordsMatch()
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.setError('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    // Validar que tenemos username y tenantName
    if (!this.username || !this.tenantName) {
      this.setError('Faltan datos de usuario. Por favor solicita el enlace de recuperación nuevamente.', 'error');
      return;
    }

    this.isLoading = true;
    this.clearError();
    this.successMessage = '';

    this.authService.confirmResetPassword(this.resetToken.trim(), this.newPassword, this.username, this.tenantName).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Si la respuesta es null o success es true, consideramos que fue exitoso
        if (!response || response.success !== false) {
          this.successMessage = '¡Contraseña restablecida exitosamente! Redirigiendo al login...';

          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.setError(response.message || 'Error al restablecer la contraseña', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error completo:', error);
        console.error('Error response:', error.error);

        const errorMsg = error.message || 'Error al restablecer la contraseña';

        if (errorMsg.includes('expirado') || errorMsg.includes('expired') || errorMsg.includes('inválido') || errorMsg.includes('invalid')) {
          this.setError('El código ha expirado o es inválido. Solicita uno nuevo.', 'warning');
        } else {
          this.setError(errorMsg, 'error');
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
