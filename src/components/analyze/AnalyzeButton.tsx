
import React from 'react';
import { Zap } from 'lucide-react';

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
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <button
        onClick={onAnalyze}
        disabled={!canAnalyze || analyzing}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          canAnalyze && !analyzing
            ? 'bg-apricot text-white hover:bg-apricot/90'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {analyzing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Analyzing CV...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Analyze CV Compatibility</span>
          </div>
        )}
      </button>
      {!canAnalyze && (
        <p className="text-sm text-blueberry/70 dark:text-apple-core/80 text-center mt-2">
          Please select a CV and add job description to proceed
        </p>
      )}
    </div>
  );
};

export default AnalyzeButton;
