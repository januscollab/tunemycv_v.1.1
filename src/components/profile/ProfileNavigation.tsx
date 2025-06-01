
import React from 'react';
import { User, History, Upload, CreditCard, Settings } from 'lucide-react';

interface ProfileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'history', label: 'Document History', icon: History },
    { id: 'files', label: 'File Management', icon: Upload },
    { id: 'password', label: 'Billing History', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="mb-6">
      {/* Desktop horizontal navigation */}
      <div className="hidden md:flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">{tab.label}</span>
              <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile vertical navigation */}
      <div className="md:hidden space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ProfileNavigation;
