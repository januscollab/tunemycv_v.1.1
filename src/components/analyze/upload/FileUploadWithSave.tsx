
import React, { useState } from 'react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import ProcessingModal from '@/components/ui/processing-modal';
import { useAuth } from '@/contexts/AuthContext';
import { useDocumentExtraction } from '@/hooks/useDocumentExtraction';
import { useToast } from '@/hooks/use-toast';
import { validateFileSecurely, createSecureFileObject } from '@/utils/secureFileValidation';

interface FileUploadWithSaveProps {
  onFileSelect: (file: File, extractedText: string, shouldSave: boolean) => void;
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
  const { toast } = useToast();
  const { isExtracting, progress, extractText } = useDocumentExtraction();

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    if (file) {
      // Perform security validation
      const validation = validateFileSecurely(file, 'cv');
      
      if (!validation.isValid) {
        toast({
          title: "File validation failed",
          description: validation.errors[0],
          variant: "destructive"
        });
        return;
      }
      
      // Create secure file object with sanitized name
      const secureFile = createSecureFileObject(file, validation.sanitizedName!);
      
      // Extract text from the file
      const result = await extractText(secureFile, 'cv');
      
      if (result) {
        onFileSelect(secureFile, result.extractedText, shouldSave);
        setShouldSave(false);
      }
    }
  };

  const isAtLimit = currentCVCount >= maxCVCount;

  return (
    <div>
      <DragDropZone
        onDrop={handleDrop}
        accept={accept}
        maxSize={parseFloat(maxSize) * 1024 * 1024}
        disabled={uploading || isExtracting}
        placeholder={isExtracting ? progress : (uploading ? "Uploading..." : label)}
        description={`${accept} • Max ${maxSize}`}
        className="border-apple-core/30 dark:border-citrus/30"
      />
      
      <ProcessingModal
        isOpen={isExtracting}
        title="Processing CV"
        message={progress}
      />

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
              className={`text-caption ${isAtLimit ? 'text-gray-400' : 'text-blueberry dark:text-apple-core'}`}
            >
              Save this CV for future use
            </label>
          </div>
          
          {isAtLimit && (
            <div className="text-caption text-red-600 dark:text-red-400">
              You've reached the maximum of {maxCVCount} saved CVs.{' '}
              <a href="/profile" className="text-apricot hover:text-apricot/80 underline">
                Manage your CVs in your Profile
              </a>{' '}
              to make space for new ones.
            </div>
          )}
          
          {!isAtLimit && (
            <p className="text-micro text-blueberry/70 dark:text-apple-core/80">
              {currentCVCount}/{maxCVCount} CV slots used
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadWithSave;
