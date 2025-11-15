import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { DistributionService } from '../../../services/distribution.service';
import { OrderService } from '../../../services/order.service';
import { CustomerService } from '../../../services/customer.service';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { DistributionResponse } from '../../../models/distribution.model';
import { Order } from '../../../models/order.model';
import { Customer } from '../../../models/customer.model';
import { UserDto, Role } from '../../../models/user.model';

@Component({
  selector: 'app-mapa-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="mb-1">Mapa de Repartos</h5>
          <p class="text-muted mb-0">Visualiza las ubicaciones de los pedidos en el mapa</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center" style="cursor: pointer; background: white; padding: 12px 20px;" (click)="filtrosExpanded = !filtrosExpanded">
          <div class="d-flex align-items-center gap-2">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            <span style="font-weight: 600; font-size: 14px;">Filtros</span>
            <span class="badge bg-primary" *ngIf="filtroEstado || filtroDealer || filtroFechaDesde || filtroFechaHasta">
              {{ getActiveFiltersCount() }}
            </span>
          </div>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" [style.transform]="filtrosExpanded ? 'rotate(180deg)' : 'rotate(0deg)'" style="transition: transform 0.3s ease;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <div class="card-body" *ngIf="filtrosExpanded" style="padding-top: 16px;">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Estado</label>
              <select class="form-select" [(ngModel)]="filtroEstado" [ngModelOptions]="{standalone: true}" (ngModelChange)="applyFilters()">
                <option value="">Todos los estados</option>
                <option value="PLANNED">Asignado</option>
                <option value="IN_PROGRESS">Enviado</option>
                <option value="COMPLETED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Repartidor</label>
              <select class="form-select" [(ngModel)]="filtroDealer" [ngModelOptions]="{standalone: true}" (ngModelChange)="applyFilters()">
                <option value="">Todos</option>
                <option *ngFor="let dealer of dealers" [value]="dealer.id">{{ dealer.username }}</option>
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
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-secondary w-100" (click)="limpiarFiltros()" title="Limpiar filtros">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Selector de Reparto -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-3 align-items-center">
            <div class="col-md-6">
              <label class="form-label">Seleccionar Reparto</label>
              <select
                class="form-select"
                [(ngModel)]="selectedDistributionId"
                (ngModelChange)="onDistributionChange()"
                [disabled]="isLoading"
              >
                <option value="">-- Selecciona un reparto --</option>
                <option *ngFor="let dist of filteredDistributions" [value]="dist.id">
                  {{ dist.dealerName }} - {{ dist.orderCount }} pedido(s) - {{ formatDate(dist.createdAt) }}
                </option>
              </select>
            </div>
            <div class="col-md-6" *ngIf="selectedDistribution">
              <div class="d-flex justify-content-between align-items-center">
                <div class="info-badges">
                  <span class="badge bg-primary me-2">
                    <svg class="me-1" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {{ selectedDistribution.dealerName }}
                  </span>
                  <span class="badge bg-info me-2">
                    <svg class="me-1" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    {{ selectedDistribution.orderCount }} pedidos
                  </span>
                  <span [class]="'badge bg-' + selectedDistribution.statusColor">
                    {{ selectedDistribution.statusLabel }}
                  </span>
                  <span *ngIf="selectedDistribution.optimized" class="badge bg-success ms-2">
                    <svg class="me-1" width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
                    </svg>
                    Ruta Optimizada
                  </span>
                </div>
                <div class="d-flex gap-2">
                  <button
                    *ngIf="selectedDistribution.status === 'PLANNED'"
                    class="btn btn-success btn-sm"
                    (click)="startDeliveryTrip()"
                    [disabled]="isStartingTrip"
                  >
                    <svg class="me-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                    {{ isStartingTrip ? 'Iniciando...' : 'Iniciar Viaje' }}
                  </button>
                  <button
                    *ngIf="selectedDistribution.status === 'IN_PROGRESS'"
                    class="btn btn-warning btn-sm"
                    (click)="revertDeliveryTrip()"
                    [disabled]="isRevertingTrip"
                  >
                    <svg class="me-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                    </svg>
                    {{ isRevertingTrip ? 'Revirtiendo...' : 'Volver a Asignado' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando datos...</p>
      </div>

      <!-- Content -->
      <div class="row g-3" *ngIf="!isLoading && selectedDistribution">
        <!-- Panel Lateral con Lista de Pedidos -->
        <div class="col-lg-4">
          <div class="card delivery-list">
            <div class="card-header">
              <h6 class="mb-0">
                {{ selectedDistribution.optimized ? 'Ruta Optimizada' : 'Pedidos del Reparto' }} ({{ orderLocations.length }})
              </h6>
              <small *ngIf="selectedDistribution.optimized" class="text-success">
                <svg class="me-1" width="12" height="12" fill="currentColor" viewBox="0 0 20 20" style="vertical-align: middle;">
                  <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
                </svg>
                Orden de entrega optimizado
              </small>
            </div>
            <div class="card-body p-0">
              <div
                class="delivery-item"
                *ngFor="let location of orderLocations; let i = index"
                [class.active]="selectedMarkerIndex === i"
              >
                <div class="delivery-number" (click)="focusOnMarker(i)">{{ i + 1 }}</div>
                <div class="delivery-info" (click)="focusOnMarker(i)">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="mb-0">#{{ location.orderNumber }}</h6>
                    <span class="badge bg-primary">{{ location.customerName }}</span>
                  </div>
                  <p class="text-muted small mb-2">
                    <svg class="me-1" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {{ location.address }}
                  </p>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <small class="text-muted">{{ location.city }}</small>
                    <small class="text-primary fw-semibold">\${{ location.total | number:'1.2-2' }}</small>
                  </div>
                  <!-- Botones de acción -->
                  <div class="action-buttons" (click)="$event.stopPropagation()">
                    <button class="btn-icon" (click)="openOrderDetail(location)" title="Ver detalle">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button class="btn-icon btn-success" (click)="openWhatsApp(location)" title="WhatsApp">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                      </svg>
                    </button>
                    <button class="btn-icon btn-warning" (click)="callPhone(location)" title="Llamar">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </button>
                    <button class="btn-icon btn-info" (click)="openGoogleMaps(location)" title="Google Maps">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 6.61 7.75 14.43 8.05 14.76a.5.5 0 00.71 0c.31-.33 8.24-8.15 8.24-14.76C20.5 3.81 16.69 0 12 0zm0 13a4 4 0 110-8 4 4 0 010 8z"></path>
                      </svg>
                    </button>
                  </div>
                  <!-- Botones de estado del pedido -->
                  <div class="order-status-actions mt-2" (click)="$event.stopPropagation()">
                    <button
                      *ngIf="canMarkAsDelivered(location.orderId)"
                      class="btn btn-sm btn-success me-2"
                      (click)="markOrderAsDelivered(location.orderId)"
                      [disabled]="isUpdatingOrder"
                    >
                      <svg class="me-1" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Entregado
                    </button>
                    <button
                      *ngIf="canMarkAsCancelled(location.orderId)"
                      class="btn btn-sm btn-danger"
                      (click)="markOrderAsCancelled(location.orderId)"
                      [disabled]="isUpdatingOrder"
                    >
                      <svg class="me-1" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Cancelado
                    </button>
                    <span *ngIf="getOrderStatus(location.orderId) === 'DELIVERED'" class="badge bg-success">Entregado</span>
                    <span *ngIf="getOrderStatus(location.orderId) === 'CANCELLED'" class="badge bg-danger">Cancelado</span>
                  </div>
                </div>
              </div>

              <div *ngIf="orderLocations.length === 0" class="text-center py-4">
                <p class="text-muted">No hay pedidos con coordenadas válidas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Área del Mapa -->
        <div class="col-lg-8">
          <div class="card map-container">
            <div class="card-body p-0" style="height: 100%;">
              <div id="map" class="leaflet-map" *ngIf="showMap"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state cuando no hay reparto seleccionado -->
      <div *ngIf="!isLoading && !selectedDistribution" class="text-center py-5">
        <svg class="mb-3" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
        <h6>Selecciona un reparto para ver en el mapa</h6>
        <p class="text-muted">Elige un reparto del listado desplegable para visualizar las ubicaciones de los pedidos</p>
      </div>

      <!-- Modal de detalle del pedido -->
      <div class="modal" [class.show]="showOrderDetailModal" *ngIf="showOrderDetailModal" (click)="closeOrderDetail()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalle del Pedido #{{ selectedOrderDetail?.orderNumber }}</h5>
              <button type="button" class="btn-close" (click)="closeOrderDetail()">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <h6 class="mb-2">Cliente</h6>
                <p class="mb-1"><strong>{{ selectedOrderDetail?.customerName }}</strong></p>
                <p class="mb-1 text-muted small">{{ selectedOrderDetail?.address }}</p>
                <p class="mb-0 text-muted small">{{ selectedOrderDetail?.city }}</p>
              </div>
              <div class="mb-3">
                <h6 class="mb-2">Productos</h6>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th class="text-end">Precio</th>
                        <th class="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of selectedOrderDetail?.order?.items">
                        <td>{{ item.productName }}</td>
                        <td>{{ item.quantity }}</td>
                        <td class="text-end">\${{ item.price | number:'1.2-2' }}</td>
                        <td class="text-end">\${{ (item.quantity * item.price) | number:'1.2-2' }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" class="text-end"><strong>Total:</strong></td>
                        <td class="text-end"><strong>\${{ selectedOrderDetail?.total | number:'1.2-2' }}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div class="d-grid gap-2">
                <button class="btn btn-success" (click)="openWhatsApp(selectedOrderDetail)">
                  <svg class="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                  </svg>
                  Abrir WhatsApp
                </button>
                <button class="btn btn-warning" (click)="callPhone(selectedOrderDetail)">
                  <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  Llamar
                </button>
                <button class="btn btn-info" (click)="openGoogleMaps(selectedOrderDetail)">
                  <svg class="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 6.61 7.75 14.43 8.05 14.76a.5.5 0 00.71 0c.31-.33 8.24-8.15 8.24-14.76C20.5 3.81 16.69 0 12 0zm0 13a4 4 0 110-8 4 4 0 010 8z"></path>
                  </svg>
                  Abrir en Google Maps
                </button>
              </div>
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

    .card-header {
      background: white;
      border-bottom: 1px solid #f3f4f6;
      padding: 16px 20px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-select {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
    }

    .form-select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .info-badges {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .badge {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      display: flex;
      align-items: center;
    }

    .delivery-list {
      height: calc(100vh - 280px);
      min-height: 500px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .delivery-list .card-body {
      overflow-y: auto;
      flex: 1;
    }

    .delivery-item {
      padding: 16px 20px;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      gap: 12px;
      transition: all 0.2s;
    }

    .delivery-item:hover {
      background: #f9fafb;
    }

    .delivery-item.active {
      background: #eff6ff;
      border-left: 3px solid #2563eb;
    }

    .delivery-number {
      cursor: pointer;
    }

    .delivery-info {
      cursor: pointer;
    }

    .action-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .btn-icon {
      padding: 6px 8px;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #4b5563;
    }

    .btn-icon:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }

    .btn-icon.btn-success {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }

    .btn-icon.btn-success:hover {
      background: #059669;
      border-color: #059669;
    }

    .btn-icon.btn-warning {
      background: #f59e0b;
      border-color: #f59e0b;
      color: white;
    }

    .btn-icon.btn-warning:hover {
      background: #d97706;
      border-color: #d97706;
    }

    .btn-icon.btn-info {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .btn-icon.btn-info:hover {
      background: #2563eb;
      border-color: #2563eb;
    }

    .delivery-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #2563eb;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }

    .delivery-info {
      flex: 1;
      min-width: 0;
    }

    .delivery-info h6 {
      font-size: 14px;
      font-weight: 600;
    }

    .map-container {
      height: calc(100vh - 280px);
      min-height: 500px;
      overflow: hidden;
    }

    .map-container .card-body {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .leaflet-map {
      height: 100%;
      width: 100%;
      min-height: 500px;
      border-radius: 12px;
      flex: 1;
    }

    :host ::ng-deep .leaflet-container {
      font-family: inherit;
      height: 100%;
      border-radius: 12px;
    }

    :host ::ng-deep .leaflet-tile {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
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

    /* Modal styles */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      align-items: center;
      justify-content: center;
    }

    .modal.show {
      display: flex;
    }

    .modal-dialog {
      max-width: 600px;
      width: 100%;
      margin: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #6b7280;
      transition: color 0.2s;
    }

    .btn-close:hover {
      color: #374151;
    }

    .modal-body {
      padding: 20px;
    }

    .table {
      width: 100%;
      margin-bottom: 0;
    }

    .table th,
    .table td {
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    .table thead th {
      font-weight: 600;
      color: #374151;
      font-size: 13px;
    }

    .table tbody td {
      font-size: 14px;
    }

    .table tfoot td {
      border-top: 2px solid #d1d5db;
      padding-top: 12px;
    }

    .d-grid {
      display: grid;
    }

    .gap-2 {
      gap: 8px;
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover {
      background: #059669;
    }

    .btn-warning {
      background: #f59e0b;
      color: white;
      border: none;
    }

    .btn-warning:hover {
      background: #d97706;
    }

    .btn-warning:disabled {
      background: #fbbf24;
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-info {
      background: #3b82f6;
      color: white;
    }

    .btn-info:hover {
      background: #2563eb;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .order-status-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    @media (max-width: 992px) {
      .delivery-list, .map-container {
        height: 400px;
        min-height: 400px;
      }
    }
  `]
})
export class MapaPageComponent implements OnInit, OnDestroy {
  private distributionService = inject(DistributionService);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  distributions: any[] = [];
  orders: Order[] = [];
  dealers: UserDto[] = [];
  selectedDistributionId: string = '';
  selectedDistribution: any = null;
  orderLocations: any[] = [];
  isLoading = false;
  selectedMarkerIndex: number = -1;
  showMap = false;
  isDealer = false;
  currentDealerId: string | null = null;

  // Filtros
  filtroEstado: string = '';
  filtroDealer: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  filtrosExpanded: boolean = false;

  // Modal de detalle de pedido
  showOrderDetailModal: boolean = false;
  selectedOrderDetail: any = null;

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private resizeObserver?: ResizeObserver;
  private currentUserMarker: L.Marker | null = null;
  currentUserLocation: { lat: number; lng: number } | null = null;
  isStartingTrip = false;
  isUpdatingOrder = false;
  isRevertingTrip = false;

  ngOnInit(): void {
    this.isDealer = this.authService.hasRole(Role.DEALER);

    // Si es dealer, obtener su ID primero
    if (this.isDealer) {
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          this.currentDealerId = user.id;
          this.loadInitialData();
        },
        error: (error) => {
          console.error('Error loading current user:', error);
          this.toastService.error('Error al cargar información del usuario');
          this.loadInitialData(); // Continuar cargando datos aunque falle
        }
      });
    } else {
      this.loadInitialData();
    }
  }

  get filteredDistributions(): any[] {
    return this.distributions.filter(dist => {
      // Si es dealer, filtrar solo sus propios repartos
      if (this.isDealer && this.currentDealerId) {
        if (dist.dealerId !== this.currentDealerId) {
          return false;
        }
      }

      // Filtro por estado
      const matchesStatus = !this.filtroEstado || dist.status === this.filtroEstado;

      // Filtro por dealer (solo para admins)
      const matchesDealer = this.isDealer || !this.filtroDealer || dist.dealerId === this.filtroDealer;

      // Filtro por fecha desde
      const matchesFechaDesde = !this.filtroFechaDesde ||
        this.getDateFromTimestamp(dist.createdAt) >= new Date(this.filtroFechaDesde);

      // Filtro por fecha hasta
      const matchesFechaHasta = !this.filtroFechaHasta ||
        this.getDateFromTimestamp(dist.createdAt) <= new Date(this.filtroFechaHasta + 'T23:59:59');

      return matchesStatus && matchesDealer && matchesFechaDesde && matchesFechaHasta;
    });
  }

  getDateFromTimestamp(dateString: string | number): Date {
    if (typeof dateString === 'number') {
      return new Date(dateString * 1000);
    }
    const parsed = parseFloat(dateString);
    if (!isNaN(parsed)) {
      return new Date(parsed * 1000);
    }
    return new Date(dateString);
  }

  applyFilters(): void {
    // Resetear selección si la distribución actual no está en los filtrados
    if (this.selectedDistributionId) {
      const stillExists = this.filteredDistributions.find(d => d.id === this.selectedDistributionId);
      if (!stillExists) {
        this.selectedDistributionId = '';
        this.selectedDistribution = null;
        this.orderLocations = [];
        this.destroyMap();
        this.showMap = false;
      }
    }
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroDealer = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.applyFilters();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filtroEstado) count++;
    if (this.filtroDealer) count++;
    if (this.filtroFechaDesde) count++;
    if (this.filtroFechaHasta) count++;
    return count;
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.destroyMap();
  }

  loadInitialData(): void {
    this.isLoading = true;

    let dealersLoaded = false;
    let ordersLoaded = false;

    // Cargar dealers
    this.userService.getAll().subscribe({
      next: (users) => {
        this.dealers = users.filter(user => user.roles.some(role => role === 'DEALER'));
        dealersLoaded = true;
        if (ordersLoaded) {
          this.loadDistributions();
        }
      },
      error: (error) => {
        console.error('Error loading dealers:', error);
        this.toastService.error('Error al cargar repartidores');
        this.isLoading = false;
      }
    });

    // Cargar orders
    this.orderService.getAll().subscribe({
      next: (orders) => {
        this.orders = orders;
        ordersLoaded = true;
        if (dealersLoaded) {
          this.loadDistributions();
        }
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.toastService.error('Error al cargar pedidos');
        this.isLoading = false;
      }
    });
  }

  loadDistributions(): void {
    this.distributionService.getAllDistributions().subscribe({
      next: (distributions) => {
        this.distributions = distributions.map(dist => {
          const dealer = this.dealers.find(d => d.id === dist.dealerId);
          const orderCount = dist.orderIds?.length || 0;

          return {
            ...dist,
            dealerName: dealer?.username || 'Sin asignar',
            orderCount,
            statusLabel: this.getStatusLabel(dist.status),
            statusColor: this.getStatusColor(dist.status)
          };
        });

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Error al cargar distribuciones');
        console.error('Error loading distributions:', error);
      }
    });
  }

  onDistributionChange(): void {
    if (!this.selectedDistributionId) {
      this.selectedDistribution = null;
      this.orderLocations = [];
      this.destroyMap();
      this.showMap = false;
      return;
    }

    this.selectedDistribution = this.distributions.find(d => d.id === this.selectedDistributionId);

    if (this.selectedDistribution) {
      this.loadOrderLocations();
    }
  }

  loadOrderLocations(): void {
    const orderIds = this.selectedDistribution.orderIds || [];
    this.orderLocations = [];
    this.destroyMap();

    if (orderIds.length === 0) {
      return;
    }

    let processedCount = 0;
    const tempLocations: any[] = [];
    let customersWithoutCoordinates = 0;

    orderIds.forEach((orderId: string) => {
      const order = this.orders.find(o => o.id === orderId);
      if (!order) {
        processedCount++;
        if (processedCount === orderIds.length) {
          this.finalizeLocationLoading(tempLocations, customersWithoutCoordinates, orderIds.length);
        }
        return;
      }

      // Obtener datos completos del cliente incluyendo coordenadas
      this.customerService.getById(order.customerId).subscribe({
        next: (customer: Customer) => {
          if (customer.latitude && customer.longitude) {
            tempLocations.push({
              orderId: order.id,
              orderNumber: order.orderNumber,
              customerName: customer.name,
              address: customer.address,
              city: customer.city,
              total: order.totalAmount,
              latitude: customer.latitude,
              longitude: customer.longitude
            });
          } else {
            customersWithoutCoordinates++;
            console.log(`Cliente sin coordenadas: ${customer.name} (${customer.address}, ${customer.city})`);
          }

          processedCount++;
          if (processedCount === orderIds.length) {
            this.finalizeLocationLoading(tempLocations, customersWithoutCoordinates, orderIds.length);
          }
        },
        error: (error) => {
          console.error('Error loading customer:', order.customerId, error);
          processedCount++;
          if (processedCount === orderIds.length) {
            this.finalizeLocationLoading(tempLocations, customersWithoutCoordinates, orderIds.length);
          }
        }
      });
    });
  }

  finalizeLocationLoading(locations: any[], withoutCoords: number, total: number): void {
    // Si existe ruta optimizada, ordenar según el mapa optimizatedRoute
    if (this.selectedDistribution.optimized && this.selectedDistribution.optimizatedRoute) {
      const optimizedRoute = this.selectedDistribution.optimizatedRoute;
      const sortedLocations: any[] = [];

      // Convertir las claves del mapa a números y ordenar
      const routeKeys = Object.keys(optimizedRoute).map(k => parseInt(k)).sort((a, b) => a - b);

      // Recorrer el mapa en orden y agregar las ubicaciones correspondientes
      routeKeys.forEach(position => {
        const orderId = optimizedRoute[position.toString()];
        const location = locations.find(loc => loc.orderId === orderId);
        if (location) {
          sortedLocations.push(location);
        }
      });

      // Agregar cualquier ubicación que no esté en la ruta optimizada (por seguridad)
      locations.forEach(loc => {
        if (!sortedLocations.find(sl => sl.orderId === loc.orderId)) {
          sortedLocations.push(loc);
        }
      });

      this.orderLocations = sortedLocations;
    } else {
      // Si no está optimizado, usar orden original
      this.orderLocations = locations;
    }

    this.showCoordinatesInfo(withoutCoords, total);

    if (this.orderLocations.length > 0) {
      this.showMap = true;
      this.cdr.detectChanges();
      this.initializeMap();
    } else {
      this.showMap = false;
    }
  }

  showCoordinatesInfo(withoutCoords: number, total: number): void {
    if (withoutCoords > 0) {
      if (withoutCoords === total) {
        this.toastService.error(`Ninguno de los ${total} clientes tiene coordenadas. Edita los clientes para agregar direcciones válidas.`);
      } else {
        this.toastService.warning(`${withoutCoords} de ${total} clientes no tienen coordenadas válidas.`);
      }
    }
  }

  initializeMap(): void {
    if (this.orderLocations.length === 0) {
      return;
    }

    // Esperar a que el DOM esté listo
    setTimeout(() => {
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      try {
        // Inicializar mapa centrado en Córdoba, Argentina
        this.map = L.map('map', {
          center: [-31.4201, -64.1888],
          zoom: 12,
          zoomControl: true,
          attributionControl: true
        });

        // Agregar capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(this.map);

        // Forzar recálculo del tamaño después de un momento
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
            this.addMarkers();
            this.trackUserLocation();
          }
        }, 250);

        // Observer para detectar cambios de tamaño del contenedor
        this.resizeObserver = new ResizeObserver(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        });
        this.resizeObserver.observe(mapElement);

      } catch (error) {
        console.error('Error initializing map:', error);
        this.toastService.error('Error al inicializar el mapa');
      }
    }, 200);
  }

  addMarkers(): void {
    if (!this.map) return;

    this.markers = [];
    const bounds: L.LatLngBoundsExpression = [];

    this.orderLocations.forEach((location, index) => {
      const marker = L.marker([location.latitude, location.longitude], {
        icon: this.createNumberedIcon(index + 1)
      }).addTo(this.map!);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h6 style="margin: 0 0 8px 0; font-size: 14px;">#${location.orderNumber}</h6>
          <p style="margin: 0 0 4px 0; font-size: 13px;"><strong>${location.customerName}</strong></p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${location.address}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${location.city}</p>
          <p style="margin: 0; font-size: 13px; color: #2563eb; font-weight: 600;">$${location.total.toFixed(2)}</p>
        </div>
      `);

      marker.on('click', () => {
        this.selectedMarkerIndex = index;
      });

      this.markers.push(marker);
      bounds.push([location.latitude, location.longitude]);
    });

    // Ajustar el mapa para mostrar todos los marcadores
    if (bounds.length > 0 && this.map) {
      setTimeout(() => {
        this.map?.fitBounds(bounds as L.LatLngBoundsExpression, { 
          padding: [50, 50],
          maxZoom: 15
        });
      }, 100);
    }
  }

  createNumberedIcon(number: number): L.DivIcon {
    return L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">${number}</div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  focusOnMarker(index: number): void {
    this.selectedMarkerIndex = index;

    if (this.map && this.markers[index]) {
      const location = this.orderLocations[index];
      this.map.setView([location.latitude, location.longitude], 15, {
        animate: true,
        duration: 1
      });
      this.markers[index].openPopup();
    }
  }

  destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markers = [];
    this.selectedMarkerIndex = -1;
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'PLANNED': 'Asignado',
      'ASSIGNED': 'Asignado',
      'IN_PROGRESS': 'Enviado',
      'COMPLETED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'secondary',
      'PLANNED': 'info',
      'ASSIGNED': 'info',
      'IN_PROGRESS': 'warning',
      'COMPLETED': 'success',
      'CANCELLED': 'danger'
    };
    return colorMap[status] || 'secondary';
  }

  formatDate(dateString: string | number): string {
    if (!dateString) return '';

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

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Métodos de acción
  openOrderDetail(location: any): void {
    // Buscar el pedido completo por orderId
    const order = this.orders.find(o => o.id === location.orderId);
    if (order) {
      this.selectedOrderDetail = {
        ...location,
        order: order
      };
      this.showOrderDetailModal = true;
    }
  }

  closeOrderDetail(): void {
    this.showOrderDetailModal = false;
    this.selectedOrderDetail = null;
  }

  openWhatsApp(location: any): void {
    // Buscar el pedido completo para obtener el teléfono del cliente
    const order = this.orders.find(o => o.id === location.orderId);
    if (order) {
      this.customerService.getById(order.customerId).subscribe({
        next: (customer) => {
          if (customer.phoneNumber) {
            const message = `Hola! Soy del reparto. Tengo tu pedido #${location.orderNumber}. Dirección: ${location.address}, ${location.city}.`;
            const phoneNumber = customer.phoneNumber.replace(/\D/g, ''); // Remover caracteres no numéricos
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
          } else {
            this.toastService.warning('El cliente no tiene número de teléfono registrado');
          }
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          this.toastService.error('Error al cargar datos del cliente');
        }
      });
    }
  }

  callPhone(location: any): void {
    const order = this.orders.find(o => o.id === location.orderId);
    if (order) {
      this.customerService.getById(order.customerId).subscribe({
        next: (customer) => {
          if (customer.phoneNumber) {
            window.location.href = `tel:${customer.phoneNumber}`;
          } else {
            this.toastService.warning('El cliente no tiene número de teléfono registrado');
          }
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          this.toastService.error('Error al cargar datos del cliente');
        }
      });
    }
  }

  openGoogleMaps(location: any): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  }

  /**
   * Track user's current location and show on map
   */
  trackUserLocation(): void {
    if (!this.map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentUserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          if (this.map) {
            // Remove previous user marker if exists
            if (this.currentUserMarker) {
              this.currentUserMarker.remove();
            }

            // Create custom icon for user location
            const userIcon = L.divIcon({
              html: `
                <div style="
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  background: #10b981;
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 600;
                  font-size: 20px;
                  border: 4px solid white;
                  box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                ">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                  </svg>
                </div>
              `,
              className: '',
              iconSize: [40, 40],
              iconAnchor: [20, 20],
              popupAnchor: [0, -20]
            });

            // Add marker for current user location
            this.currentUserMarker = L.marker(
              [this.currentUserLocation.lat, this.currentUserLocation.lng],
              { icon: userIcon }
            ).addTo(this.map);

            this.currentUserMarker.bindPopup(`
              <div style="min-width: 150px;">
                <h6 style="margin: 0 0 8px 0; font-size: 14px; color: #10b981;">Tu ubicación</h6>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">Posición actual</p>
              </div>
            `);
          }
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          this.toastService.warning('No se pudo obtener tu ubicación actual');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      this.toastService.warning('Tu navegador no soporta geolocalización');
    }
  }

  /**
   * Start delivery trip - change distribution to IN_PROGRESS and all orders to SHIPPED
   */
  startDeliveryTrip(): void {
    if (!this.selectedDistribution || this.isStartingTrip) return;

    if (this.selectedDistribution.status !== 'PLANNED') {
      this.toastService.warning('Solo se puede iniciar viaje en repartos con estado Asignado');
      return;
    }

    this.isStartingTrip = true;

    // Update distribution status to IN_PROGRESS
    this.distributionService.updateDistributionStatus(this.selectedDistribution.id, 'IN_PROGRESS').subscribe({
      next: () => {
        // Update all orders to SHIPPED
        const orderIds = this.selectedDistribution.orderIds || [];
        let updatedCount = 0;
        let failedCount = 0;

        if (orderIds.length === 0) {
          this.isStartingTrip = false;
          this.toastService.success('Viaje iniciado');
          // Update local distribution status
          this.selectedDistribution.status = 'IN_PROGRESS';
          this.selectedDistribution.statusLabel = this.getStatusLabel('IN_PROGRESS');
          this.selectedDistribution.statusColor = this.getStatusColor('IN_PROGRESS');
          return;
        }

        orderIds.forEach((orderId: string) => {
          this.orderService.updateOrderStatus(orderId, 'SHIPPED').subscribe({
            next: () => {
              updatedCount++;
              // Update local order status
              const order = this.orders.find(o => o.id === orderId);
              if (order) {
                order.status = 'SHIPPED';
              }

              if (updatedCount + failedCount === orderIds.length) {
                this.isStartingTrip = false;
                if (failedCount === 0) {
                  this.toastService.success(`Viaje iniciado. ${updatedCount} pedidos marcados como Enviado`);
                } else {
                  this.toastService.warning(`Viaje iniciado. ${updatedCount} pedidos actualizados, ${failedCount} fallaron`);
                }
                // Update local distribution status
                this.selectedDistribution.status = 'IN_PROGRESS';
                this.selectedDistribution.statusLabel = this.getStatusLabel('IN_PROGRESS');
                this.selectedDistribution.statusColor = this.getStatusColor('IN_PROGRESS');

                // If route is optimized, notify first customer
                if (this.selectedDistribution.optimized && this.orderLocations.length > 0) {
                  this.notifyNextCustomer(0);
                }
              }
            },
            error: (error) => {
              failedCount++;
              console.error('Error updating order status:', error);
              if (updatedCount + failedCount === orderIds.length) {
                this.isStartingTrip = false;
                this.toastService.warning(`Viaje iniciado. ${updatedCount} pedidos actualizados, ${failedCount} fallaron`);
                // Update local distribution status even if some orders failed
                this.selectedDistribution.status = 'IN_PROGRESS';
                this.selectedDistribution.statusLabel = this.getStatusLabel('IN_PROGRESS');
                this.selectedDistribution.statusColor = this.getStatusColor('IN_PROGRESS');

                // If route is optimized, notify first customer even if some orders failed
                if (this.selectedDistribution.optimized && this.orderLocations.length > 0) {
                  this.notifyNextCustomer(0);
                }
              }
            }
          });
        });
      },
      error: (error) => {
        this.isStartingTrip = false;
        this.toastService.error('Error al iniciar el viaje');
        console.error('Error starting delivery trip:', error);
      }
    });
  }

  /**
   * Revert delivery trip - change distribution back to PLANNED and all orders back to CONFIRMED
   */
  revertDeliveryTrip(): void {
    if (!this.selectedDistribution || this.isRevertingTrip) return;

    if (this.selectedDistribution.status !== 'IN_PROGRESS') {
      this.toastService.warning('Solo se puede revertir repartos con estado Enviado');
      return;
    }

    this.isRevertingTrip = true;

    // Update distribution status to PLANNED
    this.distributionService.updateDistributionStatus(this.selectedDistribution.id, 'PLANNED').subscribe({
      next: () => {
        // Update all orders back to CONFIRMED (only those that are SHIPPED)
        const orderIds = this.selectedDistribution.orderIds || [];
        let updatedCount = 0;
        let failedCount = 0;

        if (orderIds.length === 0) {
          this.isRevertingTrip = false;
          this.toastService.success('Reparto revertido a Asignado');
          // Update local distribution status
          this.selectedDistribution.status = 'PLANNED';
          this.selectedDistribution.statusLabel = this.getStatusLabel('PLANNED');
          this.selectedDistribution.statusColor = this.getStatusColor('PLANNED');
          return;
        }

        orderIds.forEach((orderId: string) => {
          const order = this.orders.find(o => o.id === orderId);
          // Only revert orders that are SHIPPED (not DELIVERED or CANCELLED)
          if (order && order.status === 'SHIPPED') {
            this.orderService.updateOrderStatus(orderId, 'CONFIRMED').subscribe({
              next: () => {
                updatedCount++;
                // Update local order status
                if (order) {
                  order.status = 'CONFIRMED';
                }

                if (updatedCount + failedCount === orderIds.length) {
                  this.isRevertingTrip = false;
                  if (failedCount === 0) {
                    this.toastService.success(`Reparto revertido. ${updatedCount} pedidos marcados como Confirmado`);
                  } else {
                    this.toastService.warning(`Reparto revertido. ${updatedCount} pedidos actualizados, ${failedCount} fallaron`);
                  }
                  // Update local distribution status
                  this.selectedDistribution.status = 'PLANNED';
                  this.selectedDistribution.statusLabel = this.getStatusLabel('PLANNED');
                  this.selectedDistribution.statusColor = this.getStatusColor('PLANNED');
                }
              },
              error: (error) => {
                failedCount++;
                console.error('Error updating order status:', error);
                if (updatedCount + failedCount === orderIds.length) {
                  this.isRevertingTrip = false;
                  this.toastService.warning(`Reparto revertido. ${updatedCount} pedidos actualizados, ${failedCount} fallaron`);
                  // Update local distribution status even if some orders failed
                  this.selectedDistribution.status = 'PLANNED';
                  this.selectedDistribution.statusLabel = this.getStatusLabel('PLANNED');
                  this.selectedDistribution.statusColor = this.getStatusColor('PLANNED');
                }
              }
            });
          } else {
            // Skip orders that are not SHIPPED
            updatedCount++;
            if (updatedCount + failedCount === orderIds.length) {
              this.isRevertingTrip = false;
              this.toastService.success('Reparto revertido a Asignado');
              // Update local distribution status
              this.selectedDistribution.status = 'PLANNED';
              this.selectedDistribution.statusLabel = this.getStatusLabel('PLANNED');
              this.selectedDistribution.statusColor = this.getStatusColor('PLANNED');
            }
          }
        });
      },
      error: (error) => {
        this.isRevertingTrip = false;
        this.toastService.error('Error al revertir el reparto');
        console.error('Error reverting delivery trip:', error);
      }
    });
  }

  /**
   * Mark order as delivered
   */
  markOrderAsDelivered(orderId: string): void {
    if (this.isUpdatingOrder) return;

    this.isUpdatingOrder = true;

    this.orderService.updateOrderStatus(orderId, 'DELIVERED').subscribe({
      next: () => {
        this.isUpdatingOrder = false;
        this.toastService.success('Pedido marcado como Entregado');

        // Update local order list
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.status = 'DELIVERED';
        }

        // If route is optimized, notify next customer in the sequence
        if (this.selectedDistribution?.optimized) {
          const currentIndex = this.orderLocations.findIndex(loc => loc.orderId === orderId);
          if (currentIndex !== -1 && currentIndex < this.orderLocations.length - 1) {
            // Notify the next customer in the route
            this.notifyNextCustomer(currentIndex + 1);
          }
        }

        // Check if all orders are delivered to complete distribution
        this.checkDistributionCompletion();
      },
      error: (error) => {
        this.isUpdatingOrder = false;
        this.toastService.error('Error al actualizar el pedido');
        console.error('Error marking order as delivered:', error);
      }
    });
  }

  /**
   * Mark order as cancelled
   */
  markOrderAsCancelled(orderId: string): void {
    if (this.isUpdatingOrder) return;

    this.isUpdatingOrder = true;

    this.orderService.updateOrderStatus(orderId, 'CANCELLED').subscribe({
      next: () => {
        this.isUpdatingOrder = false;
        this.toastService.success('Pedido marcado como Cancelado');

        // Update local order list
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.status = 'CANCELLED';
        }

        // Check if all orders are delivered/cancelled to complete distribution
        this.checkDistributionCompletion();
      },
      error: (error) => {
        this.isUpdatingOrder = false;
        this.toastService.error('Error al actualizar el pedido');
        console.error('Error marking order as cancelled:', error);
      }
    });
  }

  /**
   * Check if all orders are delivered/cancelled and mark distribution as complete
   */
  checkDistributionCompletion(): void {
    if (!this.selectedDistribution) return;

    const orderIds = this.selectedDistribution.orderIds || [];
    const allOrdersProcessed = orderIds.every((orderId: string) => {
      const order = this.orders.find(o => o.id === orderId);
      return order && (order.status === 'DELIVERED' || order.status === 'CANCELLED');
    });

    if (allOrdersProcessed && this.selectedDistribution.status === 'IN_PROGRESS') {
      this.distributionService.updateDistributionStatus(this.selectedDistribution.id, 'COMPLETED').subscribe({
        next: () => {
          this.toastService.success('Reparto completado automáticamente');
          this.loadInitialData();
        },
        error: (error) => {
          console.error('Error completing distribution:', error);
        }
      });
    }
  }

  /**
   * Get order status for display
   */
  getOrderStatus(orderId: string): string {
    const order = this.orders.find(o => o.id === orderId);
    return order?.status || 'UNKNOWN';
  }

  /**
   * Check if order can be marked as delivered
   */
  canMarkAsDelivered(orderId: string): boolean {
    const status = this.getOrderStatus(orderId);
    return status === 'SHIPPED' || status === 'CONFIRMED';
  }

  /**
   * Check if order can be marked as cancelled
   */
  canMarkAsCancelled(orderId: string): boolean {
    const status = this.getOrderStatus(orderId);
    return status !== 'DELIVERED' && status !== 'CANCELLED';
  }

  /**
   * Notify next customer in optimized route that delivery is approaching
   */
  notifyNextCustomer(index: number): void {
    if (!this.selectedDistribution?.optimized || index >= this.orderLocations.length) {
      return;
    }

    const nextLocation = this.orderLocations[index];
    const order = this.orders.find(o => o.id === nextLocation.orderId);

    if (!order) {
      console.error('Order not found for notification:', nextLocation.orderId);
      return;
    }

    // Send notification to customer
    this.notificationService.notifyCustomerDeliveryStarting({
      customerId: order.customerId,
      orderNumber: nextLocation.orderNumber,
      estimatedPosition: index + 1
    }).subscribe({
      next: () => {
        console.log(`Email sent to customer ${nextLocation.customerName} (position ${index + 1})`);
        this.toastService.success(`Email enviado a ${nextLocation.customerName}`);
      },
      error: (error) => {
        console.error('Error sending notification:', error);
        // Don't show error to user - this is a background operation
      }
    });
  }
}