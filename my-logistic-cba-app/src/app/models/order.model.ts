import { CustomerCreationRequest } from './customer.model';

export interface OrderItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number; // Must be > 0
}

export interface OrderCreationRequest {
  customerId?: string;
  items: OrderItemRequest[];
  notes?: string;
  customerCreationRequest?: CustomerCreationRequest;
  dealerId?: string;
  vehicleId?: string;
}

export interface OrderCreatedResponse {
  orderId: string;
  orderNumber: string;
}

export interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  tenantId: string;
  customerId: string;
  customerName?: string;
  customerAddress?: string;
  customerCity?: string;
  customerZoneId?: string;
  customerZoneName?: string;
  customerZoneColor?: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  dealerId?: string;
  dealerName?: string;
  vehicleId?: string;
  distributionId?: string;
}
