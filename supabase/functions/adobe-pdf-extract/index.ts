import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdobeCredentials {
  client_id: string;
  client_secret_encrypted: string;
  organization_id: string;
}

interface ExtractPdfRequest {
  fileData: string; // Base64 encoded file
  fileName: string;
  fileSize: number;
  userId?: string;
  debug?: boolean; // Optional debug mode
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  let userId: string | null = null;
  let extractionLogId: string | null = null;

  try {
    const requestBody: ExtractPdfRequest = await req.json();
    const { fileData, fileName, fileSize, debug = false } = requestBody;
    
    // Get user ID from JWT if available
    const authHeader = req.headers.get('authorization');
    console.log(`Authorization header present: ${!!authHeader}`);
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      console.log(`JWT token length: ${token.length}`);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError) {
        console.error('JWT authentication error:', authError);
      } else if (user) {
        console.log(`Authenticated user: ${user.id}`);
        userId = user.id;
      } else {
        console.log('No user found from JWT token');
      }
    } else {
      console.log('No authorization header provided');
    }

    const startTime = Date.now();

    // Check if Adobe API is enabled
    const { data: settings } = await supabase
      .from('site_settings')
      .select('adobe_api_enabled, monthly_adobe_limit')
      .single();

    if (!settings?.adobe_api_enabled) {
      throw new Error('Adobe PDF Services API is not enabled');
    }

    // Check usage limits
    const usageCheck = await supabase.rpc('increment_adobe_usage');
    if (!usageCheck.data) {
      throw new Error('Monthly usage limit exceeded. Please try again next month.');
    }

    // Get Adobe credentials
    const { data: credentials, error: credError } = await supabase
      .from('adobe_credentials')
      .select('client_id, client_secret_encrypted, organization_id')
      .eq('is_active', true)
      .single();

    if (credError || !credentials) {
      throw new Error('Adobe API credentials not configured');
    }

    // Create extraction log entry
    const { data: logData, error: logError } = await supabase
      .from('adobe_extraction_logs')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_size: fileSize,
        success: false
      })
      .select('id')
      .single();

    if (logError) {
      console.error('Failed to create extraction log:', logError);
    } else {
      extractionLogId = logData.id;
    }

    // Get Adobe access token
    const accessToken = await getAdobeAccessToken(credentials);

    // Extract text using Adobe PDF Services
    const extractResult = await extractTextWithAdobe(accessToken, fileData, fileName, credentials, debug);

    const processingTime = Date.now() - startTime;
    const wordCount = extractResult.extractedText.split(/\s+/).filter(word => word.length > 0).length;

    // Update extraction log with success
    if (extractionLogId) {
      await supabase
        .from('adobe_extraction_logs')
        .update({
          success: true,
          processing_time_ms: processingTime,
          cost_estimate: 0.01 // Approximate cost per extraction
        })
        .eq('id', extractionLogId);
    }

    console.log(`Successfully extracted ${wordCount} words from ${fileName} in ${processingTime}ms`);

    const response: any = {
      success: true,
      extractedText: extractResult.extractedText,
      wordCount,
      processingTime
    };

    // Include debug info if debug mode was enabled
    if (debug && extractResult.debugUrl) {
      response.debugZipUrl = extractResult.debugUrl;
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred';
    console.error('Adobe PDF extraction error:', error);

    // Update extraction log with error
    if (extractionLogId) {
      await supabase
        .from('adobe_extraction_logs')
        .update({
          success: false,
          error_message: errorMessage,
          processing_time_ms: Date.now() - (Date.now() - 30000) // Approximate
        })
        .eq('id', extractionLogId);
    }

    // Send usage alert if needed
    await checkAndSendUsageAlerts(supabase);

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

async function getAdobeAccessToken(credentials: AdobeCredentials): Promise<string> {
  const tokenUrl = 'https://ims-na1.adobelogin.com/ims/token/v3';
  
  console.log(`[${new Date().toISOString()}] Starting token request to: ${tokenUrl}`);
  console.log(`[${new Date().toISOString()}] Client ID: ${credentials.client_id.substring(0, 8)}...`);
  
  const formData = new URLSearchParams();
  formData.append('client_id', credentials.client_id);
  formData.append('client_secret', credentials.client_secret_encrypted);
  formData.append('grant_type', 'client_credentials');
  formData.append('scope', 'openid,AdobeID,DCAPI');

  console.log(`[${new Date().toISOString()}] Making token request...`);
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  console.log(`[${new Date().toISOString()}] Token response status: ${response.status}`);
  console.log(`[${new Date().toISOString()}] Token response headers:`, Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${new Date().toISOString()}] Adobe token request failed: ${response.status} - ${errorText}`);
    throw new Error(`Failed to get Adobe access token: ${errorText}`);
  }

  const tokenData = await response.json();
  console.log(`[${new Date().toISOString()}] Adobe access token obtained successfully`);
  console.log(`[${new Date().toISOString()}] Token type: ${tokenData.token_type}, expires_in: ${tokenData.expires_in}`);
  return tokenData.access_token;
}

async function extractTextWithAdobe(
  accessToken: string, 
  fileData: string, 
  fileName: string, 
  credentials: AdobeCredentials, 
  debug: boolean = false
): Promise<{ extractedText: string; debugUrl?: string }> {
  console.log(`[${new Date().toISOString()}] Starting Adobe PDF extraction for file: ${fileName}`);
  console.log(`[${new Date().toISOString()}] Access token length: ${accessToken.length}`);
  
  // Step 1: Get presigned URL and assetID
  const assetsUrl = 'https://pdf-services.adobe.io/assets';
  
  console.log(`[${new Date().toISOString()}] Step 1: Getting presigned URL from: ${assetsUrl}`);
  
  const presignedPayload = { mediaType: "application/pdf" };
  console.log(`[${new Date().toISOString()}] Presigned request payload:`, presignedPayload);
  
  const presignedResponse = await fetch(assetsUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': credentials.client_id,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(presignedPayload),
  });

  console.log(`[${new Date().toISOString()}] Presigned URL response status: ${presignedResponse.status}`);
  console.log(`[${new Date().toISOString()}] Presigned URL response headers:`, Object.fromEntries(presignedResponse.headers.entries()));

  if (!presignedResponse.ok) {
    const errorText = await presignedResponse.text();
    console.error(`[${new Date().toISOString()}] Adobe presigned URL request failed: ${presignedResponse.status} - ${errorText}`);
    throw new Error(`Failed to get presigned URL: ${errorText}`);
  }

  const presignedData = await presignedResponse.json();
  const { uploadUri, assetID } = presignedData;
  console.log(`Step 1 complete - Asset ID: ${assetID}`);
  
  // Step 2: Upload file to presigned URL
  console.log(`Step 2: Uploading file to presigned URL...`);
  
  // Convert base64 to binary data
  console.log(`Base64 data length: ${fileData.length} characters`);
  const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
  console.log(`Converted to ${binaryData.length} bytes for upload`);
  console.log(`File magic bytes: ${Array.from(binaryData.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
  
  const fileUploadResponse = await fetch(uploadUri, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf'
    },
    body: binaryData,
  });

  console.log(`File upload response status: ${fileUploadResponse.status}`);

  if (!fileUploadResponse.ok) {
    const errorText = await fileUploadResponse.text();
    console.error(`Adobe file upload failed: ${fileUploadResponse.status} - ${errorText}`);
    throw new Error(`Failed to upload file to presigned URL: ${errorText}`);
  }

  console.log(`Step 2 complete - File uploaded successfully`);

  // Step 3: Create extraction job
  const extractUrl = 'https://pdf-services.adobe.io/operation/extractpdf';
  
  const extractPayload = {
    assetID: assetID,
    getCharBounds: false,
    includeStyling: false,
    elementsToExtract: ['text', 'tables'],
    tableOutputFormat: 'xlsx',
    renditionsToExtract: ['tables', 'figures']
  };

  console.log(`Step 3: Creating extraction job with payload:`, extractPayload);

  console.log('Creating Adobe extraction job...');
  
  console.log(`[${new Date().toISOString()}] Sending extraction request to: ${extractUrl}`);
  console.log(`[${new Date().toISOString()}] Extraction payload:`, JSON.stringify(extractPayload, null, 2));

  const extractResponse = await fetch(extractUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': credentials.client_id,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(extractPayload),
  });

  console.log(`[${new Date().toISOString()}] Extraction response status: ${extractResponse.status}`);
  console.log(`[${new Date().toISOString()}] Extraction response headers:`, Object.fromEntries(extractResponse.headers.entries()));
  
  if (!extractResponse.ok) {
    const errorText = await extractResponse.text();
    console.error(`[${new Date().toISOString()}] Adobe extraction job creation failed: ${extractResponse.status}`);
    console.error(`[${new Date().toISOString()}] Full error response:`, errorText);
    throw new Error(`Failed to create extraction job: ${extractResponse.status} - ${errorText.substring(0, 200)}`);
  }

  // For job creation (201 status), Adobe only returns headers, no JSON body
  const jobLocation = extractResponse.headers.get('location');
  console.log(`[${new Date().toISOString()}] Job location header:`, jobLocation);

  if (!jobLocation) {
    throw new Error('No job location returned from Adobe');
  }

  console.log(`Extraction job created, polling for completion at: ${jobLocation}`);

  // Poll for job completion
  let jobComplete = false;
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max wait time

  while (!jobComplete && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    attempts++;

    const statusResponse = await fetch(jobLocation, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': credentials.client_id,
      },
    });

    if (!statusResponse.ok) {
      console.error(`Adobe job status check failed: ${statusResponse.status}`);
      throw new Error('Failed to check job status');
    }

    const statusData = await statusResponse.json();
    console.log(`Job status check attempt ${attempts}: ${statusData.status}`);
    
    if (statusData.status === 'done') {
      jobComplete = true;
      
      // Download the result
      const resultUrl = statusData.asset.downloadUri;
      console.log('Job completed, downloading results...');
      
      const resultResponse = await fetch(resultUrl);
      
      if (!resultResponse.ok) {
        console.error(`Adobe result download failed: ${resultResponse.status}`);
        throw new Error('Failed to download extraction result');
      }

      // Adobe returns a ZIP file containing structuredData.json
      const zipBuffer = await resultResponse.arrayBuffer();
      console.log(`Downloaded ZIP file: ${zipBuffer.byteLength} bytes`);
      
      let debugUrl: string | undefined;
      
      // Save ZIP to storage for debugging if requested
      if (debug) {
        debugUrl = await saveZipToStorage(zipBuffer, fileName);
        console.log(`Debug ZIP saved to: ${debugUrl}`);
      }
      
      // Extract and parse the structured data from the ZIP
      const extractedText = await extractTextFromZip(zipBuffer);

      console.log(`Text extraction completed, extracted ${extractedText.split(/\s+/).length} words`);
      return { 
        extractedText: extractedText.trim(),
        debugUrl 
      };
      
    } else if (statusData.status === 'failed') {
      console.error(`Adobe extraction job failed: ${JSON.stringify(statusData)}`);
      throw new Error(`Adobe extraction job failed: ${statusData.error || 'Unknown error'}`);
    }
  }

  console.error(`Adobe extraction job timed out after ${maxAttempts} attempts`);
  throw new Error('Adobe extraction job timed out');
}

