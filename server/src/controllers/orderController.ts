import { Request, Response } from "express";
import { Order, OrderItem, Client, Product, PaymentTransaction } from "../models/index.js";
import { sequelize } from "../config/db.js";
import { PaymentService } from "../services/PaymentService.js";
import { AuditService } from "../services/AuditService.js";

interface AuthRequest extends Request {
  user?: any;
}

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Client, as: "client" },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: PaymentTransaction, as: "payments" },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: Client, as: "client" },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: PaymentTransaction, as: "payments" },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      clientId,
      items,
      discountAmount = 0,
      payments,
      notes,
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Product with id ${item.productId} not found` });
      }
      
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      const itemTotal = parseFloat(product.price.toString()) * item.quantity;
      subtotal += itemTotal;
      taxAmount += (itemTotal * parseFloat(product.taxRate.toString())) / 100;
    }

    const totalAmount = subtotal + taxAmount - discountAmount;

    // Create order
    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      clientId,
      cashierId: req.user?.id,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      orderType: 'sale',
      notes,
    }, { transaction });

    // Create order items
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product!.price,
      }, { transaction });
    }

    await transaction.commit();

    // Log the action
    await AuditService.logAction(
      req.user?.id,
      'create',
      'order',
      order.id,
      null,
      { orderId: order.id, clientId, items, totalAmount },
      req.ip,
      req.get('User-Agent')
    );

    // Process payments if provided
    if (payments && payments.length > 0) {
      await PaymentService.processPayment(order.id, payments);
    }

    const createdOrder = await Order.findByPk(order.id, {
      include: [
        { model: Client, as: "client" },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: PaymentTransaction, as: "payments" },
      ],
    });

    res.status(201).json(createdOrder);
  } catch (error: any) {
    await transaction.rollback();
    await AuditService.logError(
      req.user?.id,
      'create',
      'order',
      error.message,
      req.ip,
      req.get('User-Agent')
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.update({ status, notes });

    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Client, as: "client" },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: PaymentTransaction, as: "payments" },
      ],
    });

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.destroy();
    res.json({ message: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
