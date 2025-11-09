import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroments/enviroment';

interface VerificationResponse {
  token: string;
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verify-wrapper">
      <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
          <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div class="card shadow-lg border-0">
              <!-- Loading State -->
              <div *ngIf="isVerifying" class="card-body text-center py-5">
                <div class="spinner-border text-primary mb-4" style="width: 4rem; height: 4rem;" role="status">
                  <span class="visually-hidden">Verificando...</span>
                </div>
                <h4 class="mb-3">Verificando tu cuenta</h4>
                <p class="text-muted">Por favor espera un momento...</p>
              </div>

              <!-- Success State -->
              <div *ngIf="!isVerifying && isSuccess" class="card-body text-center py-5">
                <div class="success-icon mb-4">
                  <svg class="checkmark" viewBox="0 0 52 52">
                    <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
                <h3 class="text-success mb-3">¡Cuenta Verificada!</h3>
                <p class="text-muted mb-4">{{ message }}</p>
                <p class="mb-4">Tu cuenta ha sido activada exitosamente. Ahora puedes iniciar sesión.</p>

                <div class="redirect-info mb-4">
                  <p class="text-muted mb-2">Serás redirigido al inicio de sesión en:</p>
                  <div class="countdown">{{ countdown }}</div>
                  <p class="text-muted small">segundos</p>
                </div>

                <button
                  type="button"
                  class="btn btn-primary btn-lg px-5"
                  (click)="goToLogin()"
                >
                  Ir al Login Ahora
                </button>
              </div>

              <!-- Error State -->
              <div *ngIf="!isVerifying && !isSuccess" class="card-body text-center py-5">
                <div class="error-icon mb-4">
                  <svg class="error-mark" viewBox="0 0 52 52">
                    <circle class="error-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="error-cross" fill="none" d="M16 16 l20 20 M36 16 l-20 20"/>
                  </svg>
                </div>
                <h3 class="text-danger mb-3">Error en la Verificación</h3>
                <p class="text-muted mb-4">{{ message }}</p>
                <p class="mb-4">El enlace puede haber expirado o ser inválido.</p>

                <div class="d-grid gap-2 d-md-block">
                  <button
                    type="button"
                    class="btn btn-primary btn-lg px-4 me-md-2"
                    (click)="goToLogin()"
                  >
                    Ir al Login
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-lg px-4"
                    (click)="goToRegister()"
                  >
                    Registrarse
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
    .verify-wrapper {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%);
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .verify-wrapper::before {
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
      position: relative;
      z-index: 10;
    }

    .success-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto;
    }

    .checkmark {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: block;
      stroke-width: 3;
      stroke: #22c55e;
      stroke-miterlimit: 10;
      box-shadow: inset 0px 0px 0px #22c55e;
      animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
    }

    .checkmark-circle {
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke-width: 3;
      stroke-miterlimit: 10;
      stroke: #22c55e;
      fill: none;
      animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark-check {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }

    @keyframes stroke {
      100% {
        stroke-dashoffset: 0;
      }
    }

    @keyframes scale {
      0%, 100% {
        transform: none;
      }
      50% {
        transform: scale3d(1.1, 1.1, 1);
      }
    }

    @keyframes fill {
      100% {
        box-shadow: inset 0px 0px 0px 60px #22c55e;
      }
    }

    .error-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto;
    }

    .error-mark {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: block;
      stroke-width: 3;
      stroke: #ef4444;
      stroke-miterlimit: 10;
      box-shadow: inset 0px 0px 0px #ef4444;
      animation: fill-error .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
    }

    .error-circle {
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke-width: 3;
      stroke-miterlimit: 10;
      stroke: #ef4444;
      fill: none;
      animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .error-cross {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      stroke-width: 3;
      animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }

    @keyframes fill-error {
      100% {
        box-shadow: inset 0px 0px 0px 60px #ef4444;
      }
    }

    .countdown {
      font-size: 3rem;
      font-weight: bold;
      color: #2563eb;
      line-height: 1;
    }

    .redirect-info {
      background: #f8f9fa;
      border-radius: 0.5rem;
      padding: 1.5rem;
    }

    .card-footer {
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .shadow-lg {
      box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
    }

    @media (max-width: 576px) {
      .card-body {
        padding: 2rem 1.5rem !important;
      }

      .countdown {
        font-size: 2.5rem;
      }
    }
  `]
})
export class VerifyAccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  isVerifying = true;
  isSuccess = false;
  message = '';
  countdown = 5;
  private countdownInterval: any;

  ngOnInit(): void {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const idTenant = params['idTenant'];

      if (token && idTenant) {
        this.verifyAccount(token, idTenant);
      } else {
        this.handleError('Parámetros de verificación inválidos');
      }
    });
  }

  verifyAccount(token: string, idTenant: string): void {
    this.http.get<VerificationResponse>(
      `${this.apiUrl}/auth/verifyRegisterTenantAndOwner`,
      {
        params: { token, idTenant }
      }
    ).subscribe({
      next: (response) => {
        this.isVerifying = false;

        if (response.success) {
          this.isSuccess = true;
          this.message = response.message || 'Registro verificado correctamente';
          this.startCountdown();
        } else {
          this.handleError(response.message || 'Error al verificar la cuenta');
        }
      },
      error: (error) => {
        this.handleError(error.error?.message || 'Error al verificar la cuenta. Por favor intenta nuevamente.');
      }
    });
  }

  handleError(errorMessage: string): void {
    this.isVerifying = false;
    this.isSuccess = false;
    this.message = errorMessage;
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;

      if (this.countdown === 0) {
        this.clearCountdown();
        this.goToLogin();
      }
    }, 1000);
  }

  clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  goToLogin(): void {
    this.clearCountdown();
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.clearCountdown();
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }
}
