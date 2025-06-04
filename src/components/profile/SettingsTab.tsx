import React from 'react';
import { Settings, Clock } from 'lucide-react';

interface SettingsTabProps {
  credits: number;
  memberSince: string;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ credits, memberSince }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <Settings className="h-5 w-5 text-zapier-orange mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
        </div>

        <div className="text-center py-12">
          <div className="bg-zapier-orange/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Clock className="h-8 w-8 text-zapier-orange" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We're building comprehensive settings that will give you full control over your account preferences and experience.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 max-w-lg mx-auto">
            <h4 className="font-medium text-gray-900 mb-2">What you'll see here:</h4>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Advanced notification preferences</li>
              <li>• Privacy and data controls</li>
              <li>• Account security settings</li>
              <li>• API access and integrations</li>
              <li>• Export and data management tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
