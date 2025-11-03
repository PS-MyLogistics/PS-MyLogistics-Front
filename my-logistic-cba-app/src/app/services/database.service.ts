import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

export interface Usuario {
  id?: number;
  username: string;
  password: string;
  email: string;
  tenantName: string;
  telephone: string;
  address: string;
  city: string;
  stateOrProvince: string;
  role: string;
  createdAt: Date;
}

export interface Pedido {
  id?: number;
  fecha: string;
  producto: string;
  broker: string;
  cliente: string;
  direccion: string;
  telefono?: string;
  email?: string;
  estado: string;
  estadoColor: string;
  productos: any[];
  total: number;
  repartidor?: string;
  repartidorId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  stock?: number;
}

export interface Broker {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
}

export interface Repartidor {
  id?: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  vehiculo: string; // moto, auto, bicicleta, camioneta
  patente?: string;
  estado: string; // activo, inactivo, en_entrega
  estadoColor: string; // success, secondary, warning
  direccion?: string;
  fechaIngreso: Date;
  pedidosCompletados?: number;
  calificacion?: number;
  disponible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService extends Dexie {
  usuarios!: Table<Usuario, number>;
  pedidos!: Table<Pedido, number>;
  productos!: Table<Producto, number>;
  brokers!: Table<Broker, number>;
  repartidores!: Table<Repartidor, number>;

  constructor() {
    super('MyLogisticDB');

    this.version(1).stores({
      usuarios: '++id, username, email, tenantName',
      pedidos: '++id, fecha, cliente, estado, broker',
      productos: '++id, nombre',
      brokers: '++id, nombre'
    });

    this.version(2).stores({
      usuarios: '++id, username, email, tenantName',
      pedidos: '++id, fecha, cliente, estado, broker, repartidor',
      productos: '++id, nombre',
      brokers: '++id, nombre',
      repartidores: '++id, dni, email, estado, disponible'
    });

    this.on('populate', () => this.populate());
  }

  async populate() {
    // Datos iniciales
    await this.usuarios.bulkAdd([
      {
        username: 'admin',
        password: 'Admin123!',
        email: 'admin@mylogistic.com',
        tenantName: 'mylogistic',
        telephone: '3511234567',
        address: 'Av. Colón 123',
        city: 'Córdoba',
        stateOrProvince: 'Córdoba',
        role: 'ADMIN',
        createdAt: new Date()
      },
      {
        username: 'demo',
        password: 'Demo123!',
        email: 'demo@mylogistic.com',
        tenantName: 'demo',
        telephone: '3511234568',
        address: 'San Martín 456',
        city: 'Córdoba',
        stateOrProvince: 'Córdoba',
        role: 'USER',
        createdAt: new Date()
      }
    ]);

    await this.productos.bulkAdd([
      { nombre: 'Producto A', precio: 15000, descripcion: 'Paquete Estándar', stock: 100 },
      { nombre: 'Producto B', precio: 8500, descripcion: 'Paquete Express', stock: 50 },
      { nombre: 'Producto C', precio: 5100, descripcion: 'Paquete Premium', stock: 75 },
      { nombre: 'Producto D', precio: 12000, descripcion: 'Paquete Grande', stock: 30 }
    ]);

    await this.brokers.bulkAdd([
      { nombre: 'María Rodríguez', email: 'maria@mylogistic.com', telefono: '3511111111' },
      { nombre: 'Juan Pérez', email: 'juan@mylogistic.com', telefono: '3512222222' },
      { nombre: 'Sofía Gómez', email: 'sofia@mylogistic.com', telefono: '3513333333' },
      { nombre: 'Carlos López', email: 'carlos@mylogistic.com', telefono: '3514444444' }
    ]);

    await this.repartidores.bulkAdd([
      {
        nombre: 'Roberto',
        apellido: 'González',
        dni: '35123456',
        telefono: '3515551111',
        email: 'roberto.gonzalez@mylogistic.com',
        vehiculo: 'moto',
        patente: 'AB123CD',
        estado: 'activo',
        estadoColor: 'success',
        direccion: 'Av. Vélez Sarsfield 234, Córdoba',
        fechaIngreso: new Date('2024-01-15'),
        pedidosCompletados: 156,
        calificacion: 4.8,
        disponible: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        nombre: 'Luciana',
        apellido: 'Fernández',
        dni: '38456789',
        telefono: '3515552222',
        email: 'luciana.fernandez@mylogistic.com',
        vehiculo: 'auto',
        patente: 'CD456EF',
        estado: 'en_entrega',
        estadoColor: 'warning',
        direccion: 'Bv. San Juan 890, Córdoba',
        fechaIngreso: new Date('2024-03-20'),
        pedidosCompletados: 89,
        calificacion: 4.9,
        disponible: false,
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date()
      },
      {
        nombre: 'Martín',
        apellido: 'Acosta',
        dni: '40789123',
        telefono: '3515553333',
        email: 'martin.acosta@mylogistic.com',
        vehiculo: 'bicicleta',
        estado: 'activo',
        estadoColor: 'success',
        direccion: 'Belgrano 567, Córdoba',
        fechaIngreso: new Date('2024-05-10'),
        pedidosCompletados: 234,
        calificacion: 5.0,
        disponible: true,
        createdAt: new Date('2024-05-10'),
        updatedAt: new Date()
      },
      {
        nombre: 'Gabriela',
        apellido: 'Moreno',
        dni: '42321654',
        telefono: '3515554444',
        email: 'gabriela.moreno@mylogistic.com',
        vehiculo: 'camioneta',
        patente: 'GH789IJ',
        estado: 'activo',
        estadoColor: 'success',
        direccion: '27 de Abril 1234, Córdoba',
        fechaIngreso: new Date('2024-02-28'),
        pedidosCompletados: 178,
        calificacion: 4.7,
        disponible: true,
        createdAt: new Date('2024-02-28'),
        updatedAt: new Date()
      },
      {
        nombre: 'Diego',
        apellido: 'Ramírez',
        dni: '37654321',
        telefono: '3515555555',
        email: 'diego.ramirez@mylogistic.com',
        vehiculo: 'moto',
        patente: 'KL012MN',
        estado: 'inactivo',
        estadoColor: 'secondary',
        direccion: 'Chacabuco 345, Córdoba',
        fechaIngreso: new Date('2023-11-05'),
        pedidosCompletados: 45,
        calificacion: 4.2,
        disponible: false,
        createdAt: new Date('2023-11-05'),
        updatedAt: new Date()
      },
      {
        nombre: 'Valeria',
        apellido: 'Silva',
        dni: '39987654',
        telefono: '3515556666',
        email: 'valeria.silva@mylogistic.com',
        vehiculo: 'auto',
        patente: 'OP345QR',
        estado: 'activo',
        estadoColor: 'success',
        direccion: 'Duarte Quirós 678, Córdoba',
        fechaIngreso: new Date('2024-06-12'),
        pedidosCompletados: 67,
        calificacion: 4.6,
        disponible: true,
        createdAt: new Date('2024-06-12'),
        updatedAt: new Date()
      }
    ]);

    await this.pedidos.bulkAdd([
      {
        fecha: '2025-10-15',
        producto: 'Paquete Estándar',
        broker: 'María Rodríguez',
        cliente: 'Elena Hernández',
        direccion: 'Av. Colón 1234, Córdoba, Argentina',
        telefono: '3511234567',
        email: 'elena@email.com',
        estado: 'Entregado',
        estadoColor: 'success',
        productos: [{ nombre: 'Producto A', cantidad: 1, precioUnitario: 15000, subtotal: 15000 }],
        total: 15000,
        createdAt: new Date('2025-10-15'),
        updatedAt: new Date('2025-10-15')
      },
      {
        fecha: '2025-10-20',
        producto: 'Paquete Express',
        broker: 'Juan Pérez',
        cliente: 'Javier García',
        direccion: 'San Martín 567, Rosario, Argentina',
        telefono: '3411234567',
        email: 'javier@email.com',
        estado: 'En Tránsito',
        estadoColor: 'warning',
        productos: [{ nombre: 'Producto B', cantidad: 2, precioUnitario: 8500, subtotal: 17000 }],
        total: 17000,
        createdAt: new Date('2025-10-20'),
        updatedAt: new Date('2025-10-20')
      }
    ]);
  }

  // Método para resetear la base de datos
  async resetDatabase() {
    await this.delete();
    await this.open();
  }
}