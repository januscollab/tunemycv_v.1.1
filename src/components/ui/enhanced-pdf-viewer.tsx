
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { AlertCircle, Download, Loader2, Bug, CheckCircle } from 'lucide-react';
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
  debugMode?: boolean;
}

export const EnhancedPDFViewer: React.FC<EnhancedPDFViewerProps> = ({
  pdfData,
  pdfUrl,
  fileName = 'document.pdf',
  className = '',
  onDownload,
  debugMode = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerUrl, setWorkerUrl] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addDebugInfo = (message: string) => {
    console.log(`[PDF Viewer Debug]: ${message}`);
    if (debugMode) {
      setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    }
  };

  // Configure default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      defaultTabs[0], // Thumbnail tab
      defaultTabs[1], // Outline tab
    ],
  });

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Determine the best worker URL to use
  useEffect(() => {
    const determineWorkerUrl = () => {
      const localWorkerUrl = '/assets/pdf.worker.min.js';
      const devWorkerUrl = '/node_modules/pdfjs-dist/build/pdf.worker.min.js';
      
      if (import.meta.env.PROD) {
        setWorkerUrl(localWorkerUrl);
        console.log(`[PDF Viewer Debug]: Production mode: Using local worker URL: ${localWorkerUrl}`);
      } else {
        setWorkerUrl(devWorkerUrl);
        console.log(`[PDF Viewer Debug]: Development mode: Using dev worker URL: ${devWorkerUrl}`);
      }
    };

    determineWorkerUrl();
  }, []);

  // Memoize PDF source calculation to prevent re-renders
  const pdfSource = useMemo(() => {
    if (debugMode) {
      return '';
    }

    // Priority: pdfUrl first (direct URL), then pdfData (base64)
    if (pdfUrl) {
      return pdfUrl;
    }
    
    if (pdfData) {
      // Use data as-is, only add data URL prefix if not already present
      return pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
    }
    
    return '';
  }, [pdfUrl, pdfData, debugMode]);

  // Debug logging for PDF source changes (moved to useEffect)
  useEffect(() => {
    if (debugMode) {
      addDebugInfo('Debug mode enabled - no PDF will be loaded');
      return;
    }

    if (pdfUrl) {
      addDebugInfo(`Using PDF URL: ${pdfUrl}`);
    } else if (pdfData) {
      addDebugInfo(`Using PDF base64 data, length: ${pdfData.length}`);
    } else {
      addDebugInfo('No PDF source provided');
    }
  }, [pdfUrl, pdfData, debugMode]);

  // Set up loading timeout when we have a source
  useEffect(() => {
    if (!pdfSource || debugMode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    addDebugInfo('Starting PDF load with 10 second timeout');

    // Set up 10-second timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      addDebugInfo('PDF loading timeout - 10 seconds exceeded');
      setError('PDF loading timeout. The document may be taking too long to load.');
      setLoading(false);
    }, 10000);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [pdfSource, debugMode]);

  // SIMPLIFIED download function
  const handleDownload = () => {
    addDebugInfo('Download button clicked');
    
    if (onDownload) {
      onDownload();
      return;
    }

    // Fallback download logic
    try {
      if (pdfUrl) {
        // For URL, open in new tab for download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (pdfData) {
        // For base64 data, create download link
        const base64Data = pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
      addDebugInfo(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDocumentLoad = () => {
    addDebugInfo('PDF document loaded successfully');
    setLoading(false);
    setError(null);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
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

  if (!pdfSource && !debugMode) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No PDF source provided. Please provide either pdfData or pdfUrl.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading PDF document...</p>
          {debugMode && (
            <div className="mt-4 text-left text-xs text-muted-foreground max-w-lg">
              <h4 className="font-semibold mb-2">Debug Info:</h4>
              <div className="bg-muted/50 p-2 rounded text-xs max-h-32 overflow-auto">
                {debugInfo.map((info, idx) => (
                  <div key={idx}>{info}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF Instead
          </Button>
        </div>
        {debugMode && (
          <div className="mt-4 text-left text-xs text-muted-foreground">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <div className="bg-muted/50 p-2 rounded text-xs max-h-32 overflow-auto">
              {debugInfo.map((info, idx) => (
                <div key={idx}>{info}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-surface border border-border rounded-lg overflow-hidden ${className}`}>
      {/* Header with download button */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-secondary">
        <h3 className="text-sm font-medium text-foreground">
          {debugMode ? 'PDF Viewer Debug Mode' : 'PDF Report'}
        </h3>
        <div className="flex items-center gap-2">
          {debugMode && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded text-xs">
              <Bug className="h-3 w-3" />
              Debug Mode
            </div>
          )}
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Debug Info Panel */}
      {debugMode && (
        <div className="p-4 bg-muted/50 border-b border-border">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Debug Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <strong>Worker URL:</strong>
              <div className="bg-background p-2 rounded mt-1 font-mono break-all">
                {workerUrl || 'Not set'}
              </div>
            </div>
            <div>
              <strong>PDF Source:</strong>
              <div className="bg-background p-2 rounded mt-1 break-all">
                {pdfSource ? `${pdfSource.substring(0, 100)}...` : 'None'}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <strong>Debug Log:</strong>
            <div className="bg-background p-2 rounded mt-1 max-h-32 overflow-auto text-xs">
              {debugInfo.map((info, idx) => (
                <div key={idx} className="py-0.5">{info}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="pdf-viewer-container" style={{ height: '600px' }}>
        <Worker workerUrl={workerUrl}>
          <div style={{ height: '100%' }}>
            {debugMode ? (
              <div className="flex flex-col items-center justify-center h-full bg-muted/20 text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">PDF Viewer Debug Mode</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  The PDF viewer components are successfully loaded and initialized. 
                  Worker URL is set and the layout plugin is ready.
                </p>
                <div className="text-sm text-muted-foreground bg-background p-4 rounded border">
                  <strong>Ready to display PDF!</strong><br/>
                  • PDF.js Worker: ✅ {workerUrl ? 'Loaded' : 'Not Ready'}<br/>
                  • PDF Source: ✅ {pdfSource ? 'Available' : 'Not Set'}<br/>
                  • Layout Plugin: ✅ Configured<br/>
                </div>
              </div>
            ) : (
              <Viewer
                fileUrl={pdfSource}
                plugins={[defaultLayoutPluginInstance]}
                onDocumentLoad={handleDocumentLoad}
              />
            )}
          </div>
        </Worker>
      </div>
    </div>
  );
};

export default EnhancedPDFViewer;
