import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../../services/tenant.service';
import { UserService } from '../../../services/user.service';
import { PagoService } from '../../../services/pago.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { TenantInfo, PlanType } from '../../../models/tenant.model';
import { UserDto, Role } from '../../../models/user.model';
import { CrearFacturaYPreferenciaRequest } from '../../../models/pago.model';

interface PlanFeature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
}

@Component({
  selector: 'app-plan-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-page.component.html',
  styleUrl: './plan-page.component.css'
})
export class PlanPageComponent implements OnInit {
  private tenantService = inject(TenantService);
  private userService = inject(UserService);
  private pagoService = inject(PagoService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  tenantInfo: TenantInfo | null = null;
  currentUser: UserDto | null = null;
  totalUsers: number = 0;
  isLoading = false;
  isProcessingPayment = false;

  // Plan features comparison
  planFeatures: PlanFeature[] = [
    { name: 'Usuarios máximos', free: '4 usuarios', premium: '15 usuarios' },
    { name: 'Gestión de clientes', free: true, premium: true },
    { name: 'Gestión de pedidos', free: true, premium: true },
    { name: 'Gestión de productos', free: true, premium: true },
    { name: 'Repartos básicos', free: true, premium: true },
    { name: 'Emails promocionales', free: true, premium: true },
    { name: 'Optimización de rutas', free: false, premium: true },
    { name: 'Emails de próximo paquete', free: false, premium: true }
  ];

  // Payment periods
  selectedPeriod: 1 | 3 | 6 = 1;
  paymentPeriods: Array<{ months: 1 | 3 | 6; label: string; discount: number; pricePerMonth: number }> = [
    { months: 1, label: '1 mes', discount: 0, pricePerMonth: 1000 },
    { months: 3, label: '3 meses', discount: 0, pricePerMonth: 1000 },
    { months: 6, label: '6 meses', discount: 0, pricePerMonth: 1000 }
  ];

  PlanType = PlanType;
  Role = Role;

  ngOnInit(): void {
    this.loadTenantInfo();
    this.loadCurrentUser();
    this.loadUsers();
  }

  loadTenantInfo(): void {
    this.isLoading = true;
    this.tenantService.getTenantInfo().subscribe({
      next: (info) => {
        this.tenantInfo = info;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tenant info:', error);
        this.toastService.error('Error al cargar información del plan');
        this.isLoading = false;
      }
    });
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Error loading current user:', error);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.totalUsers = users.length;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  get userPercentage(): number {
    if (!this.tenantInfo || this.tenantInfo.maxUsers === 0) return 0;
    return Math.round((this.totalUsers / this.tenantInfo.maxUsers) * 100);
  }

  get userProgressBarClass(): string {
    if (this.userPercentage >= 90) return 'bg-danger';
    if (this.userPercentage >= 70) return 'bg-warning';
    return 'bg-success';
  }

  get canAddMoreUsers(): boolean {
    if (!this.tenantInfo) return false;
    return this.totalUsers < this.tenantInfo.maxUsers;
  }

  get isPremium(): boolean {
    return this.tenantInfo?.planType === PlanType.PREMIUM;
  }

  get isFree(): boolean {
    return this.tenantInfo?.planType === PlanType.FREE;
  }

  get canUpgrade(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.roles.includes(Role.OWNER) || this.currentUser.roles.includes(Role.ADMIN);
  }

  get selectedPeriodInfo() {
    return this.paymentPeriods.find(p => p.months === this.selectedPeriod);
  }

  get totalAmount(): number {
    const period = this.selectedPeriodInfo;
    if (!period) return 0;
    return period.pricePerMonth * period.months;
  }

  upgradeToPremium(): void {
    if (!this.canUpgrade) {
      this.toastService.error('Solo el propietario o administrador puede cambiar el plan');
      return;
    }

    // Verificar que el usuario esté autenticado
    const token = this.authService.getToken();

    if (!token) {
      this.toastService.error('Tu sesión ha expirado. Por favor, cierra sesión e inicia sesión nuevamente.');
      console.error('No hay token en localStorage. Por favor, cierra sesión y vuelve a iniciar sesión.');
      return;
    }

    if (!this.currentUser || !this.tenantInfo) {
      this.toastService.error('Error: Información de usuario o tenant no disponible');
      return;
    }

    // Buscar el tenantId en el token decodificado o usar un método alternativo
    // Por ahora, vamos a obtener el tenantId del primer campo disponible
    const tenantId = this.getTenantId();
    if (!tenantId) {
      this.toastService.error('Error: No se pudo obtener el ID del tenant');
      return;
    }

    const request: CrearFacturaYPreferenciaRequest = {
      requestFactura: {
        tenantId: tenantId,
        clienteId: this.currentUser.id,
        total: this.totalAmount
      },
      requestPago: {
        monto: this.totalAmount,
        emailPagador: this.currentUser.email,
        dniPagador: '', // El usuario deberá ingresar esto en MercadoPago
        meses: this.selectedPeriod
      }
    };

    this.isProcessingPayment = true;

    let pagoObservable;
    if (this.selectedPeriod === 1) {
      pagoObservable = this.pagoService.crearFacturaYPreferencia1Mes(request);
    } else if (this.selectedPeriod === 3) {
      pagoObservable = this.pagoService.crearFacturaYPreferencia3Meses(request);
    } else {
      pagoObservable = this.pagoService.crearFacturaYPreferencia6Meses(request);
    }

    pagoObservable.subscribe({
      next: (response) => {
        this.isProcessingPayment = false;
        if (response.initPoint) {
          this.toastService.success('Redirigiendo a MercadoPago...');
          // Redirigir a MercadoPago
          window.location.href = response.initPoint;
        } else {
          this.toastService.error('Error: No se recibió el link de pago');
        }
      },
      error: (error) => {
        this.isProcessingPayment = false;
        console.error('Error creating payment:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error?.message);

        // Manejo de errores específicos
        if (error.status === 401) {
          this.toastService.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else if (error.status === 403) {
          this.toastService.error('No tienes permisos para realizar esta acción. Solo ADMIN u OWNER pueden actualizar el plan.');
        } else if (error.status === 500) {
          this.toastService.error('Error en el servidor al procesar el pago. Por favor, contacta a soporte.');
        } else if (error.status === 0) {
          this.toastService.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else if (error.error?.message) {
          this.toastService.error(error.error.message);
        } else {
          this.toastService.error('Error al procesar el pago. Por favor, intenta nuevamente.');
        }
      }
    });
  }

  private getTenantId(): string | null {
    // Primero intentar obtener del tenantInfo si está disponible
    if (this.tenantInfo?.id) {
      return this.tenantInfo.id;
    }

    // Si no, intentar obtener del token JWT
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token available');
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      // Buscar el tenantId en diferentes variantes posibles
      return decoded.tenantID || decoded.tenantId || decoded.tenant_id || decoded.tid || null;
    } catch (error) {
      console.error('Error decoding token for tenantId:', error);
      return null;
    }
  }
}
