import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DatabaseService, Repartidor } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class RepartidoresService {
  constructor(private db: DatabaseService) {}

  getRepartidores(filtros?: any): Observable<Repartidor[]> {
    return from(this.db.repartidores.toArray()).pipe(
      map(repartidores => {
        let repartidoresFiltrados = [...repartidores];

        if (filtros?.estado && filtros.estado !== '' && filtros.estado !== 'todos') {
          repartidoresFiltrados = repartidoresFiltrados.filter(r => r.estado === filtros.estado);
        }

        if (filtros?.vehiculo && filtros.vehiculo !== '' && filtros.vehiculo !== 'todos') {
          repartidoresFiltrados = repartidoresFiltrados.filter(r => r.vehiculo === filtros.vehiculo);
        }

        if (filtros?.disponible !== undefined && filtros.disponible !== null && filtros.disponible !== 'todos') {
          const disponibleBool = filtros.disponible === 'true' || filtros.disponible === true;
          repartidoresFiltrados = repartidoresFiltrados.filter(r => r.disponible === disponibleBool);
        }

        if (filtros?.busqueda) {
          const busqueda = filtros.busqueda.toLowerCase();
          repartidoresFiltrados = repartidoresFiltrados.filter(r =>
            r.nombre.toLowerCase().includes(busqueda) ||
            r.apellido.toLowerCase().includes(busqueda) ||
            r.dni.includes(busqueda) ||
            r.email.toLowerCase().includes(busqueda)
          );
        }

        // Ordenar por nombre
        return repartidoresFiltrados.sort((a, b) =>
          `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`)
        );
      }),
      delay(500)
    );
  }

  getRepartidorById(id: number): Observable<Repartidor | undefined> {
    return from(this.db.repartidores.get(id)).pipe(delay(300));
  }

  getRepartidoresDisponibles(): Observable<Repartidor[]> {
    return from(
      this.db.repartidores
        .where('disponible').equals(1)
        .and(r => r.estado === 'activo')
        .toArray()
    ).pipe(delay(400));
  }

  crearRepartidor(repartidor: Partial<Repartidor>): Observable<Repartidor> {
    const nuevoRepartidor: Repartidor = {
      nombre: repartidor.nombre!,
      apellido: repartidor.apellido!,
      dni: repartidor.dni!,
      telefono: repartidor.telefono!,
      email: repartidor.email!,
      vehiculo: repartidor.vehiculo!,
      patente: repartidor.patente,
      estado: 'activo',
      estadoColor: 'success',
      direccion: repartidor.direccion,
      fechaIngreso: new Date(),
      pedidosCompletados: 0,
      calificacion: 0,
      disponible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return from(
      this.db.repartidores.add(nuevoRepartidor).then(id => ({
        ...nuevoRepartidor,
        id: id
      }))
    ).pipe(delay(800));
  }

  actualizarRepartidor(id: number, repartidor: Partial<Repartidor>): Observable<Repartidor> {
    return from(
      this.db.repartidores.update(id, {
        ...repartidor,
        updatedAt: new Date()
      }).then(() => this.db.repartidores.get(id))
    ).pipe(
      map(r => r!),
      delay(600)
    );
  }

  eliminarRepartidor(id: number): Observable<boolean> {
    return from(
      this.db.repartidores.delete(id).then(() => true)
    ).pipe(delay(500));
  }

  cambiarEstado(id: number, nuevoEstado: string): Observable<Repartidor> {
    const estadosColor: any = {
      'activo': 'success',
      'inactivo': 'secondary',
      'en_entrega': 'warning'
    };

    return from(
      this.db.repartidores.update(id, {
        estado: nuevoEstado,
        estadoColor: estadosColor[nuevoEstado] || 'secondary',
        updatedAt: new Date()
      }).then(() => this.db.repartidores.get(id))
    ).pipe(
      map(r => r!),
      delay(400)
    );
  }

  cambiarDisponibilidad(id: number, disponible: boolean): Observable<Repartidor> {
    return from(
      this.db.repartidores.update(id, {
        disponible: disponible,
        updatedAt: new Date()
      }).then(() => this.db.repartidores.get(id))
    ).pipe(
      map(r => r!),
      delay(400)
    );
  }

  incrementarPedidosCompletados(id: number): Observable<void> {
    return from(
      this.db.repartidores.get(id).then(async (repartidor) => {
        if (repartidor) {
          await this.db.repartidores.update(id, {
            pedidosCompletados: (repartidor.pedidosCompletados || 0) + 1,
            updatedAt: new Date()
          });
        }
      })
    ).pipe(
      map(() => undefined),
      delay(300)
    );
  }

  actualizarCalificacion(id: number, nuevaCalificacion: number): Observable<Repartidor> {
    return from(
      this.db.repartidores.update(id, {
        calificacion: nuevaCalificacion,
        updatedAt: new Date()
      }).then(() => this.db.repartidores.get(id))
    ).pipe(
      map(r => r!),
      delay(400)
    );
  }

  getEstadisticas(): Observable<any> {
    return from(this.db.repartidores.toArray()).pipe(
      map(repartidores => {
        return {
          total: repartidores.length,
          activos: repartidores.filter(r => r.estado === 'activo').length,
          disponibles: repartidores.filter(r => r.disponible).length,
          enEntrega: repartidores.filter(r => r.estado === 'en_entrega').length,
          inactivos: repartidores.filter(r => r.estado === 'inactivo').length,
          totalPedidosCompletados: repartidores.reduce((sum, r) => sum + (r.pedidosCompletados || 0), 0),
          calificacionPromedio: repartidores.reduce((sum, r) => sum + (r.calificacion || 0), 0) / repartidores.length
        };
      }),
      delay(500)
    );
  }
}
