
import React, { useState } from 'react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { useUploadOrchestrator } from '@/hooks/useUploadOrchestrator';
import { useToast } from '@/hooks/use-toast';
import { validateJobDescription } from '@/utils/documentValidation';
import DocumentValidationDialog from '@/components/ui/document-validation-dialog';

interface FileUploadAreaProps {
  onFileSelect: (file: File, extractedText: string, documentJson: any, typeDetection: any, qualityAssessment: any) => void;
  uploading: boolean;
  accept: string;
  maxSize: string;
  label: string;
  fileType: 'cv' | 'job_description';
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ 
  onFileSelect, 
  uploading, 
  accept, 
  maxSize, 
  label,
  fileType
}) => {
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [pendingResult, setPendingResult] = useState<any>(null);
  const orchestrator = useUploadOrchestrator();
  const { toast } = useToast();

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    if (file) {
      await attemptFileProcessing(file);
    }
  };

  const attemptFileProcessing = async (file: File) => {
    try {
      const result = await orchestrator.processFile(file, { 
        fileType,
        shouldStore: false // Don't auto-save job descriptions
      });
      
      if (result.success && result.file && result.extractedText) {
        // For job descriptions, validate the content
        if (fileType === 'job_description') {
          const validation = validateJobDescription(result.extractedText, file.name);
          
          if (!validation.isValid) {
            setPendingResult({
              file: result.file,
              extractedText: result.extractedText,
              documentJson: result.documentJson,
              typeDetection: result.typeDetection,
              qualityAssessment: result.qualityAssessment,
              validation
            });
            setShowValidationDialog(true);
            return;
          }
        }
        
        // Proceed with file selection
        onFileSelect(
          result.file, 
          result.extractedText, 
          result.documentJson,
          result.typeDetection,
          result.qualityAssessment
        );
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'Failed to process file',
        variant: 'destructive'
      });
    }
  };

  const handleValidationConfirm = () => {
    if (pendingResult) {
      onFileSelect(
        pendingResult.file,
        pendingResult.extractedText,
        pendingResult.documentJson,
        pendingResult.typeDetection,
        pendingResult.qualityAssessment
      );
    }
    setShowValidationDialog(false);
    setPendingResult(null);
  };

  const handleValidationCancel = () => {
    setShowValidationDialog(false);
    setPendingResult(null);
  };

  return (
    <>
      <div className="relative">
        <DragDropZone
          onDrop={handleDrop}
          accept={accept}
          maxSize={parseFloat(maxSize) * 1024 * 1024}
          disabled={uploading || orchestrator.isProcessing}
          placeholder={orchestrator.isProcessing ? orchestrator.progress : (uploading ? "Uploading..." : label)}
          description={`${accept} • Max ${maxSize}`}
          className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors duration-200 rounded-xl bg-gradient-to-br from-background via-muted/10 to-background shadow-sm hover:shadow-md"
        />
      </div>
      
      {orchestrator.isProcessing && (
        <div className="flex items-center justify-center p-4">
          <ProgressIndicator 
            value={50}
            variant="default"
            size="md"
            label={`Processing ${fileType === 'cv' ? 'CV' : 'Job Description'}`}
          />
        </div>
      )}

      {/* Validation Dialog */}
      {pendingResult && (
        <DocumentValidationDialog
          isOpen={showValidationDialog}
          onClose={handleValidationCancel}
          onConfirm={handleValidationConfirm}
          documentType={fileType}
          fileName={pendingResult.file.name}
          validationResult={pendingResult.validation}
        />
      )}
    </>
  );
};

export default FileUploadArea;
