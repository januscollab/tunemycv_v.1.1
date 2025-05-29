
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileNavigation from '@/components/profile/ProfileNavigation';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import FileUploadTab from '@/components/profile/FileUploadTab';
import AnalysisHistoryTab from '@/components/profile/AnalysisHistoryTab';
import SettingsTab from '@/components/profile/SettingsTab';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoTab />;
      case 'uploads':
        return <FileUploadTab />;
      case 'history':
        return <AnalysisHistoryTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <PersonalInfoTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ProfileHeader credits={credits} memberSince={memberSince} />
        <ProfileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default Profile;
