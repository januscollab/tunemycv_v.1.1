import React, { useState, useEffect } from 'react';
import { Loader2, FileText, Download, ZoomIn, ZoomOut, RotateCw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PDFViewerEnhancedProps {
  pdfData: string; // base64 encoded PDF data
  fileName?: string;
  title?: string;
  className?: string;
  showDownloadButton?: boolean;
}

const PDFViewerEnhanced: React.FC<PDFViewerEnhancedProps> = ({
  pdfData,
  fileName = 'document.pdf',
  title = 'PDF Document',
  className = '',
  showDownloadButton = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (pdfData) {
      try {
        // Convert base64 to blob
        const binaryString = atob(pdfData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setIsLoading(false);
        
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error processing PDF data:', err);
        setError('Failed to process PDF data');
        setIsLoading(false);
      }
    }
  }, [pdfData]);

  const handleDownload = () => {
    try {
      // Convert base64 to blob
      const binaryString = atob(pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading PDF viewer...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            {showDownloadButton && (
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border border-border/60", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-heading">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            {title}
          </CardTitle>
          {showDownloadButton && (
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-muted/30 border-t border-border/60">
          <iframe
            src={pdfUrl}
            className="w-full h-96 border-none"
            title={title}
            onLoad={() => setIsLoading(false)}
          />
        </div>
        <div className="p-4 bg-muted/20 border-t border-border/30">
          <p className="text-caption text-muted-foreground text-center">
            PDF preview - Use browser controls to zoom, navigate, or download for full functionality
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewerEnhanced;