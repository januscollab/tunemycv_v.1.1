
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
    <div className="bg-white dark:bg-earth/10 rounded-lg shadow-sm p-5 border border-apple-core/20 dark:border-citrus/20">
      <div className="text-center">
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze || analyzing}
          className={`w-full py-3 px-5 rounded-lg font-semibold text-base transition-colors ${
            canAnalyze && !analyzing
              ? 'bg-zapier-orange text-white hover:bg-zapier-orange/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {analyzing ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing CV...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="h-4 w-4 text-zapier-orange" />
              <span>Start AI Analysis of CV</span>
            </div>
          )}
        </button>
        
        <p className="text-xs text-earth/60 dark:text-apple-core/70 mt-3">
          {hasCreditsForAI 
            ? "Get detailed AI-powered insights and recommendations"
            : "Receive comprehensive analysis with actionable feedback"
          }
        </p>
        
        {!canAnalyze && !analyzing && (
          <p className="text-xs text-red-600 mt-2">
            Please upload both CV and job description to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalyzeButton;
