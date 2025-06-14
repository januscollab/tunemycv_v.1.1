import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDevAdminAuth } from '@/hooks/useDevAdminAuth';

interface DevEnvironmentGuardProps {
  children: React.ReactNode;
}

const DevEnvironmentGuard: React.FC<DevEnvironmentGuardProps> = ({ children }) => {
  const isDevelopment = import.meta.env.DEV;
  const { isAdmin, loading } = useDevAdminAuth();
  
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
      {/* Simple header with logo */}
      <div className="p-4 border-b border-border">
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center space-x-2 text-lg font-semibold hover:text-primary transition-colors"
        >
          <img src="/favicon.ico" alt="TuneMyCV" className="h-6 w-6" />
          <span>TuneMyCV</span>
        </button>
      </div>
      
      {!isDevelopment && (
        <Alert className="m-4 border-warning/20 bg-warning-50 text-warning-foreground">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            🚧 Development Environment - Admin access granted.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  );
};

export default DevEnvironmentGuard;