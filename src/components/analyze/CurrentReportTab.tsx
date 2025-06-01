
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
      <AnalysisResults result={analysisResult} onStartNew={onStartNew} />
    </div>
  );
};

export default CurrentReportTab;
