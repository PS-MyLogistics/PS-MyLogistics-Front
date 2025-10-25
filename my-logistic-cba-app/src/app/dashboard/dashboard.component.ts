// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.sidebar-open]="sidebarOpen">
        <div class="sidebar-header">
          <div class="logo-sidebar">
            <svg class="logo-icon-sidebar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
            </svg>
          </div>
          <h5 class="sidebar-title">My Logistic</h5>
        </div>

        <nav class="sidebar-nav">
          <a [routerLink]="['/dashboard']" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>Inicio</span>
          </a>

          <a [routerLink]="['/dashboard/pedidos']" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <span>Pedidos</span>
          </a>

          <a [routerLink]="['/dashboard/usuarios']" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <span>Usuarios</span>
          </a>

          <a [routerLink]="['/dashboard/mapa']" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
            </svg>
            <span>Mapa</span>
          </a>

          <a href="#" class="nav-item">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>Configuración</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="btn-logout" (click)="logout()">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Top Navbar -->
        <nav class="top-navbar">
          <button class="btn-menu" (click)="toggleSidebar()">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <div class="navbar-title">
            <h4 class="mb-0">{{ currentPageTitle }}</h4>
          </div>

          <div class="navbar-actions">
            <button class="btn-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>

            <div class="user-menu">
              <div class="user-avatar">
                <span>{{ getInitials() }}</span>
              </div>
              <div class="user-info">
                <span class="user-name">{{ username }}</span>
                <small class="user-role">Administrador</small>
              </div>
            </div>
          </div>
        </nav>

        <!-- Content Area -->
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .dashboard-layout {
      display: flex;
      height: 100vh;
      background: #f5f7fa;
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      background: white;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      z-index: 1000;
      transition: transform 0.3s ease;
    }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-sidebar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-icon-sidebar {
      width: 24px;
      height: 24px;
      color: white;
    }

    .sidebar-title {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 12px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #6b7280;
      text-decoration: none;
      border-radius: 8px;
      margin-bottom: 4px;
      transition: all 0.2s;
      font-weight: 500;
    }

    .nav-item:hover {
      background: #f3f4f6;
      color: #2563eb;
    }

    .nav-item.active {
      background: #eff6ff;
      color: #2563eb;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid #e5e7eb;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      width: 100%;
      background: none;
      border: none;
      color: #ef4444;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      font-weight: 500;
      font-size: 14px;
    }

    .btn-logout:hover {
      background: #fef2f2;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .top-navbar {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .btn-menu {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: #6b7280;
    }

    .navbar-title h4 {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: #6b7280;
      transition: background 0.2s;
    }

    .btn-icon:hover {
      background: #f3f4f6;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .user-menu:hover {
      background: #f3f4f6;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .user-role {
      font-size: 12px;
      color: #6b7280;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    /* Mobile */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.sidebar-open {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0;
      }

      .btn-menu {
        display: block;
      }

      .user-info {
        display: none;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  username: string = 'Usuario Demo';
  sidebarOpen: boolean = false;
  currentPageTitle: string = 'Inicio';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      this.username = savedUsername;
    }

    this.updatePageTitle();
  }

  updatePageTitle(): void {
    const url = this.router.url;
    if (url.includes('pedidos')) {
      this.currentPageTitle = 'Pedidos';
    } else if (url.includes('usuarios')) {
      this.currentPageTitle = 'Usuarios';
    } else if (url.includes('mapa')) {
      this.currentPageTitle = 'Mapa';
    } else {
      this.currentPageTitle = 'Inicio';
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  getInitials(): string {
    return this.username.substring(0, 2).toUpperCase();
  }

  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      localStorage.clear();
      this.router.navigate(['/login']);
    }
  }
}