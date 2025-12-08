import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="privacy-wrapper">
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
                  <h4 class="mb-0 text-black">Política de Privacidad</h4>
                </div>
              </div>

              <!-- Body -->
              <div class="card-body p-4 p-md-5">
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

                <div class="alert alert-success mt-5">
                  <strong>Su confianza es importante para nosotros.</strong> Nos comprometemos a proteger su privacidad
                  y manejar sus datos de manera responsable y transparente.
                </div>
              </div>

              <!-- Footer -->
              <div class="card-footer text-center bg-light py-3">
                <button class="btn btn-primary btn-lg px-5" (click)="goBack()">
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .privacy-wrapper {
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
export class PrivacyComponent {
  private router = inject(Router);

  goBack(): void {
    // Volver a la página anterior
    window.history.back();
  }
}
