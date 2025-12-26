import { StockMovement, Product } from '../models/index.js';
import { sequelize } from '../config/db.js';

export class StockService {
  static async addStock(productId: number, quantity: number, userId?: number, notes?: string) {
    const movement = await StockMovement.create({
      productId,
      movementType: 'in',
      quantity,
      referenceType: 'manual',
      notes,
      userId,
    });

    await Product.increment('stock', { by: quantity, where: { id: productId } });
    return movement;
  }

  static async adjustStock(productId: number, newQuantity: number, userId?: number, notes?: string) {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error('Product not found');

    const difference = newQuantity - product.stock;
    
    const movement = await StockMovement.create({
      productId,
      movementType: 'adjustment',
      quantity: difference,
      referenceType: 'adjustment',
      notes,
      userId,
    });

    await product.update({ stock: newQuantity });
    return movement;
  }

  static async getStockHistory(productId: number) {
    return StockMovement.findAll({
      where: { productId },
      order: [['createdAt', 'DESC']],
      include: [
        { model: Product, as: 'product', attributes: ['name', 'sku'] }
      ]
    });
  }

  static async getLowStockProducts() {
    return Product.findAll({
      where: {
        isActive: true,
      },
      having: sequelize.literal('stock <= min_stock_level'),
      order: [['stock', 'ASC']]
    });
  }
}