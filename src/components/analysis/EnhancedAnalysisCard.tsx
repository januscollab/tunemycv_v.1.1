import React, { useState } from 'react';
import { Calendar, Eye, Download, Trash2, FileText, Pen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VybeIconButton } from '@/components/design-system/VybeIconButton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import LinkageIndicators from '@/components/analysis/LinkageIndicators';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentTypeBadge } from '@/components/ui/document-type-badge';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editJobTitle, setEditJobTitle] = useState(analysis.job_title || 'Untitled Position');
  const [editCompanyName, setEditCompanyName] = useState(analysis.company_name || 'Company not specified');
  const [isSaving, setIsSaving] = useState(false);
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

      setIsEditing(false);
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

  const handleCancelEdit = () => {
    setEditJobTitle(analysis.job_title || 'Untitled Position');
    setEditCompanyName(analysis.company_name || 'Company not specified');
    setIsEditing(false);
  };

  const handleCardClick = () => {
    if (!isEditing) {
      onView(analysis);
    }
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 border border-border relative border-t-4 border-t-[#FF6B35]",
        !isEditing && "cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Document Type Badge */}
      <DocumentTypeBadge 
        type="analysis" 
        variant="secondary" 
        size="sm" 
        className="absolute top-2 right-2"
      />
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-start space-x-3 mb-2">
              {/* Document icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Title and company with edit functionality */}
                <div className="group/edit relative">
                  {isEditing ? (
                    <div className="flex gap-2 mb-1">
                      <Input
                        value={editJobTitle}
                        onChange={(e) => setEditJobTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="text-heading font-semibold h-auto p-1 border-blue-300 focus:border-blue-500"
                        placeholder="Position title"
                        autoFocus
                      />
                      <span className="text-heading font-semibold text-foreground self-center">-</span>
                      <Input
                        value={editCompanyName}
                        onChange={(e) => setEditCompanyName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="text-heading font-semibold h-auto p-1 border-blue-300 focus:border-blue-500"
                        placeholder="Company name"
                      />
                      <div className="flex gap-1 self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit();
                          }}
                          disabled={isSaving}
                          className="text-green-600 hover:text-green-700 text-sm px-2 py-1 rounded bg-green-50 hover:bg-green-100"
                        >
                          Save
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          className="text-gray-600 hover:text-gray-700 text-sm px-2 py-1 rounded bg-gray-50 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-heading font-medium text-foreground">
                        {analysis.job_title || 'Untitled Position'} - {analysis.company_name || 'Company not specified'}
                      </h3>
                      <button
                        onClick={handleEditClick}
                        className="opacity-0 group-hover/edit:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        title="Edit position and company"
                      >
                        <Pen className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Date and badge row */}
                <div className="flex items-center space-x-4 text-caption text-muted-foreground mb-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Updated {formatDate(analysis.created_at)}</span>
                  </div>
                  <Badge className="text-micro bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                    CV Analysis
                  </Badge>
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
          </div>
          
          {/* Compatibility score on the right */}
          {analysis.compatibility_score && (
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-[#FF6B35] leading-none">
                {analysis.compatibility_score}%
              </div>
              <div className="text-tiny text-muted-foreground">
                compatibility
              </div>
            </div>
          )}
        </div>

        {/* Action buttons row at bottom */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border">
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
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(analysis);
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
                onDownload(analysis);
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
      </CardContent>
    </Card>
  );
};

export default EnhancedAnalysisCard;