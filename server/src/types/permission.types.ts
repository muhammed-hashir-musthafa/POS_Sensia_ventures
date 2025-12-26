export interface PermissionAttributes {
  id: number;
  name: string;
  resource: string;
  action: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PermissionCreationAttributes extends Omit<PermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface PermissionResponse {
  id: number;
  name: string;
  resource: string;
  action: string;
}