async function extractTextFromZip(zipBuffer: ArrayBuffer): Promise<string> {
  try {
    // Import ZIP utilities from Deno standard library
    const { unzip } = await import("https://deno.land/x/zip@v1.2.5/mod.ts");
    
    // Convert ArrayBuffer to Uint8Array
    const zipData = new Uint8Array(zipBuffer);
    
    // Extract the ZIP file
    const extractedFiles = await unzip(zipData);
    
    // Look for structuredData.json in the extracted files
    const structuredDataFile = extractedFiles.find(file => 
      file.name === 'structuredData.json' || file.name.endsWith('/structuredData.json')
    );
    
    if (!structuredDataFile) {
      console.error('Available files in ZIP:', extractedFiles.map(f => f.name));
      throw new Error('structuredData.json not found in Adobe response ZIP');
    }
    
    // Parse the JSON content
    const jsonContent = new TextDecoder().decode(structuredDataFile.content);
    const structuredData = JSON.parse(jsonContent);
    
    console.log('Successfully extracted structured data from ZIP');
    
    // Extract text from the structured data
    let extractedText = '';
    if (structuredData.elements) {
      for (const element of structuredData.elements) {
        if (element.Text) {
          extractedText += element.Text + ' ';
        }
      }
    }
    
    return extractedText.trim();
    
  } catch (error) {
    console.error('Error extracting text from ZIP:', error);
    throw new Error(`Failed to extract text from Adobe ZIP response: ${error.message}`);
  }
}

