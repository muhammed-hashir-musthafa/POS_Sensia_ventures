import { Router } from 'express';
import { body } from 'express-validator';
import { 
  getComments, 
  getComment, 
  createComment, 
  updateComment, 
  deleteComment 
} from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorization.js';

const router = Router();

router.get('/', authenticateToken, requirePermission('comments', 'view'), getComments);
router.get('/:id', authenticateToken, requirePermission('comments', 'view'), getComment);

router.post('/', [
  authenticateToken,
  requirePermission('comments', 'create'),
  body('content').notEmpty().withMessage('Content is required')
], createComment);

router.patch('/:id', [
  authenticateToken,
  requirePermission('comments', 'update'),
  body('content').notEmpty().withMessage('Content is required')
], updateComment);

router.delete('/:id', authenticateToken, requirePermission('comments', 'delete'), deleteComment);

export default router;