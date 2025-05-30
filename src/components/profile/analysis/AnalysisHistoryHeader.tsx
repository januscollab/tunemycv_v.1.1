
import React from 'react';
import { Calendar } from 'lucide-react';

interface AnalysisHistoryHeaderProps {
  analysisCount: number;
}

const AnalysisHistoryHeader: React.FC<AnalysisHistoryHeaderProps> = ({ analysisCount }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-900">Analysis History</h2>
      <div className="text-sm text-gray-500">
        {analysisCount} {analysisCount === 1 ? 'analysis' : 'analyses'}
      </div>
    </div>
  );
};

export default AnalysisHistoryHeader;
