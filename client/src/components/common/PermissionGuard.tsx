import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Resource, Action } from '../../types';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: Resource;
  action: Action;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(resource, action)) {
    return null;
  }

  return <>{children}</>;
};