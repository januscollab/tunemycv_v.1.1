import { useState } from 'react';
import { extractTextFromFile } from '@/utils/fileUtils';
import { useToast } from '@/hooks/use-toast';

interface ExtractionState {
  isExtracting: boolean;
  extractedText: string | null;
  error: string | null;
  progress: string;
}

export const useDocumentExtraction = () => {
  const [state, setState] = useState<ExtractionState>({
    isExtracting: false,
    extractedText: null,
    error: null,
    progress: 'Ready'
  });
  const { toast } = useToast();

  const extractText = async (file: File): Promise<string | null> => {
    setState({
      isExtracting: true,
      extractedText: null,
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
      
      setState(prev => ({ ...prev, progress: 'Analyzing document quality...' }));
      
      // Small delay to show quality analysis step
      await new Promise(resolve => setTimeout(resolve, 500));

      setState({
        isExtracting: false,
        extractedText,
        error: null,
        progress: 'Complete'
      });

      toast({
        title: "Document processed successfully",
        description: `Extracted ${extractedText.split(/\s+/).length} words from ${file.name}`,
      });

      return extractedText;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState({
        isExtracting: false,
        extractedText: null,
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