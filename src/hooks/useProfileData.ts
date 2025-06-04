
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useProfileData = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<{
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    country_code?: string;
    linkedin_url?: string;
    personal_website_url?: string;
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
        .select('first_name, last_name, email, phone_number, country_code, linkedin_url, personal_website_url')
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

  const getFullContactInfo = () => {
    if (!profileData) return null;
    
    const fullName = [profileData.first_name, profileData.last_name].filter(Boolean).join(' ') || '[Your Name]';
    const phoneNumber = profileData.phone_number 
      ? `${profileData.country_code || ''}${profileData.phone_number}` 
      : '[Your Phone Number]';
    const email = profileData.email || '[Your Email Address]';
    const linkedInUrl = profileData.linkedin_url || '';
    const websiteUrl = profileData.personal_website_url || '';
    
    return {
      fullName,
      phoneNumber,
      email,
      linkedInUrl,
      websiteUrl
    };
  };

  return { profileData, loading, getUserDisplayName, getFullContactInfo };
};
