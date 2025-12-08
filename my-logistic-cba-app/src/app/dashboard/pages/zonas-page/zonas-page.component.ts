import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZoneService } from '../../../services/zone.service';
import { ToastService } from '../../../services/toast.service';
import { ZoneResponse, ZoneRequest } from '../../../models/zone.model';
import { TimestampPipe } from '../../../pipes/timestamp.pipe';

@Component({
  selector: 'app-zonas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TimestampPipe],
  template: `
    <div class="page-container">
      <!-- Header con botón -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="mb-1">Gestión de Zonas</h5>
          <p class="text-muted mb-0">Administra las zonas de distribución</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateZoneModal()">
          <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nueva Zona
        </button>
      </div>

      <!-- Buscador -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-8">
              <div class="search-box">
                <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  type="text"
                  class="form-control ps-5"
                  placeholder="Buscar por nombre..."
                  [(ngModel)]="searchTerm"
                  [ngModelOptions]="{standalone: true}"
                  (ngModelChange)="applyFilters()"
                >
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filtroEstado" [ngModelOptions]="{standalone: true}" (ngModelChange)="applyFilters()">
                <option value="">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
            <div class="col-md-1">
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
        <p class="mt-3 text-muted">Cargando zonas...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && zonasFiltradas.length === 0" class="text-center py-5">
        <svg class="mb-3" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
        <h6>No se encontraron zonas</h6>
        <p class="text-muted">{{ searchTerm || filtroEstado ? 'Intenta ajustar los filtros' : 'Crea tu primera zona para comenzar' }}</p>
      </div>

      <!-- Tabla de Zonas -->
      <div class="card" *ngIf="!isLoading && zonasFiltradas.length > 0">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Color</th>
                  <th>Estado</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let zona of zonasFiltradas">
                  <td>
                    <strong>{{ zona.name }}</strong>
                  </td>
                  <td>{{ zona.description || '-' }}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div
                        class="color-box"
                        [style.background-color]="zona.color || '#6c757d'"
                      ></div>
                      <span class="text-muted">{{ zona.color || '-' }}</span>
                    </div>
                  </td>
                  <td>
                    <span [class]="'badge bg-' + (zona.isActive ? 'success' : 'secondary')">
                      {{ zona.isActive ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td>{{ zona.createdAt | timestamp: 'dd/MM/yyyy' }}</td>
                  <td>
                    <button
                      class="btn btn-sm btn-icon text-primary me-2"
                      title="Editar zona"
                      (click)="openEditZoneModal(zona)"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      class="btn btn-sm btn-icon text-danger"
                      title="Eliminar zona"
                      (click)="openDeleteModal(zona)"
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
      <div class="mt-3 text-muted" *ngIf="!isLoading && zonasFiltradas.length > 0">
        Mostrando {{ zonasFiltradas.length }} de {{ zonas.length }} zonas
      </div>

      <!-- Modal Crear/Editar Zona -->
      <div class="modal fade" [class.show]="showZoneModal" [style.display]="showZoneModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showZoneModal" (click)="closeZoneModal()"></div>
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditMode ? 'Editar Zona' : 'Crear Nueva Zona' }}</h5>
              <button type="button" class="btn-close" (click)="closeZoneModal()"></button>
            </div>
            <div class="modal-body">
              <!-- Formulario -->
              <form (ngSubmit)="saveZone()" #zoneForm="ngForm">
                <div class="mb-3">
                  <label for="name" class="form-label">Nombre *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    [(ngModel)]="newZone.name"
                    name="name"
                    required
                    placeholder="Ej: Zona Norte"
                  />
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Descripción</label>
                  <textarea
                    class="form-control"
                    id="description"
                    [(ngModel)]="newZone.description"
                    name="description"
                    rows="3"
                    placeholder="Descripción de la zona..."
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label for="color" class="form-label">Color</label>
                  <div class="d-flex gap-2 align-items-center">
                    <input
                      type="color"
                      class="form-control form-control-color"
                      id="color"
                      [(ngModel)]="newZone.color"
                      name="color"
                      style="width: 60px;"
                    />
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="newZone.color"
                      name="colorText"
                      placeholder="#000000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                  <small class="form-text text-muted">Formato hexadecimal (ej: #FF5733)</small>
                </div>

                <div class="mb-3 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="isActive"
                    [(ngModel)]="newZone.isActive"
                    name="isActive"
                  />
                  <label class="form-check-label" for="isActive">
                    Zona activa
                  </label>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeZoneModal()" [disabled]="isCreating">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" (click)="saveZone()" [disabled]="isCreating || !isFormValid()">
                <span *ngIf="!isCreating">{{ isEditMode ? 'Guardar Cambios' : 'Crear Zona' }}</span>
                <span *ngIf="isCreating">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isEditMode ? 'Guardando...' : 'Creando...' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Eliminar Zona -->
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
              <p class="mb-2">¿Estás seguro de que deseas eliminar la zona <strong>{{ zoneToDelete?.name }}</strong>?</p>
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

    .color-box {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
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

    .form-control-color {
      height: 42px;
      padding: 4px;
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
        min-width: 600px;
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
export class ZonasPageComponent implements OnInit {
  private zoneService = inject(ZoneService);
  private toastService = inject(ToastService);

  zonas: ZoneResponse[] = [];
  zonasFiltradas: ZoneResponse[] = [];
  isLoading = false;
  errorMessage = '';

  // Filtros
  searchTerm: string = '';
  filtroEstado: string = '';

  // Modal create/edit zone
  showZoneModal = false;
  isCreating = false;
  isEditMode = false;
  editingZoneId: string | null = null;

  // Modal delete zone
  showDeleteModal = false;
  isDeleting = false;
  zoneToDelete: ZoneResponse | null = null;

  newZone: ZoneRequest = {
    name: '',
    description: '',
    color: '#6366f1',
    isActive: true
  };

  ngOnInit(): void {
    this.loadZones();
  }

  loadZones(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.zoneService.getAll().subscribe({
      next: (zones) => {
        this.zonas = zones;
        this.zonasFiltradas = zones;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cargar zonas';
        this.isLoading = false;
        this.toastService.error(this.errorMessage);
      }
    });
  }

  applyFilters(): void {
    this.zonasFiltradas = this.zonas.filter(z => {
      const matchesSearch = !this.searchTerm ||
        z.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (z.description && z.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesEstado = !this.filtroEstado ||
        (this.filtroEstado === 'active' && z.isActive) ||
        (this.filtroEstado === 'inactive' && !z.isActive);

      return matchesSearch && matchesEstado;
    });
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.applyFilters();
  }

  // Modal methods
  openCreateZoneModal(): void {
    this.isEditMode = false;
    this.showZoneModal = true;
    this.resetForm();
  }

  openEditZoneModal(zone: ZoneResponse): void {
    this.isEditMode = true;
    this.showZoneModal = true;
    this.editingZoneId = zone.id;
    this.newZone = {
      name: zone.name,
      description: zone.description || '',
      color: zone.color || '#6366f1',
      isActive: zone.isActive
    };
  }

  closeZoneModal(): void {
    this.showZoneModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newZone = {
      name: '',
      description: '',
      color: '#6366f1',
      isActive: true
    };
    this.editingZoneId = null;
    this.isEditMode = false;
  }

  isFormValid(): boolean {
    return !!(this.newZone.name && this.newZone.name.trim().length > 0);
  }

  saveZone(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Por favor completa los campos requeridos');
      return;
    }

    this.isCreating = true;

    if (this.isEditMode && this.editingZoneId) {
      // Update existing zone
      this.zoneService.update(this.editingZoneId, this.newZone).subscribe({
        next: () => {
          this.toastService.success('Zona actualizada exitosamente');
          this.loadZones();
          this.closeZoneModal();
          this.isCreating = false;
        },
        error: (error) => {
          this.toastService.error(error.message || 'Error al actualizar la zona');
          this.isCreating = false;
        }
      });
    } else {
      // Create new zone
      this.zoneService.create(this.newZone).subscribe({
        next: () => {
          this.toastService.success('Zona creada exitosamente');
          this.loadZones();
          this.closeZoneModal();
          this.isCreating = false;
        },
        error: (error) => {
          this.toastService.error(error.message || 'Error al crear la zona');
          this.isCreating = false;
        }
      });
    }
  }

  // Delete methods
  openDeleteModal(zone: ZoneResponse): void {
    this.zoneToDelete = zone;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.zoneToDelete = null;
  }

  confirmDelete(): void {
    if (!this.zoneToDelete) return;

    this.isDeleting = true;
    this.zoneService.delete(this.zoneToDelete.id).subscribe({
      next: () => {
        this.toastService.success('Zona eliminada exitosamente');
        this.loadZones();
        this.closeDeleteModal();
        this.isDeleting = false;
      },
      error: (error) => {
        this.toastService.error(error.message || 'Error al eliminar la zona');
        this.isDeleting = false;
      }
    });
  }
}
