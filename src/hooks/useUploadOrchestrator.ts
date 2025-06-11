import { useState } from 'react';
import { useFileValidation } from './useFileValidation';
import { useFileStorage } from './useFileStorage';
import { useDocumentExtraction } from './useDocumentExtraction';
import { DocumentTypeDetection } from '@/utils/documentValidation';
import { QualityAssessment } from '@/utils/documentQuality';
import { DocumentJson, prettifyDocumentJson } from '@/utils/documentJsonUtils';

interface UploadResult {
  success: boolean;
  file?: File;
  extractedText?: string;
  documentJson?: DocumentJson;
  prettyJsonString?: string;
  typeDetection?: DocumentTypeDetection;
  qualityAssessment?: QualityAssessment;
  error?: string;
}

interface UploadOptions {
  fileType: 'cv' | 'job_description';
  shouldStore?: boolean;
  preserveOriginalFormat?: boolean;
}

export const useUploadOrchestrator = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('Ready');
  
  const validation = useFileValidation();
  const storage = useFileStorage();
  const extraction = useDocumentExtraction();

  const processFile = async (file: File, options: UploadOptions): Promise<UploadResult> => {
    setIsProcessing(true);
    setProgress('Starting upload process...');

    try {
      // Step 1: Validate file
      setProgress('Validating file...');
      const validationResult = await validation.validateFile(file, options.fileType);
      
      if (!validationResult.isValid || !validationResult.secureFile) {
        return {
          success: false,
          error: validationResult.errors[0] || 'File validation failed'
        };
      }

      // Step 2: Extract text and analyze document FIRST
      setProgress('Processing document...');
      const extractionResult = await extraction.extractText(validationResult.secureFile, options.fileType);
      
      if (!extractionResult) {
        return {
          success: false,
          error: extraction.error || 'Document processing failed'
        };
      }

      // Step 3: Generate pretty JSON string for storage
      setProgress('Formatting for storage...');
      const prettyJsonString = prettifyDocumentJson(extractionResult.documentJson);

      // Step 4: Store processed file with both JSON and text (ONLY if explicitly requested)
      if (options.shouldStore === true) {
        setProgress('Storing processed file...');
        await storage.storeFile(validationResult.secureFile, { 
          uploadType: options.fileType,
          extractedText: extractionResult.extractedText,
          prettyJsonString
        });
        // Continue even if storage fails - it's for debugging only
      }

      setProgress('Complete');
      return {
        success: true,
        file: validationResult.secureFile,
        extractedText: extractionResult.extractedText,
        documentJson: extractionResult.documentJson,
        prettyJsonString,
        typeDetection: extractionResult.typeDetection,
        qualityAssessment: extractionResult.qualityAssessment
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setProgress('Failed');
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const cancel = () => {
    extraction.cancel();
    setIsProcessing(false);
    setProgress('Cancelled');
  };

  const reset = () => {
    extraction.reset();
    setIsProcessing(false);
    setProgress('Ready');
  };

  return {
    isProcessing: isProcessing || validation.isValidating || storage.isStoring || extraction.isExtracting,
    progress: isProcessing ? progress : extraction.progress,
    processFile,
    cancel,
    reset
  };
};