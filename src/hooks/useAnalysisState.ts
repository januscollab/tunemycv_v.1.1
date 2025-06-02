
import { useState } from 'react';

export const useAnalysisState = () => {
  const [selectedCVId, setSelectedCVId] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  return {
    selectedCVId,
    setSelectedCVId,
    jobDescription,
    setJobDescription,
    selectedFile,
    setSelectedFile,
    jobDescriptionFile,
    setJobDescriptionFile,
    jobDescriptionText,
    setJobDescriptionText,
    inputMethod,
    setInputMethod,
    analysisResult,
    setAnalysisResult
  };
};
