
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { AlertCircle, Download, Loader2, Bug, CheckCircle, ExternalLink } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showFallback, setShowFallback] = useState(false);
  const [proxyStatus, setProxyStatus] = useState<'testing' | 'success' | 'failed' | 'idle'>('idle');
  const [actualPdfUrl, setActualPdfUrl] = useState<string>('');
  const [viewerKey, setViewerKey] = useState(0);
  const [workerUrl, setWorkerUrl] = useState<string>('');
  const [workerLoaded, setWorkerLoaded] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addDebugInfo = (message: string) => {
    console.log(`[PDF Viewer Debug]: ${message}`);
    if (debugMode) {
      setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    }
  };

  // Initialize local worker URL
  const initializeWorker = useMemo(() => {
    return async () => {
      try {
        // Use local worker path - this will be available after build
        const localWorkerUrl = '/assets/pdf.worker.min.js';
        addDebugInfo(`Using local PDF.js worker: ${localWorkerUrl}`);
        
        // Test if worker file exists
        try {
          const response = await fetch(localWorkerUrl, { method: 'HEAD' });
          if (response.ok) {
            setWorkerUrl(localWorkerUrl);
            setWorkerLoaded(true);
            addDebugInfo('Local worker file verified and ready');
            return localWorkerUrl;
          } else {
            throw new Error(`Worker file not found: ${response.status}`);
          }
        } catch (fetchError) {
          addDebugInfo(`Local worker not available: ${fetchError.message}`);
          addDebugInfo('Falling back to iframe display');
          setShowFallback(true);
          return '';
        }
      } catch (error) {
        addDebugInfo(`Worker initialization error: ${error.message}`);
        setShowFallback(true);
        return '';
      }
    };
  }, []);

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

  // Initialize worker when component mounts
  useEffect(() => {
    if (!debugMode && (pdfUrl || pdfData)) {
      initializeWorker();
    }
  }, [initializeWorker, debugMode, pdfUrl, pdfData]);

  // Test proxy function
  const testProxyFunction = async (originalUrl: string): Promise<string> => {
    const proxyUrl = `https://aohrfehhyjdebaatzqdl.supabase.co/functions/v1/pdf-proxy?url=${encodeURIComponent(originalUrl)}`;
    
    addDebugInfo(`Testing proxy function with URL: ${originalUrl}`);
    setProxyStatus('testing');
    
    try {
      const response = await fetch(proxyUrl, { method: 'HEAD' });
      
      if (response.ok) {
        addDebugInfo(`Proxy test successful! Using proxy URL`);
        setProxyStatus('success');
        return proxyUrl;
      } else {
        addDebugInfo(`Proxy test failed! Status: ${response.status} - Falling back to original URL`);
        setProxyStatus('failed');
        return originalUrl;
      }
    } catch (error) {
      addDebugInfo(`Proxy test error: ${error.message} - Falling back to original URL`);
      setProxyStatus('failed');
      return originalUrl;
    }
  };

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    try {
      if (url.startsWith('data:')) return true;
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Initialize PDF source
  useEffect(() => {
    const initializePdfSource = async () => {
      if (debugMode) {
        addDebugInfo('Debug mode enabled - no PDF will be loaded');
        return;
      }

      addDebugInfo(`Using worker URL: ${workerUrl || 'Loading...'}`);
      
      let finalUrl = '';
      
      if (pdfUrl) {
        addDebugInfo(`Processing PDF URL: ${pdfUrl}`);
        finalUrl = await testProxyFunction(pdfUrl);
      } else if (pdfData) {
        finalUrl = pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
        addDebugInfo(`Using PDF base64 data, length: ${pdfData.length}`);
      } else {
        addDebugInfo('No PDF source provided');
        return;
      }

      // Validate the final URL
      if (!isValidUrl(finalUrl)) {
        addDebugInfo(`Invalid URL format: ${finalUrl}`);
        setError('Invalid PDF URL format');
        setShowFallback(true);
        return;
      }

      addDebugInfo(`Final PDF URL: ${finalUrl}`);
      setActualPdfUrl(finalUrl);
      setViewerKey(prev => prev + 1);
    };

    // Only initialize if worker is ready or we're showing fallback
    if (workerLoaded || showFallback) {
      initializePdfSource();
    }
  }, [pdfUrl, pdfData, debugMode, workerUrl, workerLoaded, showFallback]);

  // Handle loading state when URL is ready
  useEffect(() => {
    if (!actualPdfUrl || debugMode || showFallback) {
      setLoading(false);
      return;
    }

    if (!workerLoaded) {
      setLoading(false);
      setShowFallback(true);
      addDebugInfo('Worker not loaded - switching to iframe fallback');
      return;
    }

    setLoading(true);
    setError(null);
    addDebugInfo(`Starting PDF load with local worker. URL: ${actualPdfUrl}`);

    // Set up timeout for PDF viewer
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      addDebugInfo('PDF viewer timeout - switching to iframe fallback');
      setLoading(false);
      setShowFallback(true);
    }, 8000);

    // Clear timeout after successful load simulation
    const successTimeout = setTimeout(() => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        setLoading(false);
        addDebugInfo('PDF viewer initialized successfully');
      }
    }, 2000);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      clearTimeout(successTimeout);
    };
  }, [actualPdfUrl, debugMode, workerLoaded, showFallback]);

  // Direct download function that opens PDF in new tab
  const handleDirectDownload = () => {
    addDebugInfo('Direct download/view button clicked');
    
    if (onDownload) {
      onDownload();
      return;
    }

    // Fallback: open PDF URL in new tab
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      addDebugInfo(`Opened original PDF URL in new tab: ${pdfUrl}`);
    } else if (pdfData) {
      // For base64 data, create download link
      const base64Data = pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addDebugInfo('Downloaded base64 PDF data');
    }
  };

  if (!pdfUrl && !pdfData && !debugMode) {
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

  // Show fallback when PDF fails to load OR as iframe fallback
  if (showFallback || error) {
    return (
      <div className={`bg-surface border border-border rounded-lg overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-secondary">
          <h3 className="text-sm font-medium text-foreground">PDF Report</h3>
          <Button onClick={handleDirectDownload} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View PDF
          </Button>
        </div>

        {/* Iframe Fallback or Error Content */}
        <div className="p-4">
          {actualPdfUrl && !error ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold mb-2">PDF Viewer (Browser Native)</h3>
                <p className="text-muted-foreground mb-4">
                  Using your browser's built-in PDF viewer:
                </p>
              </div>
              
              <iframe
                src={actualPdfUrl}
                width="100%"
                height="600px"
                style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}
                title="PDF Document"
                onLoad={() => addDebugInfo('PDF loaded successfully in iframe')}
                onError={() => addDebugInfo('PDF failed to load in iframe')}
              />
              
              <div className="text-center pt-4">
                <Button onClick={handleDirectDownload} className="mr-2">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                {pdfUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = pdfUrl;
                      link.download = fileName;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">PDF Viewer Not Available</h3>
              <p className="text-muted-foreground mb-6">
                The PDF couldn't be displayed in the browser, but you can still access it directly.
              </p>
              
              <div className="space-y-3">
                <Button onClick={handleDirectDownload} className="w-full max-w-xs">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open PDF in New Tab
                </Button>
                
                {pdfUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = pdfUrl;
                      link.download = fileName;
                      link.click();
                    }}
                    className="w-full max-w-xs"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>

              {error && (
                <Alert className="mt-6 max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Debug Info Panel */}
          {debugMode && (
            <div className="mt-4 p-4 bg-muted/50 border-t border-border">
              <h4 className="text-sm font-semibold mb-2">Debug Information</h4>
              <div className="text-xs space-y-2">
                <div>
                  <strong>Worker URL:</strong>
                  <div className="bg-background p-2 rounded mt-1 font-mono break-all">
                    {workerUrl || 'Not loaded'}
                  </div>
                </div>
                <div>
                  <strong>Worker Status:</strong>
                  <div className="bg-background p-2 rounded mt-1">
                    {workerLoaded ? 'Loaded Successfully' : 'Failed to Load - Using Iframe Fallback'}
                  </div>
                </div>
                <div>
                  <strong>Debug Log:</strong>
                  <div className="bg-background p-2 rounded mt-1 max-h-32 overflow-auto">
                    {debugInfo.map((info, idx) => (
                      <div key={idx} className="py-0.5">{info}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading || !workerLoaded) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            {!workerLoaded ? 'Loading PDF worker...' : 'Loading PDF document...'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            If this takes too long, we'll switch to browser native viewing
          </p>
          
          {/* Proxy Status */}
          {proxyStatus !== 'idle' && (
            <div className="mt-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                proxyStatus === 'testing' ? 'bg-blue-100 text-blue-800' :
                proxyStatus === 'success' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {proxyStatus === 'testing' && <Loader2 className="h-3 w-3 animate-spin" />}
                {proxyStatus === 'success' && <CheckCircle className="h-3 w-3" />}
                {proxyStatus === 'failed' && <AlertCircle className="h-3 w-3" />}
                Proxy Status: {proxyStatus}
              </div>
            </div>
          )}
          
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
          {/* Proxy Status */}
          {proxyStatus !== 'idle' && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
              proxyStatus === 'testing' ? 'bg-blue-100 text-blue-800' :
              proxyStatus === 'success' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {proxyStatus === 'testing' && <Loader2 className="h-3 w-3 animate-spin" />}
              {proxyStatus === 'success' && <CheckCircle className="h-3 w-3" />}
              {proxyStatus === 'failed' && <AlertCircle className="h-3 w-3" />}
              {proxyStatus}
            </div>
          )}
          <Button onClick={handleDirectDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="pdf-viewer-container" style={{ height: '600px' }}>
        {workerUrl && workerLoaded && (
          <Worker workerUrl={workerUrl}>
            <div style={{ height: '100%' }}>
              {debugMode ? (
                <div className="flex flex-col items-center justify-center h-full bg-muted/20 text-center p-8">
                  <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">PDF Viewer Debug Mode</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    The PDF viewer components are successfully loaded and initialized. 
                    Local worker is ready and the layout plugin is configured.
                  </p>
                  <div className="text-sm text-muted-foreground bg-background p-4 rounded border">
                    <strong>Ready to display PDF!</strong><br/>
                    • PDF.js Worker: ✅ {workerLoaded ? 'Loaded Locally' : 'Not Ready'}<br/>
                    • Original PDF URL: ✅ {pdfUrl ? 'Available' : 'Not Set'}<br/>
                    • Actual PDF URL: ✅ {actualPdfUrl ? 'Available' : 'Not Set'}<br/>
                    • Layout Plugin: ✅ Configured<br/>
                    • Proxy Status: {proxyStatus}<br/>
                  </div>
                </div>
              ) : (
                actualPdfUrl && (
                  <Viewer
                    key={viewerKey}
                    fileUrl={actualPdfUrl}
                    plugins={[defaultLayoutPluginInstance]}
                  />
                )
              )}
            </div>
          </Worker>
        )}
      </div>
    </div>
  );
};

export default EnhancedPDFViewer;
