
import React, { useState } from 'react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
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
  const [retryCount, setRetryCount] = useState(0);
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
        shouldStore: false // NEVER auto-save, only save when explicitly requested
      });
      
      if (result.success && result.file && result.extractedText) {
        // Pass false for shouldSave - no automatic saving
        onFileSelect(result.file, result.extractedText, false);
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

  const isAtLimit = currentCVCount >= maxCVCount;

  return (
    <div>
      <div className="relative">
        <DragDropZone
          onDrop={handleDrop}
          accept={accept}
          maxSize={parseFloat(maxSize) * 1024 * 1024}
          disabled={uploading || orchestrator.isProcessing}
          placeholder={orchestrator.isProcessing ? orchestrator.progress : (uploading ? "Uploading..." : label)}
          description={`${accept} • Max ${maxSize}`}
          className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors duration-200 rounded-xl bg-gradient-to-br from-background via-muted/10 to-background shadow-sm hover:shadow-md"
          fileInputRef={fileInputRef}
        />
      </div>
      
      {orchestrator.isProcessing && (
        <div className="flex items-center justify-center p-4">
          <ProgressIndicator 
            value={50}
            variant="default"
            size="md"
            label="Processing CV"
          />
        </div>
      )}
    </div>
  );
};

export default FileUploadWithSave;
