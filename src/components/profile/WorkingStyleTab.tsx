import React from 'react';
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
      {/* Soft Skills and Work Style - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SoftSkillsSection />
        <WorkStylePreferencesSection />
      </div>
      
      {/* Company Culture Preferences - Full Width */}
      <CompanyCulturePreferences />
    </div>
  );
};

export default WorkingStyleTab;