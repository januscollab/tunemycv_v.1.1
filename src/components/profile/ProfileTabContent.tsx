
import React from 'react';
import PersonalInfoTab from './PersonalInfoTab';
import AnalysisHistoryTab from './AnalysisHistoryTab';
import SettingsTab from './SettingsTab';

interface ProfileTabContentProps {
  activeTab: string;
}

const ProfileTabContent: React.FC<ProfileTabContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'personal':
      return <PersonalInfoTab />;
    case 'history':
      return <AnalysisHistoryTab />;
    case 'settings':
      return <SettingsTab />;
    default:
      return <PersonalInfoTab />;
  }
};

export default ProfileTabContent;
