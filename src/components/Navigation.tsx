
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import NavigationLogo from './navigation/NavigationLogo';
import UserProfileDropdown from './navigation/UserProfileDropdown';
import AuthButtons from './navigation/AuthButtons';

const Navigation = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavigationLogo />
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <UserProfileDropdown />
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
