import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface DevEnvironmentGuardProps {
  children: React.ReactNode;
}

const DevEnvironmentGuard: React.FC<DevEnvironmentGuardProps> = ({ children }) => {
  const isDevelopment = import.meta.env.DEV;
  const { isAdmin, loading } = useAdminAuth();
  
  // Show loading state while checking admin status
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }
  
  // Allow access if in development OR if user is admin
  if (!isDevelopment && !isAdmin) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Alert className="m-4 border-amber-200 bg-amber-50 text-amber-800">
        {isDevelopment ? (
          <>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              🚧 Development Environment - This area is only accessible in dev mode and will not be deployed.
            </AlertDescription>
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              🔐 Admin Access - You have administrative privileges to access these development tools.
            </AlertDescription>
          </>
        )}
      </Alert>
      {children}
    </div>
  );
};

export default DevEnvironmentGuard;