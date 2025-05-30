
import React, { useState } from 'react';
import { Upload, Link } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadWithSaveProps {
  onFileSelect: (file: File, shouldSave: boolean) => void;
  uploading: boolean;
  accept: string;
  maxSize: string;
  label: string;
  currentCVCount: number;
  maxCVCount: number;
}

const FileUploadWithSave: React.FC<FileUploadWithSaveProps> = ({ 
  onFileSelect, 
  uploading, 
  accept, 
  maxSize, 
  label,
  currentCVCount,
  maxCVCount
}) => {
  const [shouldSave, setShouldSave] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, shouldSave);
      // Reset the input and checkbox
      e.target.value = '';
      setShouldSave(false);
    }
  };

  const isAtLimit = currentCVCount >= maxCVCount;

  return (
    <div>
      <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center">
        <Upload className="mx-auto h-8 w-8 text-blueberry/60 dark:text-apple-core/60 mb-2" />
        <label className="cursor-pointer">
          <span className="text-apricot hover:text-apricot/80 font-medium">{label}</span>
          <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-1">{accept}, max {maxSize}</p>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {user && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="save-cv"
              checked={shouldSave}
              onChange={(e) => setShouldSave(e.target.checked)}
              disabled={isAtLimit}
              className="w-4 h-4 text-apricot bg-white border-apple-core/30 rounded focus:ring-apricot focus:ring-2"
            />
            <label 
              htmlFor="save-cv" 
              className={`text-sm ${isAtLimit ? 'text-gray-400' : 'text-blueberry dark:text-apple-core'}`}
            >
              Save this CV for future use
            </label>
          </div>
          
          {isAtLimit && (
            <div className="text-sm text-red-600 dark:text-red-400">
              You've reached the maximum of {maxCVCount} saved CVs.{' '}
              <a href="/profile" className="text-apricot hover:text-apricot/80 underline">
                Manage your CVs in your Profile
              </a>{' '}
              to make space for new ones.
            </div>
          )}
          
          {!isAtLimit && (
            <p className="text-xs text-blueberry/70 dark:text-apple-core/80">
              {currentCVCount}/{maxCVCount} CV slots used
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadWithSave;
