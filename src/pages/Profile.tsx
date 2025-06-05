
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
    if (tabParam && ['personal', 'documents', 'files', 'billing', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-8">
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
