export interface RolePermissionAttributes {
  id: number;
  roleId: number;
  permissionId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RolePermissionCreationAttributes extends Omit<RolePermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
