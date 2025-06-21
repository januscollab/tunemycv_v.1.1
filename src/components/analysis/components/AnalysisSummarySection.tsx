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
    <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface/95 to-surface/90 rounded-2xl shadow-lg border border-border/60 p-8 hover:shadow-xl transition-all duration-300">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
      
      {/* Header with enhanced title and floating action buttons */}
      <div className="relative flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-sm">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-title font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Analysis Summary
            </h2>
            <p className="text-caption text-muted-foreground mt-1">
              Comprehensive CV-Job Compatibility Report
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          {onReviewInBrowser && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onReviewInBrowser}
              className="flex items-center gap-2 font-normal hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 text-sm h-9"
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
              className="flex items-center gap-2 font-normal bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 text-sm h-9"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced content area with dynamic score display */}
      <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-12">
        {/* Dynamic score circle with gradient and animation */}
        <div className="flex-shrink-0 relative">
          <div className={`w-32 h-32 bg-gradient-to-br ${getScoreBg(compatibilityScore)} rounded-full flex items-center justify-center shadow-lg border border-border/30 relative overflow-hidden`}>
            {/* Animated background ring */}
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-current/20 animate-spin-slow" />
            
            {/* Score content */}
            <div className="text-center z-10">
              <span className={`text-3xl font-bold ${getScoreColor(compatibilityScore)} drop-shadow-sm`}>
                {compatibilityScore}%
              </span>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className={`h-4 w-4 ${getScoreColor(compatibilityScore)}`} />
              </div>
            </div>
          </div>
          
          {/* Score label */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className={`text-caption font-medium ${getScoreColor(compatibilityScore)} bg-surface/80 backdrop-blur px-3 py-1 rounded-full border border-border/50`}>
              {getMatchLevel(compatibilityScore)}
            </span>
          </div>
        </div>

        {/* Enhanced position and company details */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8 lg:mt-0">
          <div className="bg-gradient-to-br from-surface/80 to-surface/60 rounded-xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <h3 className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">
                Target Position
              </h3>
            </div>
            <p className="text-subheading font-bold text-foreground leading-tight">
              {jobTitle || 'Unknown Position'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-surface/80 to-surface/60 rounded-xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <h3 className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">
                Company
              </h3>
            </div>
            <p className="text-subheading font-bold text-foreground leading-tight">
              {companyName || 'Unknown Company'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSummarySection;