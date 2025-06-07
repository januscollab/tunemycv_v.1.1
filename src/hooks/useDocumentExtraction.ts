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

    try {
      // Update progress based on file type
      const fileType = file.type;
      if (fileType === 'application/pdf') {
        setState(prev => ({ ...prev, progress: 'Processing PDF document...' }));
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setState(prev => ({ ...prev, progress: 'Processing Word document...' }));
      } else if (fileType === 'text/plain') {
        setState(prev => ({ ...prev, progress: 'Reading text file...' }));
      }

      const extractedText = await extractTextFromFile(file);
      
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

      toast({
        title: "Document processed successfully",
        description: `Extracted ${extractedText.split(/\s+/).length} words with ${qualityAssessment.score}% quality score`,
      });

      return { extractedText, typeDetection, qualityAssessment };

    } catch (error) {
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

  const reset = () => {
    setState({
      isExtracting: false,
      extractedText: null,
      typeDetection: null,
      qualityAssessment: null,
      error: null,
      progress: 'Ready'
    });
  };

  return {
    ...state,
    extractText,
    reset
  };
};