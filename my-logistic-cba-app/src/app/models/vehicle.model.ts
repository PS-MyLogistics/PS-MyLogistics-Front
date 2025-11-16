export interface VehicleRequest {
  plate: string;
  model?: string;
  capacity: number;
}

export interface VehicleResponse {
  id: string;
  tenantId: string;
  plate: string;
  model?: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}
