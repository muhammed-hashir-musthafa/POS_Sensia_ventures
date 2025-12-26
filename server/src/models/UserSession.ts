import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';

export interface UserSessionAttributes {
  id: number;
  userId: number;
  sessionToken: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSessionCreationAttributes extends Optional<UserSessionAttributes, 'id' | 'lastActivityAt' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class UserSession extends Model<UserSessionAttributes, UserSessionCreationAttributes> implements UserSessionAttributes {
  public id!: number;
  public userId!: number;
  public sessionToken!: string;
  public refreshToken!: string;
  public ipAddress?: string;
  public userAgent?: string;
  public expiresAt!: Date;
  public lastActivityAt!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserSession.init(
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
    sessionToken: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'session_token',
      unique: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'refresh_token',
      unique: true,
    },
    ipAddress: {
      type: DataTypes.INET,
      allowNull: true,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_agent',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'last_activity_at',
      defaultValue: DataTypes.NOW,
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
    modelName: 'UserSession',
    tableName: 'user_sessions',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['session_token'] },
      { fields: ['refresh_token'] },
      { fields: ['expires_at'] },
      { fields: ['is_active'] },
    ],
  }
);

export default UserSession;