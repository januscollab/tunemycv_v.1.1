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
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    // Still try to show the iframe even if there was an error processing
    // as the browser might be able to handle it
    return (
      <div className={className}>
        <iframe
          src={`data:application/pdf;base64,${pdfData}`}
          className="w-full h-[600px] border-none rounded-lg"
          title={title}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <iframe
        src={pdfUrl}
        className="w-full h-[600px] border-none rounded-lg"
        title={title}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default PDFViewerEnhanced;