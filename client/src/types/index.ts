export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  clientId: number;
  userId: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  user?: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export type Resource = 'products' | 'clients' | 'orders' | 'comments' | 'users';
export type Action = 'view' | 'create' | 'update' | 'delete';