
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

  const handlePdfDownload = () => {
    if (result.pdf_file_data) {
      try {
        // Clean the base64 string
        const cleanBase64 = result.pdf_file_data.replace(/\s+/g, '');
        
        // Convert base64 to blob
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.pdf_file_name || 'analysis-report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('✅ PDF download completed successfully');
      } catch (error) {
        console.error('❌ PDF download failed:', error);
        // Fallback to URL download if available
        if (result.n8n_pdf_url) {
          handleDownload(result.n8n_pdf_url, 'pdf');
        }
      }
    } else if (result.n8n_pdf_url) {
      handleDownload(result.n8n_pdf_url, 'pdf');
    }
  };

  // Only show the component if we have actual job title and company name
  const hasValidJobInfo = result.job_title && result.company_name;
  
  if (!hasValidJobInfo) {
    return null; // Don't render anything if we don't have valid job information
  }

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

      {/* Analysis Header */}
      <Card className="border border-apple-core/20 dark:border-citrus/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-blueberry dark:text-citrus">
                {result.job_title} - {result.company_name}
              </CardTitle>
              {result.compatibility_score && (
                <p className="text-lg font-semibold text-zapier-orange mt-1">
                  {result.compatibility_score}% Compatibility Match
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-zapier-orange/10 text-zapier-orange">
                N8N Analysis
              </Badge>
              {result.html_file_data && (
                <Button onClick={handleHtmlPreview} variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  View HTML Report
                </Button>
              )}
              <Button onClick={handlePdfDownload} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* PDF Viewer */}
      {result.pdf_file_data ? (
        <ReactPDFViewer
          pdfData={result.pdf_file_data}
          fileName={result.pdf_file_name || 'analysis-report.pdf'}
          title="N8N Analysis Report"
          className="border border-apple-core/20 dark:border-citrus/20"
        />
      ) : (
        <Card className="border border-apple-core/20 dark:border-citrus/20">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              PDF report not available for this analysis
            </p>
            {result.n8n_pdf_url && (
              <Button 
                onClick={() => handleExternalLink(result.n8n_pdf_url!)} 
                variant="outline" 
                className="mt-4"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View External PDF
              </Button>
            )}
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
                About Your N8N Analysis
              </h4>
              <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
                Your documents were processed using our advanced N8N workflow, which provides comprehensive analysis 
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
