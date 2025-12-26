-- Enterprise Authorization Schema Migration
-- Advanced RBAC with ABAC features for POS System

-- Drop existing simple role enum from users table
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Create roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    scope VARCHAR(50),
    conditions JSONB,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table (many-to-many with metadata)
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by INTEGER NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- Create role_permissions table (many-to-many with metadata)
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by INTEGER NOT NULL REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    conditions JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Create user_permissions table (direct user permissions)
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    grant_type VARCHAR(10) NOT NULL DEFAULT 'grant' CHECK (grant_type IN ('grant', 'deny')),
    granted_by INTEGER NOT NULL REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    conditions JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table for session management
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table for comprehensive auditing
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    metadata JSONB
);

-- Create indexes for performance
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_level ON roles(level);
CREATE INDEX idx_roles_is_active ON roles(is_active);

CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_permissions_is_active ON permissions(is_active);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_assigned_by ON user_roles(assigned_by);
CREATE INDEX idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX idx_user_roles_expires_at ON user_roles(expires_at);

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_role_permissions_granted_by ON role_permissions(granted_by);
CREATE INDEX idx_role_permissions_is_active ON role_permissions(is_active);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX idx_user_permissions_grant_type ON user_permissions(grant_type);
CREATE INDEX idx_user_permissions_granted_by ON user_permissions(granted_by);
CREATE INDEX idx_user_permissions_is_active ON user_permissions(is_active);
CREATE INDEX idx_user_permissions_expires_at ON user_permissions(expires_at);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_success ON audit_logs(success);
CREATE INDEX idx_audit_logs_resource_resource_id ON audit_logs(resource, resource_id);

-- Insert default roles
INSERT INTO roles (name, description, level) VALUES
('super_admin', 'Super Administrator with full system access', 100),
('admin', 'Administrator with management access', 80),
('manager', 'Manager with supervisory access', 60),
('supervisor', 'Supervisor with team oversight', 40),
('cashier', 'Cashier with POS operations', 20),
('viewer', 'Read-only access', 10);

-- Insert comprehensive permissions for POS system
INSERT INTO permissions (name, resource, action, description) VALUES
-- Dashboard permissions
('dashboard.view', 'dashboard', 'view', 'View dashboard'),
('dashboard.analytics', 'dashboard', 'analytics', 'View analytics data'),

-- Product permissions
('products.view', 'products', 'view', 'View products'),
('products.create', 'products', 'create', 'Create new products'),
('products.update', 'products', 'update', 'Update existing products'),
('products.delete', 'products', 'delete', 'Delete products'),
('products.manage_inventory', 'products', 'manage_inventory', 'Manage product inventory'),
('products.view_cost', 'products', 'view_cost', 'View product cost prices'),

-- Order permissions
('orders.view', 'orders', 'view', 'View orders'),
('orders.create', 'orders', 'create', 'Create new orders'),
('orders.update', 'orders', 'update', 'Update existing orders'),
('orders.delete', 'orders', 'delete', 'Delete orders'),
('orders.cancel', 'orders', 'cancel', 'Cancel orders'),
('orders.refund', 'orders', 'refund', 'Process refunds'),
('orders.approve', 'orders', 'approve', 'Approve orders'),

-- Client permissions
('clients.view', 'clients', 'view', 'View clients'),
('clients.create', 'clients', 'create', 'Create new clients'),
('clients.update', 'clients', 'update', 'Update existing clients'),
('clients.delete', 'clients', 'delete', 'Delete clients'),

-- Payment permissions
('payments.process', 'payments', 'process', 'Process payments'),
('payments.refund', 'payments', 'refund', 'Process payment refunds'),
('payments.view_history', 'payments', 'view_history', 'View payment history'),

-- User management permissions
('users.view', 'users', 'view', 'View users'),
('users.create', 'users', 'create', 'Create new users'),
('users.update', 'users', 'update', 'Update existing users'),
('users.delete', 'users', 'delete', 'Delete users'),
('users.manage_roles', 'users', 'manage_roles', 'Manage user roles'),
('users.reset_password', 'users', 'reset_password', 'Reset user passwords'),

-- Reports permissions
('reports.sales', 'reports', 'sales', 'View sales reports'),
('reports.inventory', 'reports', 'inventory', 'View inventory reports'),
('reports.financial', 'reports', 'financial', 'View financial reports'),
('reports.export', 'reports', 'export', 'Export reports'),

-- System permissions
('system.settings', 'system', 'settings', 'Manage system settings'),
('system.audit', 'system', 'audit', 'View audit logs'),
('system.backup', 'system', 'backup', 'Manage system backups'),

-- Comments permissions
('comments.view', 'comments', 'view', 'View comments'),
('comments.create', 'comments', 'create', 'Create comments'),
('comments.update', 'comments', 'update', 'Update comments'),
('comments.delete', 'comments', 'delete', 'Delete comments');

-- Create function to automatically assign permissions to super_admin
CREATE OR REPLACE FUNCTION assign_all_permissions_to_super_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Assign all permissions to super_admin role
    INSERT INTO role_permissions (role_id, permission_id, granted_by)
    SELECT 
        (SELECT id FROM roles WHERE name = 'super_admin'),
        NEW.id,
        1 -- System user
    WHERE NOT EXISTS (
        SELECT 1 FROM role_permissions 
        WHERE role_id = (SELECT id FROM roles WHERE name = 'super_admin') 
        AND permission_id = NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign new permissions to super_admin
CREATE TRIGGER trigger_assign_permissions_to_super_admin
    AFTER INSERT ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION assign_all_permissions_to_super_admin();