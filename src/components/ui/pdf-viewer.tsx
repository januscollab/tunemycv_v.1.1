import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfData?: string; // Base64 encoded PDF data
  pdfUrl?: string; // Direct URL to PDF
  fileName?: string;
  title?: string;
  onDownload?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfData,
  pdfUrl,
  fileName = 'analysis-report.pdf',
  title = 'Analysis Report',
  onDownload
}) => {
  const getPdfSource = () => {
    if (pdfData) {
      return `data:application/pdf;base64,${pdfData}`;
    }
    return pdfUrl;
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    const source = getPdfSource();
    if (source) {
      const link = document.createElement('a');
      link.href = source;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenExternal = () => {
    const source = getPdfSource();
    if (source) {
      window.open(source, '_blank', 'noopener,noreferrer');
    }
  };

  const source = getPdfSource();

  if (!source) {
    return (
      <Card className="border border-apple-core/20 dark:border-citrus/20">
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            PDF not available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <Card className="border border-apple-core/20 dark:border-citrus/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-zapier-orange" />
              {title}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleOpenExternal}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* PDF Viewer */}
      <Card className="border border-apple-core/20 dark:border-citrus/20">
        <CardContent className="p-0">
          <div className="relative w-full h-[800px] bg-gray-50 dark:bg-gray-900">
            <iframe
              src={source}
              className="w-full h-full border-0"
              title={title}
              style={{ minHeight: '600px' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFViewer;