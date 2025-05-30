
import React from 'react';
import { Check, X } from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

interface UploadedFileDisplayProps {
  uploadedFile: UploadedFile;
  onRemove: () => void;
}

const UploadedFileDisplay: React.FC<UploadedFileDisplayProps> = ({ uploadedFile, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <Check className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-green-900">{uploadedFile.file.name}</p>
          <p className="text-sm text-green-700">{formatFileSize(uploadedFile.file.size)}</p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-2 text-red-600 hover:bg-red-100 rounded-md"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default UploadedFileDisplay;
