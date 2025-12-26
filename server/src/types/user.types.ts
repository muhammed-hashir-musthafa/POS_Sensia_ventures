export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  roleId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export interface AuthToken {
  token: string;
  user: UserResponse;
}
