
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useProfileData = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<{
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile data:', error);
        return;
      }

      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (profileData?.first_name) {
      return profileData.first_name;
    }
    return 'Jobseeker';
  };

  return { profileData, loading, getUserDisplayName };
};
