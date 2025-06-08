
import React, { useState } from 'react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import ProcessingModal from '@/components/ui/processing-modal';
import { validateFileSecurely, createSecureFileObject } from '@/utils/secureFileValidation';
import { useDocumentExtraction } from '@/hooks/useDocumentExtraction';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const { isExtracting, progress, extractText, cancel } = useDocumentExtraction();
  const maxSizeBytes = parseFloat(maxSize) * 1024 * 1024; // Convert MB to bytes

  const handleDrop = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      
      // Perform security validation
      const validation = validateFileSecurely(file, fileType);
      
      if (!validation.isValid) {
        toast({
          title: "File validation failed",
          description: validation.errors[0],
          variant: "destructive"
        });
        return;
      }
      
      // Create secure file object with sanitized name
      const secureFile = createSecureFileObject(file, validation.sanitizedName!);
      
      // Extract text from the file with type detection
      const result = await extractText(secureFile, fileType);
      
      if (result) {
        onFileSelect(secureFile, result.extractedText, result.documentJson, result.typeDetection, result.qualityAssessment);
      }
    }
  };

  return (
    <>
      <DragDropZone
        onDrop={handleDrop}
        accept={accept}
        maxSize={maxSizeBytes}
        disabled={uploading || isExtracting}
        placeholder={isExtracting ? progress : (uploading ? "Uploading..." : label)}
        description={`${accept} • Max ${maxSize}`}
        className="border-apple-core/30 dark:border-citrus/30"
      />
      
      <ProcessingModal
        isOpen={isExtracting}
        title="Processing Document"
        message={progress}
        onCancel={cancel}
      />
    </>
  );
};

export default FileUploadArea;
