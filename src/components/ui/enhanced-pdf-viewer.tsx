
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showFallback, setShowFallback] = useState(false);
  const [proxyStatus, setProxyStatus] = useState<'testing' | 'success' | 'failed' | 'idle'>('idle');
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use the correct worker URL that matches our pdfjs-dist version (5.3.31)
  const workerUrl = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js';

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

  // Test proxy function
  const testProxyFunction = async (originalUrl: string): Promise<string> => {
    const proxyUrl = `https://aohrfehhyjdebaatzqdl.supabase.co/functions/v1/pdf-proxy?url=${encodeURIComponent(originalUrl)}`;
    
    addDebugInfo(`Testing proxy function with URL: ${proxyUrl}`);
    setProxyStatus('testing');
    
    try {
      const response = await fetch(proxyUrl, { method: 'HEAD' });
      
      if (response.ok) {
        addDebugInfo(`Proxy test successful! Status: ${response.status}`);
        setProxyStatus('success');
        return proxyUrl;
      } else {
        addDebugInfo(`Proxy test failed! Status: ${response.status} - ${response.statusText}`);
        setProxyStatus('failed');
        addDebugInfo(`Falling back to original URL: ${originalUrl}`);
        return originalUrl;
      }
    } catch (error) {
      addDebugInfo(`Proxy test error: ${error.message}`);
      setProxyStatus('failed');
      addDebugInfo(`Falling back to original URL: ${originalUrl}`);
      return originalUrl;
    }
  };

  // Memoize PDF source calculation to prevent re-renders
  const pdfSource = useMemo(() => {
    if (debugMode) {
      return '';
    }

    // Priority: pdfUrl first (direct URL), then pdfData (base64)
    if (pdfUrl) {
      // We'll test the proxy in useEffect and update the actual URL
      return pdfUrl; // Temporary, will be replaced with proxy URL
    }
    
    if (pdfData) {
      // Use data as-is, only add data URL prefix if not already present
      return pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
    }
    
    return '';
  }, [pdfUrl, pdfData, debugMode]);

  // State for the actual URL to use (after proxy testing)
  const [actualPdfUrl, setActualPdfUrl] = useState<string>('');

  // Test proxy and set actual URL
  useEffect(() => {
    if (pdfUrl && !debugMode) {
      testProxyFunction(pdfUrl).then(testedUrl => {
        setActualPdfUrl(testedUrl);
        addDebugInfo(`Final PDF URL set to: ${testedUrl}`);
      });
    } else if (pdfData) {
      const dataUrl = pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
      setActualPdfUrl(dataUrl);
      addDebugInfo(`Using base64 data URL, length: ${pdfData.length}`);
    }
  }, [pdfUrl, pdfData, debugMode]);

  // Debug logging for PDF source changes
  useEffect(() => {
    if (debugMode) {
      addDebugInfo('Debug mode enabled - no PDF will be loaded');
      return;
    }

    addDebugInfo(`Using worker URL: ${workerUrl}`);
    
    if (pdfUrl) {
      addDebugInfo(`Original PDF URL: ${pdfUrl}`);
    } else if (pdfData) {
      addDebugInfo(`Using PDF base64 data, length: ${pdfData.length}`);
    } else {
      addDebugInfo('No PDF source provided');
    }
  }, [pdfUrl, pdfData, debugMode, workerUrl]);

  // Set up loading timeout when we have a source
  useEffect(() => {
    if (!actualPdfUrl || debugMode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setShowFallback(false);
    addDebugInfo(`Starting PDF load with 10 second timeout. URL: ${actualPdfUrl}`);

    // Set up 10-second timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = setTimeout(() => {
      addDebugInfo('PDF loading timeout - 10 seconds exceeded, showing fallback');
      setError('PDF loading timeout. The document may be taking too long to load.');
      setLoading(false);
      setShowFallback(true);
    }, 10000);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [actualPdfUrl, debugMode]);

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

  const handleDocumentLoad = () => {
    addDebugInfo('PDF document loaded successfully');
    setLoading(false);
    setError(null);
    setShowFallback(false);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  const handleDocumentLoadError = (error: any) => {
    addDebugInfo(`PDF document load error: ${error.message || 'Unknown error'}`);
    setError(`Failed to load PDF: ${error.message || 'Unknown error'}`);
    setLoading(false);
    setShowFallback(true);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  };

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

  // Show fallback when PDF fails to load
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

        {/* Fallback Content */}
        <div className="p-8 text-center">
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
        </div>

        {/* Debug Info Panel */}
        {debugMode && (
          <div className="p-4 bg-muted/50 border-t border-border">
            <h4 className="text-sm font-semibold mb-2">Debug Information</h4>
            <div className="text-xs space-y-2">
              <div>
                <strong>Worker URL:</strong>
                <div className="bg-background p-2 rounded mt-1 font-mono break-all">
                  {workerUrl}
                </div>
              </div>
              <div>
                <strong>Original PDF URL:</strong>
                <div className="bg-background p-2 rounded mt-1 break-all">
                  {pdfUrl || 'None'}
                </div>
              </div>
              <div>
                <strong>Actual PDF URL (after proxy test):</strong>
                <div className="bg-background p-2 rounded mt-1 break-all">
                  {actualPdfUrl || 'Not set yet'}
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
    );
  }

  if (loading) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading PDF document...</p>
          <p className="text-xs text-muted-foreground mt-2">
            If this takes too long, a fallback download option will appear
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
                  • Original PDF URL: ✅ {pdfUrl ? 'Available' : 'Not Set'}<br/>
                  • Actual PDF URL: ✅ {actualPdfUrl ? 'Available' : 'Not Set'}<br/>
                  • Layout Plugin: ✅ Configured<br/>
                  • Proxy Status: {proxyStatus}<br/>
                </div>
              </div>
            ) : (
              <Viewer
                fileUrl={actualPdfUrl}
                plugins={[defaultLayoutPluginInstance]}
                onDocumentLoad={handleDocumentLoad}
                onLoadError={handleDocumentLoadError}
              />
            )}
          </div>
        </Worker>
      </div>
    </div>
  );
};

export default EnhancedPDFViewer;
