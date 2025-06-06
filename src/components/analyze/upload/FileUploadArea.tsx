
import React from 'react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import { validateFileSecurely, createSecureFileObject } from '@/utils/secureFileValidation';
import { useToast } from '@/hooks/use-toast';

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
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
  const maxSizeBytes = parseFloat(maxSize) * 1024 * 1024; // Convert MB to bytes

  const handleDrop = (files: File[]) => {
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
      onFileSelect(secureFile);
    }
  };

  return (
    <DragDropZone
      onDrop={handleDrop}
      accept={accept}
      maxSize={maxSizeBytes}
      disabled={uploading}
      placeholder={uploading ? "Uploading..." : label}
      description={`${accept} • Max ${maxSize}`}
      className="border-apple-core/30 dark:border-citrus/30"
    />
  );
};

export default FileUploadArea;
