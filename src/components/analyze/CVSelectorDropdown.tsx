
import React from 'react';
import { ChevronDown, FileText, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const selectedCV = savedCVs.find(cv => cv.id === selectedCVId);

  if (savedCVs.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-caption font-medium text-blueberry dark:text-citrus mb-3">Saved CVs</h4>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 border border-apple-core/30 dark:border-citrus/30 rounded-lg bg-white dark:bg-blueberry/10 hover:border-apricot transition-colors">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-apricot" />
              <span className="text-blueberry dark:text-citrus">
                {selectedCV ? selectedCV.file_name : 'Select a saved CV'}
              </span>
            </div>
            <ChevronDown className="h-5 w-5 text-blueberry/60 dark:text-apple-core/60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
          {savedCVs.map((cv) => (
            <DropdownMenuItem
              key={cv.id}
              onClick={() => onCVSelect(cv)}
              className={`flex items-center justify-between p-3 cursor-pointer ${
                selectedCVId === cv.id ? 'bg-apricot/10' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-apricot" />
                <div>
                  <p className="font-medium text-blueberry dark:text-citrus">{cv.file_name}</p>
                  <p className="text-micro text-blueberry/70 dark:text-apple-core/80">
                    {new Date(cv.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {selectedCVId === cv.id && (
                <Check className="h-4 w-4 text-apricot" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CVSelectorDropdown;
