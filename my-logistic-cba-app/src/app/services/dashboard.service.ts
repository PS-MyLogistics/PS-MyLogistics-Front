import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { PedidosService } from './pedidos.service';
import { RepartidoresService } from './repartidores.service';

export interface DashboardStats {
  pedidos: {
    total: number;
    pendientes: number;
    enTransito: number;
    entregados: number;
    sinAsignar: number;
  };
  repartidores: {
    total: number;
    activos: number;
    disponibles: number;
    enEntrega: number;
  };
  ingresos: {
    hoy: number;
    semana: number;
    mes: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private pedidosService: PedidosService,
    private repartidoresService: RepartidoresService
  ) {}

  getEstadisticas(): Observable<DashboardStats> {
    return forkJoin({
      pedidos: this.pedidosService.getPedidos(),
      repartidores: this.repartidoresService.getRepartidores()
    }).pipe(
      map(({ pedidos, repartidores }) => {
        // Estadísticas de pedidos
        const totalPedidos = pedidos.length;
        const pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
        const pedidosEnTransito = pedidos.filter(p => p.estado === 'En Tránsito').length;
        const pedidosEntregados = pedidos.filter(p => p.estado === 'Entregado').length;
        const pedidosSinAsignar = pedidos.filter(p => !p.repartidor && !p.repartidorId).length;

        // Estadísticas de repartidores
        const totalRepartidores = repartidores.length;
        const repartidoresActivos = repartidores.filter(r => r.estado === 'activo').length;
        const repartidoresDisponibles = repartidores.filter(r => r.disponible).length;
        const repartidoresEnEntrega = repartidores.filter(r => r.estado === 'en_entrega').length;

        // Cálculo de ingresos
        const hoy = new Date().toISOString().split('T')[0];
        const ingresosHoy = pedidos
          .filter(p => p.fecha === hoy && p.estado === 'Entregado')
          .reduce((sum, p) => sum + p.total, 0);

        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);
        const ingresosSemana = pedidos
          .filter(p => new Date(p.fecha) >= hace7Dias && p.estado === 'Entregado')
          .reduce((sum, p) => sum + p.total, 0);

        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        const ingresosMes = pedidos
          .filter(p => new Date(p.fecha) >= hace30Dias && p.estado === 'Entregado')
          .reduce((sum, p) => sum + p.total, 0);

        return {
          pedidos: {
            total: totalPedidos,
            pendientes: pedidosPendientes,
            enTransito: pedidosEnTransito,
            entregados: pedidosEntregados,
            sinAsignar: pedidosSinAsignar
          },
          repartidores: {
            total: totalRepartidores,
            activos: repartidoresActivos,
            disponibles: repartidoresDisponibles,
            enEntrega: repartidoresEnEntrega
          },
          ingresos: {
            hoy: ingresosHoy,
            semana: ingresosSemana,
            mes: ingresosMes
          }
        };
      }),
      delay(400)
    );
  }

  getPedidosRecientes(limit: number = 5): Observable<any[]> {
    return this.pedidosService.getPedidos().pipe(
      map(pedidos => pedidos.slice(0, limit))
    );
  }

  getTopRepartidores(limit: number = 5): Observable<any[]> {
    return this.repartidoresService.getRepartidores().pipe(
      map(repartidores => {
        return repartidores
          .filter(r => r.estado === 'activo')
          .sort((a, b) => (b.pedidosCompletados || 0) - (a.pedidosCompletados || 0))
          .slice(0, limit);
      })
    );
  }
}
