
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      // Create JSON files as Blob objects
      const cvBlob = new Blob([JSON.stringify(cvJson, null, 2)], { 
        type: 'application/json' 
      });
      const jdBlob = new Blob([JSON.stringify(jobDescriptionJson, null, 2)], { 
        type: 'application/json' 
      });

      // Create form data with correct field names
      const formData = new FormData();
      formData.append('cv', cvBlob, 'cv.json');
      formData.append('jd', jdBlob, 'job_description.json');
      
      let webhookResponse = null;
      let webhookError = null;
      
      try {
        const response = await fetch('https://januscollab.app.n8n.cloud/webhook/cv-analysis', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          let responseText = '';
          try {
            responseText = await response.text();
          } catch (textError) {
            // Silent fail
          }
          webhookError = `HTTP ${response.status}: ${responseText}`;
        } else {
          webhookResponse = await response.json();
        }
      } catch (error) {
        webhookError = error instanceof Error ? error.message : 'Unknown webhook error';
      }

      // Fetch test files from public bucket
      let pdfData: string | null = null;
      let htmlData: string | null = null;

      // Helper function for retrying file downloads
      const downloadWithRetry = async (url: string, maxRetries = 3): Promise<Response | null> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await fetch(url);
            
            if (response.ok) {
              return response;
            }
          } catch (error) {
            // Silent fail on errors
          }
          
          // Wait 1 second before retry (except on last attempt)
          if (attempt < maxRetries) {
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
        }
      } catch (error) {
        // Silent fail
      }

      // Wait 1 second before downloading PDF
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Download PDF file
      try {
        const pdfResponse = await downloadWithRetry('https://aohrfehhyjdebaatzqdl.supabase.co/storage/v1/object/public/n8n-bucket/response/test-output.pdf');
        if (pdfResponse) {
          // Get the response as ArrayBuffer
          const pdfArrayBuffer = await pdfResponse.arrayBuffer();
          
          // Convert ArrayBuffer to base64
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
        }
      } catch (error) {
        // Silent fail
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

          if (!dbError && analysisResult) {
            analysisResultId = analysisResult.id;
          }
        }
      } catch (dbError) {
        // Silent fail
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
        analysisResultId
      };

    } catch (error) {
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
