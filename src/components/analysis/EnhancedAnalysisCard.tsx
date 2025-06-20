import React, { useState } from 'react';
import { Calendar, Eye, Download, Trash2, FileText, Pen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CaptureInput } from '@/components/ui/capture-input';
import { cn } from '@/lib/utils';
import LinkageIndicators from '@/components/analysis/LinkageIndicators';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 cursor-pointer relative border-t-4 border-t-[#FF6B35]",
        className
      )}
      onClick={() => onView(analysis)}
    >
      {/* Main content layout */}
      <div className="flex items-start justify-between">
        {/* Left side - Icon and content */}
        <div className="flex items-start space-x-3 flex-1">
          {/* Document icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and company with edit */}
            <div className="group/edit relative flex items-center gap-2 mb-1">
              <h3 className="text-heading font-medium text-foreground truncate">
                {analysis.job_title || 'Unknown Position'} - {analysis.company_name || 'Unknown Company'}
              </h3>
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={handleEditClick}
                    className="opacity-0 group-hover/edit:opacity-100 transition-opacity duration-200 p-1 hover:bg-muted rounded"
                    title="Edit position and company"
                  >
                    <Pen className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </DialogTrigger>
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
            
            {/* Date */}
            <div className="flex items-center text-caption text-muted-foreground mb-2">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Updated {formatDate(analysis.created_at)}</span>
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
        
        {/* Right side - Badge and score */}
        <div className="flex flex-col items-end space-y-2">
          <Badge className="text-micro bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            CV Analysis
          </Badge>
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
        </div>
      </div>

      {/* Action buttons row at bottom */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
        {/* Dynamic CTAs on the left */}
        <div className="flex items-center space-x-2">
          {/* Cover Letter CTA */}
          {linkage.hasLinkedCoverLetter ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                linkage.linkedCoverLetterId && onViewCoverLetter(linkage.linkedCoverLetterId);
              }}
              className="text-caption font-medium transition-colors h-8 px-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Cover Letter
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onGenerateCoverLetter(analysis);
              }}
              className="text-caption font-medium transition-colors h-8 px-3 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Cover Letter
            </Button>
          )}

          {/* Interview Prep CTA */}
          {linkage.hasLinkedInterviewPrep ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                linkage.linkedInterviewPrepId && onViewInterviewPrep(linkage.linkedInterviewPrepId);
              }}
              className="text-caption font-medium transition-colors h-8 px-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Interview Prep
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCreateInterviewPrep(analysis);
              }}
              className="text-caption font-medium transition-colors h-8 px-3 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Interview Prep
            </Button>
          )}
        </div>

        {/* Action icons on the right */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(analysis);
            }}
            className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-foreground hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(analysis);
            }}
            className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-foreground hover:text-foreground"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(analysis);
            }}
            disabled={deletingId === analysis.id}
            className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalysisCard;