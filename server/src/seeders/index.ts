import { User, Category, Product, Client, Comment, Role, Permission, UserRole, RolePermission } from '../models/index.js';

export const seedDatabase = async () => {
  try {
    // Create default roles (if not exists from migration)
    const roles = [
      { name: 'super_admin', description: 'Super Administrator with full system access', level: 100 },
      { name: 'admin', description: 'Administrator with management access', level: 80 },
      { name: 'manager', description: 'Manager with supervisory access', level: 60 },
      { name: 'supervisor', description: 'Supervisor with team oversight', level: 40 },
      { name: 'cashier', description: 'Cashier with POS operations', level: 20 },
    ];

    const createdRoles = [];
    for (const role of roles) {
      const [createdRole] = await Role.findOrCreate({
        where: { name: role.name },
        defaults: role
      });
      createdRoles.push(createdRole);
    }

    // Create comprehensive permissions for granular access control
    const permissions = [
      // Dashboard permissions
      { name: 'dashboard.view', resource: 'dashboard', action: 'view', description: 'View dashboard' },
      
      // Product permissions
      { name: 'products.view', resource: 'products', action: 'view', description: 'View products' },
      { name: 'products.create', resource: 'products', action: 'create', description: 'Create products' },
      { name: 'products.update', resource: 'products', action: 'update', description: 'Update products' },
      { name: 'products.delete', resource: 'products', action: 'delete', description: 'Delete products' },
      
      // Client permissions
      { name: 'clients.view', resource: 'clients', action: 'view', description: 'View clients' },
      { name: 'clients.create', resource: 'clients', action: 'create', description: 'Create clients' },
      { name: 'clients.update', resource: 'clients', action: 'update', description: 'Update clients' },
      { name: 'clients.delete', resource: 'clients', action: 'delete', description: 'Delete clients' },
      
      // Order permissions
      { name: 'orders.view', resource: 'orders', action: 'view', description: 'View orders' },
      { name: 'orders.create', resource: 'orders', action: 'create', description: 'Create orders for clients' },
      { name: 'orders.update', resource: 'orders', action: 'update', description: 'Update orders' },
      { name: 'orders.delete', resource: 'orders', action: 'delete', description: 'Delete orders' },
      { name: 'orders.cancel', resource: 'orders', action: 'cancel', description: 'Cancel orders' },
      
      // Comment permissions
      { name: 'comments.view', resource: 'comments', action: 'view', description: 'View comments' },
      { name: 'comments.create', resource: 'comments', action: 'create', description: 'Create comments' },
      { name: 'comments.update', resource: 'comments', action: 'update', description: 'Update comments' },
      { name: 'comments.delete', resource: 'comments', action: 'delete', description: 'Delete comments' },
      
      // User management permissions
      { name: 'users.view', resource: 'users', action: 'view', description: 'View users' },
      { name: 'users.create', resource: 'users', action: 'create', description: 'Create users' },
      { name: 'users.update', resource: 'users', action: 'update', description: 'Update users' },
      { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users' },
      { name: 'users.permissions', resource: 'users', action: 'permissions', description: 'Manage user permissions' },
      
      // Payment permissions
      { name: 'payments.process', resource: 'payments', action: 'process', description: 'Process payments' },
      { name: 'payments.refund', resource: 'payments', action: 'refund', description: 'Process refunds' },
      
      // Report permissions
      { name: 'reports.view', resource: 'reports', action: 'view', description: 'View reports' },
      { name: 'reports.export', resource: 'reports', action: 'export', description: 'Export reports' },
      
      // System permissions
      { name: 'system.settings', resource: 'system', action: 'settings', description: 'Manage system settings' },
      { name: 'system.audit', resource: 'system', action: 'audit', description: 'View audit logs' },
    ];

    const createdPermissions = [];
    for (const perm of permissions) {
      const [permission] = await Permission.findOrCreate({
        where: { name: perm.name },
        defaults: perm
      });
      createdPermissions.push(permission);
    }

    // Create super admin user
    const [superAdmin] = await User.findOrCreate({
      where: { email: 'superadmin@example.com' },
      defaults: {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: 'superadmin123'
      }
    });

    // Create admin user
    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123'
      }
    });

    // Create manager user
    const [managerUser] = await User.findOrCreate({
      where: { email: 'manager@example.com' },
      defaults: {
        name: 'Manager User',
        email: 'manager@example.com',
        password: 'manager123'
      }
    });

    // Create supervisor user
    const [supervisorUser] = await User.findOrCreate({
      where: { email: 'supervisor@example.com' },
      defaults: {
        name: 'Supervisor User',
        email: 'supervisor@example.com',
        password: 'supervisor123'
      }
    });

    // Create cashier user
    const [cashierUser] = await User.findOrCreate({
      where: { email: 'cashier@example.com' },
      defaults: {
        name: 'Cashier User',
        email: 'cashier@example.com',
        password: 'cashier123'
      }
    });

    // Assign roles to users
    await UserRole.findOrCreate({
      where: { userId: superAdmin.id, roleId: createdRoles[0].id },
      defaults: { userId: superAdmin.id, roleId: createdRoles[0].id, assignedBy: superAdmin.id }
    });

    await UserRole.findOrCreate({
      where: { userId: adminUser.id, roleId: createdRoles[1].id },
      defaults: { userId: adminUser.id, roleId: createdRoles[1].id, assignedBy: superAdmin.id }
    });

    await UserRole.findOrCreate({
      where: { userId: managerUser.id, roleId: createdRoles[2].id },
      defaults: { userId: managerUser.id, roleId: createdRoles[2].id, assignedBy: superAdmin.id }
    });

    await UserRole.findOrCreate({
      where: { userId: supervisorUser.id, roleId: createdRoles[3].id },
      defaults: { userId: supervisorUser.id, roleId: createdRoles[3].id, assignedBy: superAdmin.id }
    });

    await UserRole.findOrCreate({
      where: { userId: cashierUser.id, roleId: createdRoles[4].id },
      defaults: { userId: cashierUser.id, roleId: createdRoles[4].id, assignedBy: superAdmin.id }
    });

    // Assign permissions to roles
    const superAdminRole = createdRoles[0];

    // Super admin gets all permissions
    for (const permission of createdPermissions) {
      await RolePermission.findOrCreate({
        where: { roleId: superAdminRole.id, permissionId: permission.id },
        defaults: { roleId: superAdminRole.id, permissionId: permission.id, grantedBy: superAdmin.id }
      });
    }

    // Admin gets most permissions (excluding system-level)
    const adminPermissions = createdPermissions.filter(p => 
      !p.name.startsWith('system.') && !p.name.includes('users.delete')
    );
    
    for (const permission of adminPermissions) {
      await RolePermission.findOrCreate({
        where: { roleId: createdRoles[1].id, permissionId: permission.id },
        defaults: { roleId: createdRoles[1].id, permissionId: permission.id, grantedBy: superAdmin.id }
      });
    }

    // Manager gets operational permissions
    const managerPermissions = createdPermissions.filter(p => 
      ['dashboard.view', 'products.view', 'products.update', 'clients.view', 'clients.update', 
       'orders.view', 'orders.create', 'orders.update', 'comments.view', 'comments.create', 
       'payments.process', 'reports.view'].includes(p.name)
    );
    
    for (const permission of managerPermissions) {
      await RolePermission.findOrCreate({
        where: { roleId: createdRoles[2].id, permissionId: permission.id },
        defaults: { roleId: createdRoles[2].id, permissionId: permission.id, grantedBy: superAdmin.id }
      });
    }

    // Supervisor gets limited permissions
    const supervisorPermissions = createdPermissions.filter(p => 
      ['dashboard.view', 'products.view', 'clients.view', 'orders.view', 
       'orders.create', 'comments.view', 'payments.process'].includes(p.name)
    );
    
    for (const permission of supervisorPermissions) {
      await RolePermission.findOrCreate({
        where: { roleId: createdRoles[3].id, permissionId: permission.id },
        defaults: { roleId: createdRoles[3].id, permissionId: permission.id, grantedBy: superAdmin.id }
      });
    }

    // Cashier gets basic permissions
    const cashierPermissions = createdPermissions.filter(p => 
      ['dashboard.view', 'products.view', 'clients.view', 'orders.view', 
       'orders.create', 'payments.process'].includes(p.name)
    );
    
    for (const permission of cashierPermissions) {
      await RolePermission.findOrCreate({
        where: { roleId: createdRoles[4].id, permissionId: permission.id },
        defaults: { roleId: createdRoles[4].id, permissionId: permission.id, grantedBy: superAdmin.id }
      });
    }

    // Create default categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and accessories', isActive: true },
      { name: 'Clothing', description: 'Apparel and fashion items', isActive: true },
      { name: 'Food & Beverages', description: 'Food and drink items', isActive: true },
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const [category] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
      createdCategories.push(category);
    }

    // Create sample products
    const sampleProducts = [
      {
        sku: 'ELEC001',
        barcode: '1234567890123',
        name: 'Smartphone',
        description: 'Latest model smartphone',
        categoryId: createdCategories[0].id,
        price: 599.99,
        costPrice: 400.00,
        stock: 50,
        minStockLevel: 10,
        taxRate: 10.00,
        isActive: true
      },
      {
        sku: 'CLOTH001',
        barcode: '2345678901234',
        name: 'T-Shirt',
        description: 'Cotton t-shirt',
        categoryId: createdCategories[1].id,
        price: 19.99,
        costPrice: 12.00,
        stock: 100,
        minStockLevel: 20,
        taxRate: 5.00,
        isActive: true
      }
    ];

    for (const product of sampleProducts) {
      await Product.findOrCreate({
        where: { sku: product.sku },
        defaults: product
      });
    }

    // Create sample clients
    const sampleClients = [
      {
        customerCode: 'CUST000001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        customerType: 'regular' as const,
        loyaltyPoints: 100,
        isActive: true,
        creditLimit: 1000.00
      }
    ];

    for (const client of sampleClients) {
      await Client.findOrCreate({
        where: { email: client.email },
        defaults: client
      });
    }

    // Create system comment
    await Comment.findOrCreate({
      where: { content: 'System initialized with enterprise authorization' },
      defaults: {
        content: 'System initialized with enterprise authorization',
        userId: superAdmin.id,
        entityType: 'system',
        entityId: 1,
        isActive: true
      }
    });

    console.log('Database seeded successfully with enterprise authorization');
    // console.log('Login credentials:');
    // console.log('Super Admin: superadmin@example.com / superadmin123');
    // console.log('Admin: admin@example.com / admin123');
    // console.log('Manager: manager@example.com / manager123');
    // console.log('Supervisor: supervisor@example.com / supervisor123');
    // console.log('Cashier: cashier@example.com / cashier123');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};