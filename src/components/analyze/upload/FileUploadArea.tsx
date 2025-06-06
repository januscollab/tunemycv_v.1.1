
import React from 'react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
  uploading: boolean;
  accept: string;
  maxSize: string;
  label: string;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ 
  onFileSelect, 
  uploading, 
  accept, 
  maxSize, 
  label 
}) => {
  const maxSizeBytes = parseFloat(maxSize) * 1024 * 1024; // Convert MB to bytes

  const handleDrop = (files: File[]) => {
    if (files.length > 0) {
      onFileSelect(files[0]);
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
