import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';

export interface PaymentTransactionAttributes {
  id: number;
  orderId: number;
  paymentMethod: string;
  amount: number;
  referenceNumber?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransactionCreationAttributes extends Optional<PaymentTransactionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PaymentTransaction extends Model<PaymentTransactionAttributes, PaymentTransactionCreationAttributes> implements PaymentTransactionAttributes {
  public id!: number;
  public orderId!: number;
  public paymentMethod!: string;
  public amount!: number;
  public referenceNumber?: string;
  public status!: 'pending' | 'completed' | 'failed' | 'refunded';
  public processedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'digital_wallet'),
      allowNull: false,
      field: 'payment_method',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'completed',
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'processed_at',
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'PaymentTransaction',
    tableName: 'payment_transactions',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['payment_method'] },
      { fields: ['status'] },
      { fields: ['processed_at'] },
    ],
  }
);

export default PaymentTransaction;