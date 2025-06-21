import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Eye, 
  Download, 
  Trash2, 
  Target, 
  MessageSquare,
  Edit,
  Pencil,
  FileText
} from 'lucide-react';
import EditTitleDialog from '@/components/ui/edit-title-dialog';
import CoverLetterVersionBadge from '@/components/cover-letter/CoverLetterVersionBadge';
import DocumentDeleteDialog from '@/components/ui/document-delete-dialog';
import DownloadOptions from '@/components/cover-letter/DownloadOptions';

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
  const [isEditTitleOpen, setIsEditTitleOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTitleSave = (newTitle: string) => {
    // TODO: Implement title update functionality
    console.log('Updating title to:', newTitle);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(coverLetter);
    setIsDeleteDialogOpen(false);
  };

  const currentTitle = `${coverLetter.job_title} - ${coverLetter.company_name}`;

  // Calculate version number based on regeneration count
  const versionNumber = (coverLetter.regeneration_count || 0) + 1;
  const totalVersions = versionNumber;
  const isLatestVersion = true; // Since we're showing the latest version

  return (
    <>
      <Card
        className="group hover:shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 cursor-pointer border border-border relative border-t-4 border-t-orange-500 h-[120px]"
        onClick={() => onView(coverLetter)}
      >
        {/* Green Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {/* Version Badge */}
          {totalVersions > 1 && (
            <CoverLetterVersionBadge
              version={versionNumber}
              isLatest={isLatestVersion}
              totalVersions={totalVersions}
            />
          )}
          
          {/* Cover Letter Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-green-500 bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
            <span>Cover Letter</span>
          </div>
        </div>
        
        <CardContent className="p-4 relative h-full">
          <div className="flex items-start space-x-4 h-full">
            {/* Green Edit Icon - Left */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
                <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Content - Title/Company and Date stacked */}
            <div className="flex-1 min-w-0 pr-20">
              {/* Title and Company with Edit Icon */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-heading font-bold text-foreground truncate">
                  {coverLetter.job_title} - {coverLetter.company_name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditTitleOpen(true);
                  }}
                  className="h-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Pencil className="h-3 w-3 text-gray-500" />
                </Button>
              </div>
              
              {/* Date directly under title */}
              <div className="flex items-center text-caption text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(coverLetter.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Hover Menu - Bottom Right */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center space-x-1">
              {/* Cover Letter Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(coverLetter);
                }}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FileText className="h-4 w-4 text-black dark:text-white" />
              </Button>

              {/* Interview Prep */}
              {linkageData?.hasLinkedInterviewPrep ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewInterviewPrep(linkageData.linkedInterviewPrepId);
                  }}
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MessageSquare className="h-4 w-4 text-black dark:text-white" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateInterviewPrep(coverLetter);
                  }}
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MessageSquare className="h-4 w-4 text-black dark:text-white" />
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
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Eye className="h-4 w-4 text-black dark:text-white" />
              </Button>

              {/* Download Options */}
              <DownloadOptions
                content={coverLetter.content}
                fileName={`${coverLetter.job_title}-${coverLetter.company_name}-Cover-Letter`}
                triggerComponent={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Download className="h-4 w-4 text-black dark:text-white" />
                  </Button>
                }
              />

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Edit Title Dialog */}
        <EditTitleDialog
          isOpen={isEditTitleOpen}
          onClose={() => setIsEditTitleOpen(false)}
          onSave={handleTitleSave}
          currentTitle={currentTitle}
          titleType="cover-letter"
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <DocumentDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        documentType="Cover Letter"
        title={`Delete "${coverLetter.job_title} - ${coverLetter.company_name}"?`}
      />
    </>
  );
};

export default CoverLetterDocumentHistoryItem;
