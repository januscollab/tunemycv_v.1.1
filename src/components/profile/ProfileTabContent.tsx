
import React from 'react';
import PersonalInfoTab from './PersonalInfoTab';
import FileUploadTab from './FileUploadTab';
import AnalysisHistoryTab from './AnalysisHistoryTab';
import SettingsTab from './SettingsTab';

interface ProfileTabContentProps {
  activeTab: string;
}

const ProfileTabContent: React.FC<ProfileTabContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'personal':
      return <PersonalInfoTab />;
    case 'uploads':
      return <FileUploadTab />;
    case 'history':
      return <AnalysisHistoryTab />;
    case 'settings':
      return <SettingsTab />;
    default:
      return <PersonalInfoTab />;
  }
};

export default ProfileTabContent;
