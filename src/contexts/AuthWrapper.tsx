
import React from 'react';
import { AuthProvider } from './AuthContext';
import { DevAuthProvider } from './DevAuthContext';
import { featureFlags } from '@/config/featureFlags';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  if (featureFlags.DEV_BYPASS_AUTH || featureFlags.DEV_AUTO_LOGIN) {
    return <DevAuthProvider>{children}</DevAuthProvider>;
  }
  
  return <AuthProvider>{children}</AuthProvider>;
};