async function checkAndSendUsageAlerts(supabase: any) {
  try {
    // Get current usage
    const { data: usageData } = await supabase.rpc('get_current_adobe_usage');
    
    if (!usageData || usageData.length === 0) return;
    
    const usage = usageData[0];
    const thresholds = [50, 80, 90, 100];
    
    for (const threshold of thresholds) {
      if (usage.usage_percentage >= threshold) {
        // Check if alert already sent for this threshold this month
        const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
        
        const { data: existingAlert } = await supabase
          .from('usage_alerts_sent')
          .select('id')
          .eq('month_year', currentMonth)
          .eq('threshold_percentage', threshold)
          .single();
          
        if (!existingAlert) {
          // Send alert email
          await supabase.functions.invoke('send-usage-alert', {
            body: {
              threshold,
              currentUsage: usage.current_usage,
              monthlyLimit: usage.monthly_limit,
              usagePercentage: usage.usage_percentage,
              daysUntilReset: usage.days_until_reset,
              resetDate: usage.reset_date
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to check/send usage alerts:', error);
  }
}

async function saveZipToStorage(zipBuffer: ArrayBuffer, originalFileName: string): Promise<string> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${originalFileName.replace(/\.[^/.]+$/, "")}-adobe-response.zip`;
    
    const { data, error } = await supabase.storage
      .from('adobe-debug-files')
      .upload(fileName, zipBuffer, {
        contentType: 'application/zip',
        upsert: true
      });

    if (error) {
      console.error('Failed to save ZIP to storage:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('adobe-debug-files')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error saving ZIP to storage:', error);
    throw new Error(`Failed to save debug ZIP: ${error.message}`);
  }
}

serve(handler);