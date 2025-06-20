import React, { useState } from 'react';
import { Calendar, Building, Eye, Download, Trash2, MessageSquare, Plus, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LinkageIndicators from '@/components/analysis/LinkageIndicators';

interface AnalysisHistoryItem {
  id: string;
  analysis_type: string;
  job_title?: string;
  company_name?: string;
  compatibility_score?: number;
  created_at: string;
  pdf_file_data?: string;
  html_file_data?: string;
  n8n_pdf_url?: string;
  n8n_html_url?: string;
  executive_summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}

interface LinkageData {
  hasLinkedCoverLetter: boolean;
  hasLinkedInterviewPrep: boolean;
  linkedCoverLetterId?: string;
  linkedInterviewPrepId?: string;
}

interface EnhancedAnalysisCardProps {
  analysis: AnalysisHistoryItem;
  linkage: LinkageData;
  onView: (analysis: AnalysisHistoryItem) => void;
  onDownload: (analysis: AnalysisHistoryItem) => void;
  onDelete: (analysis: AnalysisHistoryItem) => void;
  onGenerateCoverLetter: (analysis: AnalysisHistoryItem) => void;
  onViewCoverLetter: (coverLetterId: string) => void;
  onCreateInterviewPrep: (analysis: AnalysisHistoryItem) => void;
  onViewInterviewPrep: (interviewPrepId: string) => void;
  deletingId: string | null;
  className?: string;
}

const EnhancedAnalysisCard: React.FC<EnhancedAnalysisCardProps> = ({
  analysis,
  linkage,
  onView,
  onDownload,
  onDelete,
  onGenerateCoverLetter,
  onViewCoverLetter,
  onCreateInterviewPrep,
  onViewInterviewPrep,
  deletingId,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'n8n':
        return 'Advanced Analysis';
      case 'ai':
        return 'AI Analysis';
      default:
        return 'Analysis';
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(analysis);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(analysis);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(analysis);
  };

  const handleGenerateCoverLetter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGenerateCoverLetter(analysis);
  };

  const handleViewCoverLetter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (linkage.linkedCoverLetterId) {
      onViewCoverLetter(linkage.linkedCoverLetterId);
    }
  };

  const handleCreateInterviewPrep = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateInterviewPrep(analysis);
  };

  const handleViewInterviewPrep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (linkage.linkedInterviewPrepId) {
      onViewInterviewPrep(linkage.linkedInterviewPrepId);
    }
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-surface border rounded-lg p-6 cursor-pointer transition-all duration-200 relative",
        "border-border",
        "hover:border-primary hover:shadow-md",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(analysis)}
    >
      {/* Document Type Badge */}
      <Badge variant="subtle" className="absolute top-2 right-2 text-micro">
        cv analysis
      </Badge>

      {/* Date header */}
      <div className="flex items-center text-caption text-muted-foreground mb-4">
        <Calendar className="h-3 w-3 mr-1" />
        <span>Updated {formatDate(analysis.created_at)}</span>
      </div>

      {/* Main content */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-heading font-medium text-foreground">
              {analysis.job_title || 'Untitled Position'}
            </h3>
            <Badge variant="compact" className="text-tiny">
              {getAnalysisTypeLabel(analysis.analysis_type)}
            </Badge>
          </div>
          
          {/* Company and score row */}
          <div className="flex items-center justify-between mb-3">
            {analysis.company_name && (
              <div className="flex items-center text-caption text-muted-foreground">
                <Building className="h-3 w-3 mr-1" />
                <span>{analysis.company_name}</span>
              </div>
            )}
            
            {analysis.compatibility_score && (
              <div className="text-primary font-medium">
                Score: {analysis.compatibility_score}%
              </div>
            )}
          </div>
          
          {/* Linkage Indicators */}
          <div className="mt-2">
            <LinkageIndicators
              hasLinkedCoverLetter={linkage.hasLinkedCoverLetter}
              hasLinkedInterviewPrep={linkage.hasLinkedInterviewPrep}
              onViewCoverLetter={() => linkage.linkedCoverLetterId && onViewCoverLetter(linkage.linkedCoverLetterId)}
              onViewInterviewPrep={() => linkage.linkedInterviewPrepId && onViewInterviewPrep(linkage.linkedInterviewPrepId)}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* Action buttons - hidden by default, shown on hover and positioned at bottom */}
      <div 
        className={cn(
          "flex items-center justify-between transition-all duration-200 absolute bottom-6 left-6 right-6",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        )}
      >
        {/* Primary actions on the left */}
        <div className="flex items-center space-x-2">
          {/* Dynamic CTA Logic for Cover Letter */}
          {linkage.hasLinkedCoverLetter ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewCoverLetter}
              className="text-caption font-medium transition-colors h-8 px-3 text-foreground hover:text-primary"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              View Cover Letter
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateCoverLetter}
              className="text-caption font-medium transition-colors h-8 px-3 text-foreground hover:text-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Cover Letter
            </Button>
          )}

          {/* Dynamic CTA Logic for Interview Prep */}
          {linkage.hasLinkedInterviewPrep ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewInterviewPrep}
              className="text-caption font-medium transition-colors h-8 px-3 text-foreground hover:text-primary"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              View Interview Notes
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateInterviewPrep}
              className="text-caption font-medium transition-colors h-8 px-3 text-foreground hover:text-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Interview Prep
            </Button>
          )}
        </div>

        {/* Secondary actions on the right */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-foreground hover:text-primary"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-foreground hover:text-primary"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deletingId === analysis.id}
            className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Add bottom padding to ensure space for the absolute positioned buttons */}
      <div className="h-8"></div>
    </div>
  );
};

export default EnhancedAnalysisCard;