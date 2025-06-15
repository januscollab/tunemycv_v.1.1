import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface N8nAnalysisResultsProps {
  htmlUrl: string;
  pdfUrl: string;
  message: string;
  cvFileName: string;
  jobDescriptionFileName: string;
}

export const N8nAnalysisResults: React.FC<N8nAnalysisResultsProps> = ({
  htmlUrl,
  pdfUrl,
  message,
  cvFileName,
  jobDescriptionFileName
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState<'html' | 'pdf'>('html');

  const handlePreview = (url: string, type: 'html' | 'pdf') => {
    setPreviewUrl(url);
    setPreviewType(type);
    setShowPreview(true);
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analysis Complete
          </CardTitle>
          <CardDescription className="text-green-700">
            {message}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Document Info */}
      <Card>
        <CardHeader>
          <CardTitle>Analyzed Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium">CV:</span>
              <span className="text-muted-foreground">{cvFileName}</span>
            </div>
            <Badge variant="secondary">Processed</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium">Job Description:</span>
              <span className="text-muted-foreground">{jobDescriptionFileName}</span>
            </div>
            <Badge variant="secondary">Processed</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Results Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>
            View and download your compatibility analysis report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* HTML Preview */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">Interactive Report</h4>
                <p className="text-sm text-muted-foreground">HTML format with interactive elements</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(htmlUrl, 'html')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(htmlUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(htmlUrl, 'compatibility-report.html')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* PDF Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">PDF Report</h4>
                <p className="text-sm text-muted-foreground">Printable format for sharing</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(pdfUrl, 'pdf')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(pdfUrl, 'compatibility-report.pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {previewType === 'html' ? 'Interactive Report Preview' : 'PDF Report Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-[70vh]">
            <iframe
              src={previewUrl}
              className="w-full h-full border rounded-lg"
              title={`${previewType.toUpperCase()} Preview`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};