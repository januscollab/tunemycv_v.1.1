import React, { useState, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ReactPDFViewerProps {
  pdfData: string; // base64 encoded PDF data
  fileName?: string;
  title?: string;
  className?: string;
  showDownloadButton?: boolean;
}

const ReactPDFViewer: React.FC<ReactPDFViewerProps> = ({
  pdfData,
  fileName = 'document.pdf',
  title = 'PDF Document',
  className = '',
  showDownloadButton = true
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Convert base64 to data URL for react-pdf
  const pdfDataUrl = React.useMemo(() => {
    console.log('=== PDF DATA URL CREATION DEBUG ===');
    console.log('Input pdfData type:', typeof pdfData);
    console.log('Input pdfData length:', pdfData?.length || 0);
    console.log('Input pdfData starts with:', pdfData?.substring(0, 50) || 'EMPTY');
    
    if (!pdfData) {
      console.error('❌ No PDF data provided');
      setDebugInfo('❌ No PDF data provided');
      return null;
    }
    
    try {
      // Check if data is already a data URL
      if (pdfData.startsWith('data:')) {
        console.log('✅ PDF data is already a data URL');
        setDebugInfo('✅ PDF data is already a data URL');
        return pdfData;
      }
      
      // Check if it's valid base64
      try {
        atob(pdfData);
        console.log('✅ PDF data is valid base64');
      } catch (base64Error) {
        console.error('❌ Invalid base64 data:', base64Error);
        setDebugInfo(`❌ Invalid base64 data: ${base64Error.message}`);
        return null;
      }
      
      // Create data URL from base64
      const dataUrl = `data:application/pdf;base64,${pdfData}`;
      console.log('✅ Created data URL, length:', dataUrl.length);
      setDebugInfo(`✅ Created data URL, length: ${dataUrl.length}`);
      return dataUrl;
    } catch (error) {
      console.error('❌ Error creating PDF data URL:', error);
      setDebugInfo(`❌ Error creating PDF data URL: ${error.message}`);
      return null;
    }
  }, [pdfData]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('✅ PDF Document loaded successfully!');
    console.log('Number of pages:', numPages);
    setNumPages(numPages);
    setIsLoading(false);
    setError('');
    setDebugInfo(`✅ PDF loaded successfully with ${numPages} pages`);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('❌ PDF Document load error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    const errorMsg = `Failed to load PDF: ${error.message}`;
    setError(errorMsg);
    setIsLoading(false);
    setDebugInfo(`❌ Load error: ${error.name} - ${error.message}`);
  }, []);

  const onDocumentLoadProgress = useCallback(({ loaded, total }: { loaded: number; total: number }) => {
    const progress = total > 0 ? Math.round((loaded / total) * 100) : 0;
    console.log(`📊 PDF loading progress: ${loaded}/${total} bytes (${progress}%)`);
    setDebugInfo(`📊 Loading progress: ${progress}%`);
  }, []);

  const goToPrevPage = useCallback(() => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      setPageInput(newPage.toString());
    }
  }, [pageNumber]);

  const goToNextPage = useCallback(() => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      setPageInput(newPage.toString());
    }
  }, [pageNumber, numPages]);

  const goToFirstPage = useCallback(() => {
    setPageNumber(1);
    setPageInput('1');
  }, []);

  const goToLastPage = useCallback(() => {
    setPageNumber(numPages);
    setPageInput(numPages.toString());
  }, [numPages]);

  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  }, []);

  const handlePageInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    } else {
      setPageInput(pageNumber.toString());
    }
  }, [pageInput, numPages, pageNumber]);

  const handleDownload = useCallback(() => {
    try {
      console.log('🔽 Starting PDF download...');
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
      console.log('✅ PDF download completed');
    } catch (error) {
      console.error('❌ Download failed:', error);
    }
  }, [pdfData, fileName]);

  const openInNewWindow = useCallback(() => {
    try {
      console.log('🔗 Opening PDF in new window...');
      const binaryString = atob(pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const newWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
      if (newWindow) {
        newWindow.document.title = title;
        newWindow.location.href = url;
        
        // Clean up URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        console.log('✅ PDF opened in new window');
      }
    } catch (error) {
      console.error('❌ Failed to open in new window:', error);
    }
  }, [pdfData, title]);

  // Early return if no PDF data
  if (!pdfData) {
    return (
      <Card className={cn("border border-border/60", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <Alert variant="destructive">
              <AlertDescription>
                <p className="font-medium mb-2">No PDF Data</p>
                <p className="text-sm">PDF data is missing or invalid.</p>
                <p className="text-xs mt-2 font-mono">{debugInfo}</p>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border border-border/60", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <Alert variant="destructive">
              <AlertDescription>
                <p className="font-medium mb-2">PDF Error</p>
                <p className="text-sm mb-4">{error}</p>
                <p className="text-xs font-mono mb-2">{debugInfo}</p>
                <p className="text-xs text-muted-foreground">
                  Check console for detailed error information.
                </p>
              </AlertDescription>
            </Alert>
            {showDownloadButton && (
              <Button onClick={handleDownload} variant="outline" className="mt-4">
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
      {/* Header with controls */}
      <div className="flex justify-between items-center p-3 border-b border-border/30">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {showDownloadButton && (
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
          <Button
            onClick={openInNewWindow}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            New Window
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        {/* Debug Info Panel */}
        {(isLoading || debugInfo) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-3">
            <p className="text-xs font-mono text-yellow-800 dark:text-yellow-200">
              🔧 Debug: {debugInfo}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading PDF...</p>
              <p className="text-xs text-muted-foreground mt-2">
                If this persists, check console for detailed logs
              </p>
            </div>
          </div>
        )}

        <div className="bg-muted/30">
          <Document
            file={pdfDataUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            onLoadProgress={onDocumentLoadProgress}
            loading=""
          >
            <div className="flex justify-center bg-white p-4">
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
                width={Math.min(800, window.innerWidth - 100)}
              />
            </div>
          </Document>

          {/* Page Navigation Controls */}
          {numPages > 0 && (
            <div className="flex items-center justify-center gap-4 p-4 bg-muted/20 border-t border-border/30">
              <Button
                onClick={() => {
                  setPageNumber(1);
                  setPageInput('1');
                }}
                disabled={pageNumber === 1}
                variant="outline"
                size="sm"
              >
                First
              </Button>
              
              <Button
                onClick={() => {
                  if (pageNumber > 1) {
                    const newPage = pageNumber - 1;
                    setPageNumber(newPage);
                    setPageInput(newPage.toString());
                  }
                }}
                disabled={pageNumber === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <form onSubmit={(e) => {
                e.preventDefault();
                const page = parseInt(pageInput, 10);
                if (page >= 1 && page <= numPages) {
                  setPageNumber(page);
                } else {
                  setPageInput(pageNumber.toString());
                }
              }} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Page</span>
                <Input
                  type="number"
                  min="1"
                  max={numPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className="w-16 h-8 text-center text-sm"
                />
                <span className="text-sm text-muted-foreground">of {numPages}</span>
              </form>

              <Button
                onClick={() => {
                  if (pageNumber < numPages) {
                    const newPage = pageNumber + 1;
                    setPageNumber(newPage);
                    setPageInput(newPage.toString());
                  }
                }}
                disabled={pageNumber === numPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => {
                  setPageNumber(numPages);
                  setPageInput(numPages.toString());
                }}
                disabled={pageNumber === numPages}
                variant="outline"
                size="sm"
              >
                Last
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReactPDFViewer;
