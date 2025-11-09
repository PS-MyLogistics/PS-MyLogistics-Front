import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { UserDto } from '../../../models/user.model';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header con botón -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 class="mb-1">Gestión de Usuarios</h5>
          <p class="text-muted mb-0">Administra los usuarios del sistema</p>
        </div>
        <button class="btn btn-primary">
          <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Buscador -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-8">
              <div class="search-box">
                <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input type="text" class="form-control ps-5" placeholder="Buscar usuarios...">
              </div>
            </div>
            <div class="col-md-4">
              <select class="form-select">
                <option>Todos los roles</option>
                <option>Administrador</option>
                <option>Usuario</option>
                <option>Operador</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Usuarios -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Pedidos</th>
                  <th>Último Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let usuario of usuarios">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="user-avatar-small">
                        {{ usuario.iniciales }}
                      </div>
                      <strong>{{ usuario.nombre }}</strong>
                    </div>
                  </td>
                  <td>{{ usuario.email }}</td>
                  <td>
                    <span [class]="'badge bg-' + usuario.rolColor">
                      {{ usuario.rol }}
                    </span>
                  </td>
                  <td>
                    <span [class]="'badge bg-' + usuario.estadoColor">
                      {{ usuario.estado }}
                    </span>
                  </td>
                  <td>{{ usuario.pedidos }}</td>
                  <td>{{ usuario.ultimoAcceso }}</td>
                  <td>
                    <div class="btn-group" role="group">
                      <button class="btn btn-sm btn-icon" title="Editar">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button class="btn btn-sm btn-icon" title="Ver detalles">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      <button class="btn btn-sm btn-icon text-danger" title="Eliminar">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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

    .btn-primary {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    .search-box {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: #9ca3af;
    }

    .form-control, .form-select {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 10px 12px;
    }

    .user-avatar-small {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 12px;
      flex-shrink: 0;
    }

    .table {
      margin: 0;
    }

    .table thead th {
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
      color: #6b7280;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      padding: 16px;
    }

    .table tbody td {
      padding: 16px;
      vertical-align: middle;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
    }

    .table tbody tr:hover {
      background: #f9fafb;
    }

    .badge {
      font-size: 11px;
      padding: 4px 10px;
      font-weight: 600;
      border-radius: 6px;
    }

    .btn-icon {
      background: none;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 6px 10px;
      color: #6b7280;
    }

    .btn-icon:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .btn-icon.text-danger:hover {
      background: #fef2f2;
      border-color: #fecaca;
      color: #ef4444;
    }

    .btn-group {
      display: flex;
      gap: 4px;
    }
  `]
})
export class UsuariosPageComponent implements OnInit {
  private userService = inject(UserService);

  usuarios: any[] = [];
  usuariosOriginales: UserDto[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getAll().subscribe({
      next: (users) => {
        this.usuariosOriginales = users;
        this.usuarios = users.map(user => ({
          id: user.id,
          nombre: user.username,
          email: user.email,
          rol: this.getRolDisplay(user.roles),
          rolColor: this.getRolColor(user.roles),
          estado: this.getEstadoDisplay(user.status),
          estadoColor: this.getEstadoColor(user.status),
          pedidos: 0, // TODO: Add pedidos count from backend
          ultimoAcceso: 'N/A', // TODO: Add lastAccess from backend
          iniciales: this.getInitials(user.username),
          telephone: user.telephone
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cargar usuarios';
        this.isLoading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  getInitials(username: string): string {
    const parts = username.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  }

  getRolDisplay(roles: string[]): string {
    if (roles.includes('OWNER') || roles.includes('SUPERADMIN')) return 'Administrador';
    if (roles.includes('ADMIN')) return 'Admin';
    if (roles.includes('DEALER')) return 'Operador';
    return 'Usuario';
  }

  getRolColor(roles: string[]): string {
    if (roles.includes('OWNER') || roles.includes('SUPERADMIN')) return 'danger';
    if (roles.includes('ADMIN')) return 'warning';
    if (roles.includes('DEALER')) return 'primary';
    return 'secondary';
  }

  getEstadoDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Activo',
      'PENDING_VERIFICATION': 'Pendiente',
      'SUSPENDED': 'Suspendido',
      'DELETED': 'Eliminado',
      'FREEZED': 'Congelado'
    };
    return statusMap[status] || status;
  }

  getEstadoColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'ACTIVE': 'success',
      'PENDING_VERIFICATION': 'warning',
      'SUSPENDED': 'danger',
      'DELETED': 'dark',
      'FREEZED': 'info'
    };
    return colorMap[status] || 'secondary';
  }
}