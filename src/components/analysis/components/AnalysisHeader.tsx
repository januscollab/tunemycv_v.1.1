
import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';

interface AnalysisHeaderProps {
  onStartNew: () => void;
  onDownloadPDF: () => void;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ onStartNew, onDownloadPDF }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={onStartNew}
        className="flex items-center space-x-2 text-apricot hover:text-apricot/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Analyze Another CV</span>
      </button>
      <button 
        onClick={onDownloadPDF}
        className="flex items-center space-x-2 bg-apricot text-white px-4 py-2 rounded-md hover:bg-apricot/90 transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>Download Report</span>
      </button>
    </div>
  );
};

export default AnalysisHeader;
