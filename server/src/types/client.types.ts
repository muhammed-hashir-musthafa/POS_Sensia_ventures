export interface ClientAttributes {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientCreationAttributes extends Omit<ClientAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface ClientResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CreateClientPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateClientPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
