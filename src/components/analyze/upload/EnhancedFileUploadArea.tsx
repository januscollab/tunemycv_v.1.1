
import React, { useState } from 'react';
import { Upload, AlertTriangle } from 'lucide-react';
import { enhancedFileValidation } from '@/utils/enhancedFileValidation';
import { logSuspiciousUpload } from '@/utils/securityAuditLogger';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EnhancedFileUploadAreaProps {
  onFileSelect: (file: File) => void;
  uploading: boolean;
  accept: string;
  maxSize: string;
  label: string;
  type: 'cv' | 'job_description';
}

const EnhancedFileUploadArea: React.FC<EnhancedFileUploadAreaProps> = ({ 
  onFileSelect, 
  uploading, 
  accept, 
  maxSize, 
  label,
  type
}) => {
  const [validating, setValidating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelection = async (file: File) => {
    setValidating(true);
    
    try {
      // Enhanced file validation
      const validation = await enhancedFileValidation(file, type);
      
      if (!validation.isValid) {
        // Log suspicious upload attempt
        logSuspiciousUpload(
          file.name, 
          validation.errors.join(', '), 
          user?.id
        );
        
        toast({
          title: 'File Validation Failed',
          description: validation.errors[0],
          variant: 'destructive'
        });
        return;
      }

      // Show warnings if any
      if (validation.contentValidation && !validation.contentValidation.magicNumberValid) {
        toast({
          title: 'File Warning',
          description: 'File content validation detected potential issues. Please ensure your file is not corrupted.',
          variant: 'destructive'
        });
        return;
      }

      onFileSelect(file);
    } catch (error) {
      toast({
        title: 'Validation Error',
        description: 'Failed to validate file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setValidating(false);
    }
  };

  const isProcessing = uploading || validating;

  return (
    <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center">
      {isProcessing ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apricot mb-2"></div>
          <p className="text-sm text-blueberry/70 dark:text-apple-core/80">
            {validating ? 'Validating file...' : 'Uploading...'}
          </p>
        </div>
      ) : (
        <>
          <Upload className="mx-auto h-8 w-8 text-blueberry/60 dark:text-apple-core/60 mb-2" />
          <label className="cursor-pointer">
            <span className="text-apricot hover:text-apricot/80 font-medium">{label}</span>
            <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-1">{accept}, max {maxSize}</p>
            <p className="text-xs text-blueberry/50 dark:text-apple-core/60 mt-1 flex items-center justify-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Enhanced security validation enabled
            </p>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
              disabled={isProcessing}
            />
          </label>
        </>
      )}
    </div>
  );
};

export default EnhancedFileUploadArea;
