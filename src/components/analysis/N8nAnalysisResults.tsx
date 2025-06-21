
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye, FileText, Globe, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DownloadMenu } from '@/components/ui/download-menu';
import ReactPDFViewer from '@/components/ui/react-pdf-viewer';

interface N8nAnalysisResultsProps {
  result: {
    analysis_type?: string;
    n8n_html_url?: string;
    n8n_pdf_url?: string;
    pdf_file_data?: string;
    html_file_data?: string;
    pdf_file_name?: string;
    html_file_name?: string;
    job_title?: string;
    company_name?: string;
    compatibility_score?: number;
    executive_summary?: string;
    job_description_extracted_text?: string;
  };
  onStartNew?: () => void;
  readOnly?: boolean;
}

const N8nAnalysisResults: React.FC<N8nAnalysisResultsProps> = ({
  result,
  onStartNew,
  readOnly = false
}) => {

  // Add comprehensive debugging
  React.useEffect(() => {
    console.log('=== N8N ANALYSIS RESULTS DEBUG ===');
    console.log('Full result object:', result);
    console.log('PDF file data type:', typeof result.pdf_file_data);
    console.log('PDF file data length:', result.pdf_file_data?.length || 0);
    console.log('PDF file data starts with:', result.pdf_file_data?.substring(0, 100) || 'EMPTY');
    console.log('HTML file data type:', typeof result.html_file_data);
    console.log('HTML file data length:', result.html_file_data?.length || 0);
    console.log('N8N PDF URL:', result.n8n_pdf_url);
    console.log('N8N HTML URL:', result.n8n_html_url);
    console.log('PDF file name:', result.pdf_file_name);
    console.log('HTML file name:', result.html_file_name);
    console.log('===================================');
  }, [result]);
  
  const handlePreview = (url: string, type: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (url: string, type: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `analysis-report.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleHtmlPreview = () => {
    if (result.html_file_data) {
      // Create a blob from the HTML data and open it as a webpage
      const blob = new Blob([result.html_file_data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (result.n8n_html_url) {
      handlePreview(result.n8n_html_url, 'html');
    }
  };

  // Extract job title and company from job description if not directly available
  const getJobTitle = () => {
    if (result.job_title) return result.job_title;
    
    // Try to extract from job description text
    if (result.job_description_extracted_text) {
      const text = result.job_description_extracted_text;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Look for common job title patterns in first few lines
      for (const line of lines.slice(0, 5)) {
        const trimmed = line.trim();
        if (trimmed.length > 5 && trimmed.length < 100 && 
            !trimmed.toLowerCase().includes('company') &&
            !trimmed.toLowerCase().includes('description') &&
            !trimmed.toLowerCase().includes('about')) {
          return trimmed;
        }
      }
    }
    
    return 'Unknown Position';
  };

  const getCompanyName = () => {
    if (result.company_name) return result.company_name;
    
    // Try to extract from job description text
    if (result.job_description_extracted_text) {
      const text = result.job_description_extracted_text;
      const companyMatch = text.match(/(?:company|organization|firm|corp|inc|ltd|llc)[:\s]+([^\n]+)/i);
      if (companyMatch && companyMatch[1]) {
        return companyMatch[1].trim();
      }
      
      // Look for patterns like "Join [Company Name]" or "At [Company Name]"
      const joinMatch = text.match(/(?:join|at)\s+([A-Z][a-zA-Z\s&]+?)(?:\s|,|\.|\n)/);
      if (joinMatch && joinMatch[1] && joinMatch[1].length < 50) {
        return joinMatch[1].trim();
      }
    }
    
    return 'Unknown Company';
  };

  return (
    <div className="space-y-6">
      {/* Header with Start New Button */}
      {!readOnly && onStartNew && (
        <div className="flex justify-end">
          <Button onClick={onStartNew} variant="outline">
            Start New Analysis
          </Button>
        </div>
      )}

      {/* Debug Information Panel */}
      <Card className="border-2 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
            🔧 Debug Information
          </h4>
          <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300 font-mono">
            <div>Analysis Type: {result.analysis_type || 'undefined'}</div>
            <div>PDF Data: {result.pdf_file_data ? `${result.pdf_file_data.length} chars` : 'missing'}</div>
            <div>HTML Data: {result.html_file_data ? `${result.html_file_data.length} chars` : 'missing'}</div>
            <div>PDF URL: {result.n8n_pdf_url || 'missing'}</div>
            <div>HTML URL: {result.n8n_html_url || 'missing'}</div>
            <div>PDF File Name: {result.pdf_file_name || 'missing'}</div>
            <div>HTML File Name: {result.html_file_name || 'missing'}</div>
            {result.pdf_file_data && (
              <div>PDF Starts With: {result.pdf_file_data.substring(0, 50)}...</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer */}
      {result.pdf_file_data ? (
        <ReactPDFViewer
          pdfData={result.pdf_file_data}
          fileName={result.pdf_file_name || 'analysis-report.pdf'}
          title="Analysis Report"
          className="border border-apple-core/20 dark:border-citrus/20"
        />
      ) : (
        <Card className="border border-apple-core/20 dark:border-citrus/20">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              PDF report not available for this analysis
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Debug: pdf_file_data = {result.pdf_file_data ? 'exists' : 'missing'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card className="border border-apple-core/20 dark:border-citrus/20 bg-apple-core/5 dark:bg-citrus/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-zapier-orange/10 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-zapier-orange" />
            </div>
            <div>
              <h4 className="text-heading font-semibold text-blueberry dark:text-citrus mb-2">
                About Your Analysis
              </h4>
              <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
                Your documents were processed using our advanced analysis workflow, which provides comprehensive analysis 
                and generates both interactive HTML and downloadable PDF reports. These reports contain detailed 
                insights about CV-job compatibility, keyword analysis, and actionable recommendations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default N8nAnalysisResults;
