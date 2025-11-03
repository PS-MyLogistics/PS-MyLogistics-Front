import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomePageComponent } from './dashboard/pages/home-page/home-page.component';
import { PedidosPageComponent } from './dashboard/pages/pedidos-page/pedidos-page.component';
import { NuevoPedidoPageComponent } from './dashboard/pages/nuevo-pedido-page/nuevo-pedido-page.component';
import { UsuariosPageComponent } from './dashboard/pages/usuarios-page/usuarios-page.component';
import { MapaPageComponent } from './dashboard/pages/mapa-page/mapa-page.component';
import { RepartidoresPageComponent } from './dashboard/pages/repartidores-page/repartidores-page.component';
import { NuevoRepartidorPageComponent } from './dashboard/pages/nuevo-repartidor-page/nuevo-repartidor-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [  // ← Las páginas son HIJAS del dashboard
      { path: '', component: HomePageComponent },
      { path: 'pedidos', component: PedidosPageComponent },
      { path: 'pedidos/nuevo', component: NuevoPedidoPageComponent },
      { path: 'repartidores', component: RepartidoresPageComponent },
      { path: 'repartidores/nuevo', component: NuevoRepartidorPageComponent },
      { path: 'repartidores/editar/:id', component: NuevoRepartidorPageComponent },
      { path: 'usuarios', component: UsuariosPageComponent },
      { path: 'mapa', component: MapaPageComponent }
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