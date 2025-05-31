
import React from 'react';
import PersonalInfoTab from './PersonalInfoTab';
import AnalysisHistoryTab from './AnalysisHistoryTab';
import CVManagementTab from './CVManagementTab';
import BillingHistoryTab from './BillingHistoryTab';
import SettingsTab from './SettingsTab';

interface ProfileTabContentProps {
  activeTab: string;
  credits: number;
  memberSince: string;
}

const ProfileTabContent: React.FC<ProfileTabContentProps> = ({ activeTab, credits, memberSince }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoTab credits={credits} memberSince={memberSince} />;
      case 'history':
        return <AnalysisHistoryTab />;
      case 'files':
        return <CVManagementTab />;
      case 'password':
        return <BillingHistoryTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <PersonalInfoTab credits={credits} memberSince={memberSince} />;
    }
  };

  return (
    <div className="flex-1">
      {renderContent()}
    </div>
  );
};

export default ProfileTabContent;
