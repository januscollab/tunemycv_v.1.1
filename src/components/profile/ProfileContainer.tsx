
import React from 'react';

interface ProfileContainerProps {
  children: React.ReactNode;
}

const ProfileContainer: React.FC<ProfileContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/10 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
};

export default ProfileContainer;
