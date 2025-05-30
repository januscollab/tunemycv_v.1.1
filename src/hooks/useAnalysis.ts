
import { useAnalysisState } from './useAnalysisState';
import { useAnalysisExecution } from './analysis/useAnalysisExecution';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

export const useAnalysis = () => {
  const { analysisResult, setAnalysisResult } = useAnalysisState();
  const { analyzing, executeAnalysis } = useAnalysisExecution();

  const performAnalysis = async (
    uploadedFiles: { cv?: UploadedFile; jobDescription?: UploadedFile },
    jobTitle: string,
    useAI: boolean,
    userCredits: any
  ) => {
    const result = await executeAnalysis(uploadedFiles, jobTitle, userCredits);
    if (result) {
      setAnalysisResult(result);
    }
  };

  return {
    analyzing,
    analysisResult,
    setAnalysisResult,
    performAnalysis
  };
};
