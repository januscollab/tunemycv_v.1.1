
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDevAuth } from '@/contexts/DevAuthContext';
import { featureFlags } from '@/config/featureFlags';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  // Use dev auth if feature flags are enabled, otherwise use regular auth
  const authHook = (featureFlags.DEV_BYPASS_AUTH || featureFlags.DEV_AUTO_LOGIN) ? useDevAuth : useAuth;
  const { user, loading } = authHook();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // In development with bypass auth enabled, always allow access
  if (featureFlags.DEV_BYPASS_AUTH) {
    console.log('🔧 DEV: Bypassing auth protection');
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
