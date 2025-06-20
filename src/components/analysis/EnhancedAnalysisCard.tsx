import React, { useState } from 'react';
import { Calendar, Eye, Download, Trash2, FileText, Pen, MessageSquare } from 'lucide-react';
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
        "group rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative border-t-4 border-t-[#FF6B35] p-6",
        className
      )}
      onClick={() => onView(analysis)}
    >
      {/* Main content layout */}
      <div className="flex items-start justify-between mb-6">
        {/* Left side - Icon and content */}
        <div className="flex items-start space-x-4 flex-1">
          {/* Document icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and company with edit */}
            <div className="group/edit relative flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-foreground">
                {analysis.job_title || 'Unknown Position'} – {analysis.company_name || 'Unknown Company'}
              </h3>
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={handleEditClick}
                    className="opacity-0 group-hover/edit:opacity-100 transition-opacity duration-200 p-1 hover:bg-muted rounded"
                    title="Edit position and company"
                  >
                    <Pen className="h-4 w-4 text-muted-foreground hover:text-foreground" />
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
            
            {/* Date and Compatibility */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
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
        
        {/* Right side - Badge */}
        <div className="flex flex-col items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(analysis);
            }}
            className="text-[10px] h-6 px-2 bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 transition-colors duration-200"
          >
            CV Analysis
          </Button>
        </div>
      </div>

      {/* Action buttons row at bottom */}
      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Cover Letter CTA */}
        {linkage.hasLinkedCoverLetter ? (
          <span className="text-sm text-muted-foreground mr-2">✓ Cover Letter</span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onGenerateCoverLetter(analysis);
            }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground mr-2 flex items-center gap-1"
          >
            <FileText className="h-3 w-3" />
            Cover Letter
          </Button>
        )}

        {/* Interview Prep CTA */}
        {linkage.hasLinkedInterviewPrep ? (
          <span className="text-sm text-muted-foreground mr-2">✓ Interview Prep</span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCreateInterviewPrep(analysis);
            }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground mr-2 flex items-center gap-1"
          >
            <MessageSquare className="h-3 w-3" />
            Interview Prep
          </Button>
        )}

        {/* Action icons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onView(analysis);
          }}
          className="p-2"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(analysis);
          }}
          className="p-2"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(analysis);
          }}
          disabled={deletingId === analysis.id}
          className="p-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedAnalysisCard;