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
}

export interface OrderCreatedResponse {
  orderId: string;
  orderNumber: string;
}
