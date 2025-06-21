
import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BrowserPDFViewerProps {
  result: any;
  onDownloadText: () => void;
}

const BrowserPDFViewer: React.FC<BrowserPDFViewerProps> = ({ result, onDownloadText }) => {
  const analysisDate = result.created_at ? new Date(result.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  
  return (
    <div className="border border-border rounded-lg bg-surface shadow-sm">
      {/* PDF Header */}
      <div className="border-b border-border p-4 bg-surface-secondary">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">CV Compatibility Analysis Report</h3>
            <p className="text-sm text-muted-foreground">Generated on {analysisDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onDownloadText}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download as Text
            </Button>
            {result.n8n_pdf_url && (
              <Button
                onClick={() => window.open(result.n8n_pdf_url, '_blank', 'noopener,noreferrer')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View External PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Content Area - Fixed height and proper overflow */}
      <div className="h-[600px] overflow-y-auto bg-white dark:bg-gray-50">
        <div className="p-8 max-w-4xl mx-auto space-y-6 text-gray-900 min-h-full">
          {/* Header Section */}
          <div className="text-center border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              CV COMPATIBILITY ANALYSIS REPORT
            </h1>
            <div className="space-y-2 text-sm text-gray-600">
              {result.job_title && <p><strong>Position:</strong> {result.job_title}</p>}
              {result.company_name && result.company_name !== 'Company' && (
                <p><strong>Company:</strong> {result.company_name}</p>
              )}
              <p><strong>Analysis Date:</strong> {analysisDate}</p>
            </div>
          </div>

          {/* Compatibility Score */}
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">COMPATIBILITY SCORE</h2>
            <div className="text-6xl font-bold text-primary mb-4">
              {result.compatibility_score || 0}%
            </div>
            <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-4">
              <div 
                className="bg-primary h-4 rounded-full transition-all duration-300"
                style={{ width: `${result.compatibility_score || 0}%` }}
              />
            </div>
          </div>

          {/* Executive Summary */}
          {result.executive_summary && (
            <div className="py-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                EXECUTIVE SUMMARY
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">{result.executive_summary}</p>
            </div>
          )}

          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <div className="py-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                STRENGTHS
              </h2>
              <ul className="space-y-3">
                {result.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed pt-1">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {result.weaknesses && result.weaknesses.length > 0 && (
            <div className="py-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                AREAS FOR IMPROVEMENT
              </h2>
              <ul className="space-y-3">
                {result.weaknesses.map((weakness: string, index: number) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed pt-1">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="py-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                RECOMMENDATIONS
              </h2>
              <ul className="space-y-3">
                {result.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed pt-1">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6 mt-8">
            <p>Generated by TuneMyCV.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserPDFViewer;
