import React from 'react';
import { Calendar, Eye, Download, Trash2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VybeIconButton } from '@/components/design-system/VybeIconButton';
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={cn(
        "bg-card dark:bg-surface border border-border rounded-lg cursor-pointer transition-all duration-normal relative group",
        "hover:border-primary hover:shadow-md border-t-4 border-t-[#FF6B35]",
        className
      )}
      onClick={() => onView(analysis)}
    >
      <div className="p-6">
        {/* Main content - Icon and content layout */}
        <div className="flex items-start gap-4 mb-4">
          {/* Document icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and company on same line */}
            <h3 className="text-heading font-semibold text-foreground mb-1">
              {analysis.job_title || 'Untitled Position'} - {analysis.company_name || 'Company not specified'}
            </h3>
            
            {/* Date with timestamp */}
            <div className="flex items-center text-caption text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(analysis.created_at)}</span>
            </div>
          </div>
          
          {/* Score, badge and actions area */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* Compatibility score */}
            {analysis.compatibility_score && (
              <div className="text-right">
                <div className="text-2xl font-bold text-[#FF6B35] leading-none">
                  {analysis.compatibility_score}%
                </div>
                <div className="text-tiny text-muted-foreground">
                  compatibility
                </div>
              </div>
            )}
            
            {/* Badge */}
            <Badge variant="subtle" className="text-micro">
              CV Analysis
            </Badge>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1 ml-4">
              <VybeIconButton
                icon={Eye}
                tooltip="View"
                onClick={() => onView(analysis)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              />
              
              <VybeIconButton
                icon={Download}
                tooltip="Download"
                onClick={() => onDownload(analysis)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              />
              
              <VybeIconButton
                icon={Trash2}
                tooltip="Delete"
                onClick={() => onDelete(analysis)}
                disabled={deletingId === analysis.id}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              />
            </div>
          </div>
        </div>
        
        {/* Linkage Indicators */}
        <div className="ml-14">
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
  );
};

export default EnhancedAnalysisCard;