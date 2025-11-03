// nuevo-pedido-page.component.ts - VERSIÓN CORREGIDA
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidosService } from '../../../services/pedidos.service';
import { RepartidoresService } from '../../../services/repartidores.service';

interface Producto {
  id: number;
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

      <!-- Alerta de éxito -->
      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show mb-3">
        {{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <!-- Alerta de error -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show mb-3">
        {{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <!-- Sección Dirección de Entrega (Azul claro) -->
      <div class="section section-blue">
        <div class="section-header">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <h6>Dirección de Entrega</h6>
        </div>
        <div class="section-body">
          <div class="input-with-icon">
            <svg class="input-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            </svg>
            <input 
              type="text" 
              class="form-control-custom" 
              [(ngModel)]="pedido.direccion"
              placeholder="Ingrese la dirección de entrega..."
            >
          </div>
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
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label-custom">Nombre del Cliente <span class="text-danger">*</span></label>
                <input type="text" class="form-control-custom" [(ngModel)]="pedido.cliente" placeholder="Nombre completo">
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Teléfono</label>
                <input type="tel" class="form-control-custom" [(ngModel)]="pedido.telefono" placeholder="3511234567">
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Email</label>
                <input type="email" class="form-control-custom" [(ngModel)]="pedido.email" placeholder="cliente@email.com">
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Broker Asignado <span class="text-danger">*</span></label>
                <select class="form-control-custom" [(ngModel)]="pedido.broker">
                  <option value="">Seleccione un broker</option>
                  <option *ngFor="let broker of brokersDisponibles" [value]="broker.nombre">
                    {{ broker.nombre }}
                  </option>
                </select>
              </div>
              <div class="col-md-12">
                <label class="form-label-custom">Repartidor Asignado</label>
                <select class="form-control-custom" [(ngModel)]="pedido.repartidorId">
                  <option [value]="null">Sin asignar</option>
                  <option *ngFor="let repartidor of repartidoresDisponibles" [value]="repartidor.id">
                    {{ repartidor.nombre }} {{ repartidor.apellido }} - {{ repartidor.vehiculo | titlecase }}
                    <span *ngIf="!repartidor.disponible">(No disponible)</span>
                  </option>
                </select>
                <small class="text-muted">Solo se muestran repartidores activos</small>
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
            <div class="row g-2">
              <div class="col-md-6">
                <select class="form-control-custom" [(ngModel)]="productoSeleccionado">
                  <option value="">Seleccione un producto</option>
                  <option *ngFor="let prod of productosDisponibles" [value]="prod.nombre">
                    {{ prod.nombre }} - \${{ prod.precio | number:'1.0-0' }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <input 
                  type="number" 
                  class="form-control-custom text-center" 
                  [(ngModel)]="cantidadSeleccionada"
                  placeholder="Cantidad"
                  min="1"
                  [value]="cantidadSeleccionada"
                >
              </div>
              <div class="col-md-3">
                <button class="btn btn-add w-100" (click)="agregarProducto()" [disabled]="!productoSeleccionado">
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
                <tr *ngFor="let prod of productos">
                  <td>{{ prod.nombre }}</td>
                  <td class="text-center">{{ prod.cantidad }}</td>
                  <td class="text-end">\$ {{ prod.precioUnitario | number:'1.2-2' }}</td>
                  <td class="text-end">\$ {{ prod.subtotal | number:'1.2-2' }}</td>
                  <td class="text-end">
                    <button class="btn-delete" (click)="eliminarProducto(prod.id)">
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
        <button class="btn btn-cancel" (click)="volver()">
          Cancelar
        </button>
        <button class="btn btn-save" (click)="guardarPedido()" [disabled]="isLoading || !isFormValid()">
          <span *ngIf="!isLoading">
            <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
            </svg>
            Guardar Pedido
          </span>
          <span *ngIf="isLoading">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Guardando...
          </span>
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
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .input-with-icon .form-control-custom {
      padding-left: 44px;
    }

    .form-control-custom:focus {
      border-color: #4F46E5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      outline: none;
    }

    .section-green .form-control-custom:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .section-pink .form-control-custom:focus {
      border-color: #ec4899;
      box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #9ca3af;
    }

    .empty-state svg {
      opacity: 0.3;
    }

    .form-label-custom {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
      display: block;
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

    .btn-add:hover:not(:disabled) {
      background: #9333EA;
      transform: translateY(-1px);
    }

    .btn-add:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .text-danger {
      color: #ef4444;
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
  pedido = {
    direccion: '',
    cliente: '',
    telefono: '',
    email: '',
    broker: '',
    repartidorId: null as number | null
  };

  productos: Producto[] = [];
  productoSeleccionado: string = '';
  cantidadSeleccionada: number = 1;

  productosDisponibles: any[] = [];
  brokersDisponibles: any[] = [];
  repartidoresDisponibles: any[] = [];

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  precios: any = {};

  constructor(
    private router: Router,
    private pedidosService: PedidosService,
    private repartidoresService: RepartidoresService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarBrokers();
    this.cargarRepartidores();
  }

  cargarProductos(): void {
    this.pedidosService.getProductos().subscribe({
      next: (data) => {
        this.productosDisponibles = data;
        data.forEach((prod: any) => {
          this.precios[prod.nombre] = prod.precio;
        });
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  cargarBrokers(): void {
    this.pedidosService.getBrokers().subscribe({
      next: (data) => {
        this.brokersDisponibles = data;
      },
      error: (error) => {
        console.error('Error al cargar brokers:', error);
      }
    });
  }

  cargarRepartidores(): void {
    this.repartidoresService.getRepartidores({ estado: 'activo' }).subscribe({
      next: (data) => {
        this.repartidoresDisponibles = data;
      },
      error: (error) => {
        console.error('Error al cargar repartidores:', error);
      }
    });
  }

  agregarProducto(): void {
    if (!this.productoSeleccionado || !this.cantidadSeleccionada || this.cantidadSeleccionada < 1) {
      return;
    }

    const precioUnitario = this.precios[this.productoSeleccionado];
    const subtotal = precioUnitario * this.cantidadSeleccionada;

    const nuevoProducto: Producto = {
      id: Date.now(),
      nombre: this.productoSeleccionado,
      cantidad: this.cantidadSeleccionada,
      precioUnitario: precioUnitario,
      subtotal: subtotal
    };

    this.productos.push(nuevoProducto);
    
    this.productoSeleccionado = '';
    this.cantidadSeleccionada = 1;
  }

  eliminarProducto(id: number): void {
    this.productos = this.productos.filter(p => p.id !== id);
  }

  calcularTotal(): number {
    return this.productos.reduce((total, prod) => total + prod.subtotal, 0);
  }

  isFormValid(): boolean {
    return !!(
      this.pedido.direccion &&
      this.pedido.cliente &&
      this.pedido.broker &&
      this.productos.length > 0
    );
  }

  guardarPedido(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Por favor completa todos los campos requeridos: dirección, cliente, broker y al menos un producto';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Buscar el nombre del repartidor si está asignado
    let repartidorNombre = undefined;
    if (this.pedido.repartidorId) {
      const repartidor = this.repartidoresDisponibles.find(r => r.id === this.pedido.repartidorId);
      if (repartidor) {
        repartidorNombre = `${repartidor.nombre} ${repartidor.apellido}`;
      }
    }

    const pedidoRequest = {
      direccion: this.pedido.direccion,
      cliente: this.pedido.cliente,
      telefono: this.pedido.telefono,
      email: this.pedido.email,
      broker: this.pedido.broker,
      repartidorId: this.pedido.repartidorId,
      repartidor: repartidorNombre,
      productos: this.productos.map(p => ({
        nombre: p.nombre,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario,
        subtotal: p.subtotal
      })),
      total: this.calcularTotal()
    };

    this.pedidosService.crearPedido(pedidoRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = '¡Pedido guardado exitosamente!';
        
        setTimeout(() => {
          this.router.navigate(['/dashboard/pedidos']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al guardar el pedido';
        console.error('Error:', error);
      }
    });
  }

  volver(): void {
    if (this.productos.length > 0 || this.pedido.direccion || this.pedido.cliente) {
      if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        this.router.navigate(['/dashboard/pedidos']);
      }
    } else {
      this.router.navigate(['/dashboard/pedidos']);
    }
  }
}