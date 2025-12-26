import { PaymentTransaction, Order } from '../models/index.js';
import { sequelize } from '../config/db.js';

export class PaymentService {
  static async processPayment(orderId: number, payments: Array<{
    paymentMethod: string;
    amount: number;
    referenceNumber?: string;
  }>) {
    const transaction = await sequelize.transaction();
    
    try {
      const order = await Order.findByPk(orderId);
      if (!order) throw new Error('Order not found');

      const totalPaymentAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      
      if (totalPaymentAmount !== parseFloat(order.totalAmount.toString())) {
        throw new Error('Payment amount does not match order total');
      }

      const paymentTransactions = [];
      for (const payment of payments) {
        const paymentTransaction = await PaymentTransaction.create({
          orderId,
          paymentMethod: payment.paymentMethod,
          amount: payment.amount,
          referenceNumber: payment.referenceNumber,
          status: 'completed',
        }, { transaction });
        
        paymentTransactions.push(paymentTransaction);
      }

      await order.update({
        paymentStatus: 'paid',
        status: 'completed'
      }, { transaction });

      await transaction.commit();
      return paymentTransactions;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async refundPayment(orderId: number, amount?: number) {
    const transaction = await sequelize.transaction();
    
    try {
      const order = await Order.findByPk(orderId, {
        include: [{ model: PaymentTransaction, as: 'payments' }]
      });
      
      if (!order) throw new Error('Order not found');

      const refundAmount = amount || parseFloat(order.totalAmount.toString());
      
      const refundTransaction = await PaymentTransaction.create({
        orderId,
        paymentMethod: 'refund',
        amount: -refundAmount,
        status: 'completed',
      }, { transaction });

      await order.update({
        paymentStatus: 'refunded',
        status: 'refunded'
      }, { transaction });

      await transaction.commit();
      return refundTransaction;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getPaymentHistory(orderId: number) {
    return PaymentTransaction.findAll({
      where: { orderId },
      order: [['processedAt', 'DESC']]
    });
  }
}