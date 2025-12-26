import { Request, Response, NextFunction } from 'express';
import { AuthorizationService } from '../services/AuthorizationService.js';
import { AuditLog } from '../models/index.js';

interface AuthorizedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

/**
 * Middleware to check if user has required permission
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const hasPermission = await AuthorizationService.hasPermission(
        req.user.id,
        resource,
        action,
        {
          userId: req.user.id,
          resourceId: req.params.id,
          method: req.method,
          path: req.path
        }
      );

      if (!hasPermission) {
        // Log unauthorized access attempt
        await AuditLog.create({
          userId: req.user.id,
          action: `unauthorized_${action}`,
          resource,
          resourceId: req.params.id ? parseInt(req.params.id) : undefined,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          success: false,
          errorMessage: 'Insufficient permissions',
          metadata: {
            requiredPermission: `${resource}:${action}`,
            endpoint: `${req.method} ${req.path}`
          }
        });

        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: `${resource}:${action}`
        });
      }

      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 */
export const requireAnyPermission = (permissions: Array<{resource: string, action: string}>) => {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const hasPermission = await AuthorizationService.hasAnyPermission(
        req.user.id,
        permissions
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: permissions.map(p => `${p.resource}:${p.action}`)
        });
      }

      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

/**
 * Middleware to check role level
 */
export const requireRoleLevel = (minLevel: number) => {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userLevel = await AuthorizationService.getUserRoleLevel(req.user.id);

      if (userLevel < minLevel) {
        return res.status(403).json({ 
          message: 'Insufficient role level',
          required: minLevel,
          current: userLevel
        });
      }

      next();
    } catch (error) {
      console.error('Role level check error:', error);
      res.status(500).json({ message: 'Role level check failed' });
    }
  };
};

/**
 * Middleware to log all API access
 */
export const auditMiddleware = async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Store original res.json to intercept response
  const originalJson = res.json;
  let responseData: any;
  
  res.json = function(data: any) {
    responseData = data;
    return originalJson.call(this, data);
  };

  // Continue with request
  next();

  // Log after response
  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;

      await AuditLog.create({
        userId: req.user?.id,
        action: req.method.toLowerCase(),
        resource: req.route?.path || req.path,
        resourceId: req.params.id ? parseInt(req.params.id) : undefined,
        newValues: req.method !== 'GET' ? req.body : undefined,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        errorMessage: success ? undefined : responseData?.message,
        metadata: {
          statusCode: res.statusCode,
          duration,
          endpoint: `${req.method} ${req.path}`,
          query: req.query
        }
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  });
};