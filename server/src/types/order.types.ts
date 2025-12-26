export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderAttributes {
  id: number;
  clientId: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod1?: string;
  paymentAmount1?: number;
  paymentMethod2?: string;
  paymentAmount2?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes extends Omit<OrderAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface OrderResponse {
  id: number;
  clientId: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod1?: string;
  paymentAmount1?: number;
  paymentMethod2?: string;
  paymentAmount2?: number;
}

export interface CreateOrderPayload {
  clientId: number;
  totalAmount: number;
  paymentMethod1?: string;
  paymentAmount1?: number;
  paymentMethod2?: string;
  paymentAmount2?: number;
}

export interface UpdateOrderPayload {
  totalAmount?: number;
  status?: OrderStatus;
  paymentMethod1?: string;
  paymentAmount1?: number;
  paymentMethod2?: string;
  paymentAmount2?: number;
}
