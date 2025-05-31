
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Check } from 'lucide-react';

interface CVUpload {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
  extracted_text: string;
}

interface CVSelectorDropdownProps {
  savedCVs: CVUpload[];
  selectedCVId: string | null;
  onCVSelect: (cv: CVUpload) => void;
}

const CVSelectorDropdown: React.FC<CVSelectorDropdownProps> = ({ 
  savedCVs, 
  selectedCVId, 
  onCVSelect 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedCV = savedCVs.find(cv => cv.id === selectedCVId);

  if (savedCVs.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-blueberry dark:text-citrus mb-3">Saved CVs</h4>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 border border-apple-core/30 dark:border-citrus/30 rounded-lg bg-white dark:bg-blueberry/10 hover:border-apricot transition-colors"
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-apricot" />
            <span className="text-blueberry dark:text-citrus">
              {selectedCV ? selectedCV.file_name : 'Select a saved CV'}
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-blueberry/60 dark:text-apple-core/60" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blueberry/60 dark:text-apple-core/60" />
          )}
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-blueberry border border-apple-core/30 dark:border-citrus/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {savedCVs.map((cv) => (
              <button
                key={cv.id}
                onClick={() => {
                  onCVSelect(cv);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 text-left hover:bg-apple-core/10 dark:hover:bg-citrus/10 transition-colors ${
                  selectedCVId === cv.id ? 'bg-apricot/10' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-apricot" />
                  <div>
                    <p className="font-medium text-blueberry dark:text-citrus">{cv.file_name}</p>
                    <p className="text-xs text-blueberry/70 dark:text-apple-core/80">
                      {new Date(cv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedCVId === cv.id && (
                  <Check className="h-4 w-4 text-apricot" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CVSelectorDropdown;
