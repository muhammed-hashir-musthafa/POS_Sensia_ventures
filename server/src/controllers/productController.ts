import { Request, Response } from 'express';
import { Product } from '../models/index.js';
import { AuditService } from '../services/AuditService.js';

interface AuthRequest extends Request {
  user?: any;
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, costPrice, stock, minStockLevel, taxRate, categoryId, sku, barcode } = req.body;
    const userId = req.user?.id;
    
    // Generate SKU if not provided
    const productSku = sku || `PRD-${Date.now()}`;
    
    const product = await Product.create({ 
      name, 
      description, 
      price: parseFloat(price), 
      costPrice: parseFloat(costPrice || price), 
      stock: parseInt(stock || 0), 
      minStockLevel: parseInt(minStockLevel || 0),
      taxRate: parseFloat(taxRate || 0),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      sku: productSku,
      barcode,
      isActive: true
    });

    // Log the action
    await AuditService.logAction(
      userId,
      'create',
      'product',
      product.id,
      null,
      product.toJSON(),
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json(product);
  } catch (error: any) {
    await AuditService.logError(
      req.user?.id,
      'create',
      'product',
      error.message,
      req.ip,
      req.get('User-Agent')
    );
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, costPrice, stock, minStockLevel, taxRate, categoryId, sku, barcode } = req.body;
    const userId = req.user?.id;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const oldValues = product.toJSON();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (costPrice !== undefined) updateData.costPrice = parseFloat(costPrice);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (minStockLevel !== undefined) updateData.minStockLevel = parseInt(minStockLevel);
    if (taxRate !== undefined) updateData.taxRate = parseFloat(taxRate);
    if (categoryId !== undefined) updateData.categoryId = categoryId ? parseInt(categoryId) : undefined;
    if (sku !== undefined) updateData.sku = sku;
    if (barcode !== undefined) updateData.barcode = barcode;

    await product.update(updateData);
    
    // Log the action
    await AuditService.logAction(
      userId,
      'update',
      'product',
      product.id,
      oldValues,
      product.toJSON(),
      req.ip,
      req.get('User-Agent')
    );

    res.json(product);
  } catch (error: any) {
    await AuditService.logError(
      req.user?.id,
      'update',
      'product',
      error.message,
      req.ip,
      req.get('User-Agent')
    );
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productData = product.toJSON();
    await product.destroy();
    
    // Log the action
    await AuditService.logAction(
      userId,
      'delete',
      'product',
      parseInt(id),
      productData,
      null,
      req.ip,
      req.get('User-Agent')
    );

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    await AuditService.logError(
      req.user?.id,
      'delete',
      'product',
      error.message,
      req.ip,
      req.get('User-Agent')
    );
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};