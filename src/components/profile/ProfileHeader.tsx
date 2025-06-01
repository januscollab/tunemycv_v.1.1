
import React from 'react';
import { useProfileData } from '@/hooks/useProfileData';

interface ProfileHeaderProps {
  credits: number;
  memberSince: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ credits, memberSince }) => {
  const { getUserDisplayName } = useProfileData();
  
  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow-sm border border-apple-core/20 dark:border-citrus/20 p-6 mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-blueberry dark:text-citrus">
            Welcome, {getUserDisplayName()}
          </h1>
          <p className="text-blueberry/80 dark:text-apple-core/80 mt-2">
            Manage your account settings and view your analysis history
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{credits}</div>
              <div className="text-sm text-blueberry/70 dark:text-apple-core/70">Credits</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-blueberry/70 dark:text-apple-core/70">Member since</div>
              <div className="font-medium text-blueberry dark:text-citrus">{memberSince}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
