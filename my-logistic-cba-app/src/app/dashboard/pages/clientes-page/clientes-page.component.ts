import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { ZoneService } from '../../../services/zone.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { PromotionService } from '../../../services/promotion.service';
import { Customer, CustomerCreationRequest } from '../../../models/customer.model';
import { ZoneResponse } from '../../../models/zone.model';
import { Role } from '../../../models/user.model';
import { CustomerWithLastOrder, InactivityPeriod } from '../../../models/promotion.model';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-page.component.html',
  styleUrl: './clientes-page.component.css'
})
export class ClientesPageComponent implements OnInit {
  private customerService = inject(CustomerService);
  private zoneService = inject(ZoneService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private promotionService = inject(PromotionService);

  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  clientesOriginales: Customer[] = [];
  clientesConUltimoPedido: CustomerWithLastOrder[] = [];
  zones: ZoneResponse[] = [];
  isLoading = false;
  errorMessage = '';
  isDealer = false;

  // Filtros
  searchTerm: string = '';
  filtroEstado: string = '';
  filtroInactividad: string = '';
  selectedCustomers: string[] = [];

  // Inactivity periods for dropdown
  inactivityPeriods = [
    { label: 'Más de 7 días', value: InactivityPeriod.WEEK_1.toString() },
    { label: 'Más de 1 mes', value: InactivityPeriod.MONTH_1.toString() },
    { label: 'Más de 3 meses', value: InactivityPeriod.MONTHS_3.toString() },
    { label: 'Más de 6 meses', value: InactivityPeriod.MONTHS_6.toString() },
    { label: 'Más de 1 año', value: '365' }
  ];

  // Modal create customer
  showCreateModal = false;
  isCreating = false;

  // Modal edit customer
  showEditModal = false;
  isEditMode = false;
  editingCustomerId: string | null = null;
  editCustomer: CustomerCreationRequest = this.getEmptyCustomer();

  // Modal delete customer
  showDeleteModal = false;
  isDeleting = false;
  customerToDelete: any = null;

  // Modal promotional email
  showPromotionalModal = false;
  isSendingPromotion = false;
  promotionalEmail = {
    subject: '',
    message: ''
  };

  // Modal confirmación cancelar crear
  showCancelCreateModal = false;

  // Modal confirmación cancelar editar
  showCancelEditModal = false;

  newCustomer: CustomerCreationRequest = this.getEmptyCustomer();

  ngOnInit(): void {
    this.isDealer = this.authService.hasRole(Role.DEALER);

    // Cargar zonas primero, luego clientes para asegurar que los colores estén disponibles
    this.loadZones();

    // Si hay un filtro de inactividad activo al cargar el componente, cargar los datos
    if (this.filtroInactividad) {
      this.loadCustomersWithLastOrder();
    }
  }

  getEmptyCustomer(): CustomerCreationRequest {
    return {
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      postalCode: '',
      city: '',
      state: '',
      country: '',
      doorbell: '',
      notes: '',
      type: '',
      isActive: true
    };
  }

  loadZones(): void {
    this.zoneService.getAll().subscribe({
      next: (zones) => {
        this.zones = zones;
        // Cargar clientes solo después de que las zonas estén cargadas
        this.loadCustomers();
      },
      error: (error) => {
        console.error('Error loading zones:', error);
        this.toastService.error('Error al cargar zonas');
        // Cargar clientes de todas formas aunque falle la carga de zonas
        this.loadCustomers();
      }
    });
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getAll().subscribe({
      next: (customers) => {
        this.clientesOriginales = customers;
        this.clientes = customers.map(customer => {
          const zone = this.zones.find(z => z.id === customer.zoneId);
          return {
            id: customer.id,
            nombre: customer.name,
            email: customer.email,
            telefono: customer.phoneNumber,
            direccion: customer.address,
            ciudad: customer.city,
            provincia: customer.state,
            pais: customer.country,
            codigoPostal: customer.postalCode,
            timbre: customer.doorbell,
            notas: customer.notes,
            tipo: customer.type || 'Regular',
            estado: customer.isActive ? 'Activo' : 'Inactivo',
            estadoColor: customer.isActive ? 'success' : 'secondary',
            isActive: customer.isActive,
            iniciales: this.getInitials(customer.name),
            createdAt: customer.createdAt,
            zoneId: customer.zoneId,
            zoneName: customer.zoneName,
            zoneColor: zone?.color || '#6366f1'
          };
        });
        this.clientesFiltrados = this.clientes;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cargar clientes';
        this.isLoading = false;
        console.error('Error loading customers:', error);
        this.toastService.error(this.errorMessage);
      }
    });
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  applyFilters(): void {
    this.clientesFiltrados = this.clientes.filter(cliente => {
      // Filtro de búsqueda por texto
      const matchesSearch = !this.searchTerm ||
        cliente.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cliente.telefono.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cliente.ciudad.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cliente.provincia.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cliente.direccion.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro por estado
      const matchesStatus = !this.filtroEstado ||
        cliente.isActive.toString() === this.filtroEstado;

      // Filtro por inactividad:
      // - Si NO hay filtro de inactividad: mostrar TODOS los clientes
      // - Si hay filtro de inactividad: mostrar solo clientes con datos de pedido
      let matchesInactivity = true;
      if (this.filtroInactividad) {
        matchesInactivity = (cliente.daysSinceLastOrder !== undefined && cliente.daysSinceLastOrder !== null);
      }

      return matchesSearch && matchesStatus && matchesInactivity;
    });
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.filtroInactividad = '';

    // Limpiar datos de pedidos al quitar filtro de inactividad
    this.clientesConUltimoPedido = [];
    this.clientes = this.clientes.map(cliente => ({
      ...cliente,
      lastOrderDate: undefined,
      lastOrderNumber: undefined,
      lastOrderTotal: undefined,
      lastOrderStatus: undefined,
      daysSinceLastOrder: undefined,
      totalOrders: undefined
    }));

    this.applyFilters();
  }

  // Modal methods
  openCreateCustomerModal(): void {
    this.showCreateModal = true;
    this.resetForm();
  }

  closeCreateCustomerModal(): void {
    const hasChanges = this.newCustomer.name ||
                       this.newCustomer.email ||
                       this.newCustomer.phoneNumber ||
                       this.newCustomer.address;

    if (hasChanges) {
      this.showCancelCreateModal = true;
    } else {
      this.showCreateModal = false;
      this.resetForm();
    }
  }

  closeCancelCreateModal(): void {
    this.showCancelCreateModal = false;
  }

  confirmCancelCreate(): void {
    this.showCancelCreateModal = false;
    this.showCreateModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newCustomer = this.getEmptyCustomer();
  }

  isFormValid(): boolean {
    return !!(
      this.newCustomer.name &&
      this.newCustomer.email &&
      this.newCustomer.phoneNumber &&
      this.newCustomer.address &&
      this.newCustomer.city &&
      this.newCustomer.state &&
      this.newCustomer.country &&
      this.newCustomer.postalCode &&
      this.newCustomer.doorbell
    );
  }

  createCustomer(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    this.isCreating = true;

    this.customerService.createCustomer(this.newCustomer).subscribe({
      next: (customer) => {
        this.isCreating = false;
        this.toastService.success(`Cliente ${customer.name} creado exitosamente`);
        this.loadCustomers();
        // Cerrar modal directamente sin verificar cambios después de crear exitosamente
        this.showCreateModal = false;
        this.resetForm();
      },
      error: (error) => {
        this.isCreating = false;
        this.toastService.error(error.message || 'Error al crear el cliente');
        console.error('Error creating customer:', error);
      }
    });
  }

  // Edit customer methods
  openEditCustomerModal(cliente: any): void {
    const originalCustomer = this.clientesOriginales.find(c => c.id === cliente.id);
    if (!originalCustomer) return;

    this.isEditMode = true;
    this.showEditModal = true;
    this.editingCustomerId = originalCustomer.id;
    this.editCustomer = {
      name: originalCustomer.name,
      email: originalCustomer.email,
      phoneNumber: originalCustomer.phoneNumber,
      address: originalCustomer.address,
      postalCode: originalCustomer.postalCode,
      city: originalCustomer.city,
      state: originalCustomer.state,
      country: originalCustomer.country,
      doorbell: originalCustomer.doorbell,
      notes: originalCustomer.notes || '',
      type: originalCustomer.type || '',
      isActive: originalCustomer.isActive !== undefined ? originalCustomer.isActive : true,
      zoneId: originalCustomer.zoneId
    };
  }

  // Action methods for customer
  openWhatsApp(cliente: any): void {
    if (cliente.telefono) {
      const tenantName = localStorage.getItem('tenantName') || 'MyLogistics';
      const message = `Hola! Soy el administrador de ${tenantName}.`;
      const phoneNumber = cliente.telefono.replace(/\D/g, '');
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      this.toastService.warning('El cliente no tiene número de teléfono registrado');
    }
  }

  callPhone(cliente: any): void {
    if (cliente.telefono) {
      window.location.href = `tel:${cliente.telefono}`;
    } else {
      this.toastService.warning('El cliente no tiene número de teléfono registrado');
    }
  }

  openGoogleMaps(cliente: any): void {
    const fullAddress = `${cliente.direccion}, ${cliente.ciudad}, ${cliente.provincia}, ${cliente.pais}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  }

  closeEditCustomerModal(): void {
    this.showCancelEditModal = true;
  }

  closeCancelEditModal(): void {
    this.showCancelEditModal = false;
  }

  confirmCancelEdit(): void {
    this.showCancelEditModal = false;
    this.showEditModal = false;
    this.isEditMode = false;
    this.editingCustomerId = null;
    this.editCustomer = this.getEmptyCustomer();
  }

  isEditFormValid(): boolean {
    return !!(
      this.editCustomer.name &&
      this.editCustomer.email &&
      this.editCustomer.phoneNumber &&
      this.editCustomer.address &&
      this.editCustomer.city &&
      this.editCustomer.state &&
      this.editCustomer.country &&
      this.editCustomer.postalCode &&
      this.editCustomer.doorbell
    );
  }

  saveEditCustomer(): void {
    if (!this.editingCustomerId || !this.isEditFormValid()) {
      this.toastService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    this.isCreating = true;

    this.customerService.updateCustomer(this.editingCustomerId, this.editCustomer).subscribe({
      next: (customer) => {
        this.isCreating = false;
        this.toastService.success(`Cliente ${customer.name} actualizado exitosamente`);
        this.loadCustomers();
        // Cerrar modal directamente sin verificar cambios después de actualizar exitosamente
        this.showEditModal = false;
        this.isEditMode = false;
        this.editingCustomerId = null;
        this.editCustomer = this.getEmptyCustomer();
      },
      error: (error) => {
        this.isCreating = false;
        this.toastService.error(error.message || 'Error al actualizar el cliente');
        console.error('Error updating customer:', error);
      }
    });
  }

  // Delete customer methods
  openDeleteModal(cliente: any): void {
    this.customerToDelete = cliente;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.customerToDelete = null;
  }

  confirmDelete(): void {
    if (!this.customerToDelete) return;

    this.isDeleting = true;

    this.customerService.deleteCustomer(this.customerToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.toastService.success(`Cliente ${this.customerToDelete.nombre} eliminado exitosamente`);
        this.loadCustomers();
        this.loadCustomersWithLastOrder();
        this.closeDeleteModal();
      },
      error: (error) => {
        this.isDeleting = false;
        this.toastService.error(error.message || 'Error al eliminar el cliente');
        console.error('Error deleting customer:', error);
      }
    });
  }

  // === FUNCIONALIDADES DE FIDELIZACIÓN ===

  loadCustomersWithLastOrder(): void {
    // Si no hay filtro de inactividad, no cargar datos
    if (!this.filtroInactividad && this.filtroInactividad !== '0') {
      return;
    }

    const days = parseInt(this.filtroInactividad);

    // Si aún no hay clientes cargados, esperar un poco y reintentar
    if (this.clientes.length === 0) {
      setTimeout(() => this.loadCustomersWithLastOrder(), 100);
      return;
    }

    this.promotionService.getCustomersWithLastOrder(days).subscribe({
      next: (customers) => {
        this.clientesConUltimoPedido = customers;
        this.mergeCustomerData();
      },
      error: (error) => {
        console.error('Error loading customers with last order:', error);
      }
    });
  }

  mergeCustomerData(): void {
    this.clientes = this.clientes.map(cliente => {
      const customerWithOrder = this.clientesConUltimoPedido.find(c => c.customerId === cliente.id);
      if (customerWithOrder) {
        return {
          ...cliente,
          lastOrderDate: customerWithOrder.lastOrderDate,
          lastOrderNumber: customerWithOrder.lastOrderNumber,
          lastOrderTotal: customerWithOrder.lastOrderAmount,
          lastOrderStatus: customerWithOrder.lastOrderStatus,
          daysSinceLastOrder: customerWithOrder.daysSinceLastOrder,
          totalOrders: customerWithOrder.totalOrders
        };
      }
      return {
        ...cliente,
        lastOrderDate: undefined,
        lastOrderNumber: undefined,
        lastOrderTotal: undefined,
        lastOrderStatus: undefined,
        daysSinceLastOrder: undefined,
        totalOrders: undefined
      };
    });

    this.applyFilters();
  }

  onInactivityFilterChange(): void {
    if (!this.filtroInactividad) {
      // Si se limpia el filtro, limpiar datos de pedidos
      this.clientesConUltimoPedido = [];
      this.clientes = this.clientes.map(cliente => ({
        ...cliente,
        lastOrderDate: undefined,
        lastOrderNumber: undefined,
        lastOrderTotal: undefined,
        lastOrderStatus: undefined,
        daysSinceLastOrder: undefined,
        totalOrders: undefined
      }));
      this.applyFilters();
    } else {
      // Si hay filtro activo, cargar datos
      this.loadCustomersWithLastOrder();
    }
  }

  toggleCustomerSelection(customerId: string): void {
    const index = this.selectedCustomers.indexOf(customerId);
    if (index > -1) {
      this.selectedCustomers.splice(index, 1);
    } else {
      this.selectedCustomers.push(customerId);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedCustomers.length === this.clientesFiltrados.length) {
      this.selectedCustomers = [];
    } else {
      this.selectedCustomers = this.clientesFiltrados.map(c => c.id);
    }
  }

  isCustomerSelected(customerId: string): boolean {
    return this.selectedCustomers.includes(customerId);
  }

  areAllSelected(): boolean {
    return this.clientesFiltrados.length > 0 &&
           this.selectedCustomers.length === this.clientesFiltrados.length;
  }

  openPromotionalModal(): void {
    if (this.selectedCustomers.length === 0) {
      this.toastService.warning('Selecciona al menos un cliente para enviar la promoción');
      return;
    }
    this.showPromotionalModal = true;
  }

  closePromotionalModal(): void {
    this.showPromotionalModal = false;
    this.promotionalEmail = {
      subject: '',
      message: ''
    };
  }

  sendPromotionalEmail(): void {
    if (!this.promotionalEmail.subject || !this.promotionalEmail.message) {
      this.toastService.error('Por favor completa el asunto y el mensaje');
      return;
    }

    if (this.selectedCustomers.length === 0) {
      this.toastService.error('No hay clientes seleccionados');
      return;
    }

    this.isSendingPromotion = true;

    this.promotionService.sendPromotionalEmail({
      customerIds: this.selectedCustomers,
      subject: this.promotionalEmail.subject,
      message: this.promotionalEmail.message
    }).subscribe({
      next: (response) => {
        this.isSendingPromotion = false;
        this.toastService.success(`Email enviado a ${response.sentCount} cliente(s)`);
        this.closePromotionalModal();
        this.selectedCustomers = [];
      },
      error: (error) => {
        this.isSendingPromotion = false;
        this.toastService.error(error.error?.message || 'Error al enviar emails promocionales');
        console.error('Error sending promotional email:', error);
      }
    });
  }

  getDaysSinceLastOrderBadge(days?: number): string {
    if (days === undefined || days === null) return '';
    if (days >= 365) return 'danger';
    if (days >= 180) return 'warning';
    if (days >= 90) return 'info';
    if (days >= 30) return 'secondary';
    return 'success';
  }

  formatDaysSinceLastOrder(days?: number): string {
    if (days === undefined || days === null) return 'Sin pedidos';
    if (days === 0) return 'Hoy';
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    }
    const years = Math.floor(days / 365);
    return `Hace ${years} año${years > 1 ? 's' : ''}`;
  }
}
