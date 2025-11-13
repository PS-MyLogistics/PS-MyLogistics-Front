import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DistributionService } from '../../../services/distribution.service';
import { UserService } from '../../../services/user.service';
import { OrderService } from '../../../services/order.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { DistributionResponse } from '../../../models/distribution.model';
import { UserDto, Role } from '../../../models/user.model';
import { Order } from '../../../models/order.model';

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

  repartos: any[] = [];
  repartosFiltrados: any[] = [];
  isLoading = false;
  dealers: UserDto[] = [];
  orders: Order[] = [];
  isDealer = false;

  // Filtros
  searchTerm: string = '';
  filtroDealer: string = '';
  filtroEstado: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  // Modal detalles
  showDetailsModal = false;
  selectedReparto: any = null;

  ngOnInit(): void {
    this.isDealer = this.authService.hasRole(Role.DEALER);
    this.loadInitialData();
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

        this.repartosFiltrados = this.repartos;
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
      // Filtro de búsqueda por texto
      const matchesSearch = !this.searchTerm ||
        reparto.dealerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        reparto.orderNumbers.some((num: string) => num.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Filtro por dealer
      const matchesDealer = !this.filtroDealer || reparto.dealerId === this.filtroDealer;

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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatDateTime(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);

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
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedReparto = null;
  }
}
