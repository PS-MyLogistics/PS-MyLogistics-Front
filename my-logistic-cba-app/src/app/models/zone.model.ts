export interface ZoneRequest {
  name: string;
  description?: string;
  color?: string; // Pattern: ^#[0-9A-Fa-f]{6}$
  isActive?: boolean;
}

export interface ZoneResponse {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
