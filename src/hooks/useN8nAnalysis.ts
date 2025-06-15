import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface N8nAnalysisResponse {
  success: boolean;
  message: string;
  test_files?: {
    html: string;
    pdf: string;
  };
  pdfData?: string | null;
  htmlData?: string | null;
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
      console.log('=== N8N ANALYSIS DEBUG START ===');
      console.log('Submitting CV and JD JSON to n8n webhook...');
      console.log('CV JSON length:', JSON.stringify(cvJson).length);
      console.log('JD JSON length:', JSON.stringify(jobDescriptionJson).length);
      
      // Create JSON files as Blob objects
      const cvBlob = new Blob([JSON.stringify(cvJson, null, 2)], { 
        type: 'application/json' 
      });
      const jdBlob = new Blob([JSON.stringify(jobDescriptionJson, null, 2)], { 
        type: 'application/json' 
      });

      console.log('Created blobs - CV:', cvBlob.size, 'bytes, JD:', jdBlob.size, 'bytes');

      // Create form data
      const formData = new FormData();
      formData.append('file1', cvBlob, 'cv.json');
      formData.append('file2', jdBlob, 'job_description.json');
      formData.append('file_type_map', JSON.stringify({
        file1: 'cv',
        file2: 'jd'
      }));

      console.log('FormData created successfully');
      console.log('FormData contents:', {
        file1: cvBlob.size + ' bytes (CV)',
        file2: jdBlob.size + ' bytes (JD)',
        file_type_map: JSON.stringify({
          file1: 'cv',
          file2: 'jd'
        })
      });

      // Test network connectivity first
      console.log('Testing network connectivity...');
      try {
        const testResponse = await fetch('https://httpbin.org/get', { method: 'GET' });
        console.log('Network test successful:', testResponse.status);
      } catch (networkError) {
        console.error('Network connectivity test failed:', networkError);
        throw new Error('Network connectivity issue detected. Please check your internet connection.');
      }
      
      console.log('Sending request to n8n webhook: https://januscollab.app.n8n.cloud/webhook/document-intake');
      console.log('Request method: POST');
      console.log('Request headers: FormData (auto-generated)');
      
      const response = await fetch('https://januscollab.app.n8n.cloud/webhook/document-intake', {
        method: 'POST',
        body: formData,
        // No manual headers for FormData - let browser handle it
      });

      console.log('n8n response received!');
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let responseText = '';
        try {
          responseText = await response.text();
          console.error('n8n error response body:', responseText);
        } catch (textError) {
          console.error('Could not read error response text:', textError);
        }
        throw new Error(`n8n HTTP error! Status: ${response.status} ${response.statusText}. Response: ${responseText}`);
      }

      const result = await response.json();
      console.log('n8n response received:', result);

      if (result.test_files?.html && result.test_files?.pdf) {
        console.log('n8n response received, downloading files...');

        // Download PDF file
        let pdfData: string | null = null;
        let htmlData: string | null = null;

        try {
          const pdfResponse = await fetch(result.test_files.pdf);
          const pdfBlob = await pdfResponse.blob();
          const pdfArrayBuffer = await pdfBlob.arrayBuffer();
          pdfData = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));
          console.log('PDF downloaded and converted to base64');
        } catch (error) {
          console.error('Failed to download PDF:', error);
        }

        // Download HTML file
        try {
          const htmlResponse = await fetch(result.test_files.html);
          htmlData = await htmlResponse.text();
          console.log('HTML downloaded');
        } catch (error) {
          console.error('Failed to download HTML:', error);
        }

        toast({
          title: "Analysis Complete",
          description: "Your documents have been successfully processed by n8n.",
        });

        return {
          success: true,
          message: result.message,
          test_files: result.test_files,
          pdfData,
          htmlData
        };
      } else {
        throw new Error('Invalid response format from n8n');
      }

    } catch (error) {
      console.error('=== N8N ANALYSIS ERROR ===');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Full error object:', error);
      
      // Provide more specific error messages based on error type
      let userFriendlyMessage = "Sorry — something went wrong while processing your documents. Please try again, or contact support if the issue continues.";
      let errorDetails = "";
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        userFriendlyMessage = "Network connection failed. This could be due to internet connectivity issues or the n8n service being temporarily unavailable.";
        errorDetails = "Network error: Failed to reach n8n webhook";
      } else if (error instanceof Error && error.message.includes('Network connectivity issue')) {
        userFriendlyMessage = "Internet connectivity issue detected. Please check your network connection and try again.";
        errorDetails = error.message;
      } else if (error instanceof Error && error.message.includes('CORS')) {
        userFriendlyMessage = "Cross-origin request blocked. The n8n service may need to allow requests from this domain.";
        errorDetails = "CORS policy error";
      } else if (error instanceof Error) {
        errorDetails = error.message;
      }
      
      console.error('User-friendly message:', userFriendlyMessage);
      console.error('Error details:', errorDetails);
      
      toast({
        title: "Processing Failed",
        description: userFriendlyMessage,
        variant: "destructive"
      });

      return {
        success: false,
        message: 'Processing failed',
        error: errorDetails || (error instanceof Error ? error.message : 'Unknown error occurred')
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