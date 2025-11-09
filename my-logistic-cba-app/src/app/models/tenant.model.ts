export enum PlanType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export enum TenantStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export interface TenantInfo {
  name: string;
  contactEmail: string;
  contactPhone: string;
  ownerName: string;
  address: string;
  active: boolean;
  planType: PlanType;
  status: TenantStatus;
  maxUsers: number;
  createdAt: string;
  updatedAt: string;
}
