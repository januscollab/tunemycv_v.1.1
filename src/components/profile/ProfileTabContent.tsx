
import React from 'react';
import PersonalInfoTab from './PersonalInfoTab';
import DocumentHistoryTab from './DocumentHistoryTab';
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
      case 'documents':
        return <DocumentHistoryTab credits={credits} memberSince={memberSince} />;
      case 'files':
        return <CVManagementTab credits={credits} memberSince={memberSince} />;
      case 'billing':
        return <BillingHistoryTab credits={credits} memberSince={memberSince} />;
      case 'settings':
        return <SettingsTab credits={credits} memberSince={memberSince} />;
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
