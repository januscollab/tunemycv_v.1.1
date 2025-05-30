
import React from 'react';
import { User, History, FileText, Settings, Lock } from 'lucide-react';

interface ProfileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'files', label: 'My Files', icon: FileText },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 mb-6">
      <nav className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-apricot text-white'
                : 'text-blueberry dark:text-apple-core hover:bg-apple-core/20 dark:hover:bg-citrus/20'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileNavigation;
