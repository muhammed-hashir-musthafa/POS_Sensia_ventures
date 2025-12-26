import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorization.js';

const router = Router();

// Register endpoint - Admin only
router.post('/register', [
  authenticateToken,
  requirePermission('users', 'create'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

// Login endpoint - Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

export default router;