import React from 'react';
import WorkEnvironmentPreferences from './WorkEnvironmentPreferences';
import SoftSkillsSection from './SoftSkillsSection';
import WorkStylePreferencesSection from './WorkStylePreferencesSection';
import CompanyCulturePreferences from './CompanyCulturePreferences';

interface WorkingStyleTabProps {
  credits: number;
  memberSince: string;
}

const WorkingStyleTab: React.FC<WorkingStyleTabProps> = ({ credits, memberSince }) => {
  return (
    <div className="space-y-6">
      {/* Work Environment Preferences - Top */}
      <WorkEnvironmentPreferences />
      
      {/* Soft Skills and Company Culture - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SoftSkillsSection />
        <CompanyCulturePreferences />
      </div>
      
      {/* Work Style Preferences - Below */}
      <WorkStylePreferencesSection />
    </div>
  );
};

export default WorkingStyleTab;