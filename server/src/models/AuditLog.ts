import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';

export interface AuditLogAttributes {
  id: number;
  userId?: number;
  action: string;
  resource: string;
  resourceId?: number;
  oldValues?: object;
  newValues?: object;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  metadata?: object;
}

export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'timestamp'> {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: number;
  public userId?: number;
  public action!: string;
  public resource!: string;
  public resourceId?: number;
  public oldValues?: object;
  public newValues?: object;
  public ipAddress?: string;
  public userAgent?: string;
  public sessionId?: string;
  public timestamp!: Date;
  public success!: boolean;
  public errorMessage?: string;
  public metadata?: object;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'resource_id',
    },
    oldValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'old_values',
    },
    newValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'new_values',
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
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'session_id',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['resource'] },
      { fields: ['resource_id'] },
      { fields: ['timestamp'] },
      { fields: ['success'] },
      { fields: ['resource', 'resource_id'] },
    ],
  }
);

export default AuditLog;