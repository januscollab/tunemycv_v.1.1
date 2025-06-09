
import React, { useState } from 'react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import ProcessingModal from '@/components/ui/processing-modal';
import { BounceLoader } from '@/components/ui/progress-indicator';
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
  selectedCVId?: string | null;
}

const FileUploadWithSave: React.FC<FileUploadWithSaveProps> = ({ 
  onFileSelect, 
  uploading, 
  accept, 
  maxSize, 
  label,
  currentCVCount,
  maxCVCount,
  selectedCVId
}) => {
  const [shouldSave, setShouldSave] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isExtracting, progress, extractText, cancel } = useDocumentExtraction();

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    if (file) {
      await attemptFileProcessing(file, 0);
    }
  };

  const attemptFileProcessing = async (file: File, currentRetry: number) => {
    try {
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
        setRetryCount(0);
      }
    } catch (error) {
      console.error('File processing error:', error);
      
      if (currentRetry < 2) {
        const nextRetry = currentRetry + 1;
        setRetryCount(nextRetry);
        
        toast({
          title: "Upload failed",
          description: `Retrying upload (attempt ${nextRetry}/2)...`,
          variant: "destructive"
        });
        
        // Retry after a brief delay
        setTimeout(() => {
          attemptFileProcessing(file, nextRetry);
        }, 1000);
      } else {
        // Max retries reached
        setRetryCount(0);
        toast({
          title: "Upload failed",
          description: "Upload failed after 2 attempts. Please check your file format and try again. Supported formats: PDF, DOCX, TXT.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveButtonClick = () => {
    setIsButtonLoading(true);
    
    // Simulate save operation with minimum 1 second
    setTimeout(() => {
      setShouldSave(!shouldSave);
      setIsButtonLoading(false);
    }, 1000);
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
        onCancel={cancel}
      />

      {user && !selectedCVId && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            {isButtonLoading ? (
              <div className="flex items-center space-x-2">
                <BounceLoader size="sm" />
                <span className="text-caption text-blueberry dark:text-apple-core">
                  {shouldSave ? 'Removing from saved CVs...' : 'Adding to saved CVs...'}
                </span>
              </div>
            ) : (
              <>
                <input
                  type="checkbox"
                  id="save-cv"
                  checked={shouldSave}
                  onChange={handleSaveButtonClick}
                  disabled={isAtLimit}
                  className="w-4 h-4 text-apricot bg-white border-apple-core/30 rounded focus:ring-apricot focus:ring-2"
                />
                <label 
                  htmlFor="save-cv" 
                  className={`text-caption ${isAtLimit ? 'text-gray-400' : 'text-blueberry dark:text-apple-core'}`}
                >
                  Save this CV for future use
                </label>
              </>
            )}
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
