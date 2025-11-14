import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { DistributionService } from '../../../services/distribution.service';
import { OrderService } from '../../../services/order.service';
import { CustomerService } from '../../../services/customer.service';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { DistributionResponse } from '../../../models/distribution.model';
import { Order } from '../../../models/order.model';
import { Customer } from '../../../models/customer.model';
import { UserDto } from '../../../models/user.model';

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
                <option *ngFor="let dist of distributions" [value]="dist.id">
                  {{ dist.dealerName }} - {{ dist.orderCount }} pedido(s) - {{ formatDate(dist.createdAt) }}
                </option>
              </select>
            </div>
            <div class="col-md-6" *ngIf="selectedDistribution">
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
              <h6 class="mb-0">Pedidos del Reparto ({{ orderLocations.length }})</h6>
            </div>
            <div class="card-body p-0">
              <div
                class="delivery-item"
                *ngFor="let location of orderLocations; let i = index"
                (click)="focusOnMarker(i)"
                [class.active]="selectedMarkerIndex === i"
              >
                <div class="delivery-number">{{ i + 1 }}</div>
                <div class="delivery-info">
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
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">{{ location.city }}</small>
                    <small class="text-primary fw-semibold">\${{ location.total | number:'1.2-2' }}</small>
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
      cursor: pointer;
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

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private resizeObserver?: ResizeObserver;

  ngOnInit(): void {
    this.loadInitialData();
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
    this.orderLocations = locations;
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
      'ASSIGNED': 'Asignado',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'secondary',
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
      day: '2-digit'
    });
  }
}