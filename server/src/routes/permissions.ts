import { Router } from 'express';
import { 
  getUserPermissions, 
  grantUserPermission, 
  revokeUserPermission, 
  getAllPermissions,
  checkUserPermission 
} from '../controllers/permissionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorization.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all available permissions (for admin UI)
router.get('/', requirePermission('users', 'permissions'), getAllPermissions);

// Get user's permissions
router.get('/user/:userId', requirePermission('users', 'view'), getUserPermissions);

// Grant permission to user
router.post('/grant', requirePermission('users', 'permissions'), grantUserPermission);

// Revoke permission from user
router.post('/revoke', requirePermission('users', 'permissions'), revokeUserPermission);

// Check if user has specific permission
router.get('/check', requirePermission('users', 'view'), checkUserPermission);

export default router;