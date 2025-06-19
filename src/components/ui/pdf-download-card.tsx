import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PDFDownloadCardProps {
  pdfData: string; // base64 encoded PDF data
  fileName?: string;
  title?: string;
  className?: string;
}

const PDFDownloadCard: React.FC<PDFDownloadCardProps> = ({
  pdfData,
  fileName = 'document.pdf',
  title = 'PDF Document',
  className = ''
}) => {
  const handleDownload = () => {
    try {
      // Convert base64 to blob
      const binaryString = atob(pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">PDF Ready for Download</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Your document has been generated and is ready to download.
          </p>
          <Button
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFDownloadCard;