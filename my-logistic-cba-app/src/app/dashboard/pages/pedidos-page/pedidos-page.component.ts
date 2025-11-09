import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { ToastService } from '../../../services/toast.service';
import { Order } from '../../../models/order.model';

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
            <div class="col-md-4">
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="searchTerm"
                (ngModelChange)="applyFilters()"
                placeholder="Buscar por número de pedido, cliente..."
              >
            </div>
            <div class="col-md-3">
              <label class="form-label">Estado</label>
              <select class="form-select" [(ngModel)]="filtroEstado" (ngModelChange)="applyFilters()">
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="PROCESSING">Procesando</option>
                <option value="IN_TRANSIT">En Tránsito</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Desde</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="filtroFechaDesde"
                (ngModelChange)="applyFilters()"
              >
            </div>
            <div class="col-md-2">
              <label class="form-label">Hasta</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="filtroFechaHasta"
                (ngModelChange)="applyFilters()"
              >
            </div>
            <div class="col-md-1 d-flex align-items-end">
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
        <p class="mt-3 text-muted">Cargando pedidos...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && pedidosFiltrados.length === 0" class="text-center py-5">
        <svg class="mb-3" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <h6>No se encontraron pedidos</h6>
        <p class="text-muted">{{ searchTerm || filtroEstado || filtroFechaDesde || filtroFechaHasta ? 'Intenta ajustar los filtros' : 'Crea tu primer pedido para comenzar' }}</p>
      </div>

      <!-- Tabla de Pedidos -->
      <div class="card" *ngIf="!isLoading && pedidosFiltrados.length > 0">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Nº Pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th class="text-end">Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let pedido of pedidosFiltrados">
                  <td><strong>#{{ pedido.orderNumber }}</strong></td>
                  <td>{{ formatDate(pedido.createdAt) }}</td>
                  <td>{{ pedido.customerName || 'N/A' }}</td>
                  <td>
                    <small class="text-muted">{{ pedido.customerAddress || 'N/A' }}</small>
                  </td>
                  <td class="text-end">
                    <strong>\${{ pedido.totalAmount | number:'1.2-2' }}</strong>
                  </td>
                  <td>
                    <span [class]="'badge bg-' + getStatusColor(pedido.status)">
                      {{ getStatusLabel(pedido.status) }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-icon" (click)="verDetalle(pedido)" title="Ver detalles">
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

      <!-- Info de resultados -->
      <div class="mt-3 text-muted" *ngIf="!isLoading && pedidosFiltrados.length > 0">
        Mostrando {{ pedidosFiltrados.length }} de {{ pedidos.length }} pedidos
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

    .btn-secondary {
      background: #6b7280;
      border: none;
      border-radius: 8px;
      padding: 10px 12px;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
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

    .spinner-border {
      width: 3rem;
      height: 3rem;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `]
})
export class PedidosPageComponent implements OnInit {
  private router = inject(Router);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  pedidos: Order[] = [];
  pedidosFiltrados: Order[] = [];
  isLoading = false;

  // Filtros
  searchTerm: string = '';
  filtroEstado: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAll().subscribe({
      next: (orders) => {
        this.pedidos = orders;
        this.pedidosFiltrados = orders;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Error al cargar los pedidos');
        console.error('Error loading orders:', error);
      }
    });
  }

  applyFilters(): void {
    this.pedidosFiltrados = this.pedidos.filter(pedido => {
      // Filtro de búsqueda por texto
      const matchesSearch = !this.searchTerm ||
        pedido.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pedido.customerName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pedido.customerAddress?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro por estado
      const matchesStatus = !this.filtroEstado || pedido.status === this.filtroEstado;

      // Filtro por fecha desde
      const matchesFechaDesde = !this.filtroFechaDesde ||
        new Date(pedido.createdAt) >= new Date(this.filtroFechaDesde);

      // Filtro por fecha hasta
      const matchesFechaHasta = !this.filtroFechaHasta ||
        new Date(pedido.createdAt) <= new Date(this.filtroFechaHasta + 'T23:59:59');

      return matchesSearch && matchesStatus && matchesFechaDesde && matchesFechaHasta;
    });
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'PROCESSING': 'Procesando',
      'IN_TRANSIT': 'En Tránsito',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'secondary',
      'PROCESSING': 'primary',
      'IN_TRANSIT': 'warning',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return colorMap[status] || 'secondary';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  verDetalle(pedido: Order): void {
    // TODO: Implementar vista de detalle del pedido
    this.toastService.info(`Ver detalle del pedido #${pedido.orderNumber}`);
    console.log('Ver detalle:', pedido);
  }

  goToNuevoPedido(): void {
    this.router.navigate(['/dashboard/pedidos/nuevo']);
  }
}
