import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db.js";

export interface ClientAttributes {
  id: number;
  customerCode: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  customerType: "regular" | "vip" | "wholesale";
  loyaltyPoints: number;
  creditLimit: number;
  isActive: boolean;
  lastVisitDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientCreationAttributes
  extends Optional<ClientAttributes, "id" | "createdAt" | "updatedAt"> {}

class Client
  extends Model<ClientAttributes, ClientCreationAttributes>
  implements ClientAttributes
{
  public id!: number;
  public customerCode!: string;
  public name!: string;
  public email!: string;
  public phone?: string;
  public address?: string;
  public customerType!: "regular" | "vip" | "wholesale";
  public loyaltyPoints!: number;
  public creditLimit!: number;
  public isActive!: boolean;
  public lastVisitDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "customer_code",
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customerType: {
      type: DataTypes.ENUM("regular", "vip", "wholesale"),
      allowNull: false,
      defaultValue: "regular",
      field: "customer_type",
    },
    loyaltyPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    creditLimit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
    lastVisitDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: "Client",
    tableName: "clients",
    indexes: [
      { fields: ["customer_code"] },
      { fields: ["email"] },
      { fields: ["customer_type"] },
      { fields: ["is_active"] },
    ],
  }
);

export default Client;
