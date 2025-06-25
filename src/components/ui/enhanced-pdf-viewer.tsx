
import React, { useState, useEffect } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import CSS
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface EnhancedPDFViewerProps {
  pdfData?: string; // base64 PDF data
  pdfUrl?: string; // PDF URL
  fileName?: string;
  className?: string;
  onDownload?: () => void;
}

export const EnhancedPDFViewer: React.FC<EnhancedPDFViewerProps> = ({
  pdfData,
  pdfUrl,
  fileName = 'document.pdf',
  className = '',
  onDownload
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfSource, setPdfSource] = useState<string | null>(null);
  const [workerUrl, setWorkerUrl] = useState<string>('');

  // Configure default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      defaultTabs[0], // Thumbnail tab
      defaultTabs[1], // Outline tab
    ],
  });

  // Determine the best worker URL to use
  useEffect(() => {
    const determineWorkerUrl = () => {
      // Try local worker first (will be available in production build)
      const localWorkerUrl = '/assets/pdf.worker.min.js';
      
      // For development, we'll use the node_modules path
      const devWorkerUrl = '/node_modules/pdfjs-dist/build/pdf.worker.min.js';
      
      // Set the appropriate worker URL based on environment
      if (import.meta.env.PROD) {
        setWorkerUrl(localWorkerUrl);
      } else {
        setWorkerUrl(devWorkerUrl);
      }
    };

    determineWorkerUrl();
  }, []);

  useEffect(() => {
    const preparePdfSource = async () => {
      setLoading(true);
      setError(null);

      try {
        if (pdfData) {
          // Handle base64 PDF data
          const base64Data = pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
          setPdfSource(base64Data);
        } else if (pdfUrl) {
          // Handle PDF URL
          setPdfSource(pdfUrl);
        } else {
          setError('No PDF data or URL provided');
          return;
        }
      } catch (err) {
        setError('Failed to load PDF document');
      } finally {
        setLoading(false);
      }
    };

    if (workerUrl) {
      preparePdfSource();
    }
  }, [pdfData, pdfUrl, workerUrl]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Fallback download logic
    if (pdfData) {
      const base64Data = pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDocumentLoad = () => {
    setLoading(false);
    setError(null);
  };

  if (!workerUrl) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Initializing PDF viewer...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading PDF document...</p>
        </div>
      </div>
    );
  }

  if (error || !pdfSource) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Unable to load PDF document'}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF Instead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Header with download button */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-secondary">
        <h3 className="text-sm font-medium text-foreground">PDF Report</h3>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* PDF Viewer */}
      <div className="pdf-viewer-container" style={{ height: '600px' }}>
        <Worker workerUrl={workerUrl}>
          <div style={{ height: '100%' }}>
            <Viewer
              fileUrl={pdfSource}
              plugins={[defaultLayoutPluginInstance]}
              onDocumentLoad={handleDocumentLoad}
            />
          </div>
        </Worker>
      </div>
    </div>
  );
};

export default EnhancedPDFViewer;
