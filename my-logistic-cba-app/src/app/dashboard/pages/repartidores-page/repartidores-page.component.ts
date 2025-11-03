import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RepartidoresService } from '../../../services/repartidores.service';
import { Repartidor } from '../../../services/database.service';

@Component({
  selector: 'app-repartidores-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header con botón -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="mb-1">Gestión de Repartidores</h5>
          <p class="text-muted mb-0">Administra todos los repartidores del sistema</p>
        </div>
        <button class="btn btn-primary" (click)="goToNuevoRepartidor()">
          <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nuevo Repartidor
        </button>
      </div>

      <!-- Estadísticas -->
      <div class="row g-3 mb-4" *ngIf="estadisticas">
        <div class="col-md-3">
          <div class="stat-card stat-primary">
            <div class="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ estadisticas.total }}</div>
              <div class="stat-label">Total Repartidores</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card stat-success">
            <div class="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ estadisticas.disponibles }}</div>
              <div class="stat-label">Disponibles</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card stat-warning">
            <div class="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ estadisticas.enEntrega }}</div>
              <div class="stat-label">En Entrega</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card stat-info">
            <div class="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ estadisticas.calificacionPromedio | number:'1.1-1' }}</div>
              <div class="stat-label">Calificación</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Estado</label>
              <select class="form-select" [(ngModel)]="filtros.estado" (change)="aplicarFiltros()">
                <option value="todos">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="en_entrega">En Entrega</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Vehículo</label>
              <select class="form-select" [(ngModel)]="filtros.vehiculo" (change)="aplicarFiltros()">
                <option value="todos">Todos</option>
                <option value="moto">Moto</option>
                <option value="auto">Auto</option>
                <option value="bicicleta">Bicicleta</option>
                <option value="camioneta">Camioneta</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Disponibilidad</label>
              <select class="form-select" [(ngModel)]="filtros.disponible" (change)="aplicarFiltros()">
                <option value="todos">Todos</option>
                <option value="true">Disponible</option>
                <option value="false">No Disponible</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="filtros.busqueda"
                (input)="aplicarFiltros()"
                placeholder="Nombre, DNI, email..."
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Spinner de carga -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando repartidores...</p>
      </div>

      <!-- Tabla de Repartidores -->
      <div class="card" *ngIf="!isLoading">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Repartidor</th>
                  <th>DNI</th>
                  <th>Contacto</th>
                  <th>Vehículo</th>
                  <th>Estado</th>
                  <th>Pedidos</th>
                  <th>Calificación</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let repartidor of repartidores">
                  <td><strong>#{{ repartidor.id }}</strong></td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar">
                        {{ repartidor.nombre.charAt(0) }}{{ repartidor.apellido.charAt(0) }}
                      </div>
                      <div class="ms-2">
                        <div class="fw-bold">{{ repartidor.nombre }} {{ repartidor.apellido }}</div>
                        <small class="text-muted">{{ repartidor.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ repartidor.dni }}</td>
                  <td>
                    <small>{{ repartidor.telefono }}</small>
                  </td>
                  <td>
                    <span class="badge-vehiculo badge-{{ repartidor.vehiculo }}">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      {{ repartidor.vehiculo | titlecase }}
                    </span>
                    <div *ngIf="repartidor.patente">
                      <small class="text-muted">{{ repartidor.patente }}</small>
                    </div>
                  </td>
                  <td>
                    <span [class]="'badge bg-' + repartidor.estadoColor">
                      {{ getEstadoLabel(repartidor.estado) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <strong>{{ repartidor.pedidosCompletados || 0 }}</strong>
                  </td>
                  <td>
                    <div class="rating">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                      </svg>
                      <span>{{ repartidor.calificacion || 0 | number:'1.1-1' }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        [checked]="repartidor.disponible"
                        (change)="toggleDisponibilidad(repartidor)"
                      >
                    </div>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button
                        class="btn btn-sm btn-icon"
                        title="Ver detalles"
                        (click)="verDetalles(repartidor)"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      <button
                        class="btn btn-sm btn-icon"
                        title="Editar"
                        (click)="editarRepartidor(repartidor)"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        class="btn btn-sm btn-icon btn-danger"
                        title="Eliminar"
                        (click)="eliminarRepartidor(repartidor)"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="repartidores.length === 0" class="text-center py-5">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="text-muted mb-3">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <p class="text-muted">No se encontraron repartidores</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1600px;
    }

    .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .form-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-select, .form-control {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
    }

    .form-select:focus, .form-control:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .btn-primary {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%);
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border-left: 4px solid;
    }

    .stat-primary { border-left-color: #2563eb; }
    .stat-success { border-left-color: #10b981; }
    .stat-warning { border-left-color: #f59e0b; }
    .stat-info { border-left-color: #8b5cf6; }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-primary .stat-icon { background: #eff6ff; color: #2563eb; }
    .stat-success .stat-icon { background: #f0fdf4; color: #10b981; }
    .stat-warning .stat-icon { background: #fffbeb; color: #f59e0b; }
    .stat-info .stat-icon { background: #f5f3ff; color: #8b5cf6; }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }

    .stat-label {
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
    }

    .table {
      margin: 0;
    }

    .table thead th {
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
      color: #6b7280;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      padding: 16px;
    }

    .table tbody td {
      padding: 16px;
      vertical-align: middle;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
    }

    .table tbody tr:hover {
      background: #f9fafb;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .badge {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
    }

    .badge-vehiculo {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-moto { background: #fef3c7; color: #92400e; }
    .badge-auto { background: #dbeafe; color: #1e40af; }
    .badge-bicicleta { background: #d1fae5; color: #065f46; }
    .badge-camioneta { background: #e9d5ff; color: #6b21a8; }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #f59e0b;
      font-weight: 600;
    }

    .btn-icon {
      background: none;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 6px 10px;
      color: #6b7280;
      margin-right: 4px;
    }

    .btn-icon:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .btn-icon.btn-danger {
      color: #ef4444;
      border-color: #fecaca;
    }

    .btn-icon.btn-danger:hover {
      background: #fef2f2;
      border-color: #fca5a5;
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
  `]
})
export class RepartidoresPageComponent implements OnInit {
  repartidores: Repartidor[] = [];
  estadisticas: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  filtros = {
    estado: 'todos',
    vehiculo: 'todos',
    disponible: 'todos',
    busqueda: ''
  };

  constructor(
    private router: Router,
    private repartidoresService: RepartidoresService
  ) {}

  ngOnInit(): void {
    this.cargarRepartidores();
    this.cargarEstadisticas();
  }

  cargarRepartidores(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.repartidoresService.getRepartidores(this.filtros).subscribe({
      next: (data) => {
        this.repartidores = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar repartidores:', error);
        this.errorMessage = 'Error al cargar los repartidores';
        this.isLoading = false;
      }
    });
  }

  cargarEstadisticas(): void {
    this.repartidoresService.getEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarRepartidores();
  }

  toggleDisponibilidad(repartidor: Repartidor): void {
    const nuevaDisponibilidad = !repartidor.disponible;

    this.repartidoresService.cambiarDisponibilidad(repartidor.id!, nuevaDisponibilidad).subscribe({
      next: () => {
        repartidor.disponible = nuevaDisponibilidad;
        this.cargarEstadisticas();
      },
      error: (error) => {
        console.error('Error al cambiar disponibilidad:', error);
        alert('Error al cambiar la disponibilidad');
      }
    });
  }

  getEstadoLabel(estado: string): string {
    const labels: any = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'en_entrega': 'En Entrega'
    };
    return labels[estado] || estado;
  }

  goToNuevoRepartidor(): void {
    this.router.navigate(['/dashboard/repartidores/nuevo']);
  }

  verDetalles(repartidor: Repartidor): void {
    // TODO: Implementar vista de detalles
    console.log('Ver detalles:', repartidor);
    alert(`Detalles de ${repartidor.nombre} ${repartidor.apellido}\n\nEsta funcionalidad se implementará próximamente.`);
  }

  editarRepartidor(repartidor: Repartidor): void {
    this.router.navigate(['/dashboard/repartidores/editar', repartidor.id]);
  }

  eliminarRepartidor(repartidor: Repartidor): void {
    const confirmacion = confirm(`¿Estás seguro de eliminar al repartidor ${repartidor.nombre} ${repartidor.apellido}?`);

    if (confirmacion) {
      this.repartidoresService.eliminarRepartidor(repartidor.id!).subscribe({
        next: () => {
          this.cargarRepartidores();
          this.cargarEstadisticas();
          alert('Repartidor eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar repartidor:', error);
          alert('Error al eliminar el repartidor');
        }
      });
    }
  }
}