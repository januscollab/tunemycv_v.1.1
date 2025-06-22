
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
  const [workerLoaded, setWorkerLoaded] = useState(false);

  // COMPREHENSIVE DEBUG LOGGING
  useEffect(() => {
    console.log('=== PDF VIEWER DEBUG START ===');
    console.log('Props received by EnhancedPDFViewer:');
    console.log('- pdfData type:', typeof pdfData);
    console.log('- pdfData length:', pdfData ? pdfData.length : 'null/undefined');
    console.log('- pdfData first 50 chars:', pdfData ? pdfData.substring(0, 50) : 'none');
    console.log('- pdfUrl:', pdfUrl);
    console.log('- fileName:', fileName);
    console.log('- Has pdfData:', !!pdfData);
    console.log('- Has pdfUrl:', !!pdfUrl);
    
    if (pdfData) {
      console.log('PDF Data Analysis:');
      console.log('- Starts with data: prefix?', pdfData.startsWith('data:'));
      console.log('- Appears to be base64?', /^[A-Za-z0-9+/]*={0,2}$/.test(pdfData.substring(0, 100)));
      console.log('- First 20 chars after potential prefix:', pdfData.substring(pdfData.indexOf(',') + 1, pdfData.indexOf(',') + 21));
    }
    
    console.log('=== PDF VIEWER DEBUG END ===');
  }, [pdfData, pdfUrl, fileName]);

  // Configure default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      defaultTabs[0], // Thumbnail tab
      defaultTabs[1], // Outline tab
    ],
  });

  // Simplified worker URL determination with fallbacks
  useEffect(() => {
    const determineWorkerUrl = async () => {
      console.log('=== WORKER URL DETERMINATION START ===');
      
      // Primary worker URL - use the copied asset
      const primaryWorkerUrl = '/assets/pdf.worker.min.js';
      
      // Fallback worker URLs
      const fallbackWorkerUrls = [
        'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      ];

      // Test if primary worker exists
      try {
        console.log('Testing primary worker URL:', primaryWorkerUrl);
        const response = await fetch(primaryWorkerUrl, { method: 'HEAD' });
        if (response.ok) {
          console.log('Primary worker URL is accessible');
          setWorkerUrl(primaryWorkerUrl);
          setWorkerLoaded(true);
          console.log('=== WORKER URL DETERMINATION END (SUCCESS) ===');
          return;
        }
        console.log('Primary worker URL failed with status:', response.status);
      } catch (error) {
        console.log('Primary worker URL test failed:', error);
      }

      // Try fallback URLs
      for (const fallbackUrl of fallbackWorkerUrls) {
        try {
          console.log('Testing fallback worker URL:', fallbackUrl);
          const response = await fetch(fallbackUrl, { method: 'HEAD' });
          if (response.ok) {
            console.log('Fallback worker URL is accessible:', fallbackUrl);
            setWorkerUrl(fallbackUrl);
            setWorkerLoaded(true);
            console.log('=== WORKER URL DETERMINATION END (FALLBACK SUCCESS) ===');
            return;
          }
          console.log('Fallback worker URL failed with status:', response.status);
        } catch (error) {
          console.log('Fallback worker URL test failed:', fallbackUrl, error);
        }
      }

      // If all failed, set error
      console.error('All worker URLs failed, PDF viewer cannot initialize');
      setError('Failed to load PDF worker. Please check your internet connection.');
      console.log('=== WORKER URL DETERMINATION END (FAILED) ===');
    };

    determineWorkerUrl();
  }, []);

  useEffect(() => {
    if (!workerLoaded) return;

    const preparePdfSource = async () => {
      console.log('=== PDF SOURCE PREPARATION START ===');
      setLoading(true);
      setError(null);

      try {
        if (pdfData) {
          console.log('Processing pdfData...');
          console.log('Raw pdfData length:', pdfData.length);
          
          // Handle base64 PDF data with improved validation
          let base64Data: string;
          if (pdfData.startsWith('data:')) {
            console.log('PDF data already has data: prefix');
            base64Data = pdfData;
          } else {
            console.log('Adding data: prefix to PDF data');
            // Validate if it looks like base64 before adding prefix
            if (/^[A-Za-z0-9+/]*={0,2}$/.test(pdfData.substring(0, 100))) {
              base64Data = `data:application/pdf;base64,${pdfData}`;
            } else {
              console.error('PDF data does not appear to be valid base64');
              setError('Invalid PDF data format');
              return;
            }
          }
          
          console.log('Final base64Data length:', base64Data.length);
          console.log('Final base64Data preview:', base64Data.substring(0, 100));
          
          setPdfSource(base64Data);
          console.log('PDF source set from base64 data');
        } else if (pdfUrl) {
          console.log('Using PDF URL:', pdfUrl);
          setPdfSource(pdfUrl);
          console.log('PDF source set from URL');
        } else {
          console.error('No PDF data or URL provided');
          setError('No PDF data or URL provided');
          return;
        }
      } catch (err) {
        console.error('Error preparing PDF source:', err);
        setError('Failed to load PDF document');
      } finally {
        console.log('PDF source preparation completed');
        console.log('=== PDF SOURCE PREPARATION END ===');
        setLoading(false);
      }
    };

    preparePdfSource();
  }, [pdfData, pdfUrl, workerLoaded]);

  const handleDownload = () => {
    console.log('=== PDF DOWNLOAD START ===');
    console.log('onDownload callback provided:', !!onDownload);
    
    if (onDownload) {
      console.log('Using provided onDownload callback');
      onDownload();
      return;
    }

    // Fallback download logic
    console.log('Using fallback download logic');
    if (pdfData) {
      console.log('Downloading from pdfData');
      const base64Data = pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('PDF download from base64 completed');
    } else if (pdfUrl) {
      console.log('Downloading from pdfUrl');
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('PDF download from URL completed');
    } else {
      console.error('No PDF data available for download');
    }
    console.log('=== PDF DOWNLOAD END ===');
  };

  const handleDocumentLoad = () => {
    console.log('PDF document loaded successfully');
    setLoading(false);
    setError(null);
  };

  const handleDocumentLoadError = (error: any) => {
    console.error('PDF document load error:', error);
    setError(`Failed to load PDF document: ${error?.message || 'Unknown error'}`);
    setLoading(false);
  };

  if (!workerLoaded && !error) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Initializing PDF viewer...</p>
          <p className="text-xs text-muted-foreground mt-2">Loading PDF.js worker...</p>
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
          <p className="text-xs text-muted-foreground mt-2">
            Debug: {pdfData ? `Base64 data (${pdfData.length} chars)` : pdfUrl ? `URL: ${pdfUrl}` : 'No source'}
          </p>
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
        <div className="text-xs text-muted-foreground mb-4">
          <p>Debug Info:</p>
          <p>- PDF Data Available: {!!pdfData ? 'Yes' : 'No'}</p>
          <p>- PDF URL Available: {!!pdfUrl ? 'Yes' : 'No'}</p>
          <p>- PDF Source Set: {!!pdfSource ? 'Yes' : 'No'}</p>
          <p>- Worker Loaded: {workerLoaded ? 'Yes' : 'No'}</p>
          <p>- Worker URL: {workerUrl || 'Not set'}</p>
          {pdfData && <p>- Data Length: {pdfData.length}</p>}
        </div>
        <div className="flex justify-center">
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF Instead
          </Button>
        </div>
      </div>
    );
  }

  if (!pdfSource) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-8 ${className}`}>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No PDF source available to display
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log('Rendering PDF viewer with source:', pdfSource ? pdfSource.substring(0, 100) + '...' : 'none');
  console.log('Using worker URL:', workerUrl);

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
          <div
            style={{ height: '100%' }}
            onError={(error) => {
              console.error('PDF rendering error:', error);
              setError('Failed to render PDF document');
            }}
          >
            <Viewer
              fileUrl={pdfSource}
              plugins={[defaultLayoutPluginInstance]}
              onDocumentLoad={handleDocumentLoad}
              onDocumentLoadError={handleDocumentLoadError}
            />
          </div>
        </Worker>
      </div>
    </div>
  );
};

export default EnhancedPDFViewer;
