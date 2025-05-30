
import React from 'react';
import { FileText } from 'lucide-react';

interface FileUploadAreaProps {
  onFileUpload: (file: File) => void;
  uploading: boolean;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFileUpload, uploading }) => {
  return (
    <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center mb-4">
      <FileText className="mx-auto h-12 w-12 text-blueberry/40 dark:text-apple-core/40 mb-4" />
      <label className="cursor-pointer">
        <span className="text-apricot hover:text-apricot/80 font-medium">Click to upload</span>
        <span className="text-blueberry/70 dark:text-apple-core/70"> or drag and drop your CV</span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
          disabled={uploading}
        />
      </label>
    </div>
  );
};

export default FileUploadArea;
