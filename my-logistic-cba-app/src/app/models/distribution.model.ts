export interface DistributionCreationRequest {
  orderIds?: string[];
  dealerId?: string;
  vehicleId?: string;
  startProgramDateTime?: string; // ISO 8601 date-time
  endProgramDateTime?: string; // ISO 8601 date-time
  notes?: string;
}

export interface DistributionResponse {
  id: string;
  tenantId: string;
  orderIds?: string[];
  dealerId?: string;
  vehicleId?: string;
  startProgramDateTime?: string;
  endProgramDateTime?: string;
  createdAt: string;
  status: string;
  notes?: string;
  optimizatedRoute?: { [key: string]: string };
  optimized?: boolean;
}
