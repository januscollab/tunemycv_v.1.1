
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  Eye, 
  Download, 
  Trash2, 
  MessageSquare, 
  Target, 
  Plus 
} from 'lucide-react';
import { DocumentTypeBadge } from '@/components/ui/document-type-badge';

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

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 cursor-pointer border border-border relative border-t-4 border-t-orange-500"
      onClick={() => onView(coverLetter)}
    >
      {/* Document Type Badge - Top Right */}
      <div className="absolute top-3 right-3 z-10">
        <DocumentTypeBadge 
          type="cover_letter" 
          variant="secondary" 
          size="sm" 
          className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-800"
        />
      </div>
      
      <CardContent className="p-4 relative">
        <div className="flex items-start space-x-4">
          {/* Blue File Icon - Left */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Content - Stacked Title, Company, Date */}
          <div className="flex-1 min-w-0 pr-20">
            {/* Title */}
            <h3 className="text-heading font-medium text-foreground truncate mb-1">
              {coverLetter.job_title}
            </h3>
            
            {/* Company */}
            <p className="text-subheading text-muted-foreground truncate mb-1">
              {coverLetter.company_name}
            </p>
            
            {/* Date */}
            <div className="flex items-center text-caption text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Updated {formatDate(coverLetter.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Hover Menu - Bottom Right */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-1">
            {/* Dynamic CTAs */}
            {linkageData?.hasLinkedAnalysis && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAnalysis(linkageData.linkedAnalysisId);
                }}
                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <Target className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Interview Prep Button */}
            {linkageData?.hasLinkedInterviewPrep ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewInterviewPrep(linkageData.linkedInterviewPrepId);
                }}
                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateInterviewPrep(coverLetter);
                }}
                className="h-7 w-7 p-0 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* View Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(coverLetter);
              }}
              className="h-7 w-7 p-0 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-950/20"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>

            {/* Download Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(coverLetter);
              }}
              className="h-7 w-7 p-0 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-950/20"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(coverLetter);
              }}
              disabled={isDeleting}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoverLetterDocumentHistoryItem;
