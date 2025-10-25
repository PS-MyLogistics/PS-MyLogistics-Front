import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedidos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header con botón -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="mb-1">Gestión de Pedidos</h5>
          <p class="text-muted mb-0">Administra todos los pedidos del sistema</p>
        </div>
        <button class="btn btn-primary" (click)="goToNuevoPedido()">
          <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nuevo Pedido
        </button>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Producto</label>
              <select class="form-select">
                <option>Seleccione una opción</option>
                <option>Todos</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Broker</label>
              <select class="form-select">
                <option>Seleccione una opción</option>
                <option>Todos</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Desde</label>
              <input type="date" class="form-control" value="2025-09-24">
            </div>
            <div class="col-md-2">
              <label class="form-label">Hasta</label>
              <input type="date" class="form-control" value="2025-10-24">
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-primary w-100">
                <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Pedidos -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Broker</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let pedido of pedidos">
                  <td><strong>{{ pedido.id }}</strong></td>
                  <td>{{ pedido.fecha }}</td>
                  <td>{{ pedido.producto }}</td>
                  <td>{{ pedido.broker }}</td>
                  <td>{{ pedido.cliente }}</td>
                  <td>
                    <small class="text-muted">{{ pedido.direccion }}</small>
                  </td>
                  <td>
                    <span [class]="'badge bg-' + pedido.estadoColor">
                      {{ pedido.estado }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-icon" title="Ver detalles">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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

    .badge {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
    }

    .btn-icon {
      background: none;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 6px 10px;
      color: #6b7280;
    }

    .btn-icon:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }
  `]
})
export class PedidosPageComponent {
  constructor(private router: Router) {}

  pedidos = [
    { id: 1, fecha: '2025-10-15', producto: 'Paquete Estándar', broker: 'María Rodríguez', cliente: 'Elena Hernández', direccion: 'Av. Colón 1234, Córdoba, Argentina', estado: 'Entregado', estadoColor: 'success' },
    { id: 2, fecha: '2025-10-20', producto: 'Paquete Express', broker: 'Juan Pérez', cliente: 'Javier García', direccion: 'San Martín 567, Piso 3, Rosario, Argentina', estado: 'En Tránsito', estadoColor: 'warning' },
    { id: 3, fecha: '2025-09-29', producto: 'Paquete Premium', broker: 'María Rodríguez', cliente: 'Laura Sánchez', direccion: 'Av. Belgrano 890, Buenos Aires, Argentina', estado: 'Procesando', estadoColor: 'primary' },
    { id: 4, fecha: '2025-09-30', producto: 'Paquete Grande', broker: 'María Rodríguez', cliente: 'Elena Sánchez', direccion: 'Independencia 234, Mendoza, Argentina', estado: 'Pendiente', estadoColor: 'secondary' },
    { id: 5, fecha: '2025-10-12', producto: 'Paquete Express', broker: 'Juan Pérez', cliente: 'Patricia Sánchez', direccion: 'Rivadavia 456, Salta, Argentina', estado: 'Entregado', estadoColor: 'success' },
    { id: 6, fecha: '2025-09-27', producto: 'Paquete Estándar', broker: 'Sofía Gómez', cliente: 'David Martín', direccion: 'Mitre 789, Tucumán, Argentina', estado: 'En Tránsito', estadoColor: 'warning' }
  ];

  goToNuevoPedido(): void {
    this.router.navigate(['/dashboard/pedidos/nuevo']);
  }
}