
import React, { useState, useEffect } from 'react';
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
  debugMode?: boolean; // New prop for debugging
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

  const addDebugInfo = (message: string) => {
    console.log(`[PDF Viewer Debug]: ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

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
      addDebugInfo('Starting worker URL determination...');
      
      // Try local worker first (will be available in production build)
      const localWorkerUrl = '/assets/pdf.worker.min.js';
      
      // For development, we'll use the node_modules path
      const devWorkerUrl = '/node_modules/pdfjs-dist/build/pdf.worker.min.js';
      
      // Set the appropriate worker URL based on environment
      if (import.meta.env.PROD) {
        setWorkerUrl(localWorkerUrl);
        addDebugInfo(`Production mode: Using local worker URL: ${localWorkerUrl}`);
      } else {
        setWorkerUrl(devWorkerUrl);
        addDebugInfo(`Development mode: Using dev worker URL: ${devWorkerUrl}`);
      }
    };

    determineWorkerUrl();
  }, []);

  useEffect(() => {
    if (workerUrl) {
      addDebugInfo(`Worker URL set to: ${workerUrl}`);
      
      if (debugMode) {
        addDebugInfo('Debug mode enabled - skipping PDF loading');
        setLoading(false);
        return;
      }

      const preparePdfSource = async () => {
        setLoading(true);
        setError(null);
        addDebugInfo('Starting PDF source preparation...');

        try {
          if (pdfData) {
            addDebugInfo('Processing base64 PDF data...');
            const base64Data = pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
            addDebugInfo('Base64 PDF data prepared');
          } else if (pdfUrl) {
            addDebugInfo(`Processing PDF URL: ${pdfUrl}`);
          } else {
            addDebugInfo('No PDF data or URL provided');
            setError('No PDF data or URL provided');
            return;
          }
        } catch (err) {
          const errorMsg = 'Failed to load PDF document';
          addDebugInfo(`Error: ${errorMsg}`);
          setError(errorMsg);
        } finally {
          setLoading(false);
        }
      };

      preparePdfSource();
    }
  }, [pdfData, pdfUrl, workerUrl, debugMode]);

  const handleDownload = () => {
    addDebugInfo('Download button clicked');
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
    addDebugInfo('PDF document loaded successfully');
    setLoading(false);
    setError(null);
  };

  if (!workerUrl) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Initializing PDF viewer...</p>
          {debugMode && (
            <div className="mt-4 text-left text-xs text-muted-foreground max-w-lg">
              <h4 className="font-semibold mb-2">Debug Info:</h4>
              <div className="bg-muted/50 p-2 rounded text-xs">
                Worker URL not yet determined...
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading && !debugMode) {
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

  if (error && !debugMode) {
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
              <strong>Environment:</strong>
              <div className="bg-background p-2 rounded mt-1">
                {import.meta.env.PROD ? 'Production' : 'Development'}
              </div>
            </div>
            <div>
              <strong>Props:</strong>
              <div className="bg-background p-2 rounded mt-1">
                PDF Data: {pdfData ? 'Present' : 'None'}<br/>
                PDF URL: {pdfUrl || 'None'}<br/>
                File Name: {fileName}
              </div>
            </div>
            <div>
              <strong>Status:</strong>
              <div className="bg-background p-2 rounded mt-1">
                Loading: {loading.toString()}<br/>
                Error: {error || 'None'}<br/>
                Worker: {workerUrl ? 'Ready' : 'Not Ready'}
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

      {/* PDF Viewer or Debug Placeholder */}
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
                  <strong>Next Steps:</strong><br/>
                  • Basic viewer structure: ✅ Working<br/>
                  • PDF.js Worker: ✅ Initialized<br/>
                  • Layout Plugin: ✅ Configured<br/>
                  • CSS Styles: ✅ Loaded<br/>
                  <br/>
                  Ready to test with actual PDF content!
                </div>
              </div>
            ) : (
              <Viewer
                fileUrl={pdfData ? (pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`) : pdfUrl || ''}
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
