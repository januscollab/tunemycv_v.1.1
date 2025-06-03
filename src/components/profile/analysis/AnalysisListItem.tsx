
import React from 'react';
import { FileText, Download, Trash2, MessageSquare, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  cv_file_name?: string;
  cv_file_size?: number;
  has_cover_letter?: boolean;
}

interface AnalysisListItemProps {
  analysis: AnalysisResult;
  onViewDetails: (analysis: AnalysisResult) => void;
  onDelete: (analysisId: string) => void;
  onCreateCoverLetter: (analysis: AnalysisResult) => void;
  onInterviewPrep: (analysis: AnalysisResult) => void;
}

const AnalysisListItem: React.FC<AnalysisListItemProps> = ({
  analysis,
  onViewDetails,
  onDelete,
  onCreateCoverLetter,
  onInterviewPrep,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-6 border border-apple-core/20 dark:border-citrus/20 hover:border-zapier-orange/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="h-5 w-5 text-zapier-orange" />
            <div>
              <h3 className="font-semibold text-blueberry dark:text-citrus">
                {analysis.job_title}
              </h3>
              <p className="text-sm text-blueberry/70 dark:text-apple-core/80">
                {analysis.company_name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.compatibility_score)}`}>
              {analysis.compatibility_score}% Match
            </div>
            <span className="text-sm text-blueberry/60 dark:text-apple-core/70">
              {new Date(analysis.created_at).toLocaleDateString()}
            </span>
            {analysis.credit_cost && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {analysis.credit_cost} credit{analysis.credit_cost !== 1 ? 's' : ''} used
              </span>
            )}
          </div>

          {analysis.cv_file_name && (
            <p className="text-xs text-blueberry/60 dark:text-apple-core/70 mb-3">
              CV: {analysis.cv_file_name}
            </p>
          )}

          <p className="text-sm text-blueberry/80 dark:text-apple-core/90 line-clamp-2">
            {analysis.executive_summary}
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-2 pt-4 border-t border-apple-core/20 dark:border-citrus/20">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(analysis)}
            className="text-xs"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(analysis.id)}
            className="text-xs text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="text-xs"
            disabled
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCreateCoverLetter(analysis)}
            className="text-xs"
          >
            <FileText className="h-4 w-4 mr-1" />
            {analysis.has_cover_letter ? 'View Cover Letter' : 'Create Cover Letter'}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onInterviewPrep(analysis)}
            className="text-xs"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Create Interview Prep
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisListItem;
