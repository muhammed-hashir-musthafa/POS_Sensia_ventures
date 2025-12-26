import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';

export interface UserRoleAttributes {
  id: number;
  userId: number;
  roleId: number;
  assignedBy: number;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleCreationAttributes extends Optional<UserRoleAttributes, 'id' | 'assignedAt' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
  public id!: number;
  public userId!: number;
  public roleId!: number;
  public assignedBy!: number;
  public assignedAt!: Date;
  public expiresAt?: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserRole.init(
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
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id',
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      field: 'assigned_by',
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'assigned_at',
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at',
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
    modelName: 'UserRole',
    tableName: 'user_roles',
    indexes: [
      { unique: true, fields: ['user_id', 'role_id'] },
      { fields: ['assigned_by'] },
      { fields: ['is_active'] },
      { fields: ['expires_at'] },
    ],
  }
);

export default UserRole;