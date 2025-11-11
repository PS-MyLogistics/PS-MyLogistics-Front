import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { Customer, CustomerCreationRequest } from '../../../models/customer.model';
import { Role } from '../../../models/user.model';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-page.component.html',
  styleUrl: './clientes-page.component.css'
})
export class ClientesPageComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  clientesOriginales: Customer[] = [];
  isLoading = false;
  errorMessage = '';
  isDealer = false;

  // Filtros
  searchTerm: string = '';
  filtroEstado: string = '';

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

  newCustomer: CustomerCreationRequest = this.getEmptyCustomer();

  ngOnInit(): void {
    this.isDealer = this.authService.hasRole(Role.DEALER);
    this.loadCustomers();
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

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getAll().subscribe({
      next: (customers) => {
        this.clientesOriginales = customers;
        this.clientes = customers.map(customer => ({
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
          createdAt: customer.createdAt
        }));
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

      return matchesSearch && matchesStatus;
    });
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.applyFilters();
  }

  // Modal methods
  openCreateCustomerModal(): void {
    this.showCreateModal = true;
    this.resetForm();
  }

  closeCreateCustomerModal(): void {
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
        this.closeCreateCustomerModal();
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
      isActive: originalCustomer.isActive
    };
  }

  closeEditCustomerModal(): void {
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
        this.closeEditCustomerModal();
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
        this.closeDeleteModal();
      },
      error: (error) => {
        this.isDeleting = false;
        this.toastService.error(error.message || 'Error al eliminar el cliente');
        console.error('Error deleting customer:', error);
      }
    });
  }
}
