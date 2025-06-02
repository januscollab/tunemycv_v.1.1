
import React from 'react';
import { Calendar, Building, CreditCard } from 'lucide-react';
import DocumentActions from '@/components/common/DocumentActions';

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
  onDownload?: (analysis: AnalysisResult) => void;
}

const AnalysisListItem: React.FC<AnalysisListItemProps> = ({ 
  analysis, 
  onViewDetails, 
  onDelete, 
  onCreateCoverLetter, 
  onInterviewPrep,
  onDownload 
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

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(analysis);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(analysis);
    }
  };

  const generatePdfContent = () => {
    return `CV Analysis Report\n\nJob Title: ${analysis.job_title}\nCompany: ${analysis.company_name}\nCompatibility Score: ${analysis.compatibility_score}%\n\nExecutive Summary:\n${analysis.executive_summary}\n\nStrengths:\n${analysis.strengths?.join('\n• ') || 'None listed'}\n\nWeaknesses:\n${analysis.weaknesses?.join('\n• ') || 'None listed'}\n\nRecommendations:\n${analysis.recommendations?.join('\n• ') || 'None listed'}`;
  };

  const downloadAsText = () => {
    const content = generatePdfContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.job_title}_${analysis.company_name}_analysis.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPdf = () => {
    const content = generatePdfContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${analysis.job_title} - ${analysis.company_name} Analysis</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                font-size: 12pt; 
                line-height: 1.5; 
                margin: 20mm; 
                white-space: pre-wrap;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>${content.replace(/\n/g, '<br>')}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const downloadAsWord = () => {
    // Fallback to text for Word download
    downloadAsText();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow hover:border-zapier-orange/50">
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
        
        <DocumentActions
          onView={handleView}
          onDelete={handleDelete}
          onCoverLetter={handleCoverLetter}
          onInterviewPrep={handleInterviewPrep}
          onDownloadTxt={downloadAsText}
          onDownloadPdf={downloadAsPdf}
          onDownloadWord={downloadAsWord}
          showCoverLetter={true}
          showInterviewPrep={true}
          showDownload={true}
        />
      </div>
    </div>
  );
};

export default AnalysisListItem;
