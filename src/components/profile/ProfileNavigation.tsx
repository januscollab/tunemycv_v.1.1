import React from 'react';
import { User, Upload, Settings, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'personal', label: 'Account Info', icon: User },
    { id: 'documents', label: 'Document History', icon: FileText },
    { id: 'files', label: 'CV Management', icon: Upload },
    { id: 'billing', label: 'Billing History', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="mb-4">
      {/* Desktop horizontal navigation */}
      <div className="hidden md:block">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center space-x-2 text-sm"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                  <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
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
    </div>
  );
};

export default ProfileNavigation;