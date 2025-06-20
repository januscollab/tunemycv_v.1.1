import React, { useState } from 'react';
import { Calendar, Building, Eye, Download, Trash2, MessageSquare, Plus, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VybeButton } from '@/components/design-system/VybeButton';
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
        "bg-card dark:bg-surface border border-border rounded-lg p-6 cursor-pointer transition-all duration-normal relative group",
        "hover:border-primary hover:shadow-md",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(analysis)}
    >
      {/* Document Type Badge */}
      <Badge variant="subtle" className="absolute top-4 right-4 text-micro">
        CV Analysis
      </Badge>

      {/* Date header */}
      <div className="flex items-center text-caption text-muted-foreground mb-4">
        <Calendar className="h-3 w-3 mr-1" />
        <span>Updated {formatDate(analysis.created_at)}</span>
      </div>

      {/* Main content - Horizontal layout with prominent score */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 pr-6">
          {/* Job title and type badge */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-heading font-semibold text-foreground">
              {analysis.job_title || 'Untitled Position'}
            </h3>
            <Badge variant="secondary" className="text-tiny">
              {getAnalysisTypeLabel(analysis.analysis_type)}
            </Badge>
          </div>
          
          {/* Company info */}
          {analysis.company_name && (
            <div className="flex items-center text-caption text-muted-foreground mb-3">
              <Building className="h-3 w-3 mr-1.5" />
              <span>{analysis.company_name}</span>
            </div>
          )}
          
          {/* Linkage Indicators */}
          <div className="mt-3">
            <LinkageIndicators
              hasLinkedCoverLetter={linkage.hasLinkedCoverLetter}
              hasLinkedInterviewPrep={linkage.hasLinkedInterviewPrep}
              onViewCoverLetter={() => linkage.linkedCoverLetterId && onViewCoverLetter(linkage.linkedCoverLetterId)}
              onViewInterviewPrep={() => linkage.linkedInterviewPrepId && onViewInterviewPrep(linkage.linkedInterviewPrepId)}
              compact={true}
            />
          </div>
        </div>

        {/* Prominent compatibility score */}
        {analysis.compatibility_score && (
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl font-bold text-primary mb-1">
              {analysis.compatibility_score}%
            </div>
            <div className="text-caption text-muted-foreground">
              Compatibility
            </div>
          </div>
        )}
      </div>

      {/* Action buttons - positioned at bottom, hidden until hover */}
      <div 
        className={cn(
          "flex items-center justify-between transition-all duration-normal absolute bottom-4 left-6 right-6",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        )}
      >
        {/* CTA actions on the left */}
        <div className="flex items-center gap-2">
          {/* Dynamic CTA Logic for Cover Letter */}
          {linkage.hasLinkedCoverLetter ? (
            <VybeButton
              vybeVariant="ghost"
              vybeSize="sm"
              icon={MessageSquare}
              onClick={handleViewCoverLetter}
              className="text-caption text-foreground hover:text-primary"
            >
              View Cover Letter
            </VybeButton>
          ) : (
            <VybeButton
              vybeVariant="ghost"
              vybeSize="sm"
              icon={Plus}
              onClick={handleGenerateCoverLetter}
              className="text-caption text-foreground hover:text-primary"
            >
              Generate Cover Letter
            </VybeButton>
          )}

          {/* Dynamic CTA Logic for Interview Prep */}
          {linkage.hasLinkedInterviewPrep ? (
            <VybeButton
              vybeVariant="ghost"
              vybeSize="sm"
              icon={MessageSquare}
              onClick={handleViewInterviewPrep}
              className="text-caption text-foreground hover:text-primary"
            >
              View Interview Notes
            </VybeButton>
          ) : (
            <VybeButton
              vybeVariant="ghost"
              vybeSize="sm"
              icon={Plus}
              onClick={handleCreateInterviewPrep}
              className="text-caption text-foreground hover:text-primary"
            >
              Create Interview Prep
            </VybeButton>
          )}
        </div>

        {/* Utility actions on the right */}
        <div className="flex items-center gap-1">
          <VybeIconButton
            icon={Eye}
            tooltip="View Analysis"
            onClick={() => onView(analysis)}
            variant="ghost"
            size="sm"
            className="text-foreground hover:text-primary"
          />
          
          <VybeIconButton
            icon={Download}
            tooltip="Download Analysis"
            onClick={() => onDownload(analysis)}
            variant="ghost"
            size="sm"
            className="text-foreground hover:text-primary"
          />
          
          <VybeIconButton
            icon={Trash2}
            tooltip="Delete Analysis"
            onClick={() => onDelete(analysis)}
            disabled={deletingId === analysis.id}
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          />
        </div>
      </div>

      {/* Bottom padding for button space */}
      <div className="h-10"></div>
    </div>
  );
};

export default EnhancedAnalysisCard;