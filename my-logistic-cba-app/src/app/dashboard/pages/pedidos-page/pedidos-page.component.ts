import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { ToastService } from '../../../services/toast.service';
import { UserService } from '../../../services/user.service';
import { DistributionService } from '../../../services/distribution.service';
import { ZoneService } from '../../../services/zone.service';
import { CustomerService } from '../../../services/customer.service';
import { AuthService } from '../../../services/auth.service';
import { Order } from '../../../models/order.model';
import { UserDto, Role } from '../../../models/user.model';
import { DistributionCreationRequest } from '../../../models/distribution.model';
import { ZoneResponse } from '../../../models/zone.model';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-pedidos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header con botón -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="mb-1">{{ isDealer ? 'Mis Pedidos' : 'Gestión de Pedidos' }}</h5>
          <p class="text-muted mb-0">{{ isDealer ? 'Pedidos asignados a ti' : 'Administra todos los pedidos del sistema' }}</p>
        </div>
        <button *ngIf="!isDealer" class="btn btn-primary" (click)="goToNuevoPedido()">
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
              <label class="form-label">Buscar</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="searchTerm"
                [ngModelOptions]="{standalone: true}"
                (ngModelChange)="applyFilters()"
                placeholder="Buscar por número de pedido, cliente..."
              >
            </div>
            <div class="col-md-2">
              <label class="form-label">Estado</label>
              <select class="form-select" [(ngModel)]="filtroEstado" [ngModelOptions]="{standalone: true}" (ngModelChange)="applyFilters()">
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="PROCESSING">Procesando</option>
                <option value="IN_TRANSIT">En Tránsito</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Zona</label>
              <select class="form-select" [(ngModel)]="filtroZona" [ngModelOptions]="{standalone: true}" (ngModelChange)="applyFilters()">
                <option value="">Todas las zonas</option>
                <option *ngFor="let zone of zones" [value]="zone.id">{{ zone.name }}</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Desde</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="filtroFechaDesde"
                [ngModelOptions]="{standalone: true}"
                (ngModelChange)="applyFilters()"
              >
            </div>
            <div class="col-md-2">
              <label class="form-label">Hasta</label>
              <input
                type="date"
                class="form-control"
                [(ngModel)]="filtroFechaHasta"
                [ngModelOptions]="{standalone: true}"
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
        <p class="text-muted">{{ searchTerm || filtroEstado || filtroZona || filtroFechaDesde || filtroFechaHasta ? 'Intenta ajustar los filtros' : 'Crea tu primer pedido para comenzar' }}</p>
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
                  <th>Zona</th>
                  <th class="text-end">Total</th>
                  <th>Repartidor</th>
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
                  <td>
                    <span *ngIf="pedido.customerZoneName" class="badge" [style.background-color]="pedido.customerZoneColor" [style.color]="'white'">
                      {{ pedido.customerZoneName }}
                    </span>
                    <span *ngIf="!pedido.customerZoneName" class="text-muted">Sin zona</span>
                  </td>
                  <td class="text-end">
                    <strong>\${{ pedido.totalAmount | number:'1.2-2' }}</strong>
                  </td>
                  <td>
                    <span *ngIf="pedido.dealerName" class="text-primary">{{ pedido.dealerName }}</span>
                    <button *ngIf="!pedido.dealerName && !isDealer" class="btn btn-sm btn-outline-primary" (click)="openAssignDealerModal(pedido)">
                      Asignar
                    </button>
                    <span *ngIf="!pedido.dealerName && isDealer" class="text-muted">-</span>
                  </td>
                  <td>
                    <span [class]="'badge bg-' + getStatusColor(pedido.status)">
                      {{ getStatusLabel(pedido.status) }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-icon me-2" (click)="verDetalle(pedido)" title="Ver detalles">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button *ngIf="pedido.dealerName && !isDealer" class="btn btn-sm btn-icon" (click)="openAssignDealerModal(pedido)" title="Cambiar repartidor">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
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

      <!-- Modal Asignar Repartidor -->
      <div class="modal fade" [class.show]="showAssignDealerModal" [style.display]="showAssignDealerModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showAssignDealerModal" (click)="closeAssignDealerModal()"></div>
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ selectedOrder?.dealerName ? 'Cambiar' : 'Asignar' }} Repartidor</h5>
              <button type="button" class="btn-close" (click)="closeAssignDealerModal()"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Pedido</label>
                <p class="form-control-plaintext">#{{ selectedOrder?.orderNumber }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Cliente</label>
                <p class="form-control-plaintext">{{ selectedOrder?.customerName }}</p>
              </div>
              <div class="mb-3">
                <label for="dealerSelect" class="form-label fw-semibold">Repartidor *</label>
                <select class="form-select" id="dealerSelect" [(ngModel)]="selectedDealerId" name="dealerId" required>
                  <option value="">Seleccionar repartidor...</option>
                  <option *ngFor="let dealer of dealers" [value]="dealer.id">{{ dealer.username }}</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeAssignDealerModal()" [disabled]="isAssigning">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" (click)="assignDealer()" [disabled]="!selectedDealerId || isAssigning">
                <span *ngIf="!isAssigning">Asignar</span>
                <span *ngIf="isAssigning">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Asignando...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Detalles del Pedido -->
      <div class="modal fade" [class.show]="showDetailsModal" [style.display]="showDetailsModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showDetailsModal" (click)="closeDetailsModal()"></div>
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalles del Pedido #{{ selectedOrderDetails?.orderNumber }}</h5>
              <button type="button" class="btn-close" (click)="closeDetailsModal()"></button>
            </div>
            <div class="modal-body" *ngIf="selectedOrderDetails">
              <!-- Información General -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="detail-group">
                    <label class="detail-label">Fecha de Creación</label>
                    <p class="detail-value">{{ formatDate(selectedOrderDetails.createdAt) }}</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="detail-group">
                    <label class="detail-label">Estado</label>
                    <p class="detail-value">
                      <span [class]="'badge bg-' + getStatusColor(selectedOrderDetails.status)">
                        {{ getStatusLabel(selectedOrderDetails.status) }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Información del Cliente -->
              <h6 class="section-title">Información del Cliente</h6>
              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="detail-group">
                    <label class="detail-label">Nombre</label>
                    <p class="detail-value">{{ selectedOrderDetails.customerName || 'N/A' }}</p>
                  </div>
                </div>
                <div class="col-md-6" *ngIf="customerDetails">
                  <div class="detail-group">
                    <label class="detail-label">Email</label>
                    <p class="detail-value">{{ customerDetails.email || 'N/A' }}</p>
                  </div>
                </div>
                <div class="col-md-6" *ngIf="customerDetails">
                  <div class="detail-group">
                    <label class="detail-label">Teléfono</label>
                    <p class="detail-value">{{ customerDetails.phoneNumber || 'N/A' }}</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="detail-group">
                    <label class="detail-label">Dirección</label>
                    <p class="detail-value">{{ selectedOrderDetails.customerAddress || 'N/A' }}</p>
                  </div>
                </div>
                <div class="col-md-6" *ngIf="selectedOrderDetails.customerCity">
                  <div class="detail-group">
                    <label class="detail-label">Ciudad</label>
                    <p class="detail-value">{{ selectedOrderDetails.customerCity }}</p>
                  </div>
                </div>
                <div class="col-md-6" *ngIf="customerDetails">
                  <div class="detail-group">
                    <label class="detail-label">Provincia</label>
                    <p class="detail-value">{{ customerDetails.state || 'N/A' }}</p>
                  </div>
                </div>
                <div class="col-md-6" *ngIf="customerDetails">
                  <div class="detail-group">
                    <label class="detail-label">Código Postal</label>
                    <p class="detail-value">{{ customerDetails.postalCode || 'N/A' }}</p>
                  </div>
                </div>
                <div class="col-md-6" *ngIf="customerDetails && customerDetails.doorbell">
                  <div class="detail-group">
                    <label class="detail-label">Timbre</label>
                    <p class="detail-value">{{ customerDetails.doorbell }}</p>
                  </div>
                </div>
                <div class="col-md-6" *ngIf="selectedOrderDetails.customerZoneName">
                  <div class="detail-group">
                    <label class="detail-label">Zona</label>
                    <p class="detail-value">
                      <span class="badge" [style.background-color]="selectedOrderDetails.customerZoneColor" [style.color]="'white'">
                        {{ selectedOrderDetails.customerZoneName }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Repartidor Asignado -->
              <h6 class="section-title" *ngIf="selectedOrderDetails.dealerName">Repartidor</h6>
              <div class="row mb-4" *ngIf="selectedOrderDetails.dealerName">
                <div class="col-md-6">
                  <div class="detail-group">
                    <label class="detail-label">Nombre del Repartidor</label>
                    <p class="detail-value text-primary">{{ selectedOrderDetails.dealerName }}</p>
                  </div>
                </div>
              </div>

              <!-- Productos del Pedido -->
              <h6 class="section-title">Productos</h6>
              <div class="table-responsive mb-3">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th class="text-center">Cantidad</th>
                      <th class="text-end">Precio Unit.</th>
                      <th class="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of selectedOrderDetails.items">
                      <td>{{ item.productName || 'Producto' }}</td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-end">\${{ item.unitPrice | number:'1.2-2' }}</td>
                      <td class="text-end fw-semibold">\${{ item.subtotal | number:'1.2-2' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-active">
                      <td colspan="3" class="text-end fw-bold">Total:</td>
                      <td class="text-end fw-bold text-success">\${{ selectedOrderDetails.totalAmount | number:'1.2-2' }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Notas -->
              <div *ngIf="selectedOrderDetails.notes" class="mb-3">
                <h6 class="section-title">Notas</h6>
                <div class="alert alert-info mb-0">
                  {{ selectedOrderDetails.notes }}
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeDetailsModal()">
                Cerrar
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

    .modal {
      z-index: 1050;
    }

    .modal.show {
      display: block !important;
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

    .modal-backdrop.show {
      opacity: 1;
    }

    .modal-dialog {
      position: relative;
      z-index: 1050;
      margin: 1.75rem auto;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .form-control-plaintext {
      padding: 8px 0;
      margin: 0;
      font-weight: 500;
    }

    .btn-outline-primary {
      border: 1px solid #3b82f6;
      color: #3b82f6;
      background: transparent;
      padding: 4px 12px;
      font-size: 13px;
      border-radius: 6px;
    }

    .btn-outline-primary:hover {
      background: #3b82f6;
      color: white;
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
      border-width: 0.15em;
    }

    .modal-lg {
      max-width: 800px;
    }

    .detail-group {
      margin-bottom: 1rem;
    }

    .detail-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      display: block;
    }

    .detail-value {
      font-size: 14px;
      color: #1f2937;
      margin: 0;
      font-weight: 500;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding-bottom: 8px;
      margin-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
    }

    .table-sm {
      font-size: 14px;
    }

    .table-sm thead th {
      background: #f9fafb;
      color: #6b7280;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      padding: 12px;
      border-bottom: 2px solid #e5e7eb;
    }

    .table-sm tbody td {
      padding: 12px;
      vertical-align: middle;
    }

    .table-sm tfoot td {
      padding: 12px;
      font-size: 16px;
    }

    .alert-info {
      background-color: #dbeafe;
      border-color: #bfdbfe;
      color: #1e40af;
      border-radius: 8px;
      padding: 12px 16px;
    }
  `]
})
export class PedidosPageComponent implements OnInit {
  private router = inject(Router);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private distributionService = inject(DistributionService);
  private zoneService = inject(ZoneService);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  pedidos: Order[] = [];
  pedidosFiltrados: Order[] = [];
  isLoading = false;
  distributions: any[] = [];
  zones: ZoneResponse[] = [];
  isDealer = false;
  currentUserId: string | null = null;
  currentUsername: string | null = null;

  // Filtros
  searchTerm: string = '';
  filtroEstado: string = '';
  filtroZona: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  // Modal asignar dealer
  showAssignDealerModal = false;
  selectedOrder: Order | null = null;
  dealers: UserDto[] = [];
  selectedDealerId: string = '';
  isAssigning = false;

  // Modal detalles
  showDetailsModal = false;
  selectedOrderDetails: Order | null = null;
  customerDetails: Customer | null = null;

  ngOnInit(): void {
    this.currentUsername = this.authService.getCurrentUsername();
    this.isDealer = this.authService.hasRole(Role.DEALER);
    // Load zones and dealers first, then distributions (which loads orders)
    this.loadZones();
    this.loadDealers();
  }

  loadZones(): void {
    this.zoneService.getAll().subscribe({
      next: (zones) => {
        this.zones = zones;
      },
      error: (error) => {
        console.error('Error loading zones:', error);
        this.toastService.error('Error al cargar zonas');
      }
    });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAll().subscribe({
      next: (orders) => {
        console.log('DEBUG - isDealer:', this.isDealer);
        console.log('DEBUG - currentUserId:', this.currentUserId);
        console.log('DEBUG - currentUsername:', this.currentUsername);
        console.log('DEBUG - distributions:', this.distributions);
        console.log('DEBUG - dealers:', this.dealers);

        // Enriquecer pedidos con información de distribuciones
        let enrichedOrders = orders.map(order => {
          // Buscar si este pedido está en alguna distribución
          const distribution = this.distributions.find(dist =>
            dist.orderIds && dist.orderIds.includes(order.id)
          );

          if (distribution && distribution.dealerId) {
            // Buscar el dealer en la lista de dealers
            const dealer = this.dealers.find(d => d.id === distribution.dealerId);
            return {
              ...order,
              dealerId: distribution.dealerId,
              dealerName: dealer?.username || 'Repartidor',
              distributionId: distribution.id
            };
          }

          return order;
        });

        console.log('DEBUG - enrichedOrders before filter:', enrichedOrders);

        // Si es dealer, filtrar solo sus pedidos
        if (this.isDealer && this.currentUserId) {
          const filteredOrders = enrichedOrders.filter(order => order.dealerId === this.currentUserId);
          console.log('DEBUG - enrichedOrders after dealer filter:', filteredOrders);

          // Si no hay distribuciones cargadas (error del backend), mostrar advertencia
          if (this.distributions.length === 0) {
            console.warn('ADVERTENCIA: No hay distribuciones disponibles. El backend /distributions/getAll está fallando.');
            console.warn('WORKAROUND: Se mostrarán todos los pedidos porque no se puede determinar cuáles están asignados al dealer.');
            // Mostrar todos los pedidos si no hay distribuciones
            enrichedOrders = orders;
          } else {
            // Usar pedidos filtrados solo si tenemos distribuciones válidas
            enrichedOrders = filteredOrders;
          }
        }

        // Enriquecer con datos de clientes y zonas
        this.enrichOrdersWithCustomerData(enrichedOrders);
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Error al cargar los pedidos');
        console.error('Error loading orders:', error);
      }
    });
  }

  enrichOrdersWithCustomerData(orders: Order[]): void {
    // Cargar los datos de todos los clientes únicos
    const customerIds = [...new Set(orders.map(order => order.customerId))];
    let processedCount = 0;

    if (customerIds.length === 0) {
      this.pedidos = orders;
      this.pedidosFiltrados = orders;
      this.isLoading = false;
      return;
    }

    // Cargar cada cliente
    customerIds.forEach(customerId => {
      this.customerService.getById(customerId).subscribe({
        next: (customer) => {
          // Buscar la zona del cliente
          const zone = this.zones.find(z => z.id === customer.zoneId);

          // Actualizar todos los pedidos de este cliente
          orders.forEach(order => {
            if (order.customerId === customerId) {
              order.customerZoneId = customer.zoneId;
              order.customerZoneName = customer.zoneName;
              order.customerZoneColor = zone?.color || '#6366f1';
            }
          });

          processedCount++;
          if (processedCount === customerIds.length) {
            // Todos los clientes fueron procesados
            this.pedidos = orders;
            this.pedidosFiltrados = orders;
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading customer:', customerId, error);
          processedCount++;
          if (processedCount === customerIds.length) {
            // Todos los clientes fueron procesados (incluso con errores)
            this.pedidos = orders;
            this.pedidosFiltrados = orders;
            this.isLoading = false;
          }
        }
      });
    });
  }

  loadDistributions(): void {
    this.distributionService.getAllDistributions().subscribe({
      next: (distributions) => {
        this.distributions = distributions;
        console.log('DEBUG - Distributions loaded successfully:', distributions.length);
        // Cargar pedidos después de cargar distribuciones
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error loading distributions:', error);
        console.warn('ADVERTENCIA: No se pudieron cargar las distribuciones. Este es un problema del backend.');
        this.distributions = [];
        // Cargar pedidos de todas formas
        this.loadOrders();
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

      // Filtro por zona
      const matchesZone = !this.filtroZona || pedido.customerZoneId === this.filtroZona;

      // Filtro por fecha desde
      const matchesFechaDesde = !this.filtroFechaDesde ||
        new Date(pedido.createdAt) >= new Date(this.filtroFechaDesde);

      // Filtro por fecha hasta
      const matchesFechaHasta = !this.filtroFechaHasta ||
        new Date(pedido.createdAt) <= new Date(this.filtroFechaHasta + 'T23:59:59');

      return matchesSearch && matchesStatus && matchesZone && matchesFechaDesde && matchesFechaHasta;
    });
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.filtroZona = '';
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
    // Cargar los datos completos del cliente incluyendo la zona
    this.customerService.getById(pedido.customerId).subscribe({
      next: (customer: Customer) => {
        // Buscar la zona del cliente
        const zone = this.zones.find(z => z.id === customer.zoneId);

        // Guardar los detalles completos del cliente
        this.customerDetails = customer;

        // Enriquecer el pedido con los datos completos del cliente
        this.selectedOrderDetails = {
          ...pedido,
          customerName: customer.name,
          customerAddress: customer.address,
          customerCity: customer.city,
          customerZoneId: customer.zoneId,
          customerZoneName: customer.zoneName,
          customerZoneColor: zone?.color || '#6366f1'
        };

        this.showDetailsModal = true;
      },
      error: (error) => {
        console.error('Error loading customer details:', error);
        // Si hay error, mostrar los detalles que tenemos
        this.customerDetails = null;
        this.selectedOrderDetails = pedido;
        this.showDetailsModal = true;
        this.toastService.error('No se pudieron cargar todos los detalles del cliente');
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedOrderDetails = null;
    this.customerDetails = null;
  }

  loadDealers(): void {
    // Si es dealer, obtener su ID desde el endpoint /me
    if (this.isDealer) {
      this.userService.getCurrentUser().subscribe({
        next: (currentUser) => {
          this.currentUserId = currentUser.id;
          console.log('DEBUG - currentUserId set to:', this.currentUserId);
          // After getting current user ID, load distributions
          this.loadDistributions();
        },
        error: (error) => {
          console.error('Error loading current user:', error);
          this.currentUserId = null;
          // Still load distributions even if current user loading fails
          this.loadDistributions();
        }
      });
    } else {
      // Si no es dealer, cargar la lista de dealers para el modal de asignación
      this.userService.getAll().subscribe({
        next: (users) => {
          // Filtrar solo usuarios con rol DEALER
          this.dealers = users.filter(user => user.roles.includes(Role.DEALER));
          // After dealers are loaded, load distributions
          this.loadDistributions();
        },
        error: (error) => {
          this.toastService.error('Error al cargar repartidores');
          console.error('Error loading dealers:', error);
          this.dealers = [];
          // Still load distributions even if dealer loading fails
          this.loadDistributions();
        }
      });
    }
  }

  openAssignDealerModal(order: Order): void {
    this.selectedOrder = order;
    this.selectedDealerId = order.dealerId || '';
    this.showAssignDealerModal = true;
  }

  closeAssignDealerModal(): void {
    this.showAssignDealerModal = false;
    this.selectedOrder = null;
    this.selectedDealerId = '';
  }

  assignDealer(): void {
    if (!this.selectedOrder || !this.selectedDealerId) {
      return;
    }

    this.isAssigning = true;

    // Crear una distribución con el pedido y el repartidor seleccionados
    const distributionRequest: DistributionCreationRequest = {
      orderIds: [this.selectedOrder.id],
      dealerId: this.selectedDealerId
    };

    this.distributionService.createDistribution(distributionRequest).subscribe({
      next: (distribution) => {
        this.isAssigning = false;
        const dealer = this.dealers.find(d => d.id === this.selectedDealerId);
        const dealerName = dealer?.username || 'Repartidor';

        // Actualizar el pedido localmente para reflejar el cambio inmediatamente
        const orderIndex = this.pedidos.findIndex(p => p.id === this.selectedOrder!.id);
        if (orderIndex !== -1) {
          this.pedidos[orderIndex] = {
            ...this.pedidos[orderIndex],
            dealerId: this.selectedDealerId,
            dealerName: dealerName,
            distributionId: distribution.id
          };
        }

        // Aplicar filtros para actualizar la vista filtrada
        this.applyFilters();

        this.toastService.success(`Repartidor ${dealerName} asignado al pedido #${this.selectedOrder!.orderNumber}`);
        this.closeAssignDealerModal();
      },
      error: (error) => {
        this.isAssigning = false;
        this.toastService.error('Error al asignar repartidor');
        console.error('Error creating distribution:', error);
      }
    });
  }

  goToNuevoPedido(): void {
    this.router.navigate(['/dashboard/pedidos/nuevo']);
  }
}
