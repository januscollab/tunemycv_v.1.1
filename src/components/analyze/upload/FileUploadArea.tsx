
import React from 'react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { useUploadOrchestrator } from '@/hooks/useUploadOrchestrator';

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
  const orchestrator = useUploadOrchestrator();
  const maxSizeBytes = parseFloat(maxSize) * 1024 * 1024; // Convert MB to bytes

  const handleDrop = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      
      const result = await orchestrator.processFile(file, { 
        fileType,
        shouldStore: fileType === 'job_description' // Only store job descriptions for now
      });
      
      if (result.success && result.file && result.extractedText) {
        onFileSelect(
          result.file, 
          result.extractedText, 
          result.documentJson!, 
          result.typeDetection!, 
          result.qualityAssessment!
        );
      }
    }
  };

  return (
    <>
      <DragDropZone
        onDrop={handleDrop}
        accept={accept}
        maxSize={maxSizeBytes}
        disabled={uploading || orchestrator.isProcessing}
        placeholder={orchestrator.isProcessing ? orchestrator.progress : (uploading ? "Uploading..." : label)}
        description={`${accept} • Max ${maxSize}`}
        className="border-apple-core/30 dark:border-citrus/30"
      />
      
      {orchestrator.isProcessing && (
        <div className="flex items-center justify-center p-4">
          <ProgressIndicator 
            value={50}
            variant="default"
            size="md"
            label="Processing Document"
            
          />
        </div>
      )}
    </>
  );
};

export default FileUploadArea;
