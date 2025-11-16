import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reset-wrapper">
      <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
          <div class="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <div class="card shadow-lg border-0">
              <!-- Header -->
              <div class="card-header bg-gradient text-white text-center py-4">
                <div class="logo-circle mx-auto mb-3">
                  <img src="logo.png" alt="Logo" class="logo-img rounded-circle" />
                </div>
                <h5 class="text-black">Recuperar Contraseña</h5>
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

                <!-- Instrucciones -->
                <div class="alert alert-info mb-4">
                  <p class="mb-0">Se enviará un enlace de recuperación al siguiente correo:</p>
                  <strong>{{ maskedEmail }}</strong>
                </div>

                <!-- Email de confirmación -->
                <div class="mb-3">
                  <label for="email" class="form-label fw-semibold">Confirma tu email</label>
                  <div class="input-group">
                    <span class="input-group-text bg-white">
                      <svg class="icon-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </span>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      [(ngModel)]="email"
                      placeholder="tu@email.com"
                      required
                      [disabled]="isLoading"
                    />
                  </div>
                  <small class="text-muted">
                    Ingresa tu correo completo para recibir el enlace de recuperación
                  </small>
                </div>

                <!-- Botón de envío -->
                <button
                  type="button"
                  class="btn btn-primary btn-lg w-100 mb-3 btn-gradient"
                  (click)="onSubmit()"
                  [disabled]="isLoading || !email"
                >
                  <span *ngIf="!isLoading">Enviar Enlace de Recuperación</span>
                  <span *ngIf="isLoading">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Enviando...
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
    .reset-wrapper {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .reset-wrapper::before {
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

      .logo-img {
        width: 180px;
        height: 180px;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username: string = '';
  tenantName: string = '';
  maskedEmail: string = '';
  email: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit(): void {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.username = params['username'] || '';
      this.tenantName = params['tenantName'] || '';
      this.maskedEmail = params['maskedEmail'] || '';

      // Si no hay parámetros, redirigir al login
      if (!this.username || !this.tenantName || !this.maskedEmail) {
        this.router.navigate(['/login']);
      }
    });
  }

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Por favor ingresa tu email';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.requestResetPassword(this.username, this.tenantName, this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '¡Enlace de recuperación enviado! Revisa tu correo electrónico y copia el código. Redirigiendo...';

        // Redirigir a confirm-reset-password después de 3 segundos, pasando username y tenantName
        setTimeout(() => {
          this.router.navigate(['/confirm-reset-password'], {
            queryParams: {
              username: this.username,
              tenantName: this.tenantName
            }
          });
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al enviar el enlace de recuperación';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
