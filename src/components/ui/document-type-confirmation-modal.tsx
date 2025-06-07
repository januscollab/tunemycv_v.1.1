import React from 'react';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface DocumentTypeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  detectedType: 'cv' | 'job_description' | 'unknown';
  confidence: number;
  cvConfidence: number;
  jobDescriptionConfidence: number;
  onConfirm: (confirmedType: 'cv' | 'job_description') => void;
}

const DocumentTypeConfirmationModal: React.FC<DocumentTypeConfirmationModalProps> = ({
  isOpen,
  onClose,
  fileName,
  detectedType,
  confidence,
  cvConfidence,
  jobDescriptionConfidence,
  onConfirm
}) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 70) return 'text-green-600 dark:text-green-400';
    if (conf >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBadge = (conf: number) => {
    if (conf >= 80) return 'High';
    if (conf >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Confirm Document Type</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Help us identify your document correctly
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-sm space-y-1">
              <p><strong>Document:</strong> {fileName}</p>
              {detectedType !== 'unknown' && (
                <p>
                  <strong>Detected as:</strong> {detectedType === 'cv' ? 'CV/Resume' : 'Job Description'} 
                  <Badge variant="outline" className={`ml-2 text-micro ${getConfidenceColor(confidence)}`}>
                    {confidence}% confidence
                  </Badge>
                </p>
              )}
            </div>
          </div>

          {detectedType === 'unknown' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                We couldn't automatically determine the document type. Please help us by confirming what type of document this is.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Analysis Results:</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">CV/Resume</span>
                  <Badge variant="outline" className={`text-micro ${getConfidenceColor(cvConfidence)}`}>
                    {getConfidenceBadge(cvConfidence)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{cvConfidence}% match</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all" 
                    style={{ width: `${cvConfidence}%` }}
                  />
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Job Description</span>
                  <Badge variant="outline" className={`text-micro ${getConfidenceColor(jobDescriptionConfidence)}`}>
                    {getConfidenceBadge(jobDescriptionConfidence)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{jobDescriptionConfidence}% match</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all" 
                    style={{ width: `${jobDescriptionConfidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">
            Which type of document is this?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => onConfirm('cv')}
              variant="outline"
              className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
            >
              <FileText className="h-4 w-4 mr-2" />
              CV/Resume
            </Button>
            <Button 
              onClick={() => onConfirm('job_description')}
              variant="outline"
              className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
            >
              <FileText className="h-4 w-4 mr-2" />
              Job Description
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentTypeConfirmationModal;