import { Router } from 'express';
import { body } from 'express-validator';
import { 
  getClients, 
  getClient, 
  createClient, 
  updateClient, 
  deleteClient 
} from '../controllers/clientController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorization.js';

const router = Router();

router.get('/', authenticateToken, requirePermission('clients', 'view'), getClients);
router.get('/:id', authenticateToken, requirePermission('clients', 'view'), getClient);

router.post('/', [
  authenticateToken,
  requirePermission('clients', 'create'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
], createClient);

router.patch('/:id', [
  authenticateToken,
  requirePermission('clients', 'update'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
], updateClient);

router.delete('/:id', [
  authenticateToken,
  requirePermission('clients', 'delete')
], deleteClient);

export default router;