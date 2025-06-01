
import React from 'react';
import AnalysisResults from '@/components/analysis/AnalysisResults';

interface CurrentReportTabProps {
  analysisResult: any;
  onStartNew: () => void;
}

const CurrentReportTab: React.FC<CurrentReportTabProps> = ({
  analysisResult,
  onStartNew
}) => {
  if (!analysisResult) {
    return (
      <div className="text-center py-12">
        <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-8 border border-apple-core/20 dark:border-citrus/20">
          <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-4">
            No Analysis Report Available
          </h3>
          <p className="text-blueberry/70 dark:text-apple-core/80 mb-6">
            You haven't generated any analysis yet, or no analysis is currently selected from your history.
            Use the CV Analysis tab to create a new analysis or select one from your Analysis History.
          </p>
          <button
            onClick={onStartNew}
            className="bg-apricot hover:bg-apricot/90 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Start New Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-1">
              Analysis Report
            </h3>
            <p className="text-sm text-blueberry/70 dark:text-apple-core/80">
              {analysisResult.id ? 'Viewing analysis from history' : 'Current analysis results'}
            </p>
          </div>
          <button
            onClick={onStartNew}
            className="bg-blueberry/10 hover:bg-blueberry/20 text-blueberry dark:bg-citrus/10 dark:hover:bg-citrus/20 dark:text-citrus px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Start New Analysis
          </button>
        </div>
      </div>
      <AnalysisResults result={analysisResult} onStartNew={onStartNew} />
    </div>
  );
};

export default CurrentReportTab;
