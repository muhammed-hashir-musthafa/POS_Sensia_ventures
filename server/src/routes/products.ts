import { Router } from 'express';
import { body } from 'express-validator';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorization.js';

const router = Router();

router.get('/', authenticateToken, requirePermission('products', 'view'), getProducts);
router.get('/:id', authenticateToken, requirePermission('products', 'view'), getProduct);

router.post('/', [
  authenticateToken,
  requirePermission('products', 'create'),
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], createProduct);

router.patch('/:id', [
  authenticateToken,
  requirePermission('products', 'update'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], updateProduct);

router.delete('/:id', [
  authenticateToken,
  requirePermission('products', 'delete')
], deleteProduct);

export default router;