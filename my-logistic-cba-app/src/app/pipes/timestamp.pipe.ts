import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestamp',
  standalone: true
})
export class TimestampPipe implements PipeTransform {
  transform(value: string | number | undefined, format: string = 'dd/MM/yyyy'): string {
    if (!value) return '';

    // Si es un número (timestamp en segundos), convertir a milisegundos
    let timestamp: number;
    if (typeof value === 'number') {
      timestamp = value * 1000;
    } else {
      // Si es string, intentar parsearlo como número primero
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        // Es un timestamp numérico en formato string
        timestamp = parsed * 1000;
      } else {
        // Es una fecha en formato ISO string
        timestamp = new Date(value).getTime();
      }
    }

    const date = new Date(timestamp);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return '';
    }

    // Formatear según el parámetro
    if (format === 'dd/MM/yyyy') {
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } else if (format === 'dd/MM/yyyy HH:mm') {
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return date.toLocaleDateString('es-AR');
  }
}
