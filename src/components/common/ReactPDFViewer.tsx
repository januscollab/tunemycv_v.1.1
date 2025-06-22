
import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReactPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
}

const ReactPDFViewer: React.FC<ReactPDFViewerProps> = ({ pdfUrl, fileName = 'document.pdf' }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);

  // Add timeout for loading state
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('PDF loading timeout reached');
        setLoadingTimeout(true);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Log PDF URL for debugging
  React.useEffect(() => {
    console.log('ReactPDFViewer: Attempting to load PDF from URL:', pdfUrl);
    console.log('ReactPDFViewer: PDF filename:', fileName);
  }, [pdfUrl, fileName]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('ReactPDFViewer: PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    setLoadingTimeout(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('ReactPDFViewer: PDF load error:', error);
    console.error('ReactPDFViewer: Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
    setLoadingTimeout(false);
  };

  const onDocumentLoadProgress = (progressData: { loaded: number; total: number }) => {
    console.log('ReactPDFViewer: Loading progress:', Math.round((progressData.loaded / progressData.total) * 100) + '%');
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const changeScale = (scaleChange: number) => {
    setScale(prevScale => Math.min(Math.max(0.5, prevScale + scaleChange), 2.5));
  };

  const downloadPDF = () => {
    console.log('ReactPDFViewer: Attempting to download PDF from:', pdfUrl);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    console.log('ReactPDFViewer: Opening PDF in new tab:', pdfUrl);
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-surface border border-border rounded-lg">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-4">Loading PDF...</p>
          
          {loadingTimeout && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                PDF is taking longer than expected to load.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInNewTab}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                URL: {pdfUrl.substring(0, 60)}...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-surface border border-border rounded-lg">
        <div className="text-center max-w-md">
          <div className="text-destructive mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-destructive font-medium mb-2">PDF Loading Error</p>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          
          <div className="flex gap-2 justify-center mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
          
          <details className="text-left">
            <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
              Debug Information
            </summary>
            <div className="mt-2 p-2 bg-muted rounded text-xs font-mono text-left">
              <p><strong>URL:</strong> {pdfUrl}</p>
              <p><strong>Filename:</strong> {fileName}</p>
              <p><strong>Error:</strong> {error}</p>
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg">
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-secondary">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {pageNumber} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeScale(-0.2)}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeScale(0.2)}
            disabled={scale >= 2.5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPDF}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="p-4 flex justify-center bg-gray-100 dark:bg-gray-800 min-h-[600px]">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          onLoadProgress={onDocumentLoadProgress}
          className="shadow-lg"
          loading={<div className="text-muted-foreground">Loading document...</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={<div className="text-muted-foreground">Loading page...</div>}
          />
        </Document>
      </div>
    </div>
  );
};

export default ReactPDFViewer;
