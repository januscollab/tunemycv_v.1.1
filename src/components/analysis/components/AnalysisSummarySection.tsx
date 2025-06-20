import React from 'react';
import { FileText, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalysisSummarySectionProps {
  compatibilityScore: number;
  jobTitle: string;
  companyName: string;
  onDownload?: () => void;
  onReviewInBrowser?: () => void;
}

const AnalysisSummarySection: React.FC<AnalysisSummarySectionProps> = ({
  compatibilityScore,
  jobTitle,
  companyName,
  onDownload,
  onReviewInBrowser
}) => {
  return (
    <div className="bg-surface rounded-lg shadow border border-border p-6">
      {/* Header with title and action buttons */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-heading font-semibold text-foreground">Analysis Summary</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {onReviewInBrowser && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onReviewInBrowser}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Review in Browser
            </Button>
          )}
          {onDownload && (
            <Button 
              variant="default" 
              size="sm"
              onClick={onDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Content area with score and details */}
      <div className="flex items-center gap-8">
        {/* Score circle */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-subheading font-bold text-primary">
              {compatibilityScore}%
            </span>
          </div>
        </div>

        {/* Position and Company details */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-caption font-medium text-muted-foreground uppercase tracking-wide mb-2">
              POSITION
            </h3>
            <p className="text-body font-medium text-foreground">
              {jobTitle || 'Unknown Position'}
            </p>
          </div>
          
          <div>
            <h3 className="text-caption font-medium text-muted-foreground uppercase tracking-wide mb-2">
              COMPANY
            </h3>
            <p className="text-body font-medium text-foreground">
              {companyName || 'Unknown Company'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSummarySection;