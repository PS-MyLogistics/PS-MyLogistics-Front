import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper">
      <!-- Navbar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-gradient">
        <div class="container-fluid">
          <a class="navbar-brand d-flex align-items-center" href="#">
            <div class="logo-navbar me-2">
              <!-- Reemplaza con tu logo: <img src="assets/logo.png" alt="Logo" class="logo-img-navbar" /> -->
                <img src="logo.png" alt="Logo" class="logo-img rounded-circle" />
            </div>
            <span class="fw-bold">My Logistic</span>
          </a>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link active" href="#dashboard">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#envios">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  Envíos
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#usuarios">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  Usuarios
                </a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {{ username }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#perfil">Mi Perfil</a></li>
                  <li><a class="dropdown-item" href="#configuracion">Configuración</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" (click)="logout()">Cerrar Sesión</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="container-fluid py-4">
        <!-- Bienvenida -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="welcome-card">
              <h1 class="mb-2">¡Bienvenido a My Logistic!</h1>
              <p class="text-muted mb-0">Gestiona tus envíos y operaciones logísticas de manera eficiente</p>
            </div>
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="row g-4 mb-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <div class="stat-card stat-primary">
              <div class="stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">124</h3>
                <p class="stat-label">Envíos Activos</p>
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
                <h3 class="stat-number">856</h3>
                <p class="stat-label">Entregas Completadas</p>
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
                <h3 class="stat-number">23</h3>
                <p class="stat-label">En Tránsito</p>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <div class="stat-card stat-danger">
              <div class="stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">5</h3>
                <p class="stat-label">Requieren Atención</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Envíos Recientes -->
        <div class="row">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0">
                  <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Envíos Recientes
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span class="badge bg-secondary">#ENV-001</span></td>
                        <td>Buenos Aires</td>
                        <td>Córdoba</td>
                        <td><span class="badge bg-success">Entregado</span></td>
                        <td>20/10/2025</td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary">Ver</button>
                        </td>
                      </tr>
                      <tr>
                        <td><span class="badge bg-secondary">#ENV-002</span></td>
                        <td>Rosario</td>
                        <td>Mendoza</td>
                        <td><span class="badge bg-warning">En Tránsito</span></td>
                        <td>19/10/2025</td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary">Ver</button>
                        </td>
                      </tr>
                      <tr>
                        <td><span class="badge bg-secondary">#ENV-003</span></td>
                        <td>Córdoba</td>
                        <td>Tucumán</td>
                        <td><span class="badge bg-primary">Procesando</span></td>
                        <td>18/10/2025</td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary">Ver</button>
                        </td>
                      </tr>
                      <tr>
                        <td><span class="badge bg-secondary">#ENV-004</span></td>
                        <td>Santa Fe</td>
                        <td>Salta</td>
                        <td><span class="badge bg-danger">Demorado</span></td>
                        <td>17/10/2025</td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary">Ver</button>
                        </td>
                      </tr>
                      <tr>
                        <td><span class="badge bg-secondary">#ENV-005</span></td>
                        <td>La Plata</td>
                        <td>Mar del Plata</td>
                        <td><span class="badge bg-success">Entregado</span></td>
                        <td>16/10/2025</td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary">Ver</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .bg-gradient {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    }

    .logo-navbar {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon-navbar {
      width: 24px;
      height: 24px;
      color: #2563eb;
    }

    .logo-img-navbar {
      width: 36px;
      height: 36px;
      object-fit: cover;
      border-radius: 50%;
    }

    .nav-icon {
      width: 18px;
      height: 18px;
      display: inline-block;
      margin-right: 5px;
      vertical-align: middle;
    }

    .section-icon {
      width: 20px;
      height: 20px;
      display: inline-block;
      margin-right: 8px;
      vertical-align: middle;
    }

    .welcome-card {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      padding: 2rem;
      border-radius: 1rem;
      color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .welcome-card h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
      border-left: 4px solid;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .stat-primary {
      border-left-color: #2563eb;
    }

    .stat-success {
      border-left-color: #10b981;
    }

    .stat-warning {
      border-left-color: #f59e0b;
    }

    .stat-danger {
      border-left-color: #ef4444;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
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

    .stat-danger .stat-icon {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .stat-icon svg {
      width: 30px;
      height: 30px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      color: #1f2937;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0;
    }

    .card {
      border: none;
      border-radius: 1rem;
    }

    .card-header {
      border-bottom: 1px solid #e5e7eb;
      padding: 1.25rem;
      border-radius: 1rem 1rem 0 0 !important;
    }

    .table {
      margin-bottom: 0;
    }

    .table thead th {
      border-bottom: 2px solid #e5e7eb;
      color: #6b7280;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      padding: 1rem;
    }

    .table tbody td {
      padding: 1rem;
      vertical-align: middle;
    }

    .table-hover tbody tr:hover {
      background-color: #f9fafb;
    }

    .badge {
      padding: 0.5rem 0.75rem;
      font-weight: 600;
    }

    .btn-outline-primary {
      border-color: #2563eb;
      color: #2563eb;
    }

    .btn-outline-primary:hover {
      background-color: #2563eb;
      color: white;
    }

    @media (max-width: 768px) {
      .welcome-card h1 {
        font-size: 1.5rem;
      }

      .stat-card {
        flex-direction: column;
        text-align: center;
      }

      .stat-number {
        font-size: 1.75rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  username: string = 'Usuario';

  ngOnInit(): void {
    // Verificar si está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener username del localStorage si existe
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      this.username = savedUsername;
    }
  }

  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: () => {
          // Aunque falle el logout en el servidor, limpiar sesión local
          this.authService.clearSession();
        }
      });
    }
  }
}