import React, { useState } from 'react';
import { Calendar, Building, Eye, Download, Trash2, Plus, MessageSquare, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CoverLetterItem {
  id: string;
  job_title: string;
  company_name: string;
  content: string;
  template_id?: string;
  created_at: string;
  updated_at: string;
  generation_parameters?: any;
  regeneration_count?: number;
  analysis_result_id?: string;
  linked_interview_prep_id?: string;
}

interface CoverLetterCardDLSProps {
  coverLetter: CoverLetterItem;
  onView: (coverLetter: CoverLetterItem) => void;
  onDelete: (coverLetter: CoverLetterItem) => void;
  onCreateInterviewPrep: (coverLetter: CoverLetterItem) => void;
  onViewAnalysis?: (analysisId: string) => void;
  onViewInterviewPrep?: (interviewPrepId: string) => void;
  onDownload?: (coverLetter: CoverLetterItem) => void;
  linkageCache?: Record<string, any>;
  className?: string;
}

const CoverLetterCardDLS: React.FC<CoverLetterCardDLSProps> = ({
  coverLetter,
  onView,
  onDelete,
  onCreateInterviewPrep,
  onViewAnalysis,
  onViewInterviewPrep,
  onDownload,
  linkageCache = {},
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(coverLetter);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(coverLetter);
  };

  const handleCreateInterviewPrep = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateInterviewPrep(coverLetter);
  };

  const handleViewAnalysis = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewAnalysis && linkageCache[coverLetter.id]?.linkedAnalysisId) {
      onViewAnalysis(linkageCache[coverLetter.id].linkedAnalysisId);
    }
  };

  const handleViewInterviewPrep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewInterviewPrep && linkageCache[coverLetter.id]?.linkedInterviewPrepId) {
      onViewInterviewPrep(linkageCache[coverLetter.id].linkedInterviewPrepId);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(coverLetter);
    } else {
      // Default download logic
      try {
        const content = `${coverLetter.content}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Cover_Letter_${coverLetter.job_title}_${coverLetter.company_name}_${new Date(coverLetter.created_at).toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTemplateName = (templateId?: string) => {
    switch (templateId) {
      case 'creative':
        return 'Creative';
      case 'technical':
        return 'Technical';
      case 'executive':
        return 'Executive';
      default:
        return 'Professional';
    }
  };

  const linkage = linkageCache[coverLetter.id] || {};

  return (
    <div
      className={cn(
        "bg-white dark:bg-surface border rounded-lg p-6 cursor-pointer transition-all duration-200",
        "border-apple-core/20 dark:border-citrus/20",
        "hover:border-zapier-orange hover:shadow-md",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(coverLetter)}
    >
      {/* Header with date and time */}
      <div className="flex items-center text-caption text-blueberry/60 dark:text-apple-core/60 mb-4">
        <Calendar className="h-3 w-3 mr-1" />
        <span>{formatDate(coverLetter.updated_at)} , {formatTime(coverLetter.updated_at)}</span>
      </div>

      {/* Main content */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {/* Job Title */}
            <h3 className="text-heading font-medium text-blueberry dark:text-citrus">
              {coverLetter.job_title}
            </h3>
            
            {/* Template Badge */}
            <Badge 
              variant="secondary" 
              className="text-tiny bg-muted text-blueberry dark:text-citrus"
            >
              {getTemplateName(coverLetter.template_id)}
            </Badge>
          </div>
          
          {/* Company and regeneration info */}
          <div className="flex items-center space-x-4 text-caption text-blueberry/60 dark:text-apple-core/60 mb-2">
            <div className="flex items-center space-x-1">
              <Building className="h-3 w-3" />
              <span>{coverLetter.company_name}</span>
            </div>
            {coverLetter.regeneration_count && coverLetter.regeneration_count > 0 && (
              <div className="text-zapier-orange font-medium">
                Regenerated {coverLetter.regeneration_count} time{coverLetter.regeneration_count > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons - hidden by default, shown on hover */}
      <div 
        className={cn(
          "flex items-center justify-between transition-all duration-200",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        )}
      >
        {/* Primary actions on the left */}
        <div className="flex items-center space-x-4">
          {/* View Source Analysis CTA */}
          {linkage.hasLinkedAnalysis && onViewAnalysis && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAnalysis}
              className="text-caption font-medium text-blueberry dark:text-citrus hover:text-zapier-orange transition-colors h-8 px-3 flex items-center space-x-2"
            >
              <Target className="h-4 w-4" />
              <span>View Source Analysis</span>
            </Button>
          )}

          {/* Dynamic CTA Logic for Interview Prep */}
          {linkage.hasLinkedInterviewPrep && onViewInterviewPrep ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewInterviewPrep}
              className="text-caption font-medium text-blueberry dark:text-citrus hover:text-zapier-orange transition-colors h-8 px-3 flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>View Interview Notes</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateInterviewPrep}
              className="text-caption font-medium text-blueberry dark:text-citrus hover:text-zapier-orange transition-colors h-8 px-3 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Interview Prep</span>
            </Button>
          )}
        </div>

        {/* Secondary actions on the right */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="text-blueberry/60 dark:text-apple-core/60 hover:text-zapier-orange transition-colors h-8 w-8 p-0"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-blueberry/60 dark:text-apple-core/60 hover:text-zapier-orange transition-colors h-8 w-8 p-0"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive/80 transition-colors h-8 w-8 p-0"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterCardDLS;