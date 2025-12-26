import {
  User,
  Role,
  Permission,
} from "../models/index.js";

export class AuthorizationService {
  /**
   * Check if user has permission for a specific resource and action
   */
  static async hasPermission(
    userId: number,
    resource: string,
    action: string,
    context?: any
  ): Promise<boolean> {
    try {
      // Check if user exists and is active
      const user = await User.findByPk(userId);
      if (!user || !user.isActive) return false;

      // Get user with roles and permissions
      const userWithPerms: any = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "roles",
            through: {
              where: { isActive: true },
              attributes: [],
            },
            include: [
              {
                model: Permission,
                as: "permissions",
                through: {
                  where: { isActive: true },
                  attributes: [],
                },
              },
            ],
          },
          {
            model: Permission,
            as: "directPermissions",
            through: {
              where: { isActive: true },
              attributes: ["grantType", "conditions", "expiresAt"],
            },
          },
        ],
      });

      if (!userWithPerms) return false;

      // Check direct user permissions first (highest priority)
      if (userWithPerms.directPermissions) {
        for (const permission of userWithPerms.directPermissions) {
          if (
            permission.resource === resource &&
            permission.action === action
          ) {
            const userPerm = permission.UserPermission;

            // Check expiration
            if (userPerm?.expiresAt && new Date() > userPerm.expiresAt)
              continue;

            // Check conditions if any
            if (
              userPerm?.conditions &&
              !this.evaluateConditions(userPerm.conditions, context)
            )
              continue;

            // Return based on grant type
            return userPerm?.grantType === "grant";
          }
        }
      }

      // Check role-based permissions
      if (userWithPerms.roles) {
        for (const role of userWithPerms.roles) {
          if (!role.isActive) continue;

          if (role.permissions) {
            for (const permission of role.permissions) {
              if (
                permission.resource === resource &&
                permission.action === action
              ) {
                const rolePerm = permission.RolePermission;

                // Check conditions if any
                if (
                  rolePerm?.conditions &&
                  !this.evaluateConditions(rolePerm.conditions, context)
                )
                  continue;

                return true;
              }
            }
          }
        }
      }

      return false;
    } catch (error) {
      console.error("Authorization check failed:", error);
      return false;
    }
  }

  // Get all permissions for a user

  static async getUserPermissions(userId: number): Promise<string[]> {
    try {
      const permissions = new Set<string>();

      const user: any = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "roles",
            through: { where: { isActive: true } },
            include: [
              {
                model: Permission,
                as: "permissions",
                through: { where: { isActive: true } },
              },
            ],
          },
          {
            model: Permission,
            as: "directPermissions",
            through: {
              where: { isActive: true, grantType: "grant" },
            },
          },
        ],
      });

      if (!user) return [];

      // Add role permissions
      if (user.roles) {
        user.roles.forEach((role: any) => {
          if (role.permissions) {
            role.permissions.forEach((perm: any) => {
              permissions.add(`${perm.resource}:${perm.action}`);
            });
          }
        });
      }

      // Add direct permissions
      if (user.directPermissions) {
        user.directPermissions.forEach((perm: any) => {
          permissions.add(`${perm.resource}:${perm.action}`);
        });
      }

      return Array.from(permissions);
    } catch (error) {
      console.error("Get user permissions failed:", error);
      return [];
    }
  }

  /**
   * Check multiple permissions at once
   */
  static async hasAnyPermission(
    userId: number,
    permissions: Array<{ resource: string; action: string }>
  ): Promise<boolean> {
    for (const perm of permissions) {
      if (await this.hasPermission(userId, perm.resource, perm.action)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all specified permissions
   */
  static async hasAllPermissions(
    userId: number,
    permissions: Array<{ resource: string; action: string }>
  ): Promise<boolean> {
    for (const perm of permissions) {
      if (!(await this.hasPermission(userId, perm.resource, perm.action))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate permission conditions
   */
  private static evaluateConditions(conditions: any, context: any): boolean {
    if (!conditions || !context) return true;

    // Simple condition evaluation - can be extended
    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) return false;
    }

    return true;
  }

  /**
   * Get user's highest role level
   */
  static async getUserRoleLevel(userId: number): Promise<number> {
    try {
      const user: any = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "roles",
            through: { where: { isActive: true } },
          },
        ],
      });

      if (!user || !user.roles) return 0;

      return Math.max(...user.roles.map((role: any) => role.level));
    } catch (error) {
      console.error("Get user role level failed:", error);
      return 0;
    }
  }
}
