import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <!-- Stats Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-card stat-primary">
            <div class="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>124</h3>
              <p>Pedidos Activos</p>
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
              <h3>856</h3>
              <p>Entregas Completadas</p>
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
              <h3>23</h3>
              <p>En Tránsito</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="stat-card stat-info">
            <div class="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <h3>45</h3>
              <p>Usuarios Activos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Welcome Card -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Bienvenido a My Logistic</h5>
          <p class="card-text text-muted">Panel de control para gestionar tus operaciones logísticas</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-left: 4px solid;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .stat-primary { border-left-color: #2563eb; }
    .stat-success { border-left-color: #10b981; }
    .stat-warning { border-left-color: #f59e0b; }
    .stat-info { border-left-color: #3b82f6; }

    .stat-icon {
      width: 56px;
      height: 56px;
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

    .stat-info .stat-icon {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .stat-icon svg {
      width: 28px;
      height: 28px;
    }

    .stat-content h3 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 4px;
      color: #1f2937;
    }

    .stat-content p {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class HomePageComponent {}
