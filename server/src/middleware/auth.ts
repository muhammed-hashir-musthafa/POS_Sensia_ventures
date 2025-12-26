import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { config } from '../config/env.js';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Keep the old authenticate for backward compatibility
export const authenticate = authenticateToken;

export const authorize = (resource: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Simple role-based check (will be replaced by permission system)
    if (user.role === 'admin' || user.role === 'super_admin') {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient permissions.' });
  };
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  next();
};