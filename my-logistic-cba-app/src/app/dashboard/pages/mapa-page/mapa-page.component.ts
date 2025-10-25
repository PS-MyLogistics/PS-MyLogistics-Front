import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mapa-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <!-- Controles del Mapa -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-3 align-items-center">
            <div class="col-auto">
              <h6 class="mb-0">Rastreo en Tiempo Real</h6>
            </div>
            <div class="col-auto ms-auto">
              <div class="btn-group" role="group">
                <button type="button" class="btn btn-sm btn-outline-secondary active">Todos</button>
                <button type="button" class="btn btn-sm btn-outline-secondary">En Ruta</button>
                <button type="button" class="btn btn-sm btn-outline-secondary">Entregados</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <!-- Panel Lateral con Lista -->
        <div class="col-lg-4">
          <div class="card delivery-list">
            <div class="card-header">
              <h6 class="mb-0">Entregas Activas ({{ entregas.length }})</h6>
            </div>
            <div class="card-body p-0">
              <div class="delivery-item" *ngFor="let entrega of entregas">
                <div class="delivery-status" [class]="'status-' + entrega.estadoColor"></div>
                <div class="delivery-info">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="mb-0">{{ entrega.codigo }}</h6>
                    <span [class]="'badge bg-' + entrega.estadoColor">{{ entrega.estado }}</span>
                  </div>
                  <p class="text-muted small mb-2">
                    <svg class="me-1" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {{ entrega.destino }}
                  </p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">{{ entrega.conductor }}</small>
                    <small class="text-primary fw-semibold">{{ entrega.tiempo }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Área del Mapa -->
        <div class="col-lg-8">
          <div class="card map-container">
            <div class="card-body p-0">
              <div class="map-placeholder">
                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
                <h5 class="mt-3 mb-2">Mapa Interactivo</h5>
                <p class="text-muted">Integración con Google Maps próximamente</p>
              </div>
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

    .card-header {
      background: white;
      border-bottom: 1px solid #f3f4f6;
      padding: 16px 20px;
    }

    .delivery-list {
      height: calc(100vh - 220px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .delivery-list .card-body {
      overflow-y: auto;
      flex: 1;
    }

    .delivery-item {
      padding: 16px 20px;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      gap: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .delivery-item:hover {
      background: #f9fafb;
    }

    .delivery-status {
      width: 4px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .status-success { background: #10b981; }
    .status-warning { background: #f59e0b; }
    .status-primary { background: #2563eb; }

    .delivery-info {
      flex: 1;
      min-width: 0;
    }

    .delivery-info h6 {
      font-size: 14px;
      font-weight: 600;
    }

    .badge {
      font-size: 10px;
      padding: 4px 8px;
    }

    .map-container {
      height: calc(100vh - 220px);
    }

    .map-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
    }

    .btn-outline-secondary {
      border-color: #d1d5db;
      color: #6b7280;
    }

    .btn-outline-secondary.active {
      background: #2563eb;
      border-color: #2563eb;
      color: white;
    }

    @media (max-width: 992px) {
      .delivery-list, .map-container {
        height: 400px;
      }
    }
  `]
})
export class MapaPageComponent {
  entregas = [
    { codigo: 'ENV-001', estado: 'En Ruta', estadoColor: 'warning', destino: 'Av. Colón 1234, Córdoba', conductor: 'Juan Pérez', tiempo: '15 min' },
    { codigo: 'ENV-002', estado: 'En Ruta', estadoColor: 'warning', destino: 'San Martín 567, Córdoba', conductor: 'María García', tiempo: '22 min' },
    { codigo: 'ENV-003', estado: 'Entregado', estadoColor: 'success', destino: 'Av. Vélez Sarsfield 890, Córdoba', conductor: 'Carlos López', tiempo: 'Entregado' },
    { codigo: 'ENV-004', estado: 'En Ruta', estadoColor: 'warning', destino: 'Chacabuco 123, Córdoba', conductor: 'Ana Martínez', tiempo: '8 min' },
    { codigo: 'ENV-005', estado: 'Preparando', estadoColor: 'primary', destino: 'Obispo Trejo 456, Córdoba', conductor: 'Pedro Gómez', tiempo: 'Pendiente' }
  ];
}