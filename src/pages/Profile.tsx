
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUserData } from '@/hooks/useUserData';
import ProfileContainer from '@/components/profile/ProfileContainer';

const Profile = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('personal');
  const { credits, memberSince } = useUserData();

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['personal', 'history', 'files', 'password', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ProfileContainer
          activeTab={activeTab}
          onTabChange={setActiveTab}
          credits={credits}
          memberSince={memberSince}
        />
      </div>
    </div>
  );
};

export default Profile;
