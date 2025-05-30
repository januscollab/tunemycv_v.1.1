
import React from 'react';
import { FileText, Check } from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';

interface CVUpload {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
  extracted_text: string;
  file_type: string;
}

interface SavedCVListProps {
  savedCVs: CVUpload[];
  selectedCVId: string | null;
  onCVSelect: (cv: CVUpload) => void;
}

const SavedCVList: React.FC<SavedCVListProps> = ({ savedCVs, selectedCVId, onCVSelect }) => {
  if (savedCVs.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-blueberry dark:text-citrus mb-3">Saved CVs</h4>
      <div className="space-y-2">
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
              <FileText className="h-5 w-5 text-apricot" />
              <div>
                <p className="font-medium text-blueberry dark:text-citrus">{cv.file_name}</p>
                <p className="text-xs text-blueberry/70 dark:text-apple-core/80">
                  {formatFileSize(cv.file_size)} • {new Date(cv.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {selectedCVId === cv.id && (
              <Check className="h-5 w-5 text-apricot" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedCVList;
