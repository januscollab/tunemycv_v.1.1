
import React, { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileNavigation from '@/components/profile/ProfileNavigation';
import ProfileTabContent from '@/components/profile/ProfileTabContent';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const { credits, memberSince } = useUserData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ProfileHeader credits={credits} memberSince={memberSince} />
        <ProfileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <ProfileTabContent activeTab={activeTab} />
      </div>
    </div>
  );
};

export default Profile;
