
import React from 'react';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { FileText } from 'lucide-react';

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
        <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-8 border border-apple-core/20 dark:border-citrus/20 max-w-md mx-auto">
          <FileText className="h-16 w-16 text-apple-core/40 dark:text-citrus/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-2">
            No Analysis Report Available
          </h3>
          <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">
            Complete a CV analysis or select one from your analysis history to view the report here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalysisResults result={analysisResult} onStartNew={onStartNew} />
    </div>
  );
};

export default CurrentReportTab;
