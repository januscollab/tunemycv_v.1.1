import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building, MapPin } from 'lucide-react';
import SecureInput from '@/components/security/SecureInput';

const WorkEnvironmentPreferences: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [preferences, setPreferences] = useState({
    company_size_preference: '',
    work_location_preference: ''
  });

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  // Auto-save with debounce
  useEffect(() => {
    if (!user || loading || isInitialLoad) return;
    
    const timeoutId = setTimeout(() => {
      savePreferences();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [preferences, user, loading, isInitialLoad]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('company_size_preference, work_location_preference')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          company_size_preference: data.company_size_preference || '',
          work_location_preference: data.work_location_preference || ''
        });
      }
      setIsInitialLoad(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load work environment preferences', 
        variant: 'destructive' 
      });
      setIsInitialLoad(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          company_size_preference: preferences.company_size_preference,
          work_location_preference: preferences.work_location_preference,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save work environment preferences', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isInitialLoad) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-surface rounded-lg border border-gray-200 dark:border-border p-6">
      <div className="flex items-center mb-6">
        <Building className="h-5 w-5 text-gray-500 dark:text-apple-core/60 mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Your Work Environment Preferences</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-apple-core/60 mb-6">
        Let us know your preferred work environment to better match you with suitable opportunities
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
            Company Size
          </label>
          <select
            id="companySize"
            value={preferences.company_size_preference}
            onChange={(e) => setPreferences({ ...preferences, company_size_preference: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
          >
            <option value="">Select preference</option>
            <option value="startup">Startup</option>
            <option value="sme">SME (Small to Medium Enterprise)</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div>
          <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700 dark:text-apple-core/80 mb-1">
            <MapPin className="h-4 w-4 inline mr-1" />
            Work Location Preference
          </label>
          <select
            id="workLocation"
            value={preferences.work_location_preference}
            onChange={(e) => setPreferences({ ...preferences, work_location_preference: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange/50 focus:border-transparent bg-white dark:bg-surface text-gray-900 dark:text-apple-core/90"
          >
            <option value="">Select preference</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="in-office">In-office</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-sm text-gray-500 dark:text-apple-core/60">
          Saving preferences...
        </div>
      )}
    </div>
  );
};

export default WorkEnvironmentPreferences;