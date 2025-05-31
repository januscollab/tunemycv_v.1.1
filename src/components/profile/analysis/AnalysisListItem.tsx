
import React from 'react';
import { Eye, Calendar, Building, Trash2, FileText, MessageSquare, CreditCard } from 'lucide-react';

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
  onInterviewPrep 
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      onDelete(analysis.id);
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">
              {analysis.job_title || 'Untitled Position'}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {analysis.compatibility_score}% match
            </span>
            {analysis.credit_cost && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <CreditCard className="h-3 w-3 mr-1" />
                {analysis.credit_cost} credit{analysis.credit_cost > 1 ? 's' : ''} used
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Building className="h-4 w-4 mr-1" />
            <span>{analysis.company_name || 'Company not specified'}</span>
            <span className="mx-2">•</span>
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCoverLetter}
            className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <FileText className="h-4 w-4 mr-1" />
            Cover Letter
          </button>
          <button
            onClick={handleInterviewPrep}
            className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Interview Prep
          </button>
          <button
            onClick={() => onViewDetails(analysis)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisListItem;
