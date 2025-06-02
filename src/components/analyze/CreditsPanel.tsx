
import React from 'react';
import { Coins, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreditsPanelProps {
  credits: number;
  hasCreditsForAI: boolean;
}

const CreditsPanel: React.FC<CreditsPanelProps> = ({ credits, hasCreditsForAI }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 h-fit">
      <div className="flex items-center space-x-2 mb-3">
        <Coins className="h-5 w-5 text-zapier-orange" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Credits</h3>
      </div>
      
      <div className="text-center mb-3">
        <div className="text-2xl font-bold text-zapier-orange">{credits}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
      </div>

      {!hasCreditsForAI && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-300 text-xs">
            You need credits to use AI features. Each analysis costs 1 credit.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>• CV Analysis: 1 credit</div>
          <div>• Cover Letter: 1 credit</div>
          <div>• Interview Prep: 1 credit</div>
        </div>
      </div>
    </div>
  );
};

export default CreditsPanel;
