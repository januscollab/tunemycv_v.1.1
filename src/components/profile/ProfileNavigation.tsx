
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
    <nav className="mb-8">
      {/* Desktop horizontal navigation */}
      <div className="hidden md:flex space-x-1 bg-cream/50 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white text-zapier-orange border border-border'
                  : 'text-earth hover:text-zapier-orange hover:bg-white/50'
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
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-zapier-orange border border-border'
                  : 'text-earth hover:text-zapier-orange hover:bg-cream/30'
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
