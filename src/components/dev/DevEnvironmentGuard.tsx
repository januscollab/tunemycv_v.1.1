import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DevEnvironmentGuardProps {
  children: React.ReactNode;
}

const DevEnvironmentGuard: React.FC<DevEnvironmentGuardProps> = ({ children }) => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  if (!isDevelopment) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Alert className="m-4 border-amber-200 bg-amber-50 text-amber-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          🚧 Development Environment - This area is only accessible in dev mode and will not be deployed.
        </AlertDescription>
      </Alert>
      {children}
    </div>
  );
};

export default DevEnvironmentGuard;