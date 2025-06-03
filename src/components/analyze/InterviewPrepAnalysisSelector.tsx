
import React from 'react';
import { Calendar, Building, Target, MessageSquare } from 'lucide-react';

interface AnalysisResult {
  id: string;
  job_title: string;
  company_name: string;
  compatibility_score: number;
  created_at: string;
  executive_summary: string;
}

interface InterviewPrepAnalysisSelectorProps {
  selectedAnalysis: AnalysisResult;
  onDeselect: () => void;
}

const InterviewPrepAnalysisSelector: React.FC<InterviewPrepAnalysisSelectorProps> = ({ 
  selectedAnalysis, 
  onDeselect 
}) => {
  return (
    <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blueberry dark:text-citrus flex items-center">
          <MessageSquare className="h-5 w-5 text-zapier-orange mr-2" />
          Selected Analysis for Interview Prep
        </h3>
        <button
          onClick={onDeselect}
          className="text-sm text-blueberry/60 dark:text-apple-core/70 hover:text-zapier-orange transition-colors"
        >
          Change Selection
        </button>
      </div>

      <div className="bg-gradient-to-r from-zapier-orange/10 to-apricot/10 rounded-lg p-4 border border-zapier-orange/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-blueberry dark:text-citrus mb-1">
              {selectedAnalysis.job_title}
            </h4>
            <div className="flex items-center text-sm text-blueberry/70 dark:text-apple-core/80 mb-2">
              <Building className="h-4 w-4 mr-1" />
              {selectedAnalysis.company_name}
            </div>
            <div className="flex items-center text-sm text-blueberry/70 dark:text-apple-core/80">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(selectedAnalysis.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center bg-white dark:bg-blueberry/20 rounded-lg px-3 py-2">
            <Target className="h-4 w-4 text-zapier-orange mr-2" />
            <span className="text-sm font-medium text-blueberry dark:text-citrus">
              {selectedAnalysis.compatibility_score}% Match
            </span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-blueberry/10 rounded p-3 mb-4">
          <p className="text-sm text-blueberry/80 dark:text-apple-core/90 line-clamp-3">
            {selectedAnalysis.executive_summary}
          </p>
        </div>

        <div className="flex items-center justify-center bg-zapier-orange/10 rounded-lg p-4 border border-zapier-orange/30">
          <MessageSquare className="h-6 w-6 text-zapier-orange mr-3" />
          <div className="text-center">
            <p className="text-sm font-medium text-blueberry dark:text-citrus mb-1">
              Ready to Generate Interview Prep Pack
            </p>
            <p className="text-xs text-blueberry/60 dark:text-apple-core/70">
              Interview prep generation feature coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepAnalysisSelector;
