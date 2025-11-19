export interface CustomerWithLastOrder {
  customerId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  type?: string;
  lastOrderId?: string;
  lastOrderNumber?: string;
  lastOrderDate?: string;
  lastOrderAmount?: number;
  lastOrderStatus?: string;
  daysSinceLastOrder?: number;
  totalOrders?: number;
}

export interface PromotionalEmailRequest {
  customerIds: string[];
  subject: string;
  message: string;
}

export interface PromotionalEmailResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  message: string;
}

export enum InactivityPeriod {
  WEEK_1 = 7,
  MONTH_1 = 30,
  MONTHS_3 = 90,
  MONTHS_6 = 180,
  YEAR_1 = 365
}
