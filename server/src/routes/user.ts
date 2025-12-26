import { Router } from "express";
import { body } from 'express-validator';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  assignUserPermissions
} from "../controllers/userController.js";
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/authorization.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get("/", requirePermission('users', 'view'), getUsers);
router.get("/:id", requirePermission('users', 'view'), getUser);

router.post("/", [
  requirePermission('users', 'create'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], createUser);

router.put("/:id", [
  requirePermission('users', 'update'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
], updateUser);

router.delete("/:id", requirePermission('users', 'delete'), deleteUser);

// Permission assignment
router.post("/permissions", [
  requirePermission('users', 'permissions'),
  body('userId').isInt().withMessage('User ID is required'),
  body('permissionIds').isArray().withMessage('Permission IDs must be an array')
], assignUserPermissions);

export default router;
