import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ConfirmResetPasswordComponent } from './confirm-reset-password/confirm-reset-password.component';
import { VerifyAccountComponent } from './verify-account/verify-account.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomePageComponent } from './dashboard/pages/home-page/home-page.component';
import { PedidosPageComponent } from './dashboard/pages/pedidos-page/pedidos-page.component';
import { NuevoPedidoPageComponent } from './dashboard/pages/nuevo-pedido-page/nuevo-pedido-page.component';
import { UsuariosPageComponent } from './dashboard/pages/usuarios-page/usuarios-page.component';
import { MapaPageComponent } from './dashboard/pages/mapa-page/mapa-page.component';
import { ProductosPageComponent } from './dashboard/pages/productos-page/productos-page.component';
import { ClientesPageComponent } from './dashboard/pages/clientes-page/clientes-page.component';
import { VehiculosPageComponent } from './dashboard/pages/vehiculos-page/vehiculos-page.component';
import { ZonasPageComponent } from './dashboard/pages/zonas-page/zonas-page.component';
import { RepartosPageComponent } from './dashboard/pages/repartos-page/repartos-page.component';
import { PlanPageComponent } from './dashboard/pages/plan-page/plan-page.component';
import { authGuard } from './guards/auth.guard';
import { noDealerGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'confirm-reset-password', component: ConfirmResetPasswordComponent },
  { path: 'auth/verifyRegisterTenantAndOwner', component: VerifyAccountComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [  // ← Las páginas son HIJAS del dashboard
      { path: '', component: HomePageComponent },
      { path: 'pedidos', component: PedidosPageComponent, canActivate: [noDealerGuard] },
      { path: 'pedidos/nuevo', component: NuevoPedidoPageComponent, canActivate: [noDealerGuard] },
      { path: 'repartos', component: RepartosPageComponent },
      { path: 'clientes', component: ClientesPageComponent, canActivate: [noDealerGuard] },
      { path: 'zonas', component: ZonasPageComponent, canActivate: [noDealerGuard] },
      { path: 'usuarios', component: UsuariosPageComponent, canActivate: [noDealerGuard] },
      { path: 'productos', component: ProductosPageComponent, canActivate: [noDealerGuard] },
      { path: 'vehiculos', component: VehiculosPageComponent, canActivate: [noDealerGuard] },
      { path: 'mapa', component: MapaPageComponent },
      { path: 'plan', component: PlanPageComponent, canActivate: [noDealerGuard] }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

// //Para pruebas del front
// export const routes: Routes = [
//   { path: 'login', component: LoginComponent },
//   { path: 'register', component: RegisterComponent },
//   {
//     path: 'dashboard',
//     component: DashboardComponent,
//     children: [
//       { path: '', component: HomePageComponent },
//       { path: 'pedidos', component: PedidosPageComponent },
//       { path: 'pedidos/nuevo', component: NuevoPedidoPageComponent },
//       { path: 'usuarios', component: UsuariosPageComponent },
//       { path: 'mapa', component: MapaPageComponent }
//     ]
//   },
//   { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
//   { path: '**', redirectTo: '/dashboard' }
// ];