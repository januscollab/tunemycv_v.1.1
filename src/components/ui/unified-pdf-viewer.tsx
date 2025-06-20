import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Download, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
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

type ViewMode = 'loading' | 'iframe' | 'data-url' | 'download' | 'error';

const UnifiedPDFViewer: React.FC<UnifiedPDFViewerProps> = ({
  pdfData,
  fileName = 'document.pdf',
  title = 'PDF Document',
  className = '',
  showDownloadButton = true
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('loading');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validate base64 data
  const validateBase64PDF = useCallback((data: string): boolean => {
    try {
      // Check if it's valid base64
      if (!data || data.length === 0) return false;
      
      // Basic base64 validation
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(data)) return false;
      
      // Try to decode and check if it starts with PDF header
      const binaryString = atob(data);
      return binaryString.startsWith('%PDF-');
    } catch {
      return false;
    }
  }, []);

  // Create blob URL with proper error handling
  const createPDFBlobUrl = useCallback((data: string): string | null => {
    try {
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      
      // Convert in chunks to avoid stack overflow on large files
      const chunkSize = 8192;
      for (let i = 0; i < binaryString.length; i += chunkSize) {
        const chunk = binaryString.slice(i, i + chunkSize);
        for (let j = 0; j < chunk.length; j++) {
          bytes[i + j] = chunk.charCodeAt(j);
        }
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Error creating blob URL:', err);
      return null;
    }
  }, []);

  // Initialize PDF with validation and fallback chain
  useEffect(() => {
    if (!pdfData) {
      setViewMode('error');
      setError('No PDF data provided');
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Validate the base64 data first
    if (!validateBase64PDF(pdfData)) {
      console.error('Invalid PDF base64 data');
      setError('Invalid PDF data format');
      setViewMode('download');
      return;
    }

    // Try to create blob URL
    const url = createPDFBlobUrl(pdfData);
    if (!url) {
      setError('Failed to process PDF data');
      setViewMode('download');
      return;
    }

    setPdfUrl(url);
    setViewMode('iframe');

    // Set timeout for iframe loading
    timeoutRef.current = setTimeout(() => {
      console.warn('PDF iframe loading timeout, falling back to data URL');
      setViewMode('data-url');
    }, 10000); // 10 second timeout

    return () => {
      if (url) URL.revokeObjectURL(url);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pdfData, validateBase64PDF, createPDFBlobUrl]);

  // Handle iframe load success
  const handleIframeLoad = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setError('');
  }, []);

  // Handle iframe load failure
  const handleIframeError = useCallback(() => {
    console.warn('PDF iframe failed, trying data URL fallback');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setViewMode('data-url');
  }, []);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      setViewMode('loading');
      setError('');
      
      // Recreate the blob URL
      const url = createPDFBlobUrl(pdfData);
      if (url) {
        setPdfUrl(url);
        setViewMode('iframe');
      } else {
        setViewMode('download');
      }
    }
  }, [retryCount, pdfData, createPDFBlobUrl]);

  // Download handler with enhanced error handling
  const handleDownload = useCallback(() => {
    try {
      if (!validateBase64PDF(pdfData)) {
        setError('Cannot download: Invalid PDF data');
        return;
      }

      const url = createPDFBlobUrl(pdfData);
      if (!url) {
        setError('Failed to create download');
        return;
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Download failed');
    }
  }, [pdfData, fileName, validateBase64PDF, createPDFBlobUrl]);

  // Loading state
  if (viewMode === 'loading') {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Processing PDF...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border border-border/60", className)}>
      {/* Header with download button and retry option */}
      <div className="flex justify-between items-center p-3 border-b border-border/30">
        {error && retryCount < 2 && (
          <Button
            onClick={handleRetry}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Retry ({retryCount + 1}/3)
          </Button>
        )}
        <div className="flex-1"></div>
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

      <CardContent className="p-0">
        {/* Error state */}
        {viewMode === 'error' && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <Alert variant="destructive">
                <AlertDescription>
                  <p className="font-medium mb-2">PDF Error</p>
                  <p className="text-sm mb-4">{error}</p>
                </AlertDescription>
              </Alert>
              <Button onClick={handleDownload} variant="outline" className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download Instead
              </Button>
            </div>
          </div>
        )}

        {/* Download fallback state */}
        {viewMode === 'download' && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Alert>
                <AlertDescription>
                  <p className="font-medium mb-2">PDF Viewer Not Available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error || 'Unable to display PDF in browser. Please download to view the document.'}
                  </p>
                </AlertDescription>
              </Alert>
              <Button onClick={handleDownload} className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        )}

        {/* Data URL fallback */}
        {viewMode === 'data-url' && (
          <div className="bg-muted/30">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                Using compatibility mode - some features may be limited
              </p>
            </div>
            <iframe
              ref={iframeRef}
              src={`data:application/pdf;base64,${pdfData}`}
              className="w-full h-[600px] border-none"
              title={title}
              onLoad={handleIframeLoad}
              onError={() => setViewMode('download')}
            />
            <div className="p-3 bg-muted/20 border-t border-border/30">
              <p className="text-caption text-muted-foreground text-center">
                Compatibility mode - Download for full functionality
              </p>
            </div>
          </div>
        )}

        {/* Standard iframe view */}
        {viewMode === 'iframe' && (
          <div className="bg-muted/30">
            <iframe
              ref={iframeRef}
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