import { Request, Response } from 'express';
import { User, Permission, UserPermission, Role, RolePermission } from '../models/index.js';
import { AuthorizationService } from '../services/AuthorizationService.js';

interface AuthorizedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const getUserPermissions = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user: any = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { where: { isActive: true } },
          include: [{
            model: Permission,
            as: 'permissions',
            through: { where: { isActive: true } }
          }]
        },
        {
          model: Permission,
          as: 'directPermissions',
          through: { 
            where: { isActive: true },
            attributes: ['grantType', 'grantedBy', 'grantedAt', 'expiresAt']
          }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const rolePermissions = user.roles?.flatMap((role: any) => 
      role.permissions?.map((perm: any) => ({
        id: perm.id,
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        source: 'role',
        roleName: role.name
      })) || []
    ) || [];

    const directPermissions = user.directPermissions?.map((perm: any) => ({
      id: perm.id,
      name: perm.name,
      resource: perm.resource,
      action: perm.action,
      source: 'direct',
      grantType: perm.UserPermission?.grantType,
      grantedBy: perm.UserPermission?.grantedBy,
      grantedAt: perm.UserPermission?.grantedAt,
      expiresAt: perm.UserPermission?.expiresAt
    })) || [];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      rolePermissions,
      directPermissions
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const grantUserPermission = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { userId, permissionId, expiresAt } = req.body;
    
    const permission = await UserPermission.create({
      userId,
      permissionId,
      grantType: 'grant',
      grantedBy: req.user!.id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    res.status(201).json({
      message: 'Permission granted successfully',
      permission
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const revokeUserPermission = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { userId, permissionId } = req.body;
    
    await UserPermission.update(
      { isActive: false },
      { 
        where: { 
          userId, 
          permissionId,
          isActive: true 
        } 
      }
    );

    res.json({ message: 'Permission revoked successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await Permission.findAll({
      where: { isActive: true },
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });

    const groupedPermissions = permissions.reduce((acc: Record<string, any[]>, perm: any) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push({
        id: perm.id,
        name: perm.name,
        action: perm.action,
        description: perm.description
      });
      return acc;
    }, {} as Record<string, any[]>);

    res.json(groupedPermissions);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const checkUserPermission = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { userId, resource, action } = req.query;
    
    const hasPermission = await AuthorizationService.hasPermission(
      Number(userId),
      resource as string,
      action as string
    );

    res.json({ hasPermission });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};