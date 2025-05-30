
import React, { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import ProfileContainer from '@/components/profile/ProfileContainer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileNavigation from '@/components/profile/ProfileNavigation';
import ProfileTabContent from '@/components/profile/ProfileTabContent';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const { credits, memberSince } = useUserData();

  return (
    <ProfileContainer>
      <ProfileHeader credits={credits} memberSince={memberSince} />
      <ProfileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <ProfileTabContent activeTab={activeTab} />
    </ProfileContainer>
  );
};

export default Profile;
