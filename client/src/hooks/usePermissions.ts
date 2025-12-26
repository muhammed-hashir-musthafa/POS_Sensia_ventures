import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Resource, Action } from '../types';

export const usePermissions = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const hasPermission = (resource: Resource, action: Action): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(`${resource}:${action}`) || false;
  };

  const canView = (resource: Resource): boolean => {
    return hasPermission(resource, 'view');
  };

  const canCreate = (resource: Resource): boolean => {
    return hasPermission(resource, 'create');
  };

  const canUpdate = (resource: Resource): boolean => {
    return hasPermission(resource, 'update');
  };

  const canDelete = (resource: Resource): boolean => {
    return hasPermission(resource, 'delete');
  };

  return {
    hasPermission,
    canView,
    canCreate,
    canUpdate,
    canDelete,
  };
};