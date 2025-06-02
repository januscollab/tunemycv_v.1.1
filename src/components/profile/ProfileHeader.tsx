
import React from 'react';
import { useProfileData } from '@/hooks/useProfileData';

interface ProfileHeaderProps {
  credits: number;
  memberSince: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ credits, memberSince }) => {
  const { getUserDisplayName } = useProfileData();
  
  return (
    <div className="bg-white rounded-lg border border-border p-8 mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-earth font-display">
            Welcome, {getUserDisplayName()}
          </h1>
          <p className="text-earth/70 mt-3 text-lg">
            Manage your account settings and view your analysis history
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex flex-col md:items-end space-y-3">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-zapier-orange">{credits}</div>
              <div className="text-sm text-earth/70">Credits</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-earth/70">Member since</div>
              <div className="font-semibold text-earth">{memberSince}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
