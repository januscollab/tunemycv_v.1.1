
import React from 'react';
import { BarChart3, Loader2 } from 'lucide-react';

interface AnalyzeButtonProps {
  onAnalyze: () => void;
  canAnalyze: boolean;
  analyzing: boolean;
  hasCreditsForAI: boolean;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  onAnalyze,
  canAnalyze,
  analyzing,
  hasCreditsForAI
}) => {
  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="text-center">
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze || analyzing}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
            canAnalyze && !analyzing
              ? 'bg-apricot text-white hover:bg-apricot/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {analyzing ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing CV...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Start Comprehensive Analysis</span>
            </div>
          )}
        </button>
        
        <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-3">
          {hasCreditsForAI 
            ? "Get detailed AI-powered insights and recommendations"
            : "Receive comprehensive analysis with actionable feedback"
          }
        </p>
        
        {!canAnalyze && !analyzing && (
          <p className="text-sm text-red-600 mt-2">
            Please upload both CV and job description to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalyzeButton;
