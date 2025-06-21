import React from 'react';
import { FileText, ExternalLink, Download, Target, TrendingUp } from 'lucide-react';
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
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-emerald-500/20 to-emerald-600/20 dark:from-emerald-400/20 dark:to-emerald-500/20';
    if (score >= 70) return 'from-blue-500/20 to-blue-600/20 dark:from-blue-400/20 dark:to-blue-500/20';
    if (score >= 50) return 'from-amber-500/20 to-amber-600/20 dark:from-amber-400/20 dark:to-amber-500/20';
    return 'from-red-500/20 to-red-600/20 dark:from-red-400/20 dark:to-red-500/20';
  };

  const getMatchLevel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 50) return 'Moderate Match';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      {/* Clean header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Analysis Summary
            </h2>
            <p className="text-sm text-muted-foreground">
              CV-Job Compatibility Report
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onReviewInBrowser && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onReviewInBrowser}
              className="text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Review
            </Button>
          )}
          {onDownload && (
            <Button 
              variant="default" 
              size="sm"
              onClick={onDownload}
              className="text-sm"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        {/* Simple score display */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center border">
            <span className={`text-xl font-semibold ${getScoreColor(compatibilityScore)}`}>
              {compatibilityScore}%
            </span>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {getMatchLevel(compatibilityScore)}
          </p>
        </div>

        {/* Job details */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Position
            </h3>
            <p className="text-base font-medium text-foreground">
              {jobTitle || 'Unknown Position'}
            </p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Company
            </h3>
            <p className="text-base font-medium text-foreground">
              {companyName || 'Unknown Company'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSummarySection;