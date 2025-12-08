import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { ToastService } from '../../../services/toast.service';
import { ZoneService } from '../../../services/zone.service';
import { CustomerService } from '../../../services/customer.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { DistributionService } from '../../../services/distribution.service';
import { TenantService } from '../../../services/tenant.service';
import { Order } from '../../../models/order.model';
import { Role, UserDto } from '../../../models/user.model';
import { ZoneResponse } from '../../../models/zone.model';
import { Customer } from '../../../models/customer.model';
import { DistributionCreationRequest } from '../../../models/distribution.model';
import { TenantInfo, PlanType } from '../../../models/tenant.model';

@Component({
  selector: 'app-pedidos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header con botones -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="mb-1">Gestión de Pedidos</h5>
          <p class="text-muted mb-0">Administra todos los pedidos del sistema</p>
        </div>
        <div class="d-flex gap-2">
          <button
            *ngIf="!isDealer"
            class="btn btn-danger"
            [disabled]="selectedOrders.length === 0"
            (click)="openCancelOrdersModal()"
          >
            <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Cancelar Pedidos{{ selectedOrders.length > 0 ? ' (' + selectedOrders.length + ')' : '' }}
          </button>
          <button
            *ngIf="!isDealer"
            class="btn btn-success"
            [disabled]="selectedOrders.length === 0"
            (click)="openCreateDistributionModal()"
          >
            <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Crear Reparto{{ selectedOrders.length > 0 ? ' (' + selectedOrders.length + ')' : '' }}
          </button>
          <button *ngIf="!isDealer" class="btn btn-primary" (click)="goToNuevoPedido()">
            <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nuevo Pedido
          </button>
        </div>
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
                <option value="CONFIRMED">Asignado</option>
                <option value="SHIPPED">Enviado</option>
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
                  <th *ngIf="!isDealer" style="width: 40px;">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      [checked]="allSelectableOrdersSelected()"
                      (change)="toggleSelectAll()"
                      title="Seleccionar todos"
                    >
                  </th>
                  <th>Nº Pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Zona</th>
                  <th class="text-end">Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let pedido of pedidosFiltrados">
                  <td *ngIf="!isDealer">
                    <input
                      *ngIf="!pedido.distributionId && pedido.status === 'PENDING'"
                      type="checkbox"
                      class="form-check-input"
                      [checked]="isOrderSelected(pedido.id)"
                      (change)="toggleOrderSelection(pedido.id)"
                      title="Seleccionar pedido"
                    >
                    <span
                      *ngIf="!pedido.distributionId && pedido.status !== 'PENDING'"
                      class="text-muted"
                      title="Solo se pueden asignar pedidos pendientes"
                    >
                      -
                    </span>
                  </td>
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

      <!-- Modal Crear Distribución -->
      <div class="modal fade" [class.show]="showCreateDistributionModal" [style.display]="showCreateDistributionModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showCreateDistributionModal" (click)="closeCreateDistributionModal()"></div>
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Crear Nuevo Reparto</h5>
              <button type="button" class="btn-close" (click)="closeCreateDistributionModal()"></button>
            </div>
            <div class="modal-body">
              <p class="text-muted mb-3">
                Selecciona el repartidor que se encargará de entregar los {{ selectedOrders.length }} pedido(s) seleccionado(s).
              </p>

              <div class="mb-3">
                <label class="form-label">Repartidor *</label>
                <select class="form-select" [(ngModel)]="selectedDealerId" [ngModelOptions]="{standalone: true}">
                  <option value="">-- Selecciona un repartidor --</option>
                  <option *ngFor="let dealer of dealers" [value]="dealer.id">
                    {{ dealer.username }} - {{ dealer.email }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label" [class.text-muted]="!isPremiumPlan">
                  Fecha y Hora de Inicio
                  <span *ngIf="!isPremiumPlan" class="badge bg-warning text-dark ms-1">Premium</span>
                </label>
                <input
                  type="datetime-local"
                  class="form-control"
                  [(ngModel)]="distributionStartDate"
                  [ngModelOptions]="{standalone: true}"
                  [disabled]="!isPremiumPlan"
                >
                <small class="text-warning" *ngIf="!isPremiumPlan">Las fechas de inicio y fin requieren plan Premium</small>
              </div>

              <div class="mb-3">
                <label class="form-label" [class.text-muted]="!isPremiumPlan">
                  Fecha y Hora de Fin
                  <span *ngIf="!isPremiumPlan" class="badge bg-warning text-dark ms-1">Premium</span>
                </label>
                <input
                  type="datetime-local"
                  class="form-control"
                  [(ngModel)]="distributionEndDate"
                  [ngModelOptions]="{standalone: true}"
                  [disabled]="!isPremiumPlan"
                >
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="optimizeCheckbox"
                    [(ngModel)]="optimizeAfterCreation"
                    [ngModelOptions]="{standalone: true}"
                    [disabled]="!isPremiumPlan"
                  >
                  <label class="form-check-label" for="optimizeCheckbox" [class.text-muted]="!isPremiumPlan">
                    <svg class="me-1" width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style="vertical-align: middle;">
                      <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
                    </svg>
                    Optimizar ruta automáticamente después de crear el reparto
                    <span *ngIf="!isPremiumPlan" class="badge bg-warning text-dark ms-2">Premium</span>
                  </label>
                </div>
                <small class="text-muted" *ngIf="isPremiumPlan">La optimización calculará la ruta más eficiente para los pedidos seleccionados</small>
                <small class="text-warning" *ngIf="!isPremiumPlan">La optimización de rutas es una característica exclusiva de planes Premium</small>
              </div>

              <div class="alert alert-info">
                <strong>Pedidos seleccionados:</strong>
                <ul class="mb-0 mt-2">
                  <li *ngFor="let orderId of selectedOrders">
                    Pedido #{{ getOrderNumber(orderId) }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeCreateDistributionModal()">
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-success"
                [disabled]="!selectedDealerId || isCreatingDistribution"
                (click)="createDistribution()"
              >
                <span *ngIf="!isCreatingDistribution">
                  {{ optimizeAfterCreation ? 'Crear y Optimizar Reparto' : 'Crear Reparto' }}
                </span>
                <span *ngIf="isCreatingDistribution">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  {{ optimizeAfterCreation ? 'Creando y optimizando...' : 'Creando...' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Cancelar Pedidos -->
      <div class="modal fade" [class.show]="showCancelOrdersModal" [style.display]="showCancelOrdersModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showCancelOrdersModal" (click)="closeCancelOrdersModal()"></div>
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Cancelar Pedidos</h5>
              <button type="button" class="btn-close" (click)="closeCancelOrdersModal()"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning">
                <svg class="me-2" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                </svg>
                <strong>Atención:</strong> Esta acción cancelará los siguientes pedidos y no se podrá deshacer.
              </div>

              <div class="mb-3">
                <label class="form-label">Pedidos a cancelar:</label>
                <ul class="list-group">
                  <li class="list-group-item" *ngFor="let orderId of selectedOrders">
                    Pedido #{{ getOrderNumber(orderId) }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeCancelOrdersModal()">
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-danger"
                [disabled]="isCancellingOrders"
                (click)="cancelOrders()"
              >
                <span *ngIf="!isCancellingOrders">Confirmar Cancelación</span>
                <span *ngIf="isCancellingOrders">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Cancelando...
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

    .btn-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .btn-success:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }

    .btn-success:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-danger {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .btn-danger:hover {
      background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
    }

    .btn-danger:disabled {
      background: #9ca3af;
      cursor: not-allowed;
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

    .alert-warning {
      background-color: #fef3c7;
      border-color: #fbbf24;
      color: #92400e;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: flex-start;
    }

    .list-group-item {
      border: 1px solid #e5e7eb;
      padding: 12px 16px;
      font-size: 14px;
    }

    .form-check-input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .form-check-input:hover {
      border-color: #2563eb;
    }

    .gap-2 {
      gap: 0.5rem;
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
  private zoneService = inject(ZoneService);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private distributionService = inject(DistributionService);
  private tenantService = inject(TenantService);

  pedidos: Order[] = [];
  pedidosFiltrados: Order[] = [];
  isLoading = false;
  zones: ZoneResponse[] = [];
  isDealer = false;
  dealers: UserDto[] = [];

  // Plan information
  tenantInfo: TenantInfo | null = null;
  isPremiumPlan = false;

  // Filtros
  searchTerm: string = '';
  filtroEstado: string = 'PENDING';
  filtroZona: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  // Modal detalles
  showDetailsModal = false;
  selectedOrderDetails: Order | null = null;
  customerDetails: Customer | null = null;

  // Selección de pedidos y creación de distribución
  selectedOrders: string[] = [];
  showCreateDistributionModal = false;
  selectedDealerId: string = '';
  distributionStartDate: string = '';
  distributionEndDate: string = '';
  isCreatingDistribution = false;
  optimizeAfterCreation: boolean = false;

  // Cancelación de pedidos
  showCancelOrdersModal = false;
  isCancellingOrders = false;

  ngOnInit(): void {
    this.isDealer = this.authService.hasRole(Role.DEALER);
    this.loadTenantInfo();
    this.loadZones();
    this.loadDealers();
    this.loadOrders();
  }

  // Cargar información del tenant
  loadTenantInfo(): void {
    this.tenantService.getTenantInfo().subscribe({
      next: (info) => {
        this.tenantInfo = info;
        this.isPremiumPlan = info.planType === PlanType.PREMIUM || info.planType === PlanType.ENTERPRISE;
      },
      error: (error) => {
        console.error('Error loading tenant info:', error);
        this.isPremiumPlan = false; // Por defecto, asumir plan FREE
      }
    });
  }

  loadDealers(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.dealers = users.filter(user => user.roles.includes(Role.DEALER));
      },
      error: (error) => {
        console.error('Error loading dealers:', error);
        this.toastService.error('Error al cargar repartidores');
      }
    });
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
        // Enriquecer con datos de clientes y zonas
        this.enrichOrdersWithCustomerData(orders);
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
      this.applyFilters();
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
            this.isLoading = false;
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error loading customer:', customerId, error);
          processedCount++;
          if (processedCount === customerIds.length) {
            // Todos los clientes fueron procesados (incluso con errores)
            this.pedidos = orders;
            this.isLoading = false;
            this.applyFilters();
          }
        }
      });
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
      'CONFIRMED': 'Asignado',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'secondary',
      'CONFIRMED': 'primary',
      'SHIPPED': 'warning',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return colorMap[status] || 'secondary';
  }

  formatDate(dateString: string | number): string {
    // Si es un número (timestamp en segundos), convertir a milisegundos
    let timestamp: number;
    if (typeof dateString === 'number') {
      timestamp = dateString * 1000;
    } else {
      // Si es string, intentar parsearlo como número primero
      const parsed = parseFloat(dateString);
      if (!isNaN(parsed)) {
        // Es un timestamp numérico en formato string
        timestamp = parsed * 1000;
      } else {
        // Es una fecha en formato ISO string
        timestamp = new Date(dateString).getTime();
      }
    }

    const date = new Date(timestamp);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  goToNuevoPedido(): void {
    this.router.navigate(['/dashboard/pedidos/nuevo']);
  }

  // Métodos de selección de pedidos
  isOrderSelected(orderId: string): boolean {
    return this.selectedOrders.includes(orderId);
  }

  toggleOrderSelection(orderId: string): void {
    const index = this.selectedOrders.indexOf(orderId);
    if (index > -1) {
      this.selectedOrders.splice(index, 1);
    } else {
      this.selectedOrders.push(orderId);
    }
  }

  allSelectableOrdersSelected(): boolean {
    const selectableOrders = this.pedidosFiltrados.filter(p => !p.distributionId && p.status === 'PENDING');
    if (selectableOrders.length === 0) return false;
    return selectableOrders.every(p => this.selectedOrders.includes(p.id));
  }

  someOrdersSelected(): boolean {
    return this.selectedOrders.length > 0 && !this.allSelectableOrdersSelected();
  }

  toggleSelectAll(): void {
    const selectableOrders = this.pedidosFiltrados.filter(p => !p.distributionId && p.status === 'PENDING');
    if (this.allSelectableOrdersSelected()) {
      // Deseleccionar todos los pedidos seleccionables de la vista actual
      selectableOrders.forEach(p => {
        const index = this.selectedOrders.indexOf(p.id);
        if (index > -1) {
          this.selectedOrders.splice(index, 1);
        }
      });
    } else {
      // Seleccionar todos los pedidos seleccionables de la vista actual
      selectableOrders.forEach(p => {
        if (!this.selectedOrders.includes(p.id)) {
          this.selectedOrders.push(p.id);
        }
      });
    }
  }

  getOrderNumber(orderId: string): string {
    const order = this.pedidos.find(p => p.id === orderId);
    return order?.orderNumber || orderId;
  }

  // Métodos del modal de crear distribución
  openCreateDistributionModal(): void {
    if (this.selectedOrders.length === 0) {
      this.toastService.error('Debes seleccionar al menos un pedido');
      return;
    }
    this.showCreateDistributionModal = true;
  }

  closeCreateDistributionModal(): void {
    this.showCreateDistributionModal = false;
    this.selectedDealerId = '';
    this.distributionStartDate = '';
    this.distributionEndDate = '';
    this.optimizeAfterCreation = false;
  }

  // Métodos del modal de cancelar pedidos
  openCancelOrdersModal(): void {
    if (this.selectedOrders.length === 0) {
      this.toastService.error('Debes seleccionar al menos un pedido');
      return;
    }
    this.showCancelOrdersModal = true;
  }

  closeCancelOrdersModal(): void {
    this.showCancelOrdersModal = false;
  }

  cancelOrders(): void {
    if (this.selectedOrders.length === 0) {
      this.toastService.error('No hay pedidos seleccionados');
      return;
    }

    this.isCancellingOrders = true;

    // Cancelar cada pedido
    let cancelledCount = 0;
    const totalOrders = this.selectedOrders.length;

    this.selectedOrders.forEach(orderId => {
      this.orderService.updateOrderStatus(orderId, 'CANCELLED').subscribe({
        next: (response) => {
          cancelledCount++;
          if (cancelledCount === totalOrders) {
            // Todos los pedidos fueron cancelados
            this.isCancellingOrders = false;
            this.toastService.success(`${totalOrders} pedido(s) cancelado(s) exitosamente`);
            this.closeCancelOrdersModal();
            this.selectedOrders = [];
            // Recargar los pedidos
            this.loadOrders();
          }
        },
        error: (error) => {
          console.error('Error cancelling order:', orderId, error);
          console.error('Error details:', error.error);
          cancelledCount++;
          if (cancelledCount === totalOrders) {
            // Todos los pedidos fueron procesados (aunque algunos con error)
            this.isCancellingOrders = false;
            this.toastService.warning('Algunos pedidos no pudieron ser cancelados');
            this.closeCancelOrdersModal();
            this.selectedOrders = [];
            this.loadOrders();
          }
        }
      });
    });
  }

  createDistribution(): void {
    if (!this.selectedDealerId) {
      this.toastService.error('Debes seleccionar un repartidor');
      return;
    }

    if (this.selectedOrders.length === 0) {
      this.toastService.error('No hay pedidos seleccionados');
      return;
    }

    this.isCreatingDistribution = true;

    // Convertir las fechas al formato ISO 8601 si están presentes
    let startDateTime: string | undefined = undefined;
    let endDateTime: string | undefined = undefined;

    if (this.distributionStartDate && this.distributionStartDate.trim() !== '') {
      const startDate = new Date(this.distributionStartDate);
      startDateTime = startDate.toISOString();
    }

    if (this.distributionEndDate && this.distributionEndDate.trim() !== '') {
      const endDate = new Date(this.distributionEndDate);
      endDateTime = endDate.toISOString();
    }

    const distributionRequest: DistributionCreationRequest = {
      dealerId: this.selectedDealerId,
      orderIds: this.selectedOrders,
      startProgramDateTime: startDateTime,
      endProgramDateTime: endDateTime
    };

    this.distributionService.createDistribution(distributionRequest).subscribe({
      next: (distribution) => {
        // El backend actualiza automáticamente el estado de los pedidos a CONFIRMED

        // Si se marcó la opción de optimizar, optimizar después de crear
        if (this.optimizeAfterCreation) {
          this.distributionService.optimizeRoutes(distribution.id).subscribe({
            next: () => {
              this.isCreatingDistribution = false;
              this.toastService.success('Reparto creado y optimizado exitosamente');
              this.closeCreateDistributionModal();
              this.selectedOrders = [];
              this.loadOrders();
            },
            error: (error) => {
              this.isCreatingDistribution = false;
              console.error('Error optimizing distribution:', error);
              this.toastService.warning('Reparto creado, pero ocurrió un error al optimizar');
              this.closeCreateDistributionModal();
              this.selectedOrders = [];
              this.loadOrders();
            }
          });
        } else {
          this.isCreatingDistribution = false;
          this.toastService.success('Reparto creado exitosamente');
          this.closeCreateDistributionModal();
          this.selectedOrders = [];
          // Recargar los pedidos para reflejar que ahora tienen distributionId y estado actualizado
          this.loadOrders();
        }
      },
      error: (error) => {
        this.isCreatingDistribution = false;
        console.error('Error creating distribution:', error);
        this.toastService.error('Error al crear el reparto');
      }
    });
  }
}
