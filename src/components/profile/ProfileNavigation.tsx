
import React from 'react';

interface ProfileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'history', label: 'Analysis History' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="border-b border-apple-core/30 mb-8">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-apricot text-apricot'
                : 'border-transparent text-blueberry/70 hover:text-blueberry hover:border-apple-core'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileNavigation;
