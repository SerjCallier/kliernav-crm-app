import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from './types';
import { CURRENT_USER, ALL_USERS, ROLES } from './constants';
import { hasPermission, getPermissionsForRole } from './services/permissionService';

interface AuthContextType {
  user: User;
  permissions: string[];
  isLoading: boolean;
  loginAs: (userId: string) => void;
  checkPermission: (permissionId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Sync permissions when user changes
    setPermissions(getPermissionsForRole(user.roleId));
  }, [user]);

  const loginAs = (userId: string) => {
    setIsLoading(true);
    const selectedUser = ALL_USERS[userId];
    if (selectedUser) {
      setUser(selectedUser);
    }
    setTimeout(() => setIsLoading(false), 500);
  };

  const checkPermission = (permissionId: string) => {
    return hasPermission(user, permissionId);
  };

  return (
    <AuthContext.Provider value={{ user, permissions, isLoading, loginAs, checkPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};