import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';

export interface UserPermissionAttributes {
  id: number;
  userId: number;
  permissionId: number;
  grantType: 'grant' | 'deny';
  grantedBy: number;
  grantedAt: Date;
  expiresAt?: Date;
  conditions?: object;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissionCreationAttributes extends Optional<UserPermissionAttributes, 'id' | 'grantedAt' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class UserPermission extends Model<UserPermissionAttributes, UserPermissionCreationAttributes> implements UserPermissionAttributes {
  public id!: number;
  public userId!: number;
  public permissionId!: number;
  public grantType!: 'grant' | 'deny';
  public grantedBy!: number;
  public grantedAt!: Date;
  public expiresAt?: Date;
  public conditions?: object;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserPermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
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
    grantType: {
      type: DataTypes.ENUM('grant', 'deny'),
      allowNull: false,
      field: 'grant_type',
      defaultValue: 'grant',
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
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at',
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
    modelName: 'UserPermission',
    tableName: 'user_permissions',
    indexes: [
      { fields: ['user_id', 'permission_id'] },
      { fields: ['granted_by'] },
      { fields: ['grant_type'] },
      { fields: ['is_active'] },
      { fields: ['expires_at'] },
    ],
  }
);

export default UserPermission;