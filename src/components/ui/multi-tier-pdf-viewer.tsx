import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, FileText, Download, AlertTriangle, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface MultiTierPDFViewerProps {
  pdfData: string; // base64 encoded PDF data
  fileName?: string;
  title?: string;
  className?: string;
  showDownloadButton?: boolean;
}

type ViewerState = 'react-pdf' | 'pdfjs' | 'download-only';

const MultiTierPDFViewer: React.FC<MultiTierPDFViewerProps> = ({
  pdfData,
  fileName = 'document.pdf',
  title = 'PDF Document',
  className = '',
  showDownloadButton = true
}) => {
  const [viewerState, setViewerState] = useState<ViewerState>('react-pdf');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState<string>('');

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
        setViewerState('download-only');
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

  const fallbackToNextTier = (errorMessage: string) => {
    console.error(`PDF viewer error (${viewerState}):`, errorMessage);
    
    if (viewerState === 'react-pdf') {
      setViewerState('pdfjs');
      setError('');
      setIsLoading(true);
    } else if (viewerState === 'pdfjs') {
      setViewerState('download-only');
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // React-PDF success handlers
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError('');
  };

  const onDocumentLoadError = (error: Error) => {
    fallbackToNextTier(error.message);
  };

  // PDF.js canvas renderer
  const PDFJSViewer = () => {
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

    useEffect(() => {
      if (viewerState !== 'pdfjs' || !pdfUrl) return;

      const loadPDFJS = async () => {
        try {
          const pdf = await pdfjs.getDocument(pdfUrl).promise;
          const page = await pdf.getPage(pageNumber);
          
          const viewport = page.getViewport({ scale });
          const canvasElement = document.createElement('canvas');
          const context = canvasElement.getContext('2d');
          
          canvasElement.height = viewport.height;
          canvasElement.width = viewport.width;
          
          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
            
            setCanvas(canvasElement);
            setNumPages(pdf.numPages);
            setIsLoading(false);
            setError('');
          }
        } catch (error) {
          fallbackToNextTier('PDF.js rendering failed');
        }
      };

      loadPDFJS();
    }, [pdfUrl, pageNumber, scale, viewerState]);

    if (canvas) {
      return (
        <div className="flex justify-center">
          <div 
            dangerouslySetInnerHTML={{ __html: canvas.outerHTML }}
            className="border border-border/30"
          />
        </div>
      );
    }

    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Loading PDF viewer... ({viewerState === 'react-pdf' ? 'React-PDF' : 'PDF.js'})
            </p>
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
            <span className="text-micro text-muted-foreground ml-2">
              ({viewerState === 'react-pdf' ? 'React-PDF' : viewerState === 'pdfjs' ? 'PDF.js' : 'Download'})
            </span>
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
        {viewerState === 'download-only' ? (
          // Download-only fallback
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
          <>
            {/* PDF Controls */}
            {numPages > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pageNumber} of {numPages}
                  </span>
                  <Button
                    onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                    disabled={pageNumber >= numPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                    variant="outline"
                    size="sm"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    onClick={() => setScale(Math.min(2.0, scale + 0.1))}
                    variant="outline"
                    size="sm"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* PDF Viewer */}
            <div className="bg-muted/30 min-h-96">
              {viewerState === 'react-pdf' ? (
                <div className="flex justify-center p-4">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      loading={
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      }
                    />
                  </Document>
                </div>
              ) : viewerState === 'pdfjs' ? (
                <div className="p-4">
                  <PDFJSViewer />
                </div>
              ) : null}
            </div>

            <div className="p-4 bg-muted/20 border-t border-border/30">
              <p className="text-caption text-muted-foreground text-center">
                PDF preview using {viewerState === 'react-pdf' ? 'React-PDF' : 'PDF.js'} - 
                Download for full functionality
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiTierPDFViewer;