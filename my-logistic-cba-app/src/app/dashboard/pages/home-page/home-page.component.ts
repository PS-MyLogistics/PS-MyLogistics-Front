import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { CustomerService } from '../../../services/customer.service';
import { UserService } from '../../../services/user.service';
import { DistributionService } from '../../../services/distribution.service';
import { AuthService } from '../../../services/auth.service';
import { Role } from '../../../models/user.model';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Welcome Header -->
      <div class="welcome-header mb-4">
        <div>
          <h4 class="mb-2">Bienvenido, {{ currentUsername || 'Usuario' }}</h4>
          <p class="text-muted mb-0">Aquí tienes un resumen de tus operaciones logísticas</p>
        </div>

        <!-- Filtros de Fecha -->
        <div class="date-filters">
          <div class="filter-group">
            <label class="filter-label">Mes</label>
            <select class="form-select" [(ngModel)]="selectedMonth" (ngModelChange)="onFilterChange()">
              <option [value]="0">Enero</option>
              <option [value]="1">Febrero</option>
              <option [value]="2">Marzo</option>
              <option [value]="3">Abril</option>
              <option [value]="4">Mayo</option>
              <option [value]="5">Junio</option>
              <option [value]="6">Julio</option>
              <option [value]="7">Agosto</option>
              <option [value]="8">Septiembre</option>
              <option [value]="9">Octubre</option>
              <option [value]="10">Noviembre</option>
              <option [value]="11">Diciembre</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Año</label>
            <select class="form-select" [(ngModel)]="selectedYear" (ngModelChange)="onFilterChange()">
              <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando estadísticas...</p>
      </div>

      <!-- Stats Cards -->
      <div *ngIf="!isLoading" class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-card stat-primary">
            <div class="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalOrders }}</h3>
              <p>Total Pedidos</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-card stat-success">
            <div class="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.deliveredOrders }}</h3>
              <p>Entregas Completadas</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-card stat-warning">
            <div class="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.inTransitOrders }}</h3>
              <p>En Tránsito</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3" *ngIf="!isDealer">
          <div class="stat-card stat-info">
            <div class="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalCustomers }}</h3>
              <p>Clientes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Stats Row -->
      <div *ngIf="!isLoading && !isDealer" class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="stat-card-secondary">
            <div class="stat-icon-small">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h4>\${{ stats.totalRevenue | number:'1.2-2' }}</h4>
              <p>Ingresos Totales</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-4">
          <div class="stat-card-secondary">
            <div class="stat-icon-small">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <h4>{{ stats.pendingOrders }}</h4>
              <p>Pedidos Pendientes</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-4">
          <div class="stat-card-secondary">
            <div class="stat-icon-small">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h4>{{ stats.totalDistributions }}</h4>
              <p>Distribuciones Activas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders by Status Chart -->
      <div *ngIf="!isLoading" class="row g-3 mb-4">
        <div class="col-12 col-lg-8">
          <div class="card">
            <div class="card-header">
              <h6 class="card-title mb-0">Estado de Pedidos</h6>
            </div>
            <div class="card-body">
              <div class="status-bars">
                <div class="status-bar-item" *ngFor="let status of ordersByStatus">
                  <div class="status-bar-header">
                    <span class="status-label">{{ status.label }}</span>
                    <span class="status-value">{{ status.count }} ({{ status.percentage }}%)</span>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar" [style.width.%]="status.percentage" [class]="'bg-' + status.color"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="card-title mb-0">Resumen Rápido</h6>
            </div>
            <div class="card-body">
              <div class="quick-stat">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <div>
                  <p class="mb-0">{{ stats.totalUsers }}</p>
                  <span>Usuarios Totales</span>
                </div>
              </div>
              <div class="quick-stat">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                <div>
                  <p class="mb-0">\${{ stats.averageOrderValue | number:'1.2-2' }}</p>
                  <span>Valor Promedio de Pedido</span>
                </div>
              </div>
              <div class="quick-stat">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <div>
                  <p class="mb-0">{{ deliveryRate }}%</p>
                  <span>Tasa de Entrega</span>
                </div>
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

    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .welcome-header h4 {
      font-weight: 700;
      color: #1f2937;
    }

    .date-filters {
      display: flex;
      gap: 12px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin: 0;
    }

    .form-select {
      padding: 8px 32px 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      background-color: white;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 8px center;
      background-size: 16px 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .form-select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-select:hover {
      border-color: #9ca3af;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-left: 4px solid;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-primary { border-left-color: #2563eb; }
    .stat-success { border-left-color: #10b981; }
    .stat-warning { border-left-color: #f59e0b; }
    .stat-info { border-left-color: #3b82f6; }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-primary .stat-icon {
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
    }

    .stat-success .stat-icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .stat-warning .stat-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .stat-info .stat-icon {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .stat-icon svg {
      width: 28px;
      height: 28px;
    }

    .stat-content h3 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
      color: #1f2937;
    }

    .stat-content p {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
      font-weight: 500;
    }

    .stat-card-secondary {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .stat-icon-small {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .stat-icon-small svg {
      width: 24px;
      height: 24px;
    }

    .stat-card-secondary h4 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 4px;
      color: #1f2937;
    }

    .stat-card-secondary p {
      font-size: 13px;
      color: #6b7280;
      margin: 0;
    }

    .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      background: white;
    }

    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: transparent;
    }

    .card-title {
      font-weight: 700;
      color: #1f2937;
      font-size: 16px;
    }

    .card-body {
      padding: 24px;
    }

    .status-bars {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .status-bar-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .status-bar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .status-value {
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
    }

    .progress-bar-container {
      width: 100%;
      height: 12px;
      background: #f3f4f6;
      border-radius: 6px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .bg-primary { background: #2563eb; }
    .bg-success { background: #10b981; }
    .bg-warning { background: #f59e0b; }
    .bg-secondary { background: #6b7280; }
    .bg-danger { background: #ef4444; }

    .quick-stat {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .quick-stat:last-child {
      border-bottom: none;
    }

    .quick-stat svg {
      color: #6b7280;
      flex-shrink: 0;
    }

    .quick-stat p {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
    }

    .quick-stat span {
      font-size: 13px;
      color: #6b7280;
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

    @media (max-width: 768px) {
      .welcome-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .date-filters {
        width: 100%;
        flex-direction: column;
      }

      .filter-group {
        width: 100%;
      }

      .form-select {
        width: 100%;
      }
    }
  `]
})
export class HomePageComponent implements OnInit {
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private userService = inject(UserService);
  private distributionService = inject(DistributionService);
  private authService = inject(AuthService);

  isLoading = true;
  currentUsername: string | null = null;
  isDealer = false;
  currentUserId: string | null = null;

  // Filtros de fecha
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];

  stats = {
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    inTransitOrders: 0,
    totalCustomers: 0,
    totalUsers: 0,
    totalDistributions: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  };

  ordersByStatus: any[] = [];
  deliveryRate: number = 0;

  ngOnInit(): void {
    this.currentUsername = this.authService.getCurrentUsername();
    this.isDealer = this.authService.hasRole(Role.DEALER);
    this.initializeAvailableYears();
    this.loadCurrentUserId();
  }

  initializeAvailableYears(): void {
    // Generar años desde 2025 hasta 2030
    for (let year = 2025; year <= 2030; year++) {
      this.availableYears.push(year);
    }
  }

  onFilterChange(): void {
    this.loadStatistics();
  }

  filterOrdersByDate(orders: any[]): any[] {
    // Asegurar que los valores del filtro sean números
    const filterMonth = Number(this.selectedMonth);
    const filterYear = Number(this.selectedYear);

    return orders.filter(order => {
      let orderDate: Date;

      // Manejar timestamp numérico o string
      if (typeof order.createdAt === 'number') {
        // Si es timestamp en segundos, convertir a milisegundos
        orderDate = new Date(order.createdAt * 1000);
      } else if (typeof order.createdAt === 'string') {
        const parsed = parseFloat(order.createdAt);
        if (!isNaN(parsed)) {
          // Es un timestamp numérico en formato string
          orderDate = new Date(parsed * 1000);
        } else {
          // Es una fecha en formato ISO string
          orderDate = new Date(order.createdAt);
        }
      } else {
        return false;
      }

      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();

      return orderMonth === filterMonth && orderYear === filterYear;
    });
  }

  loadCurrentUserId(): void {
    if (this.isDealer) {
      // Obtener el ID del usuario actual usando el endpoint /me
      this.userService.getCurrentUser().subscribe({
        next: (currentUser) => {
          this.currentUserId = currentUser.id;
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error loading current user:', error);
          this.currentUserId = null;
          this.loadStatistics();
        }
      });
    } else {
      this.loadStatistics();
    }
  }

  loadStatistics(): void {
    this.isLoading = true;

    // Reset stats to ensure clean state
    this.stats = {
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      inTransitOrders: 0,
      totalCustomers: 0,
      totalUsers: 0,
      totalDistributions: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };
    this.ordersByStatus = [];
    this.deliveryRate = 0;

    // Si es dealer, primero cargar las distribuciones para filtrar sus pedidos
    if (this.isDealer && this.currentUserId) {
      this.distributionService.getAllDistributions().subscribe({
        next: (distributions) => {
          // Filtrar distribuciones del dealer actual
          const dealerDistributions = distributions.filter(d => d.dealerId === this.currentUserId);

          // Obtener todos los IDs de pedidos asignados al dealer
          const dealerOrderIds = new Set<string>();
          dealerDistributions.forEach(dist => {
            if (dist.orderIds) {
              dist.orderIds.forEach(orderId => dealerOrderIds.add(orderId));
            }
          });

          // Cargar pedidos y filtrar solo los del dealer
          this.loadOrdersWithFilter(dealerOrderIds);
        },
        error: (error) => {
          console.error('Error loading distributions:', error);
          console.warn('ADVERTENCIA: No se pudieron cargar las distribuciones. El backend /distributions/getAll está fallando.');
          console.warn('WORKAROUND: Se mostrarán todos los pedidos porque no se puede determinar cuáles están asignados al dealer.');
          // Si falla, mostrar todos los pedidos (null = sin filtro)
          this.loadOrdersWithFilter(null);
        }
      });
    } else {
      // Si no es dealer, cargar todas las estadísticas
      this.loadOrdersWithFilter(null);
    }
  }

  loadOrdersWithFilter(dealerOrderIds: Set<string> | null): void {
    this.orderService.getAll().subscribe({
      next: (allOrders) => {
        // Filtrar pedidos si es dealer
        let orders = dealerOrderIds !== null
          ? allOrders.filter(o => dealerOrderIds.has(o.id))
          : allOrders;

        // Aplicar filtro de fecha (mes y año)
        orders = this.filterOrdersByDate(orders);

        this.stats.totalOrders = orders.length;
        this.stats.pendingOrders = orders.filter(o => o.status === 'PENDING').length;
        this.stats.deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
        this.stats.inTransitOrders = orders.filter(o => o.status === 'SHIPPED').length;

        // Calculate revenue
        this.stats.totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        this.stats.averageOrderValue = this.stats.totalOrders > 0 ? this.stats.totalRevenue / this.stats.totalOrders : 0;

        // Calculate delivery rate
        this.deliveryRate = this.stats.totalOrders > 0
          ? Math.round((this.stats.deliveredOrders / this.stats.totalOrders) * 100)
          : 0;

        // Orders by status
        const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length;
        const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length;

        this.ordersByStatus = [
          {
            label: 'Pendientes',
            count: this.stats.pendingOrders,
            percentage: this.stats.totalOrders > 0 ? Math.round((this.stats.pendingOrders / this.stats.totalOrders) * 100) : 0,
            color: 'secondary'
          },
          {
            label: 'Asignados',
            count: confirmedCount,
            percentage: this.stats.totalOrders > 0 ? Math.round((confirmedCount / this.stats.totalOrders) * 100) : 0,
            color: 'primary'
          },
          {
            label: 'Enviados',
            count: this.stats.inTransitOrders,
            percentage: this.stats.totalOrders > 0 ? Math.round((this.stats.inTransitOrders / this.stats.totalOrders) * 100) : 0,
            color: 'warning'
          },
          {
            label: 'Entregados',
            count: this.stats.deliveredOrders,
            percentage: this.stats.totalOrders > 0 ? Math.round((this.stats.deliveredOrders / this.stats.totalOrders) * 100) : 0,
            color: 'success'
          },
          {
            label: 'Cancelados',
            count: cancelledCount,
            percentage: this.stats.totalOrders > 0 ? Math.round((cancelledCount / this.stats.totalOrders) * 100) : 0,
            color: 'danger'
          }
        ];

        this.loadOtherStats();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  loadOtherStats(): void {
    // Los dealers no necesitan ver estas estadísticas
    if (this.isDealer) {
      this.isLoading = false;
      return;
    }

    // Contador para rastrear cuántas llamadas se han completado
    let completedCalls = 0;
    const totalCalls = 3;

    const checkAllCallsCompleted = () => {
      completedCalls++;
      if (completedCalls === totalCalls) {
        this.isLoading = false;
      }
    };

    // Load customers
    this.customerService.getAll().subscribe({
      next: (customers) => {
        this.stats.totalCustomers = customers.length;
        checkAllCallsCompleted();
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.stats.totalCustomers = 0;
        checkAllCallsCompleted();
      }
    });

    // Load users
    this.userService.getAll().subscribe({
      next: (users) => {
        this.stats.totalUsers = users.length;
        checkAllCallsCompleted();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.stats.totalUsers = 0;
        checkAllCallsCompleted();
      }
    });

    // Load distributions
    this.distributionService.getAllDistributions().subscribe({
      next: (distributions) => {
        this.stats.totalDistributions = distributions.length;
        checkAllCallsCompleted();
      },
      error: (error) => {
        console.error('Error loading distributions:', error);
        this.stats.totalDistributions = 0;
        checkAllCallsCompleted();
      }
    });
  }
}
