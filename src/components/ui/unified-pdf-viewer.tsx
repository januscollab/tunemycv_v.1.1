import React, { useState, useEffect } from 'react';
import { Loader2, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface UnifiedPDFViewerProps {
  pdfData: string; // base64 encoded PDF data
  fileName?: string;
  title?: string;
  className?: string;
  showDownloadButton?: boolean;
}

const UnifiedPDFViewer: React.FC<UnifiedPDFViewerProps> = ({
  pdfData,
  fileName = 'document.pdf',
  title = 'PDF Document',
  className = '',
  showDownloadButton = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'iframe' | 'download'>('iframe');

  // Convert base64 to blob URL
  useEffect(() => {
    if (pdfData) {
      try {
        const binaryString = atob(pdfData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error processing PDF data:', err);
        setError('Failed to process PDF data');
        setViewMode('download');
        setIsLoading(false);
      }
    }
  }, [pdfData]);

  const handleDownload = () => {
    try {
      const binaryString = atob(pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleIframeError = () => {
    setError('PDF viewer not supported in this browser');
    setViewMode('download');
    setIsLoading(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError('');
  };

  if (isLoading && viewMode === 'iframe') {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading PDF...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border border-border/60", className)}>
      {showDownloadButton && (
        <div className="flex justify-end p-3 border-b border-border/30">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      )}

      <CardContent className="p-0">
        {viewMode === 'download' ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Alert>
                <AlertDescription>
                  <p className="font-medium mb-2">PDF viewer not available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unable to display PDF in browser. Please download to view the document.
                  </p>
                </AlertDescription>
              </Alert>
              <Button onClick={handleDownload} className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-muted/30">
            <iframe
              src={pdfUrl}
              className="w-full h-[600px] border-none"
              title={title}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
            <div className="p-3 bg-muted/20 border-t border-border/30">
              <p className="text-caption text-muted-foreground text-center">
                PDF preview - Download for full functionality
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedPDFViewer;