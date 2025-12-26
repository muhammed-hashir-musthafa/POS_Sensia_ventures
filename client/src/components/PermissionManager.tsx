'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

interface GroupedPermissions {
  [resource: string]: Permission[];
}

const PermissionManager: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<GroupedPermissions>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if current user has permission management access
  const canManagePermissions = user?.permissions?.includes('users:permissions') || user?.role === 'admin';

  useEffect(() => {
    if (canManagePermissions) {
      fetchUsers();
      fetchPermissions();
    }
  }, [canManagePermissions]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchUserPermissions = async (userId: number) => {
    try {
      const response = await api.get(`/permissions/user/${userId}`);
      const allPermissions = [
        ...response.data.rolePermissions.map((p: any) => `${p.resource}:${p.action}`),
        ...response.data.directPermissions.map((p: any) => `${p.resource}:${p.action}`)
      ];
      setUserPermissions(allPermissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    fetchUserPermissions(selectedUser.id);
  };

  const handlePermissionToggle = async (permissionId: number, hasPermission: boolean) => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      if (hasPermission) {
        await api.post('/permissions/revoke', {
          userId: selectedUser.id,
          permissionId
        });
      } else {
        await api.post('/permissions/grant', {
          userId: selectedUser.id,
          permissionId
        });
      }
      
      // Refresh user permissions
      fetchUserPermissions(selectedUser.id);
    } catch (error) {
      console.error('Error updating permission:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canManagePermissions) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
        <p className="text-red-600">You don't have permission to manage user permissions.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
        <div className="text-sm text-gray-500">
          Logged in as: {user?.name} ({user?.role})
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => handleUserSelect(u)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === u.id
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{u.name}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
                <div className="text-xs text-gray-400 capitalize">{u.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedUser ? `Permissions for ${selectedUser.name}` : 'Select a user'}
          </h2>
          
          {selectedUser ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(permissions).map(([resource, resourcePermissions]) => (
                <div key={resource} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 capitalize">
                    {resource.replace('_', ' ')}
                  </h3>
                  <div className="space-y-2">
                    {resourcePermissions.map((permission) => {
                      const permissionKey = `${permission.resource}:${permission.action}`;
                      const hasPermission = userPermissions.includes(permissionKey);
                      
                      return (
                        <div key={permission.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{permission.action}</div>
                            {permission.description && (
                              <div className="text-xs text-gray-500">{permission.description}</div>
                            )}
                          </div>
                          <button
                            onClick={() => handlePermissionToggle(permission.id, hasPermission)}
                            disabled={loading}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              hasPermission
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {hasPermission ? 'Granted' : 'Grant'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select a user to manage their permissions
            </div>
          )}
        </div>
      </div>

      {/* Current User Permissions Display */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Your Current Permissions:</h3>
        <div className="flex flex-wrap gap-2">
          {user?.permissions?.map((permission) => (
            <span
              key={permission}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
            >
              {permission}
            </span>
          )) || (
            <span className="text-blue-600 text-sm">No specific permissions (using role-based access)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionManager;