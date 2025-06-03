import React from 'react';

interface SettingsTabProps {
  credits: number;
  memberSince: string;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ credits, memberSince }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Settings</h3>
        <p className="text-gray-600 text-lg">Coming Soon</p>
        <p className="text-sm text-gray-500 mt-2">
          Advanced settings and preferences will be available here in the future.
        </p>
      </div>
    </div>
  );
};

export default SettingsTab;
