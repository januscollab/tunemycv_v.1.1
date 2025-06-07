import React from 'react';
import { FileText, Check } from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';

interface CVUpload {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
  extracted_text: string;
}

interface SavedCVListProps {
  savedCVs: CVUpload[];
  selectedCVId: string | null;
  onCVSelect: (cv: CVUpload) => void;
}

const SavedCVList: React.FC<SavedCVListProps> = ({ savedCVs, selectedCVId, onCVSelect }) => {
  if (savedCVs.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-blueberry/40 dark:text-apple-core/40 mb-4" />
        <h3 className="text-subheading font-medium text-blueberry dark:text-citrus mb-2">No saved CVs</h3>
        <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">
          You haven't uploaded any CVs yet. Upload your first CV to get started.
        </p>
        <p className="text-caption text-blueberry/60 dark:text-apple-core/60">
          Switch to the "Upload New" tab to add your CV.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-caption font-medium text-blueberry dark:text-citrus mb-3">Select a saved CV</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {savedCVs.map((cv) => (
          <div
            key={cv.id}
            onClick={() => onCVSelect(cv)}
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedCVId === cv.id
                ? 'border-apricot bg-apricot/10'
                : 'border-apple-core/20 dark:border-citrus/20 hover:border-apricot hover:bg-apricot/5'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-apricot flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-blueberry dark:text-citrus truncate">{cv.file_name}</p>
                <p className="text-micro text-blueberry/70 dark:text-apple-core/80">
                  {formatFileSize(cv.file_size)} • {new Date(cv.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {selectedCVId === cv.id && (
              <Check className="h-5 w-5 text-apricot flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedCVList;