
import React from 'react';
import { CreditCard, Zap, BarChart3 } from 'lucide-react';

interface CreditsPanelProps {
  credits: number;
  useAI: boolean;
  setUseAI: (useAI: boolean) => void;
  hasCreditsForAI: boolean;
}

const CreditsPanel: React.FC<CreditsPanelProps> = ({
  credits,
  useAI,
  setUseAI,
  hasCreditsForAI
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Options</h3>
      
      {/* Credits Display */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <span className="text-blue-900 font-medium">
            Credits: {credits || 0}
          </span>
        </div>
      </div>
      
      {/* Analysis Type Selection */}
      <div className="space-y-4">
        <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            checked={useAI && hasCreditsForAI}
            onChange={() => setUseAI(true)}
            disabled={!hasCreditsForAI}
            className="text-blue-600 mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className={`font-medium ${hasCreditsForAI ? 'text-gray-900' : 'text-gray-400'}`}>
                AI Analysis
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Advanced AI-powered analysis with detailed insights (1 credit)
            </p>
          </div>
        </label>
        
        <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            checked={!useAI || !hasCreditsForAI}
            onChange={() => setUseAI(false)}
            className="text-blue-600 mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-gray-900">Basic Analysis</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Quick keyword matching and compatibility score (Free)
            </p>
          </div>
        </label>
      </div>
      
      {!hasCreditsForAI && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            No credits available for AI analysis. Using basic analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default CreditsPanel;
