
import React from 'react';
import { Check } from 'lucide-react';
import { UploadedFile } from '@/types/fileTypes';

interface UploadedFileDisplayProps {
  uploadedFile: UploadedFile;
  title: string;
}

const UploadedFileDisplay: React.FC<UploadedFileDisplayProps> = ({ uploadedFile, title }) => {
  return (
    <div className="mt-4 flex items-center justify-between p-3 bg-apricot/10 border border-apricot/30 rounded-lg">
      <div className="flex items-center space-x-3">
        <Check className="h-5 w-5 text-apricot" />
        <div>
          <p className="font-medium text-blueberry dark:text-citrus">{uploadedFile.file.name}</p>
          <p className="text-xs text-blueberry/70 dark:text-apple-core/80">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default UploadedFileDisplay;
