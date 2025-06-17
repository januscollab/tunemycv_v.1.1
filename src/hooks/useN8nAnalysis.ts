import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RetryLog {
  url: string;
  attempt: number;
  timestamp: number;
  status: 'success' | 'failed' | 'error';
  statusCode?: number;
  error?: string;
  delay?: number;
}

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
  debugInfo?: {
    networkTest: string;
    webhookStatus: string;
    webhookResponse: any;
    webhookError: string | null;
  };
  retryLogs?: RetryLog[];
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

      // Create form data with correct field names
      const formData = new FormData();
      formData.append('cv', cvBlob, 'cv.json');
      formData.append('jd', jdBlob, 'job_description.json');

      console.log('FormData created with cv and jd fields');

      // Test network connectivity first
      console.log('Testing network connectivity...');
      let networkTestResult = 'unknown';
      try {
        const testResponse = await fetch('https://httpbin.org/get', { method: 'GET' });
        networkTestResult = `success: ${testResponse.status}`;
        console.log('Network test successful:', testResponse.status);
      } catch (networkError) {
        networkTestResult = `failed: ${networkError.message}`;
        console.error('Network connectivity test failed:', networkError);
      }
      
      console.log('Sending request to n8n webhook: https://januscollab.app.n8n.cloud/webhook/cv-analysis');
      console.log('Request method: POST');
      console.log('Request headers: FormData (auto-generated)');
      
      let webhookResponse = null;
      let webhookError = null;
      let webhookStatus = 'unknown';
      
      try {
        const response = await fetch('https://januscollab.app.n8n.cloud/webhook/cv-analysis', {
          method: 'POST',
          body: formData,
        });

        webhookStatus = `${response.status} ${response.statusText}`;
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
          webhookError = `HTTP ${response.status}: ${responseText}`;
          console.error(`n8n HTTP error! Status: ${response.status} ${response.statusText}. Response: ${responseText}`);
        } else {
          webhookResponse = await response.json();
          console.log('n8n response received:', webhookResponse);
        }
      } catch (error) {
        webhookError = error instanceof Error ? error.message : 'Unknown webhook error';
        console.error('Webhook call failed:', error);
      }

      // Always fetch test files regardless of webhook success/failure
      console.log('Fetching test files from public bucket...');
      let pdfData: string | null = null;
      let htmlData: string | null = null;
      const retryLogs: RetryLog[] = [];

      // Helper function for retrying file downloads with detailed logging
      const downloadWithRetry = async (url: string, maxRetries = 3): Promise<Response | null> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          const startTime = Date.now();
          
          try {
            console.log(`Attempting to fetch ${url} (attempt ${attempt}/${maxRetries})`);
            const response = await fetch(url);
            
            if (response.ok) {
              console.log(`Successfully fetched ${url} on attempt ${attempt}`);
              retryLogs.push({
                url,
                attempt,
                timestamp: startTime,
                status: 'success',
                statusCode: response.status
              });
              return response;
            } else {
              console.warn(`Failed to fetch ${url} on attempt ${attempt}: ${response.status}`);
              retryLogs.push({
                url,
                attempt,
                timestamp: startTime,
                status: 'failed',
                statusCode: response.status,
                error: `HTTP ${response.status}: ${response.statusText}`
              });
            }
          } catch (error) {
            console.warn(`Error fetching ${url} on attempt ${attempt}:`, error);
            retryLogs.push({
              url,
              attempt,
              timestamp: startTime,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
          
          // Wait 1 second before retry (except on last attempt)
          if (attempt < maxRetries) {
            console.log('Waiting 1 second before retry...');
            retryLogs.push({
              url,
              attempt,
              timestamp: Date.now(),
              status: 'failed',
              delay: 1000,
              error: 'Waiting 1 second before retry'
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        return null;
      };

      // Download HTML file first
      try {
        const htmlResponse = await downloadWithRetry('https://aohrfehhyjdebaatzqdl.supabase.co/storage/v1/object/public/n8n-bucket/response/test-output.html');
        if (htmlResponse) {
          htmlData = await htmlResponse.text();
          console.log('Test HTML file downloaded successfully');
        } else {
          console.error('Failed to fetch test HTML after all retries');
        }
      } catch (error) {
        console.error('Error fetching test HTML:', error);
        retryLogs.push({
          url: 'test-output.html',
          attempt: 0,
          timestamp: Date.now(),
          status: 'error',
          error: `Outer catch: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Wait 1 second before downloading PDF
      console.log('Waiting 1 second before downloading PDF...');
      retryLogs.push({
        url: 'inter-file-delay',
        attempt: 0,
        timestamp: Date.now(),
        status: 'success',
        delay: 1000,
        error: 'Waiting 1 second between file downloads'
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Download PDF file second
      try {
        const pdfResponse = await downloadWithRetry('https://aohrfehhyjdebaatzqdl.supabase.co/storage/v1/object/public/n8n-bucket/response/test-output.pdf');
        if (pdfResponse) {
          const pdfBlob = await pdfResponse.blob();
          const pdfArrayBuffer = await pdfBlob.arrayBuffer();
          pdfData = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));
          console.log('Test PDF file downloaded and converted to base64');
        } else {
          console.error('Failed to fetch test PDF after all retries');
        }
      } catch (error) {
        console.error('Error fetching test PDF:', error);
        retryLogs.push({
          url: 'test-output.pdf',
          attempt: 0,
          timestamp: Date.now(),
          status: 'error',
          error: `Outer catch: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Show debug info
      toast({
        title: "Debug Information",
        description: `Network: ${networkTestResult}, Webhook: ${webhookStatus}, Files: ${htmlData ? 'HTML ✓' : 'HTML ✗'} ${pdfData ? 'PDF ✓' : 'PDF ✗'}`,
      });

      return {
        success: true,
        message: 'Debug analysis complete with test files',
        test_files: {
          html: 'https://aohrfehhyjdebaatzqdl.supabase.co/storage/v1/object/public/n8n-bucket/response/test-output.html',
          pdf: 'https://aohrfehhyjdebaatzqdl.supabase.co/storage/v1/object/public/n8n-bucket/response/test-output.pdf'
        },
        pdfData,
        htmlData,
        debugInfo: {
          networkTest: networkTestResult,
          webhookStatus,
          webhookResponse,
          webhookError
        },
        retryLogs
      };

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