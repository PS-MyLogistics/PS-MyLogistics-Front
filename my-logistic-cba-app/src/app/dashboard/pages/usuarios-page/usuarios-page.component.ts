import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { UserDto, RegisterUserInTenantRequest, EditUserInTenantRequest, Role } from '../../../models/user.model';

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
        <button class="btn btn-primary" (click)="openCreateUserModal()">
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
                    <button
                      class="btn btn-sm btn-icon text-primary me-2"
                      title="Editar usuario"
                      (click)="openEditUserModal(usuario)"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      class="btn btn-sm btn-icon text-danger"
                      title="Eliminar usuario"
                      (click)="openDeleteModal(usuario)"
                      [disabled]="usuario.owner"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Crear Usuario -->
      <div class="modal fade" [class.show]="showCreateModal" [style.display]="showCreateModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showCreateModal" (click)="closeCreateUserModal()"></div>
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Crear Nuevo Usuario</h5>
              <button type="button" class="btn-close" (click)="closeCreateUserModal()"></button>
            </div>
            <div class="modal-body">
              <!-- Alertas -->
              <div *ngIf="createError" class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Error:</strong> {{ createError }}
                <button type="button" class="btn-close" (click)="createError = ''" aria-label="Close"></button>
              </div>

              <div *ngIf="createSuccess" class="alert alert-success alert-dismissible fade show" role="alert">
                {{ createSuccess }}
                <button type="button" class="btn-close" (click)="createSuccess = ''" aria-label="Close"></button>
              </div>

              <!-- Formulario -->
              <form (ngSubmit)="createUser()" #createForm="ngForm">
                <div class="mb-3">
                  <label for="username" class="form-label">Nombre de Usuario *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    [(ngModel)]="newUser.username"
                    name="username"
                    required
                    placeholder="Ej: juan_perez"
                  />
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    [(ngModel)]="newUser.email"
                    name="email"
                    required
                    placeholder="usuario@example.com"
                  />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Contraseña *</label>
                  <div class="password-input-container">
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      [(ngModel)]="newUser.password"
                      name="password"
                      required
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      class="password-toggle-btn"
                      (click)="showPassword = !showPassword"
                    >
                      <svg *ngIf="!showPassword" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <svg *ngIf="showPassword" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      </svg>
                    </button>
                  </div>
                  <small class="form-text text-muted">
                    Mínimo 8 caracteres con mayúscula, minúscula y carácter especial
                  </small>
                  <div class="password-requirements mt-2">
                    <div class="requirement" [class.met]="hasMinLength()">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      Mínimo 8 caracteres
                    </div>
                    <div class="requirement" [class.met]="hasUpperCase()">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      Una mayúscula
                    </div>
                    <div class="requirement" [class.met]="hasLowerCase()">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      Una minúscula
                    </div>
                    <div class="requirement" [class.met]="hasSpecialChar()">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      Un carácter especial
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="telephone" class="form-label">Teléfono *</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="telephone"
                    [(ngModel)]="newUser.telephone"
                    name="telephone"
                    required
                    pattern="[0-9]+"
                    placeholder="Ej: 3512345678"
                  />
                  <small class="form-text text-muted">Solo números</small>
                </div>

                <div class="mb-3">
                  <label for="role" class="form-label">Rol *</label>
                  <select
                    class="form-select"
                    id="role"
                    [(ngModel)]="selectedRole"
                    name="role"
                    required
                  >
                    <option value="">Selecciona un rol</option>
                    <option value="DEALER">Operador (Dealer)</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="city" class="form-label">Ciudad</label>
                    <input
                      type="text"
                      class="form-control"
                      id="city"
                      [(ngModel)]="newUser.city"
                      name="city"
                      placeholder="Ej: Córdoba"
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="stateOrProvince" class="form-label">Provincia</label>
                    <input
                      type="text"
                      class="form-control"
                      id="stateOrProvince"
                      [(ngModel)]="newUser.stateOrProvince"
                      name="stateOrProvince"
                      placeholder="Ej: Córdoba"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label for="address" class="form-label">Dirección</label>
                  <input
                    type="text"
                    class="form-control"
                    id="address"
                    [(ngModel)]="newUser.address"
                    name="address"
                    placeholder="Ej: Av. Colón 1234"
                  />
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeCreateUserModal()" [disabled]="isCreating">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" (click)="createUser()" [disabled]="isCreating || !isFormValid()">
                <span *ngIf="!isCreating">Crear Usuario</span>
                <span *ngIf="isCreating">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creando...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Eliminar Usuario -->
      <div class="modal fade" [class.show]="showDeleteModal" [style.display]="showDeleteModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showDeleteModal" (click)="closeDeleteModal()"></div>
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-bottom-0">
              <h5 class="modal-title text-danger">
                <svg class="me-2" width="24" height="24" fill="currentColor" viewBox="0 0 20 20" style="display: inline-block; vertical-align: middle;">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                Confirmar Eliminación
              </h5>
              <button type="button" class="btn-close" (click)="closeDeleteModal()"></button>
            </div>
            <div class="modal-body">
              <p class="mb-3">¿Estás seguro de que deseas eliminar al usuario <strong>{{ userToDelete?.nombre }}</strong>?</p>
              <div class="alert alert-warning d-flex align-items-start">
                <svg class="me-2 flex-shrink-0" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <strong>Advertencia:</strong> Esta acción no se puede deshacer.
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeDeleteModal()" [disabled]="isDeleting">
                Cancelar
              </button>
              <button type="button" class="btn btn-danger" (click)="confirmDelete()" [disabled]="isDeleting">
                <span *ngIf="!isDeleting">Eliminar</span>
                <span *ngIf="isDeleting">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Eliminando...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Editar Usuario -->
      <div class="modal fade" [class.show]="showEditModal" [style.display]="showEditModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-backdrop fade" [class.show]="showEditModal" (click)="closeEditUserModal()"></div>
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <svg class="me-2" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Editar Usuario
              </h5>
              <button type="button" class="btn-close" (click)="closeEditUserModal()"></button>
            </div>
            <div class="modal-body">
              <!-- Formulario de Edición -->
              <form (ngSubmit)="saveEditUser()" #editForm="ngForm">
                <div class="mb-3">
                  <label for="editUsername" class="form-label">Nombre de Usuario *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="editUsername"
                    [(ngModel)]="editUser.username"
                    name="username"
                    required
                    placeholder="Ej: juan_perez"
                  />
                </div>

                <div class="mb-3">
                  <label for="editTelephone" class="form-label">Teléfono</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="editTelephone"
                    [(ngModel)]="editUser.telephone"
                    name="telephone"
                    pattern="[0-9]*"
                    placeholder="Ej: 3512345678"
                  />
                  <small class="form-text text-muted">Solo números</small>
                </div>

                <div class="mb-3">
                  <label for="editRole" class="form-label">Rol *</label>
                  <select
                    class="form-select"
                    id="editRole"
                    [(ngModel)]="selectedRole"
                    name="role"
                    required
                  >
                    <option value="">Selecciona un rol</option>
                    <option value="DEALER">Operador (Dealer)</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="editCity" class="form-label">Ciudad</label>
                    <input
                      type="text"
                      class="form-control"
                      id="editCity"
                      [(ngModel)]="editUser.city"
                      name="city"
                      placeholder="Ej: Córdoba"
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="editStateOrProvince" class="form-label">Provincia</label>
                    <input
                      type="text"
                      class="form-control"
                      id="editStateOrProvince"
                      [(ngModel)]="editUser.stateOrProvince"
                      name="stateOrProvince"
                      placeholder="Ej: Córdoba"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label for="editAddress" class="form-label">Dirección</label>
                  <input
                    type="text"
                    class="form-control"
                    id="editAddress"
                    [(ngModel)]="editUser.address"
                    name="address"
                    placeholder="Ej: Av. Colón 1234"
                  />
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeEditUserModal()" [disabled]="isCreating">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" (click)="saveEditUser()" [disabled]="isCreating || !editUser.username">
                <span *ngIf="!isCreating">Guardar Cambios</span>
                <span *ngIf="isCreating">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </span>
              </button>
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

    .btn-icon.text-primary:hover {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #2563eb;
    }

    .btn-group {
      display: flex;
      gap: 4px;
    }

    /* Modal styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1055;
      width: 100%;
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      outline: 0;
    }

    .modal.show {
      display: block !important;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1050;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .modal-dialog {
      position: relative;
      width: auto;
      margin: 1.75rem auto;
      max-width: 600px;
      z-index: 1056;
    }

    .modal-dialog.modal-lg {
      max-width: 800px;
    }

    .modal-content {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid rgba(0,0,0,.2);
      border-radius: 12px;
      outline: 0;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-title {
      margin: 0;
      font-weight: 600;
      font-size: 1.25rem;
    }

    .modal-body {
      position: relative;
      flex: 1 1 auto;
      padding: 1.5rem;
      max-height: calc(100vh - 300px);
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      gap: 0.5rem;
    }

    .password-input-container {
      position: relative;
    }

    .password-toggle-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 5px;
      display: flex;
      align-items: center;
    }

    .password-toggle-btn:hover {
      color: #4f46e5;
    }

    .password-requirements {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
    }

    .requirement {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #9ca3af;
    }

    .requirement svg {
      flex-shrink: 0;
    }

    .requirement.met {
      color: #10b981;
    }

    .btn-secondary {
      background: #e5e7eb;
      border: none;
      color: #374151;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #d1d5db;
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      color: #6b7280;
      cursor: pointer;
      padding: 0;
      width: 1em;
      height: 1em;
    }

    .btn-close:hover {
      color: #000;
    }

    .btn-close::before {
      content: "×";
      display: block;
    }

    .btn-danger {
      background: #ef4444;
      border: none;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }

    .btn-danger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-icon:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .border-bottom-0 {
      border-bottom: none !important;
    }
  `]
})
export class UsuariosPageComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  usuarios: any[] = [];
  usuariosOriginales: UserDto[] = [];
  isLoading = false;
  errorMessage = '';

  // Modal create user
  showCreateModal = false;
  isCreating = false;
  createError = '';
  createSuccess = '';
  showPassword = false;
  selectedRole: string = '';

  // Modal edit user
  showEditModal = false;
  isEditMode = false;
  editingUserId: string | null = null;
  editUser: Partial<EditUserInTenantRequest> = {};

  // Modal delete user
  showDeleteModal = false;
  isDeleting = false;
  userToDelete: any = null;

  newUser: Partial<RegisterUserInTenantRequest> = {
    username: '',
    email: '',
    password: '',
    telephone: '',
    address: '',
    city: '',
    stateOrProvince: '',
    roles: []
  };

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
          telephone: user.telephone,
          owner: user.owner
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

  // Modal methods
  openCreateUserModal(): void {
    this.showCreateModal = true;
    this.resetForm();
  }

  closeCreateUserModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newUser = {
      username: '',
      email: '',
      password: '',
      telephone: '',
      address: '',
      city: '',
      stateOrProvince: '',
      roles: []
    };
    this.selectedRole = '';
    this.createError = '';
    this.createSuccess = '';
    this.showPassword = false;
  }

  // Password validation methods
  hasMinLength(): boolean {
    return (this.newUser.password?.length || 0) >= 8;
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.newUser.password || '');
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.newUser.password || '');
  }

  hasSpecialChar(): boolean {
    return /[!@#$%^_&*(),.?":{}|<>]/.test(this.newUser.password || '');
  }

  isPasswordValid(): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^_&*(),.?":{}|<>]).{8,}$/;
    return passwordRegex.test(this.newUser.password || '');
  }

  isTelephoneValid(): boolean {
    const phoneRegex = /^[0-9]+$/;
    return phoneRegex.test(this.newUser.telephone || '');
  }

  isFormValid(): boolean {
    return !!(
      this.newUser.username &&
      this.newUser.email &&
      this.newUser.password &&
      this.newUser.telephone &&
      this.selectedRole &&
      this.isPasswordValid() &&
      this.isTelephoneValid()
    );
  }

  createUser(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Por favor completa todos los campos requeridos correctamente');
      return;
    }

    this.isCreating = true;
    this.createError = '';
    this.createSuccess = '';

    // Preparar el request con el rol seleccionado
    const request: RegisterUserInTenantRequest = {
      username: this.newUser.username!,
      email: this.newUser.email!,
      password: this.newUser.password!,
      telephone: this.newUser.telephone!,
      roles: [this.selectedRole as Role],
      address: this.newUser.address,
      city: this.newUser.city,
      stateOrProvince: this.newUser.stateOrProvince
    };

    console.log('Creating user with request:', request);

    this.userService.createInternalUser(request).subscribe({
      next: (user) => {
        this.isCreating = false;

        // Mostrar toast de éxito
        this.toastService.success(
          `Usuario ${user.username} creado exitosamente. Se envió un email de verificación a ${user.email}`,
          6000
        );

        // Recargar la lista de usuarios
        this.loadUsers();

        // Cerrar el modal
        this.closeCreateUserModal();
      },
      error: (error) => {
        this.isCreating = false;

        // Mostrar toast de error
        this.toastService.error(error.message || 'Error al crear el usuario', 5000);

        console.error('Error creating user:', error);
      }
    });
  }

  // Edit user methods
  openEditUserModal(usuario: any): void {
    const originalUser = this.usuariosOriginales.find(u => u.id === usuario.id);
    if (!originalUser) return;

    this.isEditMode = true;
    this.showEditModal = true;
    this.editingUserId = originalUser.id;
    this.editUser = {
      userId: originalUser.id,
      username: originalUser.username,
      telephone: originalUser.telephone || '',
      address: originalUser.address || '',
      city: originalUser.city || '',
      stateOrProvince: originalUser.stateOrProvince || '',
      roles: originalUser.roles
    };
    this.selectedRole = originalUser.roles[0] || '';
  }

  closeEditUserModal(): void {
    this.showEditModal = false;
    this.isEditMode = false;
    this.editingUserId = null;
    this.editUser = {};
    this.selectedRole = '';
  }

  saveEditUser(): void {
    if (!this.editingUserId || !this.editUser.username) {
      this.toastService.warning('Por favor completa los campos requeridos');
      return;
    }

    this.isCreating = true;

    const request: EditUserInTenantRequest = {
      userId: this.editingUserId,
      username: this.editUser.username!,
      telephone: this.editUser.telephone,
      address: this.editUser.address,
      city: this.editUser.city,
      stateOrProvince: this.editUser.stateOrProvince,
      roles: [this.selectedRole as Role]
    };

    this.userService.editInternalUser(request).subscribe({
      next: (user) => {
        this.isCreating = false;
        this.toastService.success(`Usuario ${user.username} actualizado exitosamente`);
        this.loadUsers();
        this.closeEditUserModal();
      },
      error: (error) => {
        this.isCreating = false;
        this.toastService.error(error.message || 'Error al actualizar el usuario');
      }
    });
  }

  // Delete user methods
  openDeleteModal(usuario: any): void {
    this.userToDelete = usuario;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.isDeleting = true;

    // TODO: Implementar llamada al backend para eliminar usuario
    // Por ahora, simularemos la eliminación
    setTimeout(() => {
      this.isDeleting = false;

      // Mostrar toast de éxito
      this.toastService.success(
        `Usuario ${this.userToDelete.nombre} eliminado exitosamente`,
        4000
      );

      // Recargar la lista de usuarios
      this.loadUsers();

      // Cerrar el modal
      this.closeDeleteModal();
    }, 1000);

    // Cuando tengas el endpoint del backend, reemplaza el código anterior con:
    /*
    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.toastService.success(
          `Usuario ${this.userToDelete.nombre} eliminado exitosamente`,
          4000
        );
        this.loadUsers();
        this.closeDeleteModal();
      },
      error: (error) => {
        this.isDeleting = false;
        this.toastService.error(error.message || 'Error al eliminar el usuario', 5000);
        console.error('Error deleting user:', error);
      }
    });
    */
  }
}