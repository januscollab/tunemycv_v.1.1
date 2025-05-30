
import React from 'react';
import PersonalInfoTab from './PersonalInfoTab';
import AnalysisHistoryTab from './AnalysisHistoryTab';
import FileUploadTab from './FileUploadTab';
import SettingsTab from './SettingsTab';
import PasswordChangeTab from './PasswordChangeTab';

interface ProfileTabContentProps {
  activeTab: string;
}

const ProfileTabContent: React.FC<ProfileTabContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'personal':
      return <PersonalInfoTab />;
    case 'history':
      return <AnalysisHistoryTab />;
    case 'files':
      return <FileUploadTab />;
    case 'password':
      return <PasswordChangeTab />;
    case 'settings':
      return <SettingsTab />;
    default:
      return <PersonalInfoTab />;
  }
};

export default ProfileTabContent;
