export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  DEALER = 'DEALER'
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
  FREEZED = 'FREEZED'
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  telephone?: string;
  roles: Role[];
  owner: boolean;
  status: UserStatus;
}

export interface RegisterUserInTenantRequest {
  email: string;
  password: string; // Pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^_&*(),.?":{}|<>]).{8,}$
  username: string;
  roles: Role[];
  telephone: string; // Pattern: ^[0-9]+$
  address?: string;
  city?: string;
  stateOrProvince?: string;
}

export interface EditUserInTenantRequest {
  userId?: string;
  username: string;
  roles?: Role[];
  telephone?: string;
  address?: string;
  city?: string;
  stateOrProvince?: string;
  newPassword?: string;
}
