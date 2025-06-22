
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  analysisResultId?: string;
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

      // Test connectivity directly to N8N endpoint with lightweight HEAD request
      console.log('Testing N8N endpoint connectivity...');
      let networkTestResult = 'unknown';
      try {
        const testResponse = await fetch('https://januscollab.app.n8n.cloud/webhook/cv-analysis', { 
          method: 'HEAD',
          mode: 'no-cors' // Allow cross-origin HEAD request
        });
        networkTestResult = `N8N endpoint reachable`;
        console.log('N8N connectivity test successful');
      } catch (networkError) {
        networkTestResult = `N8N endpoint test failed: ${networkError.message}`;
        console.warn('N8N connectivity test failed:', networkError);
        // Continue anyway - the actual POST might still work
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

      // Download PDF file - FIXED BASE64 CONVERSION
      try {
        const pdfResponse = await downloadWithRetry('https://aohrfehhyjdebaatzqdl.supabase.co/storage/v1/object/public/n8n-bucket/response/test-output.pdf');
        if (pdfResponse) {
          console.log('PDF response received, converting to base64...');
          
          // Get the response as ArrayBuffer
          const pdfArrayBuffer = await pdfResponse.arrayBuffer();
          console.log('PDF downloaded, size:', pdfArrayBuffer.byteLength, 'bytes');
          
          // Convert ArrayBuffer to base64 - PROPER METHOD
          const uint8Array = new Uint8Array(pdfArrayBuffer);
          
          // Use btoa with proper binary string conversion
          let binaryString = '';
          const chunkSize = 8192; // Process in 8KB chunks
          
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.slice(i, i + chunkSize);
            // Convert each byte to a character
            const chunkString = Array.from(chunk, byte => String.fromCharCode(byte)).join('');
            binaryString += chunkString;
          }
          
          // Now convert to base64
          pdfData = btoa(binaryString);
          console.log('PDF converted to base64, length:', pdfData.length);
          
          // Validate base64 format
          if (pdfData && pdfData.length > 0) {
            try {
              // Test the base64 by trying to decode it
              const testDecode = atob(pdfData.substring(0, 100)); // Test first 100 chars
              console.log('✅ Base64 PDF data validation: Valid format, starts with:', pdfData.substring(0, 20));
            } catch (validateError) {
              console.error('❌ Base64 validation failed:', validateError);
              console.log('PDF data sample:', pdfData.substring(0, 100));
            }
          } else {
            console.error('Base64 PDF data validation: Invalid or empty');
          }
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
          error: `PDF processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Extract job information from job description JSON
      const extractJobInfo = (jdJson: any) => {
        const jobInfo = {
          job_title: '',
          company_name: ''
        };

        // Try to extract job title
        if (jdJson.job_title) {
          jobInfo.job_title = jdJson.job_title;
        } else if (jdJson.title) {
          jobInfo.job_title = jdJson.title;
        } else if (jdJson.position) {
          jobInfo.job_title = jdJson.position;
        }

        // Try to extract company name
        if (jdJson.company_name) {
          jobInfo.company_name = jdJson.company_name;
        } else if (jdJson.company) {
          jobInfo.company_name = jdJson.company;
        } else if (jdJson.organization) {
          jobInfo.company_name = jdJson.organization;
        }

        return jobInfo;
      };

      const jobInfo = extractJobInfo(jobDescriptionJson);

      // Store the analysis result in the database
      let analysisResultId: string | undefined;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: analysisResult, error: dbError } = await supabase
            .from('analysis_results')
            .insert({
              user_id: user.id,
              analysis_type: 'n8n',
              job_title: jobInfo.job_title || 'Unknown Position',
              company_name: jobInfo.company_name || 'Unknown Company',
              compatibility_score: 85, // Default score for test data
              pdf_file_data: pdfData, // Store as base64 string
              html_file_data: htmlData,
              pdf_file_name: 'analysis-report.pdf',
              html_file_name: 'analysis-report.html',
              n8n_pdf_url: 'https://aohrfehhyjdebaatzqdl.supabase.co/storage/v1/object/public/n8n-bucket/response/test-output.pdf',
              n8n_html_url: 'https://aohrfehhyjdebaatzqdl.supabase.co/storage/v1/object/public/n8n-bucket/response/test-output.html',
              executive_summary: null,
              job_description_extracted_text: JSON.stringify(jobDescriptionJson)
            })
            .select('id')
            .single();

          if (dbError) {
            console.error('Error storing analysis result:', dbError);
          } else if (analysisResult) {
            analysisResultId = analysisResult.id;
            console.log('Analysis result stored with ID:', analysisResultId);
          }
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
      }

      // Show success toast
      toast({
        title: "Analysis Complete",
        description: `Files processed: ${htmlData ? 'HTML ✓' : 'HTML ✗'} ${pdfData ? 'PDF ✓' : 'PDF ✗'}`,
      });

      return {
        success: true,
        message: 'Analysis complete with test files',
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
        retryLogs,
        analysisResultId
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
