
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credits, setCredits] = useState(0);
  const [memberSince, setMemberSince] = useState('');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user?.id)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') throw creditsError;
      
      setCredits(creditsData?.credits || 0);

      // Set member since date from user creation
      if (user?.created_at) {
        const date = new Date(user.created_at);
        setMemberSince(date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }));
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load user data', variant: 'destructive' });
    }
  };

  return { credits, memberSince, loadUserData };
};
