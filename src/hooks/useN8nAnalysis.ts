import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface N8nAnalysisResult {
  message: string;
  test_files: {
    html: string;
    pdf: string;
  };
}

interface N8nAnalysisError {
  success: false;
  error: string;
}

interface N8nAnalysisSuccess {
  success: true;
  data: N8nAnalysisResult;
  htmlUrl: string;
  pdfUrl: string;
}

type N8nAnalysisResponse = N8nAnalysisError | N8nAnalysisSuccess;

export const useN8nAnalysis = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('Ready');
  const { toast } = useToast();

  const submitForAnalysis = async (
    cvFile: File,
    jobDescriptionFile: File
  ): Promise<N8nAnalysisResponse> => {
    setIsProcessing(true);
    setProgress('Preparing documents for analysis...');

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('file1', cvFile);
      formData.append('file2', jobDescriptionFile);
      formData.append('file_type_map', JSON.stringify({
        file1: 'cv',
        file2: 'jd'
      }));

      setProgress('Submitting documents to n8n workflow...');

      const response = await fetch('https://januscollab.app.n8n.cloud/webhook/document-intake', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: N8nAnalysisResult = await response.json();

      setProgress('Analysis complete!');
      
      toast({
        title: 'Analysis Complete!',
        description: 'Your CV and job description have been successfully analyzed.',
      });

      return {
        success: true,
        data,
        htmlUrl: data.test_files.html,
        pdfUrl: data.test_files.pdf
      };

    } catch (error) {
      console.error('N8n analysis failed:', error);
      
      const errorMessage = 'Sorry — the document processing workflow failed. Please try again shortly or contact support if the issue persists.';
      
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      setProgress('Failed');
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setIsProcessing(false);
    setProgress('Ready');
  };

  return {
    isProcessing,
    progress,
    submitForAnalysis,
    reset
  };
};