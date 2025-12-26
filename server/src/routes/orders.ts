import { Router } from 'express';
import { body } from 'express-validator';
import { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrder, 
  deleteOrder 
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorization.js';

const router = Router();

router.get('/', authenticateToken, requirePermission('orders', 'view'), getOrders);
router.get('/:id', authenticateToken, requirePermission('orders', 'view'), getOrder);

router.post('/', [
  authenticateToken,
  requirePermission('orders', 'create'),
  body('clientId').isInt().withMessage('Client ID must be an integer'),
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.productId').isInt().withMessage('Product ID must be an integer'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
], createOrder);

router.patch('/:id', [
  authenticateToken,
  requirePermission('orders', 'update')
], updateOrder);

router.delete('/:id', [
  authenticateToken,
  requirePermission('orders', 'delete')
], deleteOrder);

export default router;