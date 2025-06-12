
import React, { useState } from 'react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import ProcessingModal from '@/components/ui/processing-modal';
import { BounceLoader } from '@/components/ui/progress-indicator';
import { useAuth } from '@/contexts/AuthContext';
import { useUploadOrchestrator } from '@/hooks/useUploadOrchestrator';

interface FileUploadWithSaveProps {
  onFileSelect: (file: File, extractedText: string, shouldSave: boolean) => void;
  uploading: boolean;
  accept: string;
  maxSize: string;
  label: string;
  currentCVCount: number;
  maxCVCount: number;
  selectedCVId?: string | null;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

const FileUploadWithSave: React.FC<FileUploadWithSaveProps> = ({ 
  onFileSelect, 
  uploading, 
  accept, 
  maxSize, 
  label,
  currentCVCount,
  maxCVCount,
  selectedCVId,
  fileInputRef
}) => {
  const [shouldSave, setShouldSave] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const { user } = useAuth();
  const orchestrator = useUploadOrchestrator();

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    if (file) {
      await attemptFileProcessing(file, 0);
    }
  };

  const attemptFileProcessing = async (file: File, currentRetry: number) => {
    try {
      const result = await orchestrator.processFile(file, { 
        fileType: 'cv',
        shouldStore: true // Always store JSON to database for editor functionality
      });
      
      if (result.success && result.file && result.extractedText) {
        onFileSelect(result.file, result.extractedText, shouldSave);
        if (shouldSave) {
          setHasBeenSaved(true);
        }
        setRetryCount(0);
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('File processing error:', error);
      
      if (currentRetry < 2) {
        const nextRetry = currentRetry + 1;
        setRetryCount(nextRetry);
        
        // Retry after a brief delay
        setTimeout(() => {
          attemptFileProcessing(file, nextRetry);
        }, 1000);
      } else {
        // Max retries reached
        setRetryCount(0);
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
        disabled={uploading || orchestrator.isProcessing}
        placeholder={orchestrator.isProcessing ? orchestrator.progress : (uploading ? "Uploading..." : label)}
        description={`${accept} • Max ${maxSize}`}
        className="border-apple-core/30 dark:border-citrus/30"
        fileInputRef={fileInputRef}
      />
      
      <ProcessingModal
        isOpen={orchestrator.isProcessing}
        title="Processing CV"
        message={orchestrator.progress}
        onCancel={orchestrator.cancel}
      />

      {user && !selectedCVId && !hasBeenSaved && (
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
