import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../services/vehicle.service';
import { ToastService } from '../../../services/toast.service';
import { VehicleResponse, VehicleRequest } from '../../../models/vehicle.model';
import { TimestampPipe } from '../../../pipes/timestamp.pipe';

@Component({
  selector: 'app-vehiculos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TimestampPipe],
  template: `
    <div class="page-container">
      <!-- Header con botón -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="mb-1">Gestión de Vehículos</h5>
          <p class="text-muted mb-0">Administra la flota de vehículos</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateVehicleModal()">
          <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nuevo Vehículo
        </button>
      </div>

      <!-- Buscador -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-10">
              <div class="search-box">
                <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  type="text"
                  class="form-control ps-5"
                  placeholder="Buscar por patente o modelo..."
                  [(ngModel)]="searchTerm"
                  [ngModelOptions]="{standalone: true}"
                  (ngModelChange)="applyFilters()"
                >
              </div>
            </div>
            <div class="col-md-2">
              <button class="btn btn-secondary w-100" (click)="limpiarFiltros()" title="Limpiar filtros">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando vehículos...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && vehiculosFiltrados.length === 0" class="text-center py-5">
        <svg class="mb-3" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0h-.01M15 17a2 2 0 104 0m-4 0h-.01M9 17h6"></path>
        </svg>
        <h6>No se encontraron vehículos</h6>
        <p class="text-muted">{{ searchTerm ? 'Intenta ajustar los filtros' : 'Crea tu primer vehículo para comenzar' }}</p>
      </div>

      <!-- Tabla de Vehículos -->
      <div class="card" *ngIf="!isLoading && vehiculosFiltrados.length > 0">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Patente</th>
                  <th>Modelo</th>
                  <th>Capacidad</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let vehiculo of vehiculosFiltrados">
                  <td>
                    <strong>{{ vehiculo.plate }}</strong>
                  </td>
                  <td>{{ vehiculo.model || '-' }}</td>
                  <td>
                    <span class="badge bg-info">
                      {{ vehiculo.capacity }} unidades
                    </span>
                  </td>
                  <td>{{ vehiculo.createdAt | timestamp: 'dd/MM/yyyy' }}</td>
                  <td>
                    <button
                      class="btn btn-sm btn-icon text-primary me-2"
                      title="Editar vehículo"
                      (click)="openEditVehicleModal(vehiculo)"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      class="btn btn-sm btn-icon text-danger"
                      title="Eliminar vehículo"
                      (click)="openDeleteModal(vehiculo)"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Info de resultados -->
      <div class="mt-3 text-muted" *ngIf="!isLoading && vehiculosFiltrados.length > 0">
        Mostrando {{ vehiculosFiltrados.length }} de {{ vehiculos.length }} vehículos
      </div>

      <!-- Modal Crear/Editar Vehículo -->
      <div class="modal fade" [class.show]="showVehicleModal" [style.display]="showVehicleModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showVehicleModal" (click)="closeVehicleModal()"></div>
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditMode ? 'Editar Vehículo' : 'Crear Nuevo Vehículo' }}</h5>
              <button type="button" class="btn-close" (click)="closeVehicleModal()"></button>
            </div>
            <div class="modal-body">
              <!-- Formulario -->
              <form (ngSubmit)="saveVehicle()" #vehicleForm="ngForm">
                <div class="mb-3">
                  <label for="plate" class="form-label">Patente *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="plate"
                    [(ngModel)]="newVehicle.plate"
                    name="plate"
                    required
                    placeholder="Ej: ABC123"
                    [disabled]="isEditMode"
                  />
                  <small class="form-text text-muted">La patente no puede modificarse después de crear el vehículo</small>
                </div>

                <div class="mb-3">
                  <label for="model" class="form-label">Modelo</label>
                  <input
                    type="text"
                    class="form-control"
                    id="model"
                    [(ngModel)]="newVehicle.model"
                    name="model"
                    placeholder="Ej: Ford Transit 2020"
                  />
                </div>

                <div class="mb-3">
                  <label for="capacity" class="form-label">Capacidad *</label>
                  <input
                    type="number"
                    class="form-control"
                    id="capacity"
                    [(ngModel)]="newVehicle.capacity"
                    name="capacity"
                    required
                    min="1"
                    placeholder="Ej: 100"
                  />
                  <small class="form-text text-muted">Capacidad máxima en unidades</small>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeVehicleModal()" [disabled]="isCreating">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" (click)="saveVehicle()" [disabled]="isCreating || !isFormValid()">
                <span *ngIf="!isCreating">{{ isEditMode ? 'Guardar Cambios' : 'Crear Vehículo' }}</span>
                <span *ngIf="isCreating">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isEditMode ? 'Guardando...' : 'Creando...' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Eliminar Vehículo -->
      <div class="modal fade" [class.show]="showDeleteModal" [style.display]="showDeleteModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showDeleteModal" (click)="closeDeleteModal()"></div>
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-bottom-0">
              <h5 class="modal-title text-danger">
                <svg class="me-2" width="24" height="24" fill="currentColor" viewBox="0 0 20 20" style="display: inline-block; vertical-align: middle;">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                Confirmar Eliminación
              </h5>
              <button type="button" class="btn-close" (click)="closeDeleteModal()"></button>
            </div>
            <div class="modal-body">
              <p class="mb-2">¿Estás seguro de que deseas eliminar el vehículo <strong>{{ vehicleToDelete?.plate }}</strong>?</p>
              <p class="text-muted mb-0">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer border-top-0">
              <button type="button" class="btn btn-secondary" (click)="closeDeleteModal()" [disabled]="isDeleting">
                Cancelar
              </button>
              <button type="button" class="btn btn-danger" (click)="confirmDelete()" [disabled]="isDeleting">
                <span *ngIf="!isDeleting">Eliminar</span>
                <span *ngIf="isDeleting">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Eliminando...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
    }

    .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .btn-primary {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    .search-box {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: #9ca3af;
    }

    .form-control, .form-select {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 14px;
    }

    .form-control:focus, .form-select:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .table {
      font-size: 14px;
    }

    .table thead th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
      padding: 12px 16px;
    }

    .table tbody td {
      padding: 16px;
      vertical-align: middle;
      border-bottom: 1px solid #f3f4f6;
    }

    .table tbody tr:hover {
      background-color: #f9fafb;
    }

    .badge {
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 12px;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .btn-icon:hover:not(:disabled) {
      background: #f3f4f6;
    }

    .modal {
      background: rgba(0, 0, 0, 0.5);
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }

    .modal-dialog {
      position: relative;
      z-index: 1050;
    }

    .modal-content {
      border: none;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      border-bottom: 1px solid #e5e7eb;
      padding: 20px 24px;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-footer {
      border-top: 1px solid #e5e7eb;
      padding: 16px 24px;
    }

    .btn-secondary {
      background: #e5e7eb;
      border: none;
      color: #374151;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #d1d5db;
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      color: #6b7280;
      cursor: pointer;
      padding: 0;
      width: 1em;
      height: 1em;
    }

    .btn-close:hover {
      color: #000;
    }

    .btn-close::before {
      content: "×";
      display: block;
    }

    .btn-danger {
      background: #ef4444;
      border: none;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }

    .btn-danger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-icon:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .modal.show {
      display: block !important;
    }

    .modal-backdrop.show {
      opacity: 1;
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
      border-width: 0.15em;
    }

    .table-responsive {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      width: 100%;
    }

    /* Mobile responsive styles */
    @media (max-width: 768px) {
      .d-flex.justify-content-between.align-items-center {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 1rem;
      }

      .d-flex.gap-2 {
        flex-direction: column !important;
        width: 100%;
        gap: 0.5rem !important;
      }

      .d-flex.gap-2 .btn {
        width: 100%;
        justify-content: center;
      }

      .table-responsive {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .table {
        min-width: 700px;
      }

      .modal-dialog {
        margin: 0.5rem;
        max-width: calc(100% - 1rem);
      }

      .modal-body {
        padding: 1rem;
      }

      .card-body {
        padding: 1rem;
      }

      .btn {
        font-size: 13px;
        padding: 6px 12px;
      }

      h5 {
        font-size: 1.1rem;
      }

      .row.g-3 {
        gap: 0.5rem !important;
      }

      .col-md-3, .col-md-4, .col-md-6 {
        width: 100%;
        margin-bottom: 0.5rem;
      }
    }

    @media (max-width: 576px) {
      .table thead th,
      .table tbody td {
        padding: 8px;
        font-size: 12px;
      }

      .btn-icon {
        padding: 4px;
      }

      .badge {
        font-size: 10px;
        padding: 3px 8px;
      }
    }
  `]
})
export class VehiculosPageComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private toastService = inject(ToastService);

  vehiculos: VehicleResponse[] = [];
  vehiculosFiltrados: VehicleResponse[] = [];
  isLoading = false;
  errorMessage = '';

  // Filtros
  searchTerm: string = '';

  // Modal create/edit vehicle
  showVehicleModal = false;
  isCreating = false;
  isEditMode = false;
  editingVehicleId: string | null = null;

  // Modal delete vehicle
  showDeleteModal = false;
  isDeleting = false;
  vehicleToDelete: VehicleResponse | null = null;

  newVehicle: VehicleRequest = {
    plate: '',
    model: '',
    capacity: 0
  };

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.vehicleService.getAll().subscribe({
      next: (vehicles) => {
        this.vehiculos = vehicles;
        this.vehiculosFiltrados = vehicles;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cargar vehículos';
        this.isLoading = false;
        this.toastService.error(this.errorMessage);
      }
    });
  }

  applyFilters(): void {
    this.vehiculosFiltrados = this.vehiculos.filter(v => {
      const matchesSearch = !this.searchTerm ||
        v.plate.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (v.model && v.model.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  // Modal methods
  openCreateVehicleModal(): void {
    this.isEditMode = false;
    this.showVehicleModal = true;
    this.resetForm();
  }

  openEditVehicleModal(vehicle: VehicleResponse): void {
    this.isEditMode = true;
    this.showVehicleModal = true;
    this.editingVehicleId = vehicle.id;
    this.newVehicle = {
      plate: vehicle.plate,
      model: vehicle.model || '',
      capacity: vehicle.capacity
    };
  }

  closeVehicleModal(): void {
    this.showVehicleModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newVehicle = {
      plate: '',
      model: '',
      capacity: 0
    };
    this.editingVehicleId = null;
    this.isEditMode = false;
  }

  isFormValid(): boolean {
    return !!(this.newVehicle.plate && this.newVehicle.capacity > 0);
  }

  saveVehicle(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Por favor completa los campos requeridos');
      return;
    }

    this.isCreating = true;

    if (this.isEditMode && this.editingVehicleId) {
      // Update existing vehicle
      this.vehicleService.update(this.editingVehicleId, this.newVehicle).subscribe({
        next: () => {
          this.toastService.success('Vehículo actualizado exitosamente');
          this.loadVehicles();
          this.closeVehicleModal();
          this.isCreating = false;
        },
        error: (error) => {
          this.toastService.error(error.message || 'Error al actualizar el vehículo');
          this.isCreating = false;
        }
      });
    } else {
      // Create new vehicle
      this.vehicleService.create(this.newVehicle).subscribe({
        next: () => {
          this.toastService.success('Vehículo creado exitosamente');
          this.loadVehicles();
          this.closeVehicleModal();
          this.isCreating = false;
        },
        error: (error) => {
          this.toastService.error(error.message || 'Error al crear el vehículo');
          this.isCreating = false;
        }
      });
    }
  }

  // Delete methods
  openDeleteModal(vehicle: VehicleResponse): void {
    this.vehicleToDelete = vehicle;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.vehicleToDelete = null;
  }

  confirmDelete(): void {
    if (!this.vehicleToDelete) return;

    this.isDeleting = true;
    this.vehicleService.delete(this.vehicleToDelete.id).subscribe({
      next: () => {
        this.toastService.success('Vehículo eliminado exitosamente');
        this.loadVehicles();
        this.closeDeleteModal();
        this.isDeleting = false;
      },
      error: (error) => {
        this.toastService.error(error.message || 'Error al eliminar el vehículo');
        this.isDeleting = false;
      }
    });
  }
}
