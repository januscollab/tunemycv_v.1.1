
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Eye, 
  Download, 
  Trash2, 
  Target, 
  MessageSquare,
  Edit
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
      {/* Green Badge - Top Right */}
      <div className="absolute top-3 right-3 z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-green-500 bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
          <span>Cover Letter</span>
        </div>
      </div>
      
      <CardContent className="p-4 relative">
        <div className="flex items-start space-x-4">
          {/* Green Edit Icon - Left */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Content - Stacked Title, Company + Date */}
          <div className="flex-1 min-w-0 pr-20">
            {/* Title */}
            <h3 className="text-heading font-medium text-foreground truncate mb-1">
              {coverLetter.job_title}
            </h3>
            
            {/* Company and Date on same line */}
            <div className="flex items-center text-subheading text-muted-foreground mb-1">
              <span className="truncate">{coverLetter.company_name}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center text-caption">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(coverLetter.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Menu - Bottom Right */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-3">
            {/* CV Analysis */}
            {linkageData?.hasLinkedAnalysis ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAnalysis(linkageData.linkedAnalysisId);
                }}
                className="h-auto p-1 flex flex-col items-center text-black hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Target className="h-4 w-4 mb-1" />
                <span className="text-xs">CV Analysis</span>
              </Button>
            ) : null}

            {/* Interview Prep */}
            {linkageData?.hasLinkedInterviewPrep ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewInterviewPrep(linkageData.linkedInterviewPrepId);
                }}
                className="h-auto p-1 flex flex-col items-center text-black hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MessageSquare className="h-4 w-4 mb-1" />
                <span className="text-xs">Interview Prep</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateInterviewPrep(coverLetter);
                }}
                className="h-auto p-1 flex flex-col items-center text-black hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MessageSquare className="h-4 w-4 mb-1" />
                <span className="text-xs">Interview Prep</span>
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
              className="h-auto p-1 flex flex-col items-center text-black hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Eye className="h-4 w-4 mb-1" />
              <span className="text-xs">View</span>
            </Button>

            {/* Download Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(coverLetter);
              }}
              className="h-auto p-1 flex flex-col items-center text-black hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4 mb-1" />
              <span className="text-xs">Download</span>
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
              className="h-auto p-1 flex flex-col items-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4 mb-1" />
              <span className="text-xs">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoverLetterDocumentHistoryItem;
