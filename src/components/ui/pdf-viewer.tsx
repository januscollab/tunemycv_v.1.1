/**
 * @deprecated This component is deprecated. Use PDFDownloadCard instead.
 * The iframe-based PDF viewer has cross-origin and encoding issues.
 * PDFDownloadCard provides immediate download functionality.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, FileText, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PDFDownloadCard from './pdf-download-card';

interface PDFViewerProps {
  pdfData: string; // base64 encoded PDF data
  fileName?: string;
  title?: string;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfData,
  fileName = 'document.pdf',
  title = 'PDF Document',
  className = ''
}) => {
  // Redirect to the new PDFDownloadCard component
  return (
    <PDFDownloadCard
      pdfData={pdfData}
      fileName={fileName}
      title={title}
      className={className}
    />
  );
};

export default PDFViewer;