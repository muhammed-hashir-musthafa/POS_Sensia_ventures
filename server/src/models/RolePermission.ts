import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';

export interface RolePermissionAttributes {
  id: number;
  roleId: number;
  permissionId: number;
  grantedBy: number;
  grantedAt: Date;
  conditions?: object;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermissionCreationAttributes extends Optional<RolePermissionAttributes, 'id' | 'grantedAt' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class RolePermission extends Model<RolePermissionAttributes, RolePermissionCreationAttributes> implements RolePermissionAttributes {
  public id!: number;
  public roleId!: number;
  public permissionId!: number;
  public grantedBy!: number;
  public grantedAt!: Date;
  public conditions?: object;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id',
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'permission_id',
      references: {
        model: 'permissions',
        key: 'id',
      },
    },
    grantedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'granted_by',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    grantedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'granted_at',
      defaultValue: DataTypes.NOW,
    },
    conditions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_active',
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'role_permissions',
    indexes: [
      { unique: true, fields: ['role_id', 'permission_id'] },
      { fields: ['granted_by'] },
      { fields: ['is_active'] },
    ],
  }
);

export default RolePermission;