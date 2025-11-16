export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
}

export interface ProductCreationRequest {
  name: string;
  description?: string;
  sku?: string;
  price: number;
}
