import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RepartidoresService } from '../../../services/repartidores.service';
import { Repartidor } from '../../../services/database.service';

@Component({
  selector: 'app-nuevo-repartidor-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="header-blue">
        <button class="btn-back" (click)="volver()">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </button>
        <div>
          <h4 class="mb-1">
            <svg class="me-2" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            {{ isEditMode ? 'Editar Repartidor' : 'Nuevo Repartidor' }}
          </h4>
          <p class="mb-0">{{ isEditMode ? 'Actualiza la información del repartidor' : 'Completa la información del nuevo repartidor' }}</p>
        </div>
      </div>

      <!-- Alertas -->
      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show mb-3">
        {{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show mb-3">
        {{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <!-- Formulario -->
      <form (ngSubmit)="guardarRepartidor()">
        <!-- Información Personal -->
        <div class="section section-blue">
          <div class="section-header">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <h6>Información Personal</h6>
          </div>
          <div class="section-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label-custom">Nombre <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control-custom"
                  [(ngModel)]="repartidor.nombre"
                  name="nombre"
                  placeholder="Ej: Juan"
                  required
                >
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Apellido <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control-custom"
                  [(ngModel)]="repartidor.apellido"
                  name="apellido"
                  placeholder="Ej: Pérez"
                  required
                >
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">DNI <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control-custom"
                  [(ngModel)]="repartidor.dni"
                  name="dni"
                  placeholder="Ej: 35123456"
                  maxlength="8"
                  required
                >
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Teléfono <span class="text-danger">*</span></label>
                <input
                  type="tel"
                  class="form-control-custom"
                  [(ngModel)]="repartidor.telefono"
                  name="telefono"
                  placeholder="Ej: 3511234567"
                  required
                >
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Email <span class="text-danger">*</span></label>
                <input
                  type="email"
                  class="form-control-custom"
                  [(ngModel)]="repartidor.email"
                  name="email"
                  placeholder="ejemplo@email.com"
                  required
                >
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Dirección</label>
                <input
                  type="text"
                  class="form-control-custom"
                  [(ngModel)]="repartidor.direccion"
                  name="direccion"
                  placeholder="Ej: Av. Colón 123, Córdoba"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Información del Vehículo -->
        <div class="section section-green">
          <div class="section-header">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
            </svg>
            <h6>Información del Vehículo</h6>
          </div>
          <div class="section-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label-custom">Tipo de Vehículo <span class="text-danger">*</span></label>
                <select
                  class="form-control-custom"
                  [(ngModel)]="repartidor.vehiculo"
                  name="vehiculo"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="moto">Moto</option>
                  <option value="auto">Auto</option>
                  <option value="bicicleta">Bicicleta</option>
                  <option value="camioneta">Camioneta</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Patente</label>
                <input
                  type="text"
                  class="form-control-custom"
                  [(ngModel)]="repartidor.patente"
                  name="patente"
                  placeholder="Ej: AB123CD"
                  [disabled]="repartidor.vehiculo === 'bicicleta'"
                >
                <small class="text-muted" *ngIf="repartidor.vehiculo === 'bicicleta'">
                  No se requiere patente para bicicleta
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado y Disponibilidad (solo en modo edición) -->
        <div class="section section-purple" *ngIf="isEditMode">
          <div class="section-header">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h6>Estado y Disponibilidad</h6>
          </div>
          <div class="section-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label-custom">Estado</label>
                <select
                  class="form-control-custom"
                  [(ngModel)]="repartidor.estado"
                  name="estado"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="en_entrega">En Entrega</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Disponible</label>
                <div class="form-check form-switch mt-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    [(ngModel)]="repartidor.disponible"
                    name="disponible"
                    id="disponibleSwitch"
                  >
                  <label class="form-check-label" for="disponibleSwitch">
                    {{ repartidor.disponible ? 'Disponible' : 'No Disponible' }}
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label-custom">Pedidos Completados</label>
                <input
                  type="number"
                  class="form-control-custom"
                  [(ngModel)]="repartidor.pedidosCompletados"
                  name="pedidosCompletados"
                  min="0"
                >
              </div>
              <div class="col-md-4">
                <label class="form-label-custom">Calificación</label>
                <input
                  type="number"
                  class="form-control-custom"
                  [(ngModel)]="repartidor.calificacion"
                  name="calificacion"
                  min="0"
                  max="5"
                  step="0.1"
                >
              </div>
              <div class="col-md-4">
                <label class="form-label-custom">Fecha de Ingreso</label>
                <input
                  type="date"
                  class="form-control-custom"
                  [ngModel]="getFechaIngresoForInput()"
                  (ngModelChange)="setFechaIngreso($event)"
                  name="fechaIngreso"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="action-buttons">
          <button type="button" class="btn btn-cancel" (click)="volver()">
            Cancelar
          </button>
          <button type="submit" class="btn btn-save" [disabled]="isLoading || !isFormValid()">
            <span *ngIf="!isLoading">
              <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              {{ isEditMode ? 'Actualizar Repartidor' : 'Guardar Repartidor' }}
            </span>
            <span *ngIf="isLoading">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Guardando...
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header-blue {
      background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .header-blue h4 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
    }

    .header-blue p {
      font-size: 14px;
      opacity: 0.9;
    }

    .btn-back {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-back:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .section {
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .section-blue {
      background: #EFF6FF;
      border: 2px solid #DBEAFE;
    }

    .section-green {
      background: #F0FDF4;
      border: 2px solid #DCFCE7;
    }

    .section-purple {
      background: #F5F3FF;
      border: 2px solid #EDE9FE;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .section-header h6 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
    }

    .section-header svg {
      color: #6b7280;
    }

    .section-body {
      background: white;
      border-radius: 12px;
      padding: 20px;
    }

    .form-label-custom {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
      display: block;
    }

    .form-control-custom {
      width: 100%;
      padding: 12px 14px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .form-control-custom:focus {
      border-color: #4F46E5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      outline: none;
    }

    .form-control-custom:disabled {
      background: #f3f4f6;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .section-green .form-control-custom:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .section-purple .form-control-custom:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }

    .text-danger {
      color: #ef4444;
    }

    .text-muted {
      color: #6b7280;
      font-size: 12px;
    }

    .form-check-input {
      cursor: pointer;
      width: 44px;
      height: 24px;
    }

    .form-check-input:checked {
      background-color: #10b981;
      border-color: #10b981;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-cancel {
      flex: 1;
      padding: 14px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #F9FAFB;
      border-color: #d1d5db;
    }

    .btn-save {
      flex: 2;
      padding: 14px;
      background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .header-blue {
        flex-direction: column;
        text-align: center;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-save {
        flex: 1;
      }
    }
  `]
})
export class NuevoRepartidorPageComponent implements OnInit {
  repartidor: any = {
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    vehiculo: '',
    patente: '',
    direccion: '',
    estado: 'activo',
    estadoColor: 'success',
    disponible: true,
    pedidosCompletados: 0,
    calificacion: 0,
    fechaIngreso: new Date()
  };

  isEditMode: boolean = false;
  repartidorId: number | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private repartidoresService: RepartidoresService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.repartidorId = +params['id'];
        this.cargarRepartidor();
      }
    });
  }

  cargarRepartidor(): void {
    if (!this.repartidorId) return;

    this.isLoading = true;
    this.repartidoresService.getRepartidorById(this.repartidorId).subscribe({
      next: (data) => {
        if (data) {
          this.repartidor = { ...data };
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar repartidor:', error);
        this.errorMessage = 'Error al cargar el repartidor';
        this.isLoading = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.repartidor.nombre &&
      this.repartidor.apellido &&
      this.repartidor.dni &&
      this.repartidor.telefono &&
      this.repartidor.email &&
      this.repartidor.vehiculo
    );
  }

  guardarRepartidor(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.repartidorId) {
      // Actualizar repartidor existente
      this.repartidoresService.actualizarRepartidor(this.repartidorId, this.repartidor).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Repartidor actualizado exitosamente';

          setTimeout(() => {
            this.router.navigate(['/dashboard/repartidores']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error al actualizar el repartidor';
          console.error('Error:', error);
        }
      });
    } else {
      // Crear nuevo repartidor
      this.repartidoresService.crearRepartidor(this.repartidor).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Repartidor creado exitosamente';

          setTimeout(() => {
            this.router.navigate(['/dashboard/repartidores']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error al crear el repartidor';
          console.error('Error:', error);
        }
      });
    }
  }

  getFechaIngresoForInput(): string {
    if (this.repartidor.fechaIngreso) {
      const fecha = new Date(this.repartidor.fechaIngreso);
      return fecha.toISOString().split('T')[0];
    }
    return '';
  }

  setFechaIngreso(value: string): void {
    this.repartidor.fechaIngreso = new Date(value);
  }

  volver(): void {
    const hasChanges = this.repartidor.nombre || this.repartidor.apellido || this.repartidor.dni;

    if (hasChanges && !this.isEditMode) {
      if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/dashboard/repartidores']);
      }
    } else {
      this.router.navigate(['/dashboard/repartidores']);
    }
  }
}