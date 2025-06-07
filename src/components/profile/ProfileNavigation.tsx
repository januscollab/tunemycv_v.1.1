import React from 'react';
import { User, Upload, Brain, FileText, Info } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'personal', label: 'Account Info', icon: User },
    { 
      id: 'working-style', 
      label: 'My Working Style', 
      icon: Brain,
      tooltip: 'Get 3x More Relevant Job Matches (Optional) - Complete your working style profile for personalized career guidance and better role matching.'
    },
    { 
      id: 'documents', 
      label: 'Document History', 
      icon: FileText,
      tooltip: 'View and manage your CV analyses and cover letters'
    },
    { 
      id: 'files', 
      label: 'CV Management', 
      icon: Upload,
      tooltip: 'Upload and organize up to 5 CV versions (PDF/DOCX)'
    },
    { id: 'billing', label: 'Billing History', icon: FileText },
  ];

  return (
    <div className="mb-2">
      {/* Desktop horizontal navigation */}
      <div className="hidden md:block">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-5 mb-3">
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
                  {tab.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:text-apple-core/60 dark:hover:text-apple-core/80 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          className="w-max max-w-[280px] whitespace-normal break-words z-50" 
                          collisionPadding={8}
                        >
                          <p className="text-sm leading-relaxed">{tab.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
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
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                  : 'text-foreground hover:text-primary hover:bg-accent/50 hover:scale-[1.01]'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-apple-core/60 dark:hover:text-apple-core/80 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="bottom" 
                      className="w-max max-w-[280px] whitespace-normal break-words z-50" 
                      collisionPadding={8}
                    >
                      <p className="text-sm leading-relaxed">{tab.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileNavigation;