import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterOwnerRequest } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
                <div *ngIf="errorMessage" class="alert alert-dismissible fade show" role="alert"
                     [ngClass]="{
                       'alert-danger': errorType === 'error',
                       'alert-warning': errorType === 'warning',
                       'alert-info': errorType === 'info'
                     }">
                  <div class="d-flex align-items-start">
                    <svg *ngIf="errorType === 'error'" class="icon-alert me-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <svg *ngIf="errorType === 'warning'" class="icon-alert me-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <svg *ngIf="errorType === 'info'" class="icon-alert me-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <div class="flex-grow-1">
                      <strong *ngIf="errorType === 'error'">Error:</strong>
                      <strong *ngIf="errorType === 'warning'">Atención:</strong>
                      <strong *ngIf="errorType === 'info'">Información:</strong>
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
                    Acepto los <a href="#" (click)="openTermsModal($event)" class="text-decoration-none">términos y condiciones</a> y la <a href="#" (click)="openPrivacyModal($event)" class="text-decoration-none">política de privacidad</a> <span class="text-danger">*</span>
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

      <!-- Modal Términos y Condiciones -->
      <div class="modal fade" [class.show]="showTermsModal" [style.display]="showTermsModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showTermsModal" (click)="closeTermsModal()"></div>
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
          <div class="modal-content">
            <div class="modal-header bg-gradient text-white">
              <h5 class="modal-title text-black">Términos y Condiciones</h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeTermsModal()"></button>
            </div>
            <div class="modal-body terms-content">
              <p class="text-muted mb-4">
                <strong>Última actualización:</strong> 08 de Noviembre de 2025
              </p>

              <section class="mb-4">
                <h5 class="text-primary mb-3">1. Aceptación de los Términos</h5>
                <p>
                  Al acceder y utilizar My Logistic ("el Servicio"), usted acepta estar sujeto a estos Términos y Condiciones.
                  Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestro servicio.
                </p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">2. Descripción del Servicio</h5>
                <p>
                  My Logistic es una plataforma de gestión logística que permite a las empresas administrar sus operaciones de distribución,
                  pedidos, usuarios y seguimiento en tiempo real.
                </p>
                <p>El servicio incluye, pero no se limita a:</p>
                <ul>
                  <li>Gestión de pedidos y entregas</li>
                  <li>Seguimiento en tiempo real mediante mapas</li>
                  <li>Administración de usuarios y roles</li>
                  <li>Gestión de productos y catálogos</li>
                  <li>Reportes y análisis de operaciones</li>
                </ul>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">3. Registro y Cuenta de Usuario</h5>
                <p><strong>3.1 Creación de Cuenta:</strong></p>
                <ul>
                  <li>Debe proporcionar información precisa y completa durante el registro</li>
                  <li>Es responsable de mantener la confidencialidad de sus credenciales</li>
                  <li>Debe ser mayor de 18 años para crear una cuenta</li>
                </ul>
                <p><strong>3.2 Verificación:</strong></p>
                <ul>
                  <li>Su cuenta debe ser verificada mediante correo electrónico antes de poder acceder al servicio completo</li>
                  <li>Nos reservamos el derecho de solicitar documentación adicional para verificar su identidad</li>
                </ul>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">4. Uso Aceptable</h5>
                <p>Al utilizar el Servicio, usted se compromete a:</p>
                <ul>
                  <li>No utilizar el servicio para actividades ilegales o no autorizadas</li>
                  <li>No intentar acceder sin autorización a sistemas o datos de otros usuarios</li>
                  <li>No interferir con el funcionamiento normal del servicio</li>
                  <li>No transmitir virus, malware o código malicioso</li>
                  <li>Cumplir con todas las leyes y regulaciones aplicables</li>
                </ul>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">5. Planes y Facturación</h5>
                <p><strong>5.1 Planes de Servicio:</strong></p>
                <ul>
                  <li><strong>Plan FREE:</strong> Funcionalidades básicas con limitaciones en usuarios y operaciones</li>
                  <li><strong>Planes Premium:</strong> Acceso completo con características avanzadas</li>
                </ul>
                <p><strong>5.2 Pagos:</strong></p>
                <ul>
                  <li>Los pagos se procesan de forma segura a través de proveedores de pago terceros</li>
                  <li>Las suscripciones se renuevan automáticamente a menos que se cancelen</li>
                  <li>No se realizan reembolsos por cancelaciones a mitad de período</li>
                </ul>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">6. Propiedad Intelectual</h5>
                <p>
                  Todo el contenido, características y funcionalidades del Servicio son propiedad exclusiva de My Logistic
                  y están protegidos por leyes de derechos de autor, marcas registradas y otras leyes de propiedad intelectual.
                </p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">7. Limitación de Responsabilidad</h5>
                <p>
                  My Logistic no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos,
                  incluyendo pérdida de beneficios, datos, uso, o cualquier otra pérdida intangible resultante de:
                </p>
                <ul>
                  <li>El uso o la imposibilidad de usar el servicio</li>
                  <li>Acceso no autorizado a sus datos</li>
                  <li>Errores o interrupciones en el servicio</li>
                  <li>Virus u otro código malicioso obtenido del servicio</li>
                </ul>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">8. Modificaciones del Servicio</h5>
                <p>
                  Nos reservamos el derecho de modificar o descontinuar, temporal o permanentemente, el Servicio
                  (o cualquier parte del mismo) con o sin previo aviso en cualquier momento.
                </p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">9. Terminación</h5>
                <p>
                  Podemos suspender o terminar su acceso al Servicio inmediatamente, sin previo aviso o responsabilidad,
                  por cualquier motivo, incluyendo si usted incumple estos Términos y Condiciones.
                </p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">10. Ley Aplicable</h5>
                <p>
                  Estos Términos se regirán e interpretarán de acuerdo con las leyes de Argentina,
                  sin dar efecto a ningún principio de conflictos de leyes.
                </p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">11. Cambios en los Términos</h5>
                <p>
                  Nos reservamos el derecho de actualizar o modificar estos Términos en cualquier momento.
                  Le notificaremos sobre cualquier cambio mediante la publicación de los nuevos Términos en esta página
                  y actualizando la fecha de "Última actualización".
                </p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">12. Contacto</h5>
                <p>
                  Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos en:
                </p>
                <ul class="list-unstyled">
                  <li><strong>Email:</strong> soporte&#64;mylogistic.com</li>
                  <li><strong>Teléfono:</strong> +54 351 123-4567</li>
                </ul>
              </section>

              <div class="alert alert-info">
                <strong>Nota Importante:</strong> Al utilizar My Logistic, usted reconoce que ha leído,
                entendido y acepta estar obligado por estos Términos y Condiciones.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" (click)="closeTermsModal()">Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Política de Privacidad -->
      <div class="modal fade" [class.show]="showPrivacyModal" [style.display]="showPrivacyModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showPrivacyModal" (click)="closePrivacyModal()"></div>
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
          <div class="modal-content">
            <div class="modal-header bg-gradient text-white">
              <h5 class="modal-title text-black">Política de Privacidad</h5>
              <button type="button" class="btn-close btn-close-white" (click)="closePrivacyModal()"></button>
            </div>
            <div class="modal-body terms-content">
              <p class="text-muted mb-4">
                <strong>Última actualización:</strong> 08 de Noviembre de 2025
              </p>

              <div class="alert alert-primary mb-4">
                <strong>Resumen:</strong> En My Logistic respetamos su privacidad y nos comprometemos a proteger sus datos personales.
                Esta política explica cómo recopilamos, usamos y protegemos su información.
              </div>

              <section class="mb-4">
                <h5 class="text-primary mb-3">1. Información que Recopilamos</h5>

                <p><strong>1.1 Información que usted nos proporciona:</strong></p>
                <ul>
                  <li><strong>Datos de cuenta:</strong> Nombre de usuario, correo electrónico, teléfono, contraseña</li>
                  <li><strong>Información de la empresa:</strong> Nombre de la empresa, dirección, contacto</li>
                  <li><strong>Datos de perfil:</strong> Dirección, ciudad, provincia</li>
                  <li><strong>Información de pedidos:</strong> Productos, destinatarios, direcciones de entrega</li>
                </ul>

                <p><strong>1.2 Información recopilada automáticamente:</strong></p>
                <ul>
                  <li><strong>Datos de uso:</strong> Páginas visitadas, tiempo de navegación, acciones realizadas</li>
                  <li><strong>Información del dispositivo:</strong> Tipo de navegador, sistema operativo, dirección IP</li>
                  <li><strong>Datos de ubicación:</strong> Geolocalización para el seguimiento de entregas (con su consentimiento)</li>
                  <li><strong>Cookies:</strong> Identificadores únicos para mejorar la experiencia del usuario</li>
                </ul>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">2. Cómo Utilizamos su Información</h5>
                <p>Utilizamos la información recopilada para:</p>
                <ul>
                  <li>Proporcionar y mantener nuestro servicio</li>
                  <li>Procesar y gestionar pedidos y entregas</li>
                  <li>Verificar su identidad y autenticar su acceso</li>
                  <li>Enviar notificaciones sobre el estado de sus pedidos</li>
                  <li>Mejorar y personalizar su experiencia de usuario</li>
                  <li>Analizar el uso del servicio y detectar problemas técnicos</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                  <li>Prevenir fraudes y actividades no autorizadas</li>
                  <li>Enviar comunicaciones de marketing (con su consentimiento)</li>
                </ul>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">3. Compartir Información con Terceros</h5>
                <p>No vendemos sus datos personales. Podemos compartir su información únicamente en los siguientes casos:</p>

                <p><strong>3.1 Proveedores de servicios:</strong></p>
                <ul>
                  <li>Servicios de hosting y almacenamiento en la nube</li>
                  <li>Procesadores de pagos</li>
                  <li>Servicios de mensajería y notificaciones</li>
                  <li>Proveedores de análisis y métricas</li>
                </ul>

                <p><strong>3.2 Requisitos legales:</strong></p>
                <ul>
                  <li>Cumplimiento de órdenes judiciales o requerimientos legales</li>
                  <li>Protección de derechos, propiedad o seguridad de My Logistic</li>
                  <li>Investigación de fraudes o violaciones de términos de servicio</li>
                </ul>

                <p><strong>3.3 Transferencias de negocio:</strong></p>
                <ul>
                  <li>En caso de fusión, adquisición o venta de activos, sus datos pueden transferirse</li>
                </ul>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">4. Seguridad de los Datos</h5>
                <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información:</p>
                <ul>
                  <li><strong>Encriptación:</strong> Todos los datos se transmiten mediante conexiones HTTPS seguras</li>
                  <li><strong>Contraseñas:</strong> Se almacenan usando algoritmos de hash seguros (BCrypt)</li>
                  <li><strong>Tokens de autenticación:</strong> JWT (JSON Web Tokens) con tiempo de expiración</li>
                  <li><strong>Control de acceso:</strong> Acceso restringido según roles y permisos</li>
                  <li><strong>Monitoreo:</strong> Detección continua de actividades sospechosas</li>
                  <li><strong>Copias de seguridad:</strong> Backups regulares de la información</li>
                </ul>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">5. Retención de Datos</h5>
                <p>
                  Conservamos su información personal durante el tiempo que sea necesario para cumplir con los propósitos
                  descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
                </p>
                <ul>
                  <li><strong>Cuentas activas:</strong> Mientras su cuenta esté activa</li>
                  <li><strong>Cuentas eliminadas:</strong> Hasta 90 días después de la eliminación (para recuperación)</li>
                  <li><strong>Datos de transacciones:</strong> Hasta 10 años (requisitos fiscales y legales)</li>
                  <li><strong>Registros de acceso:</strong> Hasta 2 años (seguridad y auditoría)</li>
                </ul>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">6. Sus Derechos</h5>
                <p>Usted tiene los siguientes derechos sobre sus datos personales:</p>
                <ul>
                  <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                  <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                  <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos ("derecho al olvido")</li>
                  <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado y legible</li>
                  <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos para ciertos propósitos</li>
                  <li><strong>Limitación:</strong> Solicitar la limitación del procesamiento de sus datos</li>
                  <li><strong>Revocación del consentimiento:</strong> Retirar su consentimiento en cualquier momento</li>
                </ul>
                <p>Para ejercer estos derechos, contáctenos en: <strong>privacidad&#64;mylogistic.com</strong></p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">7. Cookies y Tecnologías Similares</h5>
                <p>Utilizamos cookies y tecnologías similares para:</p>
                <ul>
                  <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del servicio</li>
                  <li><strong>Cookies de rendimiento:</strong> Para analizar el uso y mejorar la experiencia</li>
                  <li><strong>Cookies de funcionalidad:</strong> Para recordar sus preferencias</li>
                  <li><strong>Cookies de marketing:</strong> Para personalizar anuncios (con su consentimiento)</li>
                </ul>
                <p>Puede gestionar las preferencias de cookies desde la configuración de su navegador.</p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">8. Privacidad de Menores</h5>
                <p>
                  Nuestro servicio no está dirigido a menores de 18 años. No recopilamos intencionalmente información
                  de menores. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.
                </p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">9. Transferencias Internacionales</h5>
                <p>
                  Sus datos pueden ser transferidos y almacenados en servidores ubicados fuera de Argentina.
                  Garantizamos que dichas transferencias cumplan con las leyes de protección de datos aplicables.
                </p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">10. Cambios en esta Política</h5>
                <p>
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cambios significativos
                  mediante un aviso en nuestro servicio o por correo electrónico. La fecha de "Última actualización" se modificará
                  en la parte superior de esta política.
                </p>
              </section>

              <section class="mb-4">
                <h5 class="text-primary mb-3">11. Contacto</h5>
                <p>
                  Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, puede contactarnos:
                </p>
                <ul class="list-unstyled">
                  <li><strong>Email:</strong> privacidad&#64;mylogistic.com</li>
                  <li><strong>Correo postal:</strong> Av. Principal 123, Córdoba, Argentina</li>
                  <li><strong>Teléfono:</strong> +54 351 123-4567</li>
                </ul>
              </section>

              <div class="alert alert-success">
                <strong>Su confianza es importante para nosotros.</strong> Nos comprometemos a proteger su privacidad
                y manejar sus datos de manera responsable y transparente.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" (click)="closePrivacyModal()">Cerrar</button>
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

    .icon-alert {
      width: 20px;
      height: 20px;
      margin-top: 2px;
    }

    /* Estilos para modales */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1050;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .modal.show {
      display: flex !important;
      align-items: center;
      justify-content: center;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1040;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .modal-dialog {
      position: relative;
      z-index: 1050;
      max-height: 90vh;
    }

    .modal-content {
      border-radius: 1rem;
      border: none;
      box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }

    .modal-body {
      max-height: calc(90vh - 200px);
      overflow-y: auto;
      padding: 2rem;
    }

    .modal-footer {
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      padding: 1rem 1.5rem;
    }

    .terms-content section {
      margin-bottom: 2rem;
    }

    .terms-content h5 {
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }

    .terms-content ul {
      padding-left: 1.5rem;
    }

    .terms-content ul li {
      margin-bottom: 0.5rem;
    }

    .btn-close-white {
      filter: invert(1) grayscale(100%) brightness(200%);
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

      .modal-dialog {
        margin: 1rem;
        max-width: calc(100% - 2rem);
      }

      .modal-body {
        padding: 1.5rem;
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
  errorType: 'error' | 'warning' | 'info' = 'error';
  successMessage: string = '';

  // Modales para términos y privacidad
  showTermsModal: boolean = false;
  showPrivacyModal: boolean = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.errorMessage = '';
    this.errorType = 'error';
  }

  setError(message: string, type: 'error' | 'warning' | 'info' = 'error'): void {
    this.errorMessage = message;
    this.errorType = type;
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
      this.setError('Por favor completa todos los campos requeridos correctamente', 'warning');
      return;
    }

    this.isLoading = true;
    this.clearError();
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
          this.setError(response.message || 'Error al registrar la cuenta', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;

        // Clasificar el tipo de error según el mensaje
        const errorMsg = error.message || 'Error al registrar. Por favor intenta nuevamente.';

        if (errorMsg.includes('ya existe') || errorMsg.includes('already exists')) {
          this.setError(errorMsg, 'warning');
        } else if (errorMsg.includes('Datos inválidos') || errorMsg.includes('inválido')) {
          this.setError(errorMsg, 'error');
        } else if (errorMsg.includes('No se pudo conectar')) {
          this.setError(errorMsg, 'error');
        } else {
          this.setError(errorMsg, 'error');
        }
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

  openTermsModal(event: Event): void {
    event.preventDefault();
    this.showTermsModal = true;
  }

  closeTermsModal(): void {
    this.showTermsModal = false;
  }

  openPrivacyModal(event: Event): void {
    event.preventDefault();
    this.showPrivacyModal = true;
  }

  closePrivacyModal(): void {
    this.showPrivacyModal = false;
  }
}