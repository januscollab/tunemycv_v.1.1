
import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';

interface AnalysisHeaderProps {
  onStartNew: () => void;
  onDownloadPDF: () => void;
  readOnly?: boolean;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ onStartNew, onDownloadPDF, readOnly = false }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {!readOnly && (
            <button
              onClick={onStartNew}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all duration-200 font-normal"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Analyze Another CV</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onDownloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-apricot text-white hover:bg-apricot/90 rounded-lg transition-all duration-200 font-normal shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisHeader;
