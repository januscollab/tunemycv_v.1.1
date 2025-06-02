
import React from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileNavigation from './ProfileNavigation';
import ProfileTabContent from './ProfileTabContent';

interface ProfileContainerProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  credits: number;
  memberSince: string;
}

const ProfileContainer: React.FC<ProfileContainerProps> = ({ 
  activeTab, 
  onTabChange, 
  credits, 
  memberSince 
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <ProfileHeader credits={credits} memberSince={memberSince} />
      <ProfileNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <ProfileTabContent activeTab={activeTab} credits={credits} memberSince={memberSince} />
    </div>
  );
};

export default ProfileContainer;
