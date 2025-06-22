
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AnalysisHeaderProps {
  onStartNew: () => void;
  readOnly?: boolean;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ onStartNew, readOnly = false }) => {
  return (
    <div className="bg-gradient-to-r from-surface to-surface-secondary border border-border rounded-2xl p-8 mb-8 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {!readOnly && (
            <button
              onClick={onStartNew}
              className="group flex items-center space-x-3 px-6 py-3 text-foreground-secondary hover:text-foreground bg-surface-tertiary hover:bg-surface-hover rounded-xl transition-all duration-300 font-normal border border-border hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-subheading">Analyze Another CV</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisHeader;
