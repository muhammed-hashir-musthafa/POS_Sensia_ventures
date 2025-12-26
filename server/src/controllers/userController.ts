import { Request, Response } from 'express';
import { User, Role, Permission, UserRole, UserPermission } from '../models/index.js';
import { AuthorizationService } from '../services/AuthorizationService.js';

interface AuthorizedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { where: { isActive: true } }
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
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

    const permissions = await AuthorizationService.getUserPermissions(user.id);

    res.json({
      ...user.toJSON(),
      permissions
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, roleIds = [] } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    // Assign roles if provided
    if (roleIds.length > 0) {
      const userRoles = roleIds.map((roleId: number) => ({
        userId: user.id,
        roleId,
        assignedBy: (req as AuthorizedRequest).user!.id
      }));
      await UserRole.bulkCreate(userRoles);
    }

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, isActive, roleIds } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ name, email, isActive });

    // Update roles if provided
    if (roleIds !== undefined) {
      // Deactivate existing roles
      await UserRole.update(
        { isActive: false },
        { where: { userId: user.id, isActive: true } }
      );

      // Add new roles
      if (roleIds.length > 0) {
        const userRoles = roleIds.map((roleId: number) => ({
          userId: user.id,
          roleId,
          assignedBy: (req as AuthorizedRequest).user!.id
        }));
        await UserRole.bulkCreate(userRoles);
      }
    }

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete by deactivating
    await user.update({ isActive: false });
    res.json({ message: 'User deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const assignUserPermissions = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { userId, permissionIds, expiresAt } = req.body;

    // Remove existing permissions
    await UserPermission.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );

    // Add new permissions
    if (permissionIds.length > 0) {
      const userPermissions = permissionIds.map((permissionId: number) => ({
        userId,
        permissionId,
        grantType: 'grant' as const,
        grantedBy: req.user!.id,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      }));
      await UserPermission.bulkCreate(userPermissions);
    }

    res.json({ message: 'User permissions updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};