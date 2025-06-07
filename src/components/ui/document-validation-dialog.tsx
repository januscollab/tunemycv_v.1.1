import React from 'react';
import { AlertTriangle, FileX, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ValidationResult } from '@/utils/documentValidation';

interface DocumentValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentType: 'cv' | 'job_description';
  fileName: string;
  validationResult: ValidationResult;
}

const DocumentValidationDialog: React.FC<DocumentValidationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  documentType,
  fileName,
  validationResult
}) => {
  const isCV = documentType === 'cv';
  const documentLabel = isCV ? 'CV/Resume' : 'Job Description';
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Document Verification</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Please confirm this is the correct document type
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium text-sm">Expected: {documentLabel}</p>
              <p className="text-xs text-muted-foreground truncate">{fileName}</p>
            </div>
            <Badge 
              variant="outline" 
              className={getConfidenceColor(validationResult.confidence)}
            >
              {validationResult.confidence}% match
            </Badge>
          </div>
          
          {validationResult.issues.length > 0 && (
            <Alert>
              <FileX className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Potential issues detected:</p>
                  <ul className="text-sm space-y-1">
                    {validationResult.issues.map((issue, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-muted-foreground">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {validationResult.suggestions.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Suggestions:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span>•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Different File
          </Button>
          <Button 
            variant="outline"
            onClick={onConfirm}
            className="hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            Continue Anyway
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentValidationDialog;