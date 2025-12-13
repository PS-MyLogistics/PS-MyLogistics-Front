import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DistributionService } from '../../../services/distribution.service';
import { UserService } from '../../../services/user.service';
import { OrderService } from '../../../services/order.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { TenantService } from '../../../services/tenant.service';
import { DistributionResponse } from '../../../models/distribution.model';
import { UserDto, Role } from '../../../models/user.model';
import { Order } from '../../../models/order.model';
import { TenantInfo, PlanType } from '../../../models/tenant.model';

@Component({
  selector: 'app-repartos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repartos-page.component.html',
  styleUrl: './repartos-page.component.css'
})
export class RepartosPageComponent implements OnInit {
  private router = inject(Router);
  private distributionService = inject(DistributionService);
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private tenantService = inject(TenantService);

  repartos: any[] = [];
  repartosFiltrados: any[] = [];
  isLoading = false;
  dealers: UserDto[] = [];
  orders: Order[] = [];
  isDealer = false;
  currentDealerId: string | null = null;

  // Plan information
  tenantInfo: TenantInfo | null = null;
  isPremiumPlan = false;

  // Filtros
  searchTerm: string = '';
  filtroDealer: string = '';
  filtroEstado: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  // Modal detalles
  showDetailsModal = false;
  selectedReparto: any = null;
  selectedRepartoOrders: Order[] = [];

  // Modal detalle de pedido
  showOrderDetailModal = false;
  selectedOrder: Order | null = null;

  // Selección y acciones masivas
  selectedRepartos: string[] = [];
  showCancelRepartosModal = false;
  showCompleteRepartosModal = false;
  isCancellingRepartos = false;
  isCompletingRepartos = false;

  // Revertir repartos
  showRevertRepartosModal = false;
  isRevertingRepartos = false;

  // Optimización de repartos
  showOptimizeRepartosModal = false;
  isOptimizingRepartos = false;
  optimizeFechaInicio: string = '';
  optimizeFechaFin: string = '';

  ngOnInit(): void {
    this.isDealer = this.authService.hasRole(Role.DEALER);

    // Cargar información del tenant para verificar el plan
    this.loadTenantInfo();

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

  loadInitialData(): void {
    this.isLoading = true;

    // Cargar dealers y orders primero, luego repartos
    let dealersLoaded = false;
    let ordersLoaded = false;

    this.userService.getAll().subscribe({
      next: (users) => {
        this.dealers = users.filter(user => user.roles.includes(Role.DEALER));
        dealersLoaded = true;
        if (ordersLoaded) {
          this.loadRepartos();
        }
      },
      error: (error) => {
        console.error('Error loading dealers:', error);
        this.toastService.error('Error al cargar repartidores');
        this.isLoading = false;
      }
    });

    this.orderService.getAll().subscribe({
      next: (orders) => {
        this.orders = orders;
        ordersLoaded = true;
        if (dealersLoaded) {
          this.loadRepartos();
        }
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  loadRepartos(): void {
    this.distributionService.getAllDistributions().subscribe({
      next: (distributions) => {
        // Enriquecer distribuciones con información de dealers y pedidos
        this.repartos = distributions.map(dist => {
          const dealer = this.dealers.find(d => d.id === dist.dealerId);
          const orderCount = dist.orderIds?.length || 0;
          const orderNumbers = dist.orderIds?.map(orderId => {
            const order = this.orders.find(o => o.id === orderId);
            return order?.orderNumber || orderId;
          }) || [];

          return {
            ...dist,
            dealerName: dealer?.username || 'Sin asignar',
            dealerEmail: dealer?.email || '',
            orderCount,
            orderNumbers,
            statusLabel: this.getStatusLabel(dist.status),
            statusColor: this.getStatusColor(dist.status)
          };
        });

        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error('Error al cargar repartos');
        console.error('Error loading distributions:', error);
      }
    });
  }

  applyFilters(): void {
    this.repartosFiltrados = this.repartos.filter(reparto => {
      // Si es dealer, filtrar solo sus propios repartos
      if (this.isDealer && this.currentDealerId) {
        if (reparto.dealerId !== this.currentDealerId) {
          return false;
        }
      }

      // Filtro de búsqueda por texto
      const matchesSearch = !this.searchTerm ||
        reparto.dealerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        reparto.orderNumbers.some((num: string) => num.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Filtro por dealer (solo para admins)
      const matchesDealer = this.isDealer || !this.filtroDealer || reparto.dealerId === this.filtroDealer;

      // Filtro por estado
      const matchesStatus = !this.filtroEstado || reparto.status === this.filtroEstado;

      // Filtro por fecha desde
      const matchesFechaDesde = !this.filtroFechaDesde ||
        new Date(reparto.createdAt) >= new Date(this.filtroFechaDesde);

      // Filtro por fecha hasta
      const matchesFechaHasta = !this.filtroFechaHasta ||
        new Date(reparto.createdAt) <= new Date(this.filtroFechaHasta + 'T23:59:59');

      return matchesSearch && matchesDealer && matchesStatus && matchesFechaDesde && matchesFechaHasta;
    });
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroDealer = '';
    this.filtroEstado = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'PLANNED': 'Asignado',
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
      'IN_PROGRESS': 'warning',
      'COMPLETED': 'success',
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

  formatDateTime(dateString?: string | number): string {
    if (!dateString) return 'N/A';

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
      return 'N/A';
    }

    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  verDetalle(reparto: any): void {
    this.selectedReparto = reparto;
    // Cargar los detalles completos de los pedidos
    this.selectedRepartoOrders = [];
    if (reparto.orderIds && reparto.orderIds.length > 0) {
      reparto.orderIds.forEach((orderId: string) => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          this.selectedRepartoOrders.push(order);
        }
      });
    }
    this.showDetailsModal = true;
  }

  verEnMapa(reparto: any): void {
    // Navegar a la página del mapa pasando el ID del reparto como parámetro
    this.router.navigate(['/dashboard/mapa'], {
      queryParams: { repartoId: reparto.id }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedReparto = null;
    this.selectedRepartoOrders = [];
  }

  // Métodos para modal de detalle de pedido
  verDetallePedido(order: Order): void {
    this.selectedOrder = order;
    this.showOrderDetailModal = true;
  }

  closeOrderDetailModal(): void {
    this.showOrderDetailModal = false;
    this.selectedOrder = null;
  }

  getOrderStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Asignado',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getOrderStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'secondary',
      'CONFIRMED': 'primary',
      'SHIPPED': 'warning',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return colorMap[status] || 'secondary';
  }

  // Métodos de selección
  isRepartoSelected(repartoId: string): boolean {
    return this.selectedRepartos.includes(repartoId);
  }

  toggleRepartoSelection(repartoId: string): void {
    const index = this.selectedRepartos.indexOf(repartoId);
    if (index > -1) {
      this.selectedRepartos.splice(index, 1);
    } else {
      this.selectedRepartos.push(repartoId);
    }
  }

  allSelectableRepartosSelected(): boolean {
    const selectableRepartos = this.repartosFiltrados.filter(r => r.status !== 'CANCELLED');
    if (selectableRepartos.length === 0) return false;
    return selectableRepartos.every(r => this.selectedRepartos.includes(r.id));
  }

  toggleSelectAll(): void {
    const selectableRepartos = this.repartosFiltrados.filter(r => r.status !== 'CANCELLED');
    if (this.allSelectableRepartosSelected()) {
      // Deseleccionar todos
      selectableRepartos.forEach(r => {
        const index = this.selectedRepartos.indexOf(r.id);
        if (index > -1) {
          this.selectedRepartos.splice(index, 1);
        }
      });
    } else {
      // Seleccionar todos
      selectableRepartos.forEach(r => {
        if (!this.selectedRepartos.includes(r.id)) {
          this.selectedRepartos.push(r.id);
        }
      });
    }
  }

  // Métodos de modales
  openCancelRepartosModal(): void {
    if (this.selectedRepartos.length === 0) {
      this.toastService.error('Debes seleccionar al menos un reparto');
      return;
    }
    this.showCancelRepartosModal = true;
  }

  closeCancelRepartosModal(): void {
    this.showCancelRepartosModal = false;
  }

  openCompleteRepartosModal(): void {
    if (this.selectedRepartos.length === 0) {
      this.toastService.error('Debes seleccionar al menos un reparto');
      return;
    }
    this.showCompleteRepartosModal = true;
  }

  closeCompleteRepartosModal(): void {
    this.showCompleteRepartosModal = false;
  }

  // Cancelar repartos
  cancelRepartos(): void {
    if (this.selectedRepartos.length === 0) {
      this.toastService.error('No hay repartos seleccionados');
      return;
    }

    this.isCancellingRepartos = true;
    let processedCount = 0;
    const totalRepartos = this.selectedRepartos.length;

    this.selectedRepartos.forEach(repartoId => {
      const reparto = this.repartos.find(r => r.id === repartoId);
      if (!reparto) {
        processedCount++;
        return;
      }

      // Cancelar el reparto
      this.distributionService.updateDistributionStatus(repartoId, 'CANCELLED').subscribe({
        next: () => {
          // Cambiar todos los pedidos del reparto a PENDING
          const orderIds = reparto.orderIds || [];
          let ordersProcessed = 0;

          if (orderIds.length === 0) {
            processedCount++;
            this.checkCancelCompletion(processedCount, totalRepartos);
            return;
          }

          orderIds.forEach((orderId: string) => {
            this.orderService.updateOrderStatus(orderId, 'PENDING').subscribe({
              next: () => {
                ordersProcessed++;
                if (ordersProcessed === orderIds.length) {
                  processedCount++;
                  this.checkCancelCompletion(processedCount, totalRepartos);
                }
              },
              error: (error) => {
                console.error('Error updating order status:', orderId, error);
                ordersProcessed++;
                if (ordersProcessed === orderIds.length) {
                  processedCount++;
                  this.checkCancelCompletion(processedCount, totalRepartos);
                }
              }
            });
          });
        },
        error: (error) => {
          console.error('Error cancelling distribution:', repartoId, error);
          processedCount++;
          this.checkCancelCompletion(processedCount, totalRepartos);
        }
      });
    });
  }

  checkCancelCompletion(processedCount: number, totalRepartos: number): void {
    if (processedCount === totalRepartos) {
      this.isCancellingRepartos = false;
      this.toastService.success(`${totalRepartos} reparto(s) cancelado(s) exitosamente`);
      this.closeCancelRepartosModal();
      this.selectedRepartos = [];
      this.loadInitialData();
    }
  }

  // Completar repartos
  completeRepartos(): void {
    if (this.selectedRepartos.length === 0) {
      this.toastService.error('No hay repartos seleccionados');
      return;
    }

    this.isCompletingRepartos = true;
    let processedCount = 0;
    const totalRepartos = this.selectedRepartos.length;

    this.selectedRepartos.forEach(repartoId => {
      const reparto = this.repartos.find(r => r.id === repartoId);
      if (!reparto) {
        processedCount++;
        return;
      }

      // Completar el reparto
      this.distributionService.updateDistributionStatus(repartoId, 'COMPLETED').subscribe({
        next: () => {
          // Cambiar todos los pedidos del reparto a DELIVERED
          const orderIds = reparto.orderIds || [];
          let ordersProcessed = 0;

          if (orderIds.length === 0) {
            processedCount++;
            this.checkCompleteCompletion(processedCount, totalRepartos);
            return;
          }

          orderIds.forEach((orderId: string) => {
            this.orderService.updateOrderStatus(orderId, 'DELIVERED').subscribe({
              next: () => {
                ordersProcessed++;
                if (ordersProcessed === orderIds.length) {
                  processedCount++;
                  this.checkCompleteCompletion(processedCount, totalRepartos);
                }
              },
              error: (error) => {
                console.error('Error updating order status:', orderId, error);
                ordersProcessed++;
                if (ordersProcessed === orderIds.length) {
                  processedCount++;
                  this.checkCompleteCompletion(processedCount, totalRepartos);
                }
              }
            });
          });
        },
        error: (error) => {
          console.error('Error completing distribution:', repartoId, error);
          processedCount++;
          this.checkCompleteCompletion(processedCount, totalRepartos);
        }
      });
    });
  }

  checkCompleteCompletion(processedCount: number, totalRepartos: number): void {
    if (processedCount === totalRepartos) {
      this.isCompletingRepartos = false;
      this.toastService.success(`${totalRepartos} reparto(s) marcado(s) como entregado(s) exitosamente`);
      this.closeCompleteRepartosModal();
      this.selectedRepartos = [];
      this.loadInitialData();
    }
  }

  getRepartoIdentifier(repartoId: string): string {
    const reparto = this.repartos.find(r => r.id === repartoId);
    if (!reparto) return repartoId;
    return `${reparto.dealerName} - ${reparto.orderCount} pedido(s)`;
  }

  // Métodos para optimización de repartos
  canOptimizeSelectedRepartos(): boolean {
    // Verificar si es plan premium
    if (!this.isPremiumPlan) return false;

    if (this.selectedRepartos.length === 0) return false;

    return this.selectedRepartos.every(repartoId => {
      const reparto = this.repartos.find(r => r.id === repartoId);
      return reparto && reparto.status === 'PLANNED' && !reparto.optimized;
    });
  }

  openOptimizeRepartosModal(): void {
    this.optimizeFechaInicio = '';
    this.optimizeFechaFin = '';
    this.showOptimizeRepartosModal = true;
  }

  closeOptimizeRepartosModal(): void {
    this.showOptimizeRepartosModal = false;
    this.optimizeFechaInicio = '';
    this.optimizeFechaFin = '';
  }

  optimizeRepartos(): void {
    if (this.selectedRepartos.length === 0) return;

    this.isOptimizingRepartos = true;
    let processedCount = 0;
    const totalRepartos = this.selectedRepartos.length;

    this.selectedRepartos.forEach(repartoId => {
      this.distributionService.optimizeRoutes(repartoId).subscribe({
        next: () => {
          // Si se proporcionaron fechas, actualizar las fechas del reparto
          if (this.optimizeFechaInicio || this.optimizeFechaFin) {
            // Aquí podrías llamar a un método para actualizar las fechas
            // Por ahora solo incrementamos el contador
            processedCount++;
            this.checkOptimizeCompletion(processedCount, totalRepartos);
          } else {
            processedCount++;
            this.checkOptimizeCompletion(processedCount, totalRepartos);
          }
        },
        error: (error) => {
          console.error('Error optimizing distribution:', repartoId, error);
          this.toastService.error(`Error al optimizar reparto: ${error.message || 'Error desconocido'}`);
          processedCount++;
          this.checkOptimizeCompletion(processedCount, totalRepartos);
        }
      });
    });
  }

  checkOptimizeCompletion(processedCount: number, totalRepartos: number): void {
    if (processedCount === totalRepartos) {
      this.isOptimizingRepartos = false;
      this.toastService.success(`${totalRepartos} reparto(s) optimizado(s) exitosamente`);
      this.closeOptimizeRepartosModal();
      this.selectedRepartos = [];
      this.loadInitialData();
    }
  }

  // Revertir repartos a estado PLANNED
  openRevertRepartosModal(): void {
    if (this.selectedRepartos.length === 0) {
      this.toastService.error('Debes seleccionar al menos un reparto');
      return;
    }
    this.showRevertRepartosModal = true;
  }

  closeRevertRepartosModal(): void {
    this.showRevertRepartosModal = false;
  }

  revertRepartos(): void {
    if (this.selectedRepartos.length === 0) {
      this.toastService.error('No hay repartos seleccionados');
      return;
    }

    this.isRevertingRepartos = true;
    let processedCount = 0;
    const totalRepartos = this.selectedRepartos.length;

    this.selectedRepartos.forEach(repartoId => {
      const reparto = this.repartos.find(r => r.id === repartoId);
      if (!reparto) {
        processedCount++;
        return;
      }

      // Revertir el reparto a PLANNED
      this.distributionService.updateDistributionStatus(repartoId, 'PLANNED').subscribe({
        next: () => {
          // Cambiar todos los pedidos que estén en SHIPPED a CONFIRMED
          const orderIds = reparto.orderIds || [];
          let ordersProcessed = 0;

          if (orderIds.length === 0) {
            processedCount++;
            this.checkRevertCompletion(processedCount, totalRepartos);
            return;
          }

          orderIds.forEach((orderId: string) => {
            const order = this.orders.find(o => o.id === orderId);
            // Revertir todos los pedidos excepto CANCELLED
            if (order && order.status !== 'CANCELLED') {
              this.orderService.updateOrderStatus(orderId, 'CONFIRMED').subscribe({
                next: () => {
                  ordersProcessed++;
                  if (ordersProcessed === orderIds.length) {
                    processedCount++;
                    this.checkRevertCompletion(processedCount, totalRepartos);
                  }
                },
                error: (error) => {
                  console.error('Error updating order status:', orderId, error);
                  ordersProcessed++;
                  if (ordersProcessed === orderIds.length) {
                    processedCount++;
                    this.checkRevertCompletion(processedCount, totalRepartos);
                  }
                }
              });
            } else {
              // Saltar pedidos que son CANCELLED
              ordersProcessed++;
              if (ordersProcessed === orderIds.length) {
                processedCount++;
                this.checkRevertCompletion(processedCount, totalRepartos);
              }
            }
          });
        },
        error: (error) => {
          console.error('Error reverting distribution:', repartoId, error);
          processedCount++;
          this.checkRevertCompletion(processedCount, totalRepartos);
        }
      });
    });
  }

  checkRevertCompletion(processedCount: number, totalRepartos: number): void {
    if (processedCount === totalRepartos) {
      this.isRevertingRepartos = false;
      this.toastService.success(`${totalRepartos} reparto(s) revertido(s) a Asignado exitosamente`);
      this.closeRevertRepartosModal();
      this.selectedRepartos = [];
      this.loadInitialData();
    }
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
}
