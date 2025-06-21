
import React, { useState } from 'react';
import { Calendar, Eye, Download, Trash2, FileText, Pen, MessageSquare, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CaptureInput } from '@/components/ui/capture-input';
import { cn } from '@/lib/utils';
import LinkageIndicators from '@/components/analysis/LinkageIndicators';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';

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
  onAnalysisUpdate?: (updatedAnalysis: AnalysisHistoryItem) => void;
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
  className,
  onAnalysisUpdate
}) => {
  const [editJobTitle, setEditJobTitle] = useState(analysis.job_title || 'Unknown Position');
  const [editCompanyName, setEditCompanyName] = useState(analysis.company_name || 'Unknown Company');
  const [isSaving, setIsSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveEdit = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('analysis_results')
        .update({
          job_title: editJobTitle,
          company_name: editCompanyName
        })
        .eq('id', analysis.id);

      if (error) throw error;

      // Update the analysis object and notify parent
      const updatedAnalysis = {
        ...analysis,
        job_title: editJobTitle,
        company_name: editCompanyName
      };
      
      if (onAnalysisUpdate) {
        onAnalysisUpdate(updatedAnalysis);
      }

      setEditDialogOpen(false);
      toast({
        title: "Updated Successfully",
        description: "Position and company name have been updated.",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: "Failed to update the analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditJobTitle(analysis.job_title || 'Unknown Position');
    setEditCompanyName(analysis.company_name || 'Unknown Company');
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(analysis);
    setDeleteDialogOpen(false);
  };

  const handleDownloadPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(analysis);
  };

  return (
    <>
      <div
        className={cn(
          "group rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative border-t-4 border-t-[#FF6B35] p-4 h-[120px]",
          className
        )}
        onClick={() => onView(analysis)}
      >
        {/* CV Analysis Badge - Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-orange-500 bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-800">
            <span>CV Analysis</span>
          </div>
        </div>

        {/* Main content layout */}
        <div className="flex items-start space-x-4 h-full">
          {/* Orange Lightning Icon - Left */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/20 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 pr-20 flex flex-col justify-between h-full">
            <div>
              {/* Title and company with edit */}
              <div className="group/edit relative flex items-center gap-2 mb-1">
                <h3 className="text-heading font-bold text-foreground">
                  {analysis.job_title || 'Unknown Position'} - {analysis.company_name || 'Unknown Company'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="h-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Pen className="h-3 w-3 text-gray-500" />
                </Button>
              </div>
            </div>
            
            {/* Date and Compatibility */}
            <div className="flex items-center text-caption text-muted-foreground mt-auto">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(analysis.created_at)}</span>
              {analysis.compatibility_score && (
                <div className="flex items-center text-sm ml-4">
                  <span className="text-sm font-bold text-[#FF6B35] mr-1">
                    {analysis.compatibility_score}%
                  </span>
                  <span>compatibility</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hover Menu - Bottom Right */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-1">
            {/* Cover Letter CTA */}
            {linkage.hasLinkedCoverLetter ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (linkage.linkedCoverLetterId) {
                    onViewCoverLetter(linkage.linkedCoverLetterId);
                  }
                }}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FileText className="h-4 w-4 text-blue-600" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateCoverLetter(analysis);
                }}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FileText className="h-4 w-4 text-black dark:text-white" />
              </Button>
            )}

            {/* Interview Prep CTA */}
            {linkage.hasLinkedInterviewPrep ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (linkage.linkedInterviewPrepId) {
                    onViewInterviewPrep(linkage.linkedInterviewPrepId);
                  }
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
                  onCreateInterviewPrep(analysis);
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
                onView(analysis);
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Eye className="h-4 w-4 text-black dark:text-white" />
            </Button>

            {/* Download PDF Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadPDF}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4 text-black dark:text-white" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deletingId === analysis.id}
              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        </div>

        {/* Edit Title Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Analysis Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <CaptureInput
                label="Position Title"
                value={editJobTitle}
                onChange={(e) => setEditJobTitle(e.target.value)}
                placeholder="Enter position title"
                required
              />
              <CaptureInput
                label="Company Name"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                placeholder="Enter company name"
                required
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete CV Analysis"
        description="Are you sure you want to delete this CV analysis? This action cannot be undone and will permanently remove all associated data including any linked cover letters and interview prep materials."
        creditCost={0}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default EnhancedAnalysisCard;
