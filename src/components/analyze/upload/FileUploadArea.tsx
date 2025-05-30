
import React from 'react';
import { Upload } from 'lucide-react';

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
  return (
    <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center">
      <Upload className="mx-auto h-8 w-8 text-blueberry/60 dark:text-apple-core/60 mb-2" />
      <label className="cursor-pointer">
        <span className="text-apricot hover:text-apricot/80 font-medium">{label}</span>
        <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-1">{accept}, max {maxSize}</p>
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
          disabled={uploading}
        />
      </label>
    </div>
  );
};

export default FileUploadArea;
