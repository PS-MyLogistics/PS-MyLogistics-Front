import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DatabaseService, Pedido } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  constructor(private db: DatabaseService) {}

  getPedidos(filtros?: any): Observable<Pedido[]> {
    return from(this.db.pedidos.toArray()).pipe(
      map(pedidos => {
        let pedidosFiltrados = [...pedidos];

        if (filtros?.producto && filtros.producto !== '' && filtros.producto !== 'Todos') {
          pedidosFiltrados = pedidosFiltrados.filter(p => p.producto === filtros.producto);
        }

        if (filtros?.broker && filtros.broker !== '' && filtros.broker !== 'Todos') {
          pedidosFiltrados = pedidosFiltrados.filter(p => p.broker === filtros.broker);
        }

        if (filtros?.repartidor) {
          if (filtros.repartidor === 'sin_asignar') {
            pedidosFiltrados = pedidosFiltrados.filter(p => !p.repartidor && !p.repartidorId);
          } else if (filtros.repartidor === 'asignado') {
            pedidosFiltrados = pedidosFiltrados.filter(p => p.repartidor || p.repartidorId);
          }
        }

        if (filtros?.fechaDesde) {
          pedidosFiltrados = pedidosFiltrados.filter(p => p.fecha >= filtros.fechaDesde);
        }

        if (filtros?.fechaHasta) {
          pedidosFiltrados = pedidosFiltrados.filter(p => p.fecha <= filtros.fechaHasta);
        }

        // Ordenar por fecha descendente
        return pedidosFiltrados.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      }),
      delay(500)
    );
  }

  getPedidoById(id: number): Observable<Pedido | undefined> {
    return from(this.db.pedidos.get(id)).pipe(delay(300));
  }

  crearPedido(pedido: any): Observable<Pedido> {
    const nuevoPedido: Pedido = {
      fecha: new Date().toISOString().split('T')[0],
      producto: pedido.productos[0]?.nombre || 'Varios',
      broker: pedido.broker,
      cliente: pedido.cliente,
      direccion: pedido.direccion,
      telefono: pedido.telefono,
      email: pedido.email,
      estado: 'Pendiente',
      estadoColor: 'secondary',
      productos: pedido.productos,
      total: pedido.total,
      repartidor: pedido.repartidor,
      repartidorId: pedido.repartidorId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return from(
      this.db.pedidos.add(nuevoPedido).then(id => ({
        ...nuevoPedido,
        id: id
      }))
    ).pipe(delay(1000));
  }

  actualizarPedido(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    return from(
      this.db.pedidos.update(id, {
        ...pedido,
        updatedAt: new Date()
      }).then(() => this.db.pedidos.get(id))
    ).pipe(
      map(p => p!),
      delay(800)
    );
  }

  eliminarPedido(id: number): Observable<boolean> {
    return from(
      this.db.pedidos.delete(id).then(() => true)
    ).pipe(delay(500));
  }

  getProductos(): Observable<any[]> {
    return from(this.db.productos.toArray()).pipe(delay(400));
  }

  getBrokers(): Observable<any[]> {
    return from(this.db.brokers.toArray()).pipe(delay(400));
  }
}