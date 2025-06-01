
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDevAuth } from '@/contexts/DevAuthContext';
import { featureFlags } from '@/config/featureFlags';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  // Use dev auth if feature flags are enabled, otherwise use regular auth
  const authHook = (featureFlags.DEV_BYPASS_AUTH || featureFlags.DEV_AUTO_LOGIN) ? useDevAuth : useAuth;
  const { user } = authHook();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user?.id, _role: 'admin' });
      
      if (error) throw error;
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
};
