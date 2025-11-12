export interface CustomerCreationRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  doorbell: string;
  notes?: string;
  type?: string;
  isActive?: boolean;
  zoneId?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  doorbell: string;
  notes?: string;
  type?: string;
  isActive: boolean;
  zoneId?: string;
  zoneName?: string;
  createdAt: string;
}
