
import React from 'react';
import { Zap, BarChart3 } from 'lucide-react';

interface AnalyzeButtonProps {
  onAnalyze: () => void;
  canAnalyze: boolean;
  analyzing: boolean;
  useAI: boolean;
  hasCreditsForAI: boolean;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  onAnalyze,
  canAnalyze,
  analyzing,
  useAI,
  hasCreditsForAI
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <button
        onClick={onAnalyze}
        disabled={!canAnalyze || analyzing}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          canAnalyze && !analyzing
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {analyzing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>
              {useAI && hasCreditsForAI ? 'Running AI Analysis...' : 'Analyzing CV...'}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            {useAI && hasCreditsForAI ? (
              <>
                <Zap className="h-4 w-4" />
                <span>Analyze with AI (1 credit)</span>
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                <span>Analyze CV Compatibility</span>
              </>
            )}
          </div>
        )}
      </button>
      {!canAnalyze && (
        <p className="text-sm text-gray-500 text-center mt-2">
          Please upload both CV and job description to proceed
        </p>
      )}
    </div>
  );
};

export default AnalyzeButton;
