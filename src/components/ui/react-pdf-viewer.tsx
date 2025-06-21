
import React, { useState, useMemo } from 'react';
import { Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, RotateCw, ExternalLink, Maximize } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ReactPDFViewerProps {
  pdfData: string;
  fileName?: string;
  title?: string;
  className?: string;
}

const ReactPDFViewer: React.FC<ReactPDFViewerProps> = ({
  pdfData,
  fileName = 'document.pdf',
  title = 'CV Analysis Report',
  className
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create PDF data URL with proper error handling
  const pdfDataUrl = useMemo(() => {
    try {
      console.log('=== PDF DATA URL CREATION DEBUG ===');
      console.log('Input pdfData type:', typeof pdfData);
      console.log('Input pdfData length:', pdfData?.length || 0);
      console.log('Input pdfData starts with:', pdfData?.substring(0, 50) || 'EMPTY');

      if (!pdfData || typeof pdfData !== 'string') {
        console.error('❌ Invalid PDF data: not a string or empty');
        return null;
      }

      // Clean the base64 string - remove any whitespace or newlines
      const cleanBase64 = pdfData.replace(/\s+/g, '');
      
      // Validate base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(cleanBase64)) {
        console.error('❌ Invalid base64 format detected');
        return null;
      }

      // Test decode a small portion to verify it's valid base64
      try {
        atob(cleanBase64.substring(0, Math.min(100, cleanBase64.length)));
        console.log('✅ Base64 validation successful');
      } catch (testError) {
        console.error('❌ Base64 decode test failed:', testError);
        return null;
      }

      // Create data URL
      const dataUrl = `data:application/pdf;base64,${cleanBase64}`;
      console.log('✅ PDF data URL created successfully, length:', dataUrl.length);
      return dataUrl;
    } catch (error) {
      console.error('❌ Error creating PDF data URL:', error);
      return null;
    }
  }, [pdfData]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    console.log('✅ PDF loaded successfully, pages:', numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('❌ PDF load error:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setIsLoading(false);
  };

  const downloadPDF = () => {
    try {
      if (!pdfDataUrl) {
        console.error('No PDF data available for download');
        return;
      }

      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('✅ PDF download initiated');
    } catch (error) {
      console.error('❌ PDF download failed:', error);
    }
  };

  const openInNewTab = () => {
    if (pdfDataUrl) {
      window.open(pdfDataUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const openInLightbox = () => {
    if (pdfDataUrl) {
      // Create a modal overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      `;
      
      const iframe = document.createElement('iframe');
      iframe.src = pdfDataUrl;
      iframe.style.cssText = `
        width: 90vw;
        height: 90vh;
        border: none;
        background: white;
        cursor: auto;
      `;
      
      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          document.body.removeChild(overlay);
        }
      });

      // Close on Escape key
      const closeOnEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          document.body.removeChild(overlay);
          document.removeEventListener('keydown', closeOnEscape);
        }
      };
      document.addEventListener('keydown', closeOnEscape);
      
      overlay.appendChild(iframe);
      document.body.appendChild(overlay);
    }
  };

  // Handle case where PDF data is not available
  if (!pdfData) {
    return (
      <div className={cn('border rounded-lg p-8 text-center', className)}>
        <div className="text-muted-foreground">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">PDF document not available</p>
        </div>
      </div>
    );
  }

  // Handle case where PDF data URL creation failed
  if (!pdfDataUrl) {
    return (
      <div className={cn('border rounded-lg p-8 text-center', className)}>
        <div className="text-red-500">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Failed to load PDF document</p>
          <p className="text-xs text-muted-foreground mt-2">The PDF data format is invalid</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">{title}</h3>
          {fileName && (
            <p className="text-xs text-muted-foreground">{fileName}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Download Button */}
          <Button variant="ghost" size="sm" onClick={downloadPDF}>
            <Download className="h-4 w-4" />
          </Button>
          
          {/* Open in New Tab Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={openInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          
          {/* Open in Lightbox Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={openInLightbox}
            title="Open in fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </Button>
          
          {/* Only show viewer controls if PDF is loading successfully */}
          {!error && (
            <>
              {/* Zoom Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-muted-foreground px-2">
                {Math.round(scale * 100)}%
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
                disabled={scale >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              {/* Rotation */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRotation(prev => (prev + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* PDF Content - Removed background styling */}
      <div className="relative min-h-[600px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-red-500 max-w-md mx-auto p-4">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={downloadPDF} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={openInNewTab} variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        )}

        {!error && (
          <div className="flex justify-center p-4">
            <Document
              file={pdfDataUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              options={{
                // Use main thread rendering (worker disabled in main.tsx)
                isEvalSupported: false,
                // Additional fallback options
                disableFontFace: false,
                disableRange: false,
                disableStream: false
              }}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                loading=""
                className="shadow-lg"
              />
            </Document>
          </div>
        )}

        {/* Navigation */}
        {numPages && numPages > 1 && !error && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg px-4 py-2 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm">
              Page {pageNumber} of {numPages}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactPDFViewer;
