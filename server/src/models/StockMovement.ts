import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';

export interface StockMovementAttributes {
  id: number;
  productId: number;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  referenceType?: string;
  referenceId?: number;
  notes?: string;
  userId?: number;
  commentId?: number;
  createdAt: Date;
}

export interface StockMovementCreationAttributes extends Optional<StockMovementAttributes, 'id' | 'createdAt'> {}

class StockMovement extends Model<StockMovementAttributes, StockMovementCreationAttributes> implements StockMovementAttributes {
  public id!: number;
  public productId!: number;
  public movementType!: 'in' | 'out' | 'adjustment';
  public quantity!: number;
  public referenceType?: string;
  public referenceId?: number;
  public notes?: string;
  public userId?: number;
  public commentId?: number;
  public readonly createdAt!: Date;
}

StockMovement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      field: 'product_id',
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    movementType: {
      field: 'movement_type',
      type: DataTypes.ENUM('in', 'out', 'adjustment'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referenceType: {
      field: 'reference_type',
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    referenceId: {
      field: 'reference_id',
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
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
  },
  {
    sequelize,
    modelName: 'StockMovement',
    tableName: 'stock_movements',
    timestamps: false,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['movement_type'] },
      { fields: ['created_at'] },
      { fields: ['reference_type', 'reference_id'] },
    ],
  }
);

export default StockMovement;