import { User, Lead, Permission, Role, UserRole } from '../types';
import { ROLES } from '../constants';

export const getPermissionsForRole = (roleId: string): string[] => {
  const role = ROLES.find(r => r.id === roleId);
  return role ? role.permissions : [];
};

export const hasPermission = (user: User, permissionId: string): boolean => {
  if (user.role === UserRole.ADMIN) return true;
  
  const rolePermissions = getPermissionsForRole(user.roleId);
  const userPermissions = user.permissions || [];
  
  return rolePermissions.includes(permissionId) || userPermissions.includes(permissionId);
};

export const can = (user: User, action: string, module: string): boolean => {
  return hasPermission(user, `${module}_${action}`) || hasPermission(user, `${module}_manage`);
};

export const getVisibleLeads = (user: User, leads: Lead[]): Lead[] => {
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
    return leads;
  }
  // Restricted View: Only owned leads
  return leads.filter(lead => lead.ownerId === user.id);
};

export const canEditLead = (user: User, lead: Lead): boolean => {
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) return true;
  return user.id === lead.ownerId && can(user, 'update', 'leads');
};

export const canDeleteLead = (user: User, lead: Lead): boolean => {
  if (user.role === UserRole.ADMIN) return true;
  return false; // Typically only admins delete in this flow
};

export const canAccessModule = (user: User, module: string): boolean => {
  if (user.role === UserRole.ADMIN) return true;
  return getPermissionsForRole(user.roleId).some(p => p.startsWith(module));
};