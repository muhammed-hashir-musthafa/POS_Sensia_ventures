import { Resource, Action, User } from '@/types';

export class PermissionManager {
  private static permissions: Set<string> = new Set();
  private static user: User | null = null;

  static setUser(user: User | null) {
    this.user = user;
    this.permissions = new Set(user?.permissions || []);
  }

  static hasPermission(resource: Resource, action: Action): boolean {
    if (!this.user) return false;
    if (this.user.role === 'admin') return true;
    return this.permissions.has(`${resource}:${action}`);
  }

  static hasAnyPermission(checks: Array<{ resource: Resource; action: Action }>): boolean {
    return checks.some(({ resource, action }) => this.hasPermission(resource, action));
  }

  static hasAllPermissions(checks: Array<{ resource: Resource; action: Action }>): boolean {
    return checks.every(({ resource, action }) => this.hasPermission(resource, action));
  }

  static canView(resource: Resource): boolean {
    return this.hasPermission(resource, 'view');
  }

  static canCreate(resource: Resource): boolean {
    return this.hasPermission(resource, 'create');
  }

  static canUpdate(resource: Resource): boolean {
    return this.hasPermission(resource, 'update');
  }

  static canDelete(resource: Resource): boolean {
    return this.hasPermission(resource, 'delete');
  }

  static getPermissions(): string[] {
    return Array.from(this.permissions);
  }

  static isAdmin(): boolean {
    return this.user?.role === 'admin';
  }
}

// Permission constants for easy reference
export const PERMISSIONS = {
  PRODUCTS: {
    VIEW: { resource: 'products' as Resource, action: 'view' as Action },
    CREATE: { resource: 'products' as Resource, action: 'create' as Action },
    UPDATE: { resource: 'products' as Resource, action: 'update' as Action },
    DELETE: { resource: 'products' as Resource, action: 'delete' as Action },
  },
  CLIENTS: {
    VIEW: { resource: 'clients' as Resource, action: 'view' as Action },
    CREATE: { resource: 'clients' as Resource, action: 'create' as Action },
    UPDATE: { resource: 'clients' as Resource, action: 'update' as Action },
    DELETE: { resource: 'clients' as Resource, action: 'delete' as Action },
  },
  ORDERS: {
    VIEW: { resource: 'orders' as Resource, action: 'view' as Action },
    CREATE: { resource: 'orders' as Resource, action: 'create' as Action },
    UPDATE: { resource: 'orders' as Resource, action: 'update' as Action },
    DELETE: { resource: 'orders' as Resource, action: 'delete' as Action },
    CANCEL: { resource: 'orders' as Resource, action: 'cancel' as Action },
  },
  COMMENTS: {
    VIEW: { resource: 'comments' as Resource, action: 'view' as Action },
    CREATE: { resource: 'comments' as Resource, action: 'create' as Action },
    UPDATE: { resource: 'comments' as Resource, action: 'update' as Action },
    DELETE: { resource: 'comments' as Resource, action: 'delete' as Action },
  },
  PAYMENTS: {
    PROCESS: { resource: 'payments' as Resource, action: 'process' as Action },
    REFUND: { resource: 'payments' as Resource, action: 'refund' as Action },
  },
  USERS: {
    VIEW: { resource: 'users' as Resource, action: 'view' as Action },
    CREATE: { resource: 'users' as Resource, action: 'create' as Action },
    UPDATE: { resource: 'users' as Resource, action: 'update' as Action },
    DELETE: { resource: 'users' as Resource, action: 'delete' as Action },
    PERMISSIONS: { resource: 'users' as Resource, action: 'permissions' as Action },
  },
} as const;