import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidosService } from '../../../services/pedidos.service';

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
            <div class="col-md-2">
              <label class="form-label">Producto</label>
              <select class="form-select" [(ngModel)]="filtros.producto" (change)="buscarPedidos()">
                <option value="">Todos</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Broker</label>
              <select class="form-select" [(ngModel)]="filtros.broker" (change)="buscarPedidos()">
                <option value="">Todos</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Repartidor</label>
              <select class="form-select" [(ngModel)]="filtros.repartidor" (change)="buscarPedidos()">
                <option value="">Todos</option>
                <option value="sin_asignar">Sin asignar</option>
                <option value="asignado">Con repartidor</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Desde</label>
              <input type="date" class="form-control" [(ngModel)]="filtros.fechaDesde" (change)="buscarPedidos()">
            </div>
            <div class="col-md-2">
              <label class="form-label">Hasta</label>
              <input type="date" class="form-control" [(ngModel)]="filtros.fechaHasta" (change)="buscarPedidos()">
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-primary w-100" (click)="buscarPedidos()">
                <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Spinner de carga -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando pedidos...</p>
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
                  <th>Repartidor</th>
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
                    <span *ngIf="pedido.repartidor" class="badge badge-repartidor">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      {{ pedido.repartidor }}
                    </span>
                    <span *ngIf="!pedido.repartidor" class="text-muted">Sin asignar</span>
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

    .badge-repartidor {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: #f0f9ff;
      color: #0369a1;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
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

export class PedidosPageComponent implements OnInit {
  pedidos: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  // Filtros
  filtros = {
    producto: '',
    broker: '',
    repartidor: '',
    fechaDesde: '2025-09-24',
    fechaHasta: '2025-11-24'
  };

  constructor(
    private router: Router,
    private pedidosService: PedidosService
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.pedidosService.getPedidos(this.filtros).subscribe({
      next: (data) => {
        this.pedidos = data;
        this.isLoading = false;
        console.log('Pedidos cargados:', data); // Para debug
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.errorMessage = 'Error al cargar los pedidos';
        this.isLoading = false;
      }
    });
  }

  buscarPedidos(): void {
    this.cargarPedidos();
  }

  goToNuevoPedido(): void {
    this.router.navigate(['/dashboard/pedidos/nuevo']);
  }
}