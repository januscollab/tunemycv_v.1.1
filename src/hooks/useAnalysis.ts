
import { useToast } from '@/hooks/use-toast';
import { useAnalysisState } from './useAnalysisState';
import { useAnalysisExecution } from './analysis/useAnalysisExecution';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

interface AnalysisOptions {
  saveCV: boolean;
  saveJobDescription: boolean;
  cvSource: 'new' | 'saved';
  existingCVId?: string;
}

export const useAnalysis = () => {
  const { toast } = useToast();
  const { analyzing, setAnalyzing, analysisResult, setAnalysisResult } = useAnalysisState();
  const { executeAnalysis } = useAnalysisExecution();

  const performAnalysis = async (
    uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
    jobTitle: string,
    useComprehensive: boolean,
    userCredits: any,
    options: AnalysisOptions
  ) => {
    try {
      setAnalyzing(true);
      const result = await executeAnalysis(uploadedFiles, jobTitle, useComprehensive, userCredits, options);
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
