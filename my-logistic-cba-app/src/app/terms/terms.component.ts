import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-wrapper">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-10 col-xl-9">
            <div class="card shadow-lg border-0">
              <!-- Header -->
              <div class="card-header bg-gradient text-white py-4">
                <div class="d-flex align-items-center">
                  <button class="btn btn-light btn-sm me-3" (click)="goBack()">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Volver
                  </button>
                  <h4 class="mb-0 text-black">Términos y Condiciones</h4>
                </div>
              </div>

              <!-- Body -->
              <div class="card-body p-4 p-md-5">
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

                <div class="alert alert-info mt-5">
                  <strong>Nota Importante:</strong> Al utilizar My Logistic, usted reconoce que ha leído,
                  entendido y acepta estar obligado por estos Términos y Condiciones.
                </div>
              </div>

              <!-- Footer -->
              <div class="card-footer text-center bg-light py-3">
                <button class="btn btn-primary btn-lg px-5" (click)="goBack()">
                  Aceptar y Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .terms-wrapper {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      min-height: 100vh;
    }

    .bg-gradient {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
    }

    .icon {
      width: 20px;
      height: 20px;
    }

    .card {
      border-radius: 1rem;
      overflow: hidden;
    }

    .card-body {
      max-height: 70vh;
      overflow-y: auto;
    }

    .card-body::-webkit-scrollbar {
      width: 8px;
    }

    .card-body::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .card-body::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }

    .card-body::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    section {
      scroll-margin-top: 20px;
    }

    h5 {
      font-weight: 600;
      margin-top: 1.5rem;
    }

    ul {
      padding-left: 1.5rem;
    }

    ul li {
      margin-bottom: 0.5rem;
    }

    .shadow-lg {
      box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
    }

    @media (max-width: 768px) {
      .card-body {
        padding: 2rem 1.5rem !important;
      }
    }
  `]
})
export class TermsComponent {
  private router = inject(Router);

  goBack(): void {
    // Volver a la página anterior
    window.history.back();
  }
}
