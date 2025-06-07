
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
    <div className="bg-card rounded-lg shadow-sm p-5 border border-card-border transition-all duration-normal hover:shadow-md">
      <div className="text-center">
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze || analyzing}
          className={`w-full py-4 px-6 rounded-lg text-subheading font-semibold transition-all duration-normal group ${
            canAnalyze && !analyzing
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {analyzing ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="animate-pulse">Analyzing CV...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 group-hover:space-x-3 transition-all duration-normal">
              <BarChart3 className="h-5 w-5 group-hover:scale-110 transition-transform duration-normal" />
              <span>Start AI Analysis of CV</span>
            </div>
          )}
        </button>
        
        <p className="text-body text-muted-foreground mt-3 transition-colors duration-normal">
          {hasCreditsForAI 
            ? "Get detailed AI-powered insights and recommendations"
            : "Receive comprehensive analysis with actionable feedback"
          }
        </p>
        
        {!canAnalyze && !analyzing && (
          <div className="mt-3">
            <p className="text-body text-destructive font-medium">
              Please upload both CV and job description to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeButton;
