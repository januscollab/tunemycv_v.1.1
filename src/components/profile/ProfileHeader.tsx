
import React from 'react';
import { useProfileData } from '@/hooks/useProfileData';

interface ProfileHeaderProps {
  credits: number;
  memberSince: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ credits, memberSince }) => {
  const { getUserDisplayName } = useProfileData();
  
  return (
    <div className="bg-card dark:bg-surface rounded-lg border border-card-border p-4 mb-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-display font-bold text-card-foreground font-display">
            Welcome, {getUserDisplayName()}
          </h1>
          <p className="text-foreground-secondary mt-3 text-lg">
            Manage your account settings and view your analysis history
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex flex-col md:items-end space-y-3">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-display font-bold text-primary">{credits}</div>
              <div className="text-sm text-foreground-secondary">Credits</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-foreground-secondary">Member since</div>
              <div className="font-semibold text-card-foreground">{memberSince}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
