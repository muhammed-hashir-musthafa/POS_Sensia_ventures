import { sequelize } from '../config/db.js';
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Client from './Client.js';
import Comment from './Comment.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import PaymentTransaction from './PaymentTransaction.js';
import StockMovement from './StockMovement.js';
import Role from './Role.js';
import Permission from './Permission.js';
import UserRole from './UserRole.js';
import RolePermission from './RolePermission.js';
import UserPermission from './UserPermission.js';
import AuditLog from './AuditLog.js';
import UserSession from './UserSession.js';

// User - Role associations (many-to-many)
User.belongsToMany(Role, { 
  through: UserRole, 
  foreignKey: 'userId', 
  otherKey: 'roleId',
  as: 'roles' 
});
Role.belongsToMany(User, { 
  through: UserRole, 
  foreignKey: 'roleId', 
  otherKey: 'userId',
  as: 'users' 
});

// Role - Permission associations (many-to-many)
Role.belongsToMany(Permission, { 
  through: RolePermission, 
  foreignKey: 'roleId', 
  otherKey: 'permissionId',
  as: 'permissions' 
});
Permission.belongsToMany(Role, { 
  through: RolePermission, 
  foreignKey: 'permissionId', 
  otherKey: 'roleId',
  as: 'roles' 
});

// User - Permission associations (many-to-many)
User.belongsToMany(Permission, { 
  through: UserPermission, 
  foreignKey: 'userId', 
  otherKey: 'permissionId',
  as: 'directPermissions' 
});
Permission.belongsToMany(User, { 
  through: UserPermission, 
  foreignKey: 'permissionId', 
  otherKey: 'userId',
  as: 'users' 
});

// Product - Category associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Order - Client associations
Order.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Order, { foreignKey: 'clientId', as: 'orders' });

// Order - User (Cashier) associations
Order.belongsTo(User, { foreignKey: 'cashierId', as: 'cashier' });
User.hasMany(Order, { foreignKey: 'cashierId', as: 'orders' });

// Order - OrderItem associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product - OrderItem associations
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order - PaymentTransaction associations
Order.hasMany(PaymentTransaction, { foreignKey: 'orderId', as: 'payments' });
PaymentTransaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product - StockMovement associations
Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'stockMovements' });
StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User - StockMovement associations
User.hasMany(StockMovement, { foreignKey: 'userId', as: 'stockMovements' });
StockMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// StockMovement - Comment associations
StockMovement.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });
Comment.hasMany(StockMovement, { foreignKey: 'commentId', as: 'stockMovements' });

// Order - Comment associations
Order.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });
Comment.hasMany(Order, { foreignKey: 'commentId', as: 'orders' });

// User - Comment associations
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Session associations
User.hasMany(UserSession, { foreignKey: 'userId', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - AuditLog associations
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Category,
  Product,
  Client,
  Comment,
  Order,
  OrderItem,
  PaymentTransaction,
  StockMovement,
  Role,
  Permission,
  UserRole,
  RolePermission,
  UserPermission,
  AuditLog,
  UserSession,
};