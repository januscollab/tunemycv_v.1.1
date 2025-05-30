
import { useState } from 'react';

export const useAnalysisState = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  return {
    analyzing,
    setAnalyzing,
    analysisResult,
    setAnalysisResult
  };
};
