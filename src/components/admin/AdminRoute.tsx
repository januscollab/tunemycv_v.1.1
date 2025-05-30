
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const { toast } = useToast();
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // Admin session timeout: 30 minutes
  const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    if (!isAdmin) return;

    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for session timeout
    const timeoutCheck = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      if (inactiveTime >= ADMIN_SESSION_TIMEOUT) {
        toast({
          title: 'Session Timeout',
          description: 'Your admin session has expired due to inactivity.',
          variant: 'destructive',
        });
        signOut();
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(timeoutCheck);
    };
  }, [isAdmin, lastActivity, signOut, toast]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-core/10">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apricot mx-auto"></div>
          <p className="text-blueberry">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    toast({
      title: 'Access Denied',
      description: 'You do not have administrator privileges.',
      variant: 'destructive',
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
