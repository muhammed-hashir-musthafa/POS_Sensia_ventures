import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';

export interface OrderAttributes {
  id: number;
  orderNumber: string;
  clientId: number;
  cashierId?: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  orderType: 'sale' | 'return' | 'exchange';
  notes?: string;
  commentId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNumber!: string;
  public clientId!: number;
  public cashierId?: number;
  public subtotal!: number;
  public discountAmount!: number;
  public taxAmount!: number;
  public totalAmount!: number;
  public status!: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  public paymentStatus!: 'pending' | 'partial' | 'paid' | 'refunded';
  public orderType!: 'sale' | 'return' | 'exchange';
  public notes?: string;
  public commentId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      field: 'order_number',
      allowNull: false,
      unique: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'client_id',
      references: {
        model: 'clients',
        key: 'id',
      },
    },
    cashierId: {
      type: DataTypes.INTEGER,
      field: 'cashier_id',
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'payment_status',
    },
    orderType: {
      type: DataTypes.ENUM('sale', 'return', 'exchange'),
      allowNull: false,
      defaultValue: 'sale',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
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
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    indexes: [
      { fields: ['order_number'] },
      { fields: ['client_id'] },
      { fields: ['cashier_id'] },
      { fields: ['status'] },
      { fields: ['payment_status'] },
      { fields: ['created_at'] },
    ],
    hooks: {
      beforeCreate: async (order: Order) => {
        if (!order.orderNumber) {
          const timestamp = Date.now().toString();
          order.orderNumber = `ORD-${timestamp.slice(-8)}`;
        }
      },
    },
  }
);

export default Order;