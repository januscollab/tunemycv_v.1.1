import React, { useState } from 'react';
import { Calendar, Building, Eye, Download, Trash2, FileText, MessageSquare, Plus, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  id: string;
  job_title: string;
  company_name: string;
  compatibility_score: number;
  created_at: string;
  executive_summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  credit_cost?: number;
  has_cover_letter?: boolean;
}

interface AnalysisCardExperimentProps {
  analysis: AnalysisResult;
  onViewDetails: (analysis: AnalysisResult) => void;
  onDelete: (analysisId: string) => void;
  onCreateCoverLetter: (analysis: AnalysisResult) => void;
  onInterviewPrep: (analysis: AnalysisResult) => void;
  onEditTitle?: (analysisId: string, newTitle: string) => void;
  className?: string;
}

const AnalysisCardExperiment: React.FC<AnalysisCardExperimentProps> = ({
  analysis,
  onViewDetails,
  onDelete,
  onCreateCoverLetter,
  onInterviewPrep,
  onEditTitle,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(analysis.job_title || '');

  const handleEditTitle = () => {
    if (onEditTitle && editedTitle.trim() !== analysis.job_title) {
      onEditTitle(analysis.id, editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(analysis.job_title || '');
      setIsEditingTitle(false);
    }
  };

  const handleCoverLetter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateCoverLetter(analysis);
  };

  const handleInterviewPrep = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInterviewPrep(analysis);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(analysis);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Download logic would go here
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(analysis.id);
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
      onClick={() => onViewDetails(analysis)}
    >
      {/* Header with date and time */}
      <div className="flex items-center text-caption text-blueberry/60 dark:text-apple-core/60 mb-4">
        <Calendar className="h-3 w-3 mr-1" />
        <span>{formatDate(analysis.created_at)} , {formatTime(analysis.created_at)}</span>
      </div>

      {/* Main content */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {/* Job Title with edit functionality */}
            <div className="flex items-center space-x-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleEditTitle}
                  onKeyDown={handleKeyPress}
                  className="text-heading font-medium text-blueberry dark:text-citrus bg-transparent border-b border-ring focus:outline-none focus:border-zapier-orange"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <h3 className="text-heading font-medium text-blueberry dark:text-citrus">
                    {analysis.job_title || 'Untitled Position'}
                  </h3>
                  {onEditTitle && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingTitle(true);
                      }}
                      className="text-blueberry/40 dark:text-apple-core/40 hover:text-zapier-orange transition-colors"
                      title="Edit title"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </>
              )}
            </div>
            
            {/* CV Analysis Badge */}
            <Badge 
              variant="secondary" 
              className="text-tiny bg-muted text-blueberry dark:text-citrus"
            >
              cv analysis
            </Badge>
          </div>
          
          {/* Company */}
          <div className="flex items-center text-caption text-blueberry/60 dark:text-apple-core/60 mb-3">
            <Building className="h-3 w-3 mr-1" />
            <span>{analysis.company_name || 'Company not specified'}</span>
          </div>
        </div>
        
        {/* Compatibility Score */}
        <div className="text-right">
          <div className="text-4xl font-bold text-zapier-orange">
            {analysis.compatibility_score}%
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCoverLetter}
            className="text-caption font-medium text-blueberry dark:text-citrus hover:text-zapier-orange transition-colors h-8 px-3 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Cover Letter</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInterviewPrep}
            className="text-caption font-medium text-blueberry dark:text-citrus hover:text-zapier-orange transition-colors h-8 px-3 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Interview Prep</span>
          </Button>
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

export default AnalysisCardExperiment;