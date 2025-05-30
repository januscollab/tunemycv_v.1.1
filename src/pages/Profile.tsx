
import React, { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import ProfileContainer from '@/components/profile/ProfileContainer';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const { credits, memberSince } = useUserData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/10 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-8">
      <ProfileContainer
        activeTab={activeTab}
        onTabChange={setActiveTab}
        credits={credits}
        memberSince={memberSince}
      />
    </div>
  );
};

export default Profile;
