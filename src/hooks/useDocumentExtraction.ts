import { useState } from 'react';
import { extractTextFromFile } from '@/utils/fileUtils';
import { detectDocumentType, DocumentTypeDetection } from '@/utils/documentValidation';
import { assessDocumentQuality, QualityAssessment } from '@/utils/documentQuality';
import { 
  textToJson, 
  DocumentJson, 
  enforceFormattingRules, 
  syncJsonAndText,
  isWellStructuredDocument 
} from '@/utils/documentJsonUtils';
import { useToast } from '@/hooks/use-toast';

interface ExtractionState {
  isExtracting: boolean;
  extractedText: string | null;
  documentJson: DocumentJson | null;
  typeDetection: DocumentTypeDetection | null;
  qualityAssessment: QualityAssessment | null;
  error: string | null;
  progress: string;
}

export const useDocumentExtraction = () => {
  const [state, setState] = useState<ExtractionState>({
    isExtracting: false,
    extractedText: null,
    documentJson: null,
    typeDetection: null,
    qualityAssessment: null,
    error: null,
    progress: 'Ready'
  });
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { toast } = useToast();

  const extractText = async (file: File, expectedDocumentType?: 'cv' | 'job_description'): Promise<{
    extractedText: string;
    documentJson: DocumentJson;
    typeDetection: DocumentTypeDetection;
    qualityAssessment: QualityAssessment;
  } | null> => {
    // Create new abort controller for this extraction
    const controller = new AbortController();
    setAbortController(controller);

    setState({
      isExtracting: true,
      extractedText: null,
      documentJson: null,
      typeDetection: null,
      qualityAssessment: null,
      error: null,
      progress: `Extracting text from ${file.type.includes('pdf') ? 'PDF' : 'DOCX'}...`
    });

    const extractionStartTime = Date.now();
    let timeoutId: NodeJS.Timeout;

    try {
      // Create timeout promise that rejects after 15 seconds for faster fallback
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Client-side processing timed out. Trying server-side fallback...'));
        }, 15000);
      });

      // Create cancellation promise
      const cancellationPromise = new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Processing cancelled by user'));
        });
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

      // Race between extraction, timeout, and cancellation
      const extractedText = await Promise.race([
        extractTextFromFile(file, controller.signal),
        timeoutPromise,
        cancellationPromise
      ]);
      
      clearTimeout(timeoutId);
      setState(prev => ({ ...prev, progress: 'Applying formatting rules and creating structured document...' }));
      
      // Generate structured JSON from text with formatting rules applied
      const rawDocumentJson = textToJson(extractedText);
      
      // Enforce JSON formatting rules (bold only, H1-H3, single font, "-" bullets)
      const enforcedDocumentJson = enforceFormattingRules(rawDocumentJson);
      
      // Ensure bidirectional sync and consistency
      const { json: documentJson, text: consistentText } = syncJsonAndText(enforcedDocumentJson, extractedText);
      
      // Validate document structure (not a text blob)
      const isWellStructured = isWellStructuredDocument(documentJson);
      
      setState(prev => ({ ...prev, progress: 'Analyzing document type and quality...' }));
      
      // Detect document type using the consistent text
      const typeDetection = detectDocumentType(consistentText, file.name);
      
      // Assess document quality using the consistent text
      const qualityAssessment = assessDocumentQuality(consistentText, file.name, expectedDocumentType);
      
      // Add structure warning if document is poorly structured
      if (!isWellStructured) {
        qualityAssessment.issues.push({
          type: 'warning',
          title: 'Document Structure',
          description: 'Document appears to be a large text block. Consider adding headings and sections for better organization.',
          suggestion: 'Add section headings using # for main sections and ## for subsections to improve document structure.'
        });
      }
      
      // Small delay to show analysis step
      await new Promise(resolve => setTimeout(resolve, 500));

      setState({
        isExtracting: false,
        extractedText,
        documentJson,
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

      return { extractedText, documentJson, typeDetection, qualityAssessment };

    } catch (error) {
      clearTimeout(timeoutId!);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState({
        isExtracting: false,
        extractedText: null,
        documentJson: null,
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
      documentJson: null,
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
      documentJson: null,
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