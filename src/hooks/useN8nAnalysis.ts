import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface N8nAnalysisResponse {
  success: boolean;
  message: string;
  test_files?: {
    html: string;
    pdf: string;
  };
  error?: string;
}

export const useN8nAnalysis = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const submitForAnalysis = async (
    cvJson: any,
    jobDescriptionJson: any
  ): Promise<N8nAnalysisResponse> => {
    setIsProcessing(true);
    
    try {
      console.log('Submitting CV and JD JSON to n8n webhook...');
      
      // Create JSON files as Blob objects
      const cvBlob = new Blob([JSON.stringify(cvJson, null, 2)], { 
        type: 'application/json' 
      });
      const jdBlob = new Blob([JSON.stringify(jobDescriptionJson, null, 2)], { 
        type: 'application/json' 
      });

      // Create form data
      const formData = new FormData();
      formData.append('file1', cvBlob, 'cv.json');
      formData.append('file2', jdBlob, 'job_description.json');
      formData.append('file_type_map', JSON.stringify({
        file1: 'cv',
        file2: 'jd'
      }));

      console.log('Sending request to n8n webhook...');
      
      const response = await fetch('https://januscollab.app.n8n.cloud/webhook/document-intake', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('n8n response received:', result);

      if (result.test_files?.html && result.test_files?.pdf) {
        toast({
          title: "Analysis Complete",
          description: "Your documents have been successfully processed by n8n.",
        });

        return {
          success: true,
          message: result.message,
          test_files: result.test_files
        };
      } else {
        throw new Error('Invalid response format from n8n');
      }

    } catch (error) {
      console.error('n8n analysis error:', error);
      
      toast({
        title: "Processing Failed",
        description: "Sorry — something went wrong while processing your documents. Please try again, or contact support if the issue continues.",
        variant: "destructive"
      });

      return {
        success: false,
        message: 'Processing failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    submitForAnalysis,
    isProcessing
  };
};