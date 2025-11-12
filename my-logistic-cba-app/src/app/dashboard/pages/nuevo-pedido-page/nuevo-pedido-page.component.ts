import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { CustomerService } from '../../../services/customer.service';
import { ZoneService } from '../../../services/zone.service';
import { ToastService } from '../../../services/toast.service';
import { OrderCreationRequest, OrderItemRequest } from '../../../models/order.model';
import { CustomerCreationRequest, Customer } from '../../../models/customer.model';
import { ProductResponse } from '../../../models/product.model';
import { ZoneResponse } from '../../../models/zone.model';

interface ProductoEnPedido {
  productId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Component({
  selector: 'app-nuevo-pedido-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header Azul -->
      <div class="header-blue">
        <button class="btn-back" (click)="volver()">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </button>
        <div>
          <h4 class="mb-1">
            <svg class="me-2" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            Nuevo Pedido
          </h4>
          <p class="mb-0">Completa la información del pedido</p>
        </div>
      </div>


      <!-- Sección Información del Cliente (Verde claro) -->
      <div class="section section-green">
        <div class="section-header">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <h6>Información del Cliente</h6>
        </div>
        <div class="section-body">
          <div class="client-info">
            <!-- Toggle para seleccionar modo -->
            <div class="customer-mode-toggle mb-3">
              <button
                type="button"
                class="toggle-btn"
                [class.active]="!useExistingCustomer"
                (click)="toggleCustomerMode(false)"
              >
                Nuevo Cliente
              </button>
              <button
                type="button"
                class="toggle-btn"
                [class.active]="useExistingCustomer"
                (click)="toggleCustomerMode(true)"
              >
                Cliente Existente
              </button>
            </div>

            <!-- Selector de cliente existente -->
            <div *ngIf="useExistingCustomer" class="mb-3">
              <label class="form-label-custom">Seleccionar Cliente *</label>
              <select class="form-control-custom" [(ngModel)]="selectedCustomerId" (ngModelChange)="onCustomerSelect()">
                <option value="">-- Selecciona un cliente --</option>
                <option *ngFor="let customer of customersDisponibles" [value]="customer.id">
                  {{ customer.name }} - {{ customer.email }}
                  <span *ngIf="customer.zoneName"> - {{ customer.zoneName }}</span>
                </option>
              </select>
            </div>

            <div class="row g-3" *ngIf="!useExistingCustomer || selectedCustomerId">
              <div class="col-md-6">
                <label class="form-label-custom">Nombre del Cliente *</label>
                <input type="text" class="form-control-custom" [(ngModel)]="cliente.name" placeholder="Nombre completo" required [disabled]="useExistingCustomer">
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Email *</label>
                <input type="email" class="form-control-custom" [(ngModel)]="cliente.email" placeholder="cliente@email.com" required [disabled]="useExistingCustomer">
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Teléfono *</label>
                <input type="tel" class="form-control-custom" [(ngModel)]="cliente.phoneNumber" placeholder="3511234567" required [disabled]="useExistingCustomer">
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Dirección *</label>
                <input type="text" class="form-control-custom" [(ngModel)]="cliente.address" placeholder="Calle y número" required [disabled]="useExistingCustomer">
              </div>
              <div class="col-md-4">
                <label class="form-label-custom">Código Postal *</label>
                <input type="text" class="form-control-custom" [(ngModel)]="cliente.postalCode" placeholder="5000" required [disabled]="useExistingCustomer">
              </div>
              <div class="col-md-4">
                <label class="form-label-custom">Ciudad *</label>
                <input type="text" class="form-control-custom" [(ngModel)]="cliente.city" placeholder="Córdoba" required [disabled]="useExistingCustomer">
              </div>
              <div class="col-md-4">
                <label class="form-label-custom">Provincia *</label>
                <input type="text" class="form-control-custom" [(ngModel)]="cliente.state" placeholder="Córdoba" required [disabled]="useExistingCustomer">
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">País *</label>
                <input type="text" class="form-control-custom" [(ngModel)]="cliente.country" placeholder="Argentina" required [disabled]="useExistingCustomer">
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Timbre</label>
                <input type="text" class="form-control-custom" [(ngModel)]="cliente.doorbell" placeholder="Ej: A, 1B, etc." [disabled]="useExistingCustomer">
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Zona</label>
                <select class="form-control-custom" [(ngModel)]="cliente.zoneId" [disabled]="useExistingCustomer">
                  <option value="">Sin zona asignada</option>
                  <option *ngFor="let zone of zones" [value]="zone.id">
                    {{ zone.name }}
                  </option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label-custom">Notas Adicionales</label>
                <textarea class="form-control-custom" [(ngModel)]="cliente.notes" placeholder="Información adicional sobre el cliente..." rows="3" [disabled]="useExistingCustomer"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección Productos del Pedido (Rosa claro) -->
      <div class="section section-pink">
        <div class="section-header">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <h6>Productos del Pedido</h6>
        </div>
        <div class="section-body">
          <!-- Selector de productos -->
          <div class="product-selector mb-3">
            <div class="row g-2 align-items-end">
              <div class="col-md-4">
                <label class="form-label-custom">Producto</label>
                <select class="form-control-custom" [(ngModel)]="productoSeleccionadoId" (ngModelChange)="onProductoSelect()" [disabled]="isLoadingProducts">
                  <option value="">Seleccione un producto</option>
                  <option *ngFor="let prod of productosDisponibles" [value]="prod.id">{{ prod.name }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label-custom">Cantidad</label>
                <input
                  type="number"
                  class="form-control-custom text-center"
                  [(ngModel)]="cantidadSeleccionada"
                  placeholder="Cantidad"
                  min="1"
                  value="1"
                >
              </div>
              <div class="col-md-3">
                <label class="form-label-custom">Precio Unitario</label>
                <input
                  type="number"
                  class="form-control-custom text-end"
                  [(ngModel)]="precioUnitarioSeleccionado"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                >
              </div>
              <div class="col-md-2">
                <button class="btn btn-add w-100" (click)="agregarProducto()">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <!-- Tabla de productos -->
          <div class="products-table" *ngIf="productos.length > 0">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-center">Cant.</th>
                  <th class="text-end">Precio Unit.</th>
                  <th class="text-end">Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let prod of productos; let i = index">
                  <td>{{ prod.nombre }}</td>
                  <td class="text-center">{{ prod.cantidad }}</td>
                  <td class="text-end">\$ {{ prod.precioUnitario | number:'1.2-2' }}</td>
                  <td class="text-end">\$ {{ prod.subtotal | number:'1.2-2' }}</td>
                  <td class="text-end">
                    <button class="btn-delete" (click)="eliminarProducto(i)">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="total-section">
              <span class="total-label">TOTAL:</span>
              <span class="total-amount">\$ {{ calcularTotal() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="empty-state" *ngIf="productos.length === 0">
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <p class="mt-3">No hay productos agregados</p>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="action-buttons">
        <button class="btn btn-cancel" (click)="volver()" [disabled]="isCreatingOrder">
          Cancelar
        </button>
        <button class="btn btn-save" (click)="guardarPedido()" [disabled]="!isFormValid() || isCreatingOrder">
          <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
          <span *ngIf="!isCreatingOrder">Guardar Pedido</span>
          <span *ngIf="isCreatingOrder">Guardando...</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header-blue {
      background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .header-blue h4 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
    }

    .header-blue p {
      font-size: 14px;
      opacity: 0.9;
    }

    .btn-back {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-back:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .section {
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .section-blue {
      background: #EFF6FF;
      border: 2px solid #DBEAFE;
    }

    .section-green {
      background: #F0FDF4;
      border: 2px solid #DCFCE7;
    }

    .section-pink {
      background: #FDF2F8;
      border: 2px solid #FCE7F3;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .section-header h6 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
    }

    .section-header svg {
      color: #6b7280;
    }

    .section-body {
      background: white;
      border-radius: 12px;
      padding: 20px;
    }

    .input-with-icon {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .form-control-custom {
      width: 100%;
      padding: 12px 14px;
      padding-left: 44px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .input-with-icon .form-control-custom:focus {
      border-color: #4F46E5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      outline: none;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #9ca3af;
    }

    .empty-state svg {
      opacity: 0.3;
    }

    .client-info .form-control-custom,
    .client-info textarea.form-control-custom {
      padding-left: 14px;
    }

    .form-label-custom {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
      display: block;
    }

    .client-info .form-control-custom:focus,
    .client-info textarea.form-control-custom:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      outline: none;
    }

    .client-info .form-control-custom:disabled,
    .client-info textarea.form-control-custom:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .customer-mode-toggle {
      display: flex;
      gap: 8px;
      background: #f3f4f6;
      padding: 4px;
      border-radius: 10px;
      width: fit-content;
    }

    .toggle-btn {
      padding: 10px 20px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-btn:hover {
      color: #374151;
    }

    .toggle-btn.active {
      background: white;
      color: #10b981;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    textarea.form-control-custom {
      resize: vertical;
      font-family: inherit;
    }

    .product-selector .form-control-custom {
      padding-left: 14px;
    }

    .product-selector .form-control-custom:focus {
      border-color: #ec4899;
      box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
      outline: none;
    }

    .btn-add {
      background: #A855F7;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-add:hover {
      background: #9333EA;
      transform: translateY(-1px);
    }

    .products-table {
      margin-top: 20px;
    }

    .table-custom {
      width: 100%;
      border-collapse: collapse;
    }

    .table-custom thead th {
      background: #F9FAFB;
      padding: 12px;
      font-size: 12px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      border-bottom: 2px solid #F3F4F6;
    }

    .table-custom tbody td {
      padding: 14px 12px;
      border-bottom: 1px solid #F3F4F6;
      font-size: 14px;
    }

    .btn-delete {
      background: none;
      border: none;
      color: #EF4444;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .btn-delete:hover {
      background: #FEF2F2;
    }

    .total-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #F9FAFB;
      border-radius: 10px;
      margin-top: 16px;
    }

    .total-label {
      font-size: 14px;
      font-weight: 700;
      color: #6b7280;
    }

    .total-amount {
      font-size: 24px;
      font-weight: 700;
      color: #A855F7;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-cancel {
      flex: 1;
      padding: 14px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #F9FAFB;
      border-color: #d1d5db;
    }

    .btn-save {
      flex: 2;
      padding: 14px;
      background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .header-blue {
        flex-direction: column;
        text-align: center;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-save {
        flex: 1;
      }
    }
  `]
})
export class NuevoPedidoPageComponent implements OnInit {
  private router = inject(Router);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);
  private zoneService = inject(ZoneService);
  private toastService = inject(ToastService);

  // Customer selection mode
  useExistingCustomer: boolean = false;
  selectedCustomerId: string = '';
  customersDisponibles: Customer[] = [];
  zones: ZoneResponse[] = [];

  // Customer information
  cliente: CustomerCreationRequest = {
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    postalCode: '',
    city: '',
    state: '',
    country: '',
    doorbell: '',
    notes: ''
  };

  // Products
  productos: ProductoEnPedido[] = [];
  productosDisponibles: ProductResponse[] = [];
  productoSeleccionadoId: string = '';
  cantidadSeleccionada: number = 1;
  precioUnitarioSeleccionado: number = 0;

  // Loading states
  isLoadingProducts = false;
  isLoadingCustomers = false;
  isCreatingOrder = false;

  ngOnInit(): void {
    this.loadZones();
    this.loadProducts();
    this.loadCustomers();
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

  loadCustomers(): void {
    this.isLoadingCustomers = true;
    this.customerService.getAll().subscribe({
      next: (customers) => {
        this.customersDisponibles = customers.filter(c => c.isActive);
        this.isLoadingCustomers = false;
      },
      error: (error) => {
        this.toastService.error(error.message || 'Error al cargar clientes');
        this.isLoadingCustomers = false;
      }
    });
  }

  toggleCustomerMode(useExisting: boolean): void {
    this.useExistingCustomer = useExisting;
    if (!useExisting) {
      // Reset to new customer mode
      this.selectedCustomerId = '';
      this.cliente = {
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        postalCode: '',
        city: '',
        state: '',
        country: '',
        doorbell: '',
        notes: ''
      };
    }
  }

  onCustomerSelect(): void {
    if (this.selectedCustomerId) {
      const selectedCustomer = this.customersDisponibles.find(c => c.id === this.selectedCustomerId);
      if (selectedCustomer) {
        this.cliente = {
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          phoneNumber: selectedCustomer.phoneNumber,
          address: selectedCustomer.address,
          postalCode: selectedCustomer.postalCode,
          city: selectedCustomer.city,
          state: selectedCustomer.state,
          country: selectedCustomer.country,
          doorbell: selectedCustomer.doorbell,
          notes: selectedCustomer.notes || '',
          zoneId: selectedCustomer.zoneId
        };
      }
    }
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.productosDisponibles = products;
        this.isLoadingProducts = false;
      },
      error: (error) => {
        this.toastService.error(error.message || 'Error al cargar productos');
        this.isLoadingProducts = false;
      }
    });
  }

  onProductoSelect(): void {
    if (this.productoSeleccionadoId) {
      const productoSeleccionado = this.productosDisponibles.find(p => p.id === this.productoSeleccionadoId);
      if (productoSeleccionado && productoSeleccionado.price) {
        this.precioUnitarioSeleccionado = productoSeleccionado.price;
      }
    } else {
      this.precioUnitarioSeleccionado = 0;
    }
  }

  agregarProducto(): void {
    if (!this.productoSeleccionadoId || !this.cantidadSeleccionada || this.cantidadSeleccionada < 1) {
      this.toastService.warning('Seleccione un producto y una cantidad válida');
      return;
    }

    if (!this.precioUnitarioSeleccionado || this.precioUnitarioSeleccionado <= 0) {
      this.toastService.warning('Ingrese un precio unitario válido mayor a 0');
      return;
    }

    const productoEncontrado = this.productosDisponibles.find(p => p.id === this.productoSeleccionadoId);
    if (!productoEncontrado) {
      this.toastService.error('Producto no encontrado');
      return;
    }

    const subtotal = this.precioUnitarioSeleccionado * this.cantidadSeleccionada;

    const nuevoProducto: ProductoEnPedido = {
      productId: this.productoSeleccionadoId,
      nombre: productoEncontrado.name,
      cantidad: this.cantidadSeleccionada,
      precioUnitario: this.precioUnitarioSeleccionado,
      subtotal: subtotal
    };

    this.productos.push(nuevoProducto);
    this.toastService.success(`Producto "${productoEncontrado.name}" agregado`);

    // Limpiar selección
    this.productoSeleccionadoId = '';
    this.cantidadSeleccionada = 1;
    this.precioUnitarioSeleccionado = 0;
  }

  eliminarProducto(index: number): void {
    const producto = this.productos[index];
    this.productos.splice(index, 1);
    this.toastService.info(`Producto "${producto.nombre}" eliminado`);
  }

  calcularTotal(): number {
    return this.productos.reduce((total, prod) => total + prod.subtotal, 0);
  }

  isFormValid(): boolean {
    // Validate customer information
    const customerValid = !!(
      this.cliente.name &&
      this.cliente.email &&
      this.cliente.phoneNumber &&
      this.cliente.address &&
      this.cliente.postalCode &&
      this.cliente.city &&
      this.cliente.state &&
      this.cliente.country &&
      this.cliente.doorbell
    );

    // Validate at least one product
    const productsValid = this.productos.length > 0;

    return customerValid && productsValid;
  }

  guardarPedido(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Por favor complete todos los campos requeridos');
      return;
    }

    this.isCreatingOrder = true;

    // Build order items
    const items: OrderItemRequest[] = this.productos.map(p => ({
      productId: p.productId,
      quantity: p.cantidad,
      unitPrice: p.precioUnitario
    }));

    // Build order request
    const orderRequest: OrderCreationRequest = this.useExistingCustomer && this.selectedCustomerId
      ? {
          items: items,
          customerId: this.selectedCustomerId
        }
      : {
          items: items,
          customerCreationRequest: this.cliente
        };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.isCreatingOrder = false;
        this.toastService.success(
          `Pedido #${response.orderNumber} creado exitosamente`
        );

        // Navigate to pedidos page after a short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard/pedidos']);
        }, 1500);
      },
      error: (error) => {
        this.isCreatingOrder = false;
        this.toastService.error(
          error.message || 'Error al crear el pedido. Por favor intente nuevamente.'
        );
        console.error('Error creating order:', error);
      }
    });
  }

  volver(): void {
    const hasChanges = this.productos.length > 0 ||
                       this.cliente.name ||
                       this.cliente.email;

    if (hasChanges) {
      if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/dashboard/pedidos']);
      }
    } else {
      this.router.navigate(['/dashboard/pedidos']);
    }
  }
}