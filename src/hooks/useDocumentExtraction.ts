import { useState } from 'react';
import { extractTextFromFile } from '@/utils/fileUtils';
import { detectDocumentType, DocumentTypeDetection } from '@/utils/documentValidation';
import { assessDocumentQuality, QualityAssessment } from '@/utils/documentQuality';
import { useToast } from '@/hooks/use-toast';

interface ExtractionState {
  isExtracting: boolean;
  extractedText: string | null;
  typeDetection: DocumentTypeDetection | null;
  qualityAssessment: QualityAssessment | null;
  error: string | null;
  progress: string;
}

export const useDocumentExtraction = () => {
  const [state, setState] = useState<ExtractionState>({
    isExtracting: false,
    extractedText: null,
    typeDetection: null,
    qualityAssessment: null,
    error: null,
    progress: 'Ready'
  });
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { toast } = useToast();

  const extractText = async (file: File, expectedDocumentType?: 'cv' | 'job_description'): Promise<{
    extractedText: string;
    typeDetection: DocumentTypeDetection;
    qualityAssessment: QualityAssessment;
  } | null> => {
    setState({
      isExtracting: true,
      extractedText: null,
      typeDetection: null,
      qualityAssessment: null,
      error: null,
      progress: `Extracting text from ${file.type.includes('pdf') ? 'PDF' : 'DOCX'}...`
    });

    const extractionStartTime = Date.now();
    let timeoutId: NodeJS.Timeout;

    try {
      // Create timeout promise that rejects after 60 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Document processing timed out. The file may be too large or complex.'));
        }, 60000);
      });

      // Update progress based on file type
      const fileType = file.type;
      if (fileType === 'application/pdf') {
        setState(prev => ({ ...prev, progress: 'Processing PDF document...' }));
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setState(prev => ({ ...prev, progress: 'Processing Word document...' }));
      } else if (fileType === 'text/plain') {
        setState(prev => ({ ...prev, progress: 'Reading text file...' }));
      }

      // Race between extraction and timeout
      const extractedText = await Promise.race([
        extractTextFromFile(file),
        timeoutPromise
      ]);
      
      clearTimeout(timeoutId);
      setState(prev => ({ ...prev, progress: 'Analyzing document type and quality...' }));
      
      // Detect document type
      const typeDetection = detectDocumentType(extractedText, file.name);
      
      // Assess document quality
      const qualityAssessment = assessDocumentQuality(extractedText, file.name, expectedDocumentType);
      
      // Small delay to show analysis step
      await new Promise(resolve => setTimeout(resolve, 500));

      setState({
        isExtracting: false,
        extractedText,
        typeDetection,
        qualityAssessment,
        error: null,
        progress: 'Complete'
      });

      const processingTime = Date.now() - extractionStartTime;
      toast({
        title: "Document processed successfully",
        description: `Extracted ${extractedText.split(/\s+/).length} words with ${qualityAssessment.score}% quality score in ${(processingTime / 1000).toFixed(1)}s`,
      });

      return { extractedText, typeDetection, qualityAssessment };

    } catch (error) {
      clearTimeout(timeoutId!);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState({
        isExtracting: false,
        extractedText: null,
        typeDetection: null,
        qualityAssessment: null,
        error: errorMessage,
        progress: 'Failed'
      });

      toast({
        title: "Document extraction failed",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  };

  const cancel = () => {
    if (abortController) {
      abortController.abort();
    }
    setState({
      isExtracting: false,
      extractedText: null,
      typeDetection: null,
      qualityAssessment: null,
      error: 'Upload cancelled by user',
      progress: 'Cancelled'
    });
    setAbortController(null);
    toast({
      title: "Upload cancelled",
      description: "Document processing was cancelled.",
      variant: "destructive"
    });
  };

  const reset = () => {
    if (abortController) {
      abortController.abort();
    }
    setState({
      isExtracting: false,
      extractedText: null,
      typeDetection: null,
      qualityAssessment: null,
      error: null,
      progress: 'Ready'
    });
    setAbortController(null);
  };

  return {
    ...state,
    extractText,
    cancel,
    reset
  };
};