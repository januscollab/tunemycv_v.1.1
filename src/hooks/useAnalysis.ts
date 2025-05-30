
import { useToast } from '@/hooks/use-toast';
import { useAnalysisState } from './useAnalysisState';
import { useAnalysisExecution } from './analysis/useAnalysisExecution';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

export const useAnalysis = () => {
  const { toast } = useToast();
  const { analyzing, setAnalyzing, analysisResult, setAnalysisResult } = useAnalysisState();
  const { executeAnalysis } = useAnalysisExecution();

  const performAnalysis = async (
    uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
    jobTitle: string,
    useAI: boolean,
    userCredits: any
  ) => {
    try {
      setAnalyzing(true);
      const result = await executeAnalysis(uploadedFiles, jobTitle, useAI, userCredits);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze CV. Please try again.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    analysisResult,
    setAnalysisResult,
    performAnalysis
  };
};
