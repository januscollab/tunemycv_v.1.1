
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  Building, 
  Eye, 
  Download, 
  Trash2, 
  MessageSquare, 
  Target, 
  Plus 
} from 'lucide-react';
import { DocumentTypeBadge } from '@/components/ui/document-type-badge';
import LinkageIndicators from '@/components/analysis/LinkageIndicators';

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

interface CoverLetterDocumentHistoryItemProps {
  coverLetter: CoverLetterItem;
  linkageData: any;
  onView: (coverLetter: CoverLetterItem) => void;
  onViewAnalysis: (analysisId: string) => void;
  onViewInterviewPrep: (interviewPrepId: string) => void;
  onCreateInterviewPrep: (coverLetter: CoverLetterItem) => void;
  onDownload: (coverLetter: CoverLetterItem) => void;
  onDelete: (coverLetter: CoverLetterItem) => void;
  isDeleting: boolean;
}

const CoverLetterDocumentHistoryItem: React.FC<CoverLetterDocumentHistoryItemProps> = ({
  coverLetter,
  linkageData,
  onView,
  onViewAnalysis,
  onViewInterviewPrep,
  onCreateInterviewPrep,
  onDownload,
  onDelete,
  isDeleting
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

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 cursor-pointer border border-border relative"
      onClick={() => onView(coverLetter)}
    >
      {/* Document Type Badge */}
      <DocumentTypeBadge 
        type="cover_letter" 
        variant="secondary" 
        size="sm" 
        className="absolute top-2 right-2"
      />
      
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Left Side - Blue File Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Company */}
            <div className="mb-2">
              <h3 className="text-heading font-medium text-foreground truncate">
                {coverLetter.job_title}
              </h3>
              <p className="text-subheading text-muted-foreground truncate">
                {coverLetter.company_name}
              </p>
            </div>

            {/* Badges Row */}
            <div className="flex items-center space-x-2 mb-2">
              <Badge 
                variant="outline" 
                className="text-tiny bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-800"
              >
                Cover Letter
              </Badge>
              <Badge variant="compact" className="text-tiny">
                {getTemplateName(coverLetter.template_id)}
              </Badge>
              {coverLetter.regeneration_count && coverLetter.regeneration_count > 0 && (
                <Badge variant="outline" className="text-tiny bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
                  v{coverLetter.regeneration_count + 1}
                </Badge>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center text-caption text-muted-foreground mb-2">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Updated {formatDate(coverLetter.updated_at)}</span>
            </div>

            {/* Linkage Indicators */}
            <div className="mt-2">
              <LinkageIndicators
                hasLinkedCoverLetter={false}
                hasLinkedInterviewPrep={linkageData?.hasLinkedInterviewPrep || false}
                onViewInterviewPrep={() => onViewInterviewPrep(linkageData?.linkedInterviewPrepId)}
                compact={true}
              />
            </div>
          </div>
        </div>

        {/* Action buttons - Only visible on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            {/* Dynamic CTAs on the left */}
            <div className="flex items-center space-x-2">
              {/* View Source Analysis CTA */}
              {linkageData?.hasLinkedAnalysis && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewAnalysis(linkageData.linkedAnalysisId);
                  }}
                  className="text-caption font-medium transition-colors h-8 px-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Target className="h-4 w-4 mr-2" />
                  View Source Analysis
                </Button>
              )}

              {/* Dynamic CTA Logic for Interview Prep */}
              {linkageData?.hasLinkedInterviewPrep ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewInterviewPrep(linkageData.linkedInterviewPrepId);
                  }}
                  className="text-caption font-medium transition-colors h-8 px-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Interview Notes
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateInterviewPrep(coverLetter);
                  }}
                  className="text-caption font-medium transition-colors h-8 px-3 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Interview Prep
                </Button>
              )}
            </div>

            {/* Action icons on the right */}
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(coverLetter);
                }}
                className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-black hover:text-black"
              >
                <Eye className="h-4 w-4 text-black" />
                <span>View</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(coverLetter);
                }}
                className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-black hover:text-black"
              >
                <Download className="h-4 w-4 text-black" />
                <span>Download</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(coverLetter);
                }}
                disabled={isDeleting}
                className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoverLetterDocumentHistoryItem;
