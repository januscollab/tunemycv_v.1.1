
import React from 'react';
import { CreditCard, Zap } from 'lucide-react';

interface CreditsPanelProps {
  credits: number;
  hasCreditsForAI: boolean;
}

const CreditsPanel: React.FC<CreditsPanelProps> = ({ credits, hasCreditsForAI }) => {
  return (
    <div className="bg-white dark:bg-earth/10 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 sticky top-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <CreditCard className="h-5 w-5 text-zapier-orange mr-2" />
          <h3 className="text-lg font-semibold text-earth dark:text-white">
            Your Credits
          </h3>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="h-6 w-6 text-zapier-orange" />
            <span className="text-2xl font-bold text-zapier-orange">
              {credits}
            </span>
            <span className="text-sm text-earth/70 dark:text-white/70">
              Credits
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-earth/70 dark:text-white/70">
          <div className="flex items-center justify-between">
            <span>CV Analysis</span>
            <span className="text-zapier-orange font-medium">1 Credit</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cover Letter</span>
            <span className="text-zapier-orange font-medium">1 Credit</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Interview Prep</span>
            <span className="text-zapier-orange font-medium">1 Credit</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-zapier-orange/10 rounded-lg">
          <p className="text-xs text-earth dark:text-white">
            {hasCreditsForAI 
              ? "You have credits available for AI analysis with multiple free AI iterations"
              : "Purchase credits to unlock AI-powered features"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreditsPanel;
