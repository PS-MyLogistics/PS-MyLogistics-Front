export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  TARJETA_DEBITO = 'TARJETA_DEBITO',
  BILLETERA_VIRTUAL = 'BILLETERA_VIRTUAL'
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  EXITOSO = 'EXITOSO',
  FALLIDO = 'FALLIDO'
}

export enum EstadoFactura {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  ANULADA = 'ANULADA'
}

export interface PagoResponse {
  id: string;
  monto: number;
  fechaPago: string;
  estadoPago: EstadoPago;
  transaccionIdExterno?: string;
  preferenciaPagoId?: string;
  initPoint?: string;
  facturaId: string;
}

export interface FacturaResponse {
  id: string;
  tenantId: string;
  clientId: string;
  numeroFactura: string;
  fechaEmision: string;
  total: number;
  metodoPago: MetodoPago;
  estado: EstadoFactura;
  pagos: PagoResponse[];
}

export interface CrearFacturaRequest {
  tenantId: string;
  clienteId: string;
}

export interface RegistrarPagoRequest {
  facturaId?: string;
  monto: number;
  emailPagador: string;
  dniPagador: string;
  meses?: number;
}

export interface CrearFacturaYPreferenciaRequest {
  requestFactura: CrearFacturaRequest;
  requestPago: RegistrarPagoRequest;
}