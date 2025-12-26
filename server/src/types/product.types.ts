export interface ProductAttributes {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCreationAttributes extends Omit<ProductAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}
