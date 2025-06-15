import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye, FileText, Globe, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DownloadMenu } from '@/components/ui/download-menu';

interface N8nAnalysisResultsProps {
  result: {
    analysis_type?: string;
    n8n_html_url?: string;
    n8n_pdf_url?: string;
    job_title?: string;
    company_name?: string;
    compatibility_score?: number;
    executive_summary?: string;
  };
  onStartNew?: () => void;
  readOnly?: boolean;
}

const N8nAnalysisResults: React.FC<N8nAnalysisResultsProps> = ({
  result,
  onStartNew,
  readOnly = false
}) => {
  const handlePreview = (url: string, type: string) => {
    // Open in new tab for preview
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display font-bold text-foreground">n8n Analysis Results</h2>
          <p className="text-subheading text-earth/70 dark:text-white/70 mt-1">
            Your documents have been processed through our advanced n8n workflow
          </p>
        </div>
        {!readOnly && onStartNew && (
          <Button onClick={onStartNew} variant="outline">
            Start New Analysis
          </Button>
        )}
      </div>

      {/* Analysis Summary */}
      <Card className="border border-apple-core/20 dark:border-citrus/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-zapier-orange" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.job_title && (
              <div>
                <p className="text-micro font-medium text-blueberry/60 dark:text-apple-core/70 uppercase tracking-wide">
                  Position
                </p>
                <p className="text-caption font-semibold text-blueberry dark:text-apple-core">
                  {result.job_title}
                </p>
              </div>
            )}
            {result.company_name && (
              <div>
                <p className="text-micro font-medium text-blueberry/60 dark:text-apple-core/70 uppercase tracking-wide">
                  Company
                </p>
                <p className="text-caption font-semibold text-blueberry dark:text-apple-core">
                  {result.company_name}
                </p>
              </div>
            )}
            {result.compatibility_score && (
              <div>
                <p className="text-micro font-medium text-blueberry/60 dark:text-apple-core/70 uppercase tracking-wide">
                  Compatibility Score
                </p>
                <Badge variant="secondary" className="bg-zapier-orange/10 text-zapier-orange">
                  {result.compatibility_score}%
                </Badge>
              </div>
            )}
          </div>
          {result.executive_summary && (
            <div>
              <p className="text-micro font-medium text-blueberry/60 dark:text-apple-core/70 uppercase tracking-wide mb-2">
                Summary
              </p>
              <p className="text-caption text-blueberry dark:text-apple-core">
                {result.executive_summary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HTML Report */}
        {result.n8n_html_url && (
          <Card className="border border-apple-core/20 dark:border-citrus/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-zapier-orange" />
                Interactive HTML Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
                View your analysis results in an interactive web format with detailed breakdowns and insights.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handlePreview(result.n8n_html_url!, 'html')}
                  variant="default"
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview HTML Report
                </Button>
                <Button
                  onClick={() => handleExternalLink(result.n8n_html_url!)}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PDF Report */}
        {result.n8n_pdf_url && (
          <Card className="border border-apple-core/20 dark:border-citrus/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-zapier-orange" />
                PDF Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
                Download your analysis as a professional PDF document for printing or sharing.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handlePreview(result.n8n_pdf_url!, 'pdf')}
                  variant="default"
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview PDF Report
                </Button>
                <DownloadMenu
                  buttonText="Download"
                  variant="outline"
                  className="w-full"
                  onDownloadPDF={() => handleDownload(result.n8n_pdf_url!, 'pdf')}
                  onDownloadHTML={() => handleDownload(result.n8n_html_url!, 'html')}
                  onDownloadText={() => {
                    // Convert PDF to text functionality could be added here
                    console.log('Text download not implemented for n8n reports');
                  }}
                  onDownloadWord={() => {
                    // Convert PDF to Word functionality could be added here  
                    console.log('Word download not implemented for n8n reports');
                  }}
                />
                <Button
                  onClick={() => handleExternalLink(result.n8n_pdf_url!)}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Information */}
      <Card className="border border-apple-core/20 dark:border-citrus/20 bg-apple-core/5 dark:bg-citrus/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-zapier-orange/10 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-zapier-orange" />
            </div>
            <div>
              <h4 className="text-heading font-semibold text-blueberry dark:text-citrus mb-2">
                About Your n8n Analysis
              </h4>
              <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
                Your documents were processed using our advanced n8n workflow, which provides comprehensive analysis 
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