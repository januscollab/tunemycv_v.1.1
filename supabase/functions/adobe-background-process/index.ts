import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { 
  generateAdobeResponseFileName, 
  generateExtractedTextFileName, 
  generateFormattedTextFileName,
  generateUserUploadFileName 
} from "./fileNaming.ts";
import { formatExtractedText } from "../shared/adobe-text-formatter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdobeCredentials {
  client_id: string;
  client_secret_encrypted: string;
  organization_id: string;
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

  try {
    const requestBody = await req.json();
    const { uploadId } = requestBody;

    // If specific upload ID provided, process that one
    if (uploadId) {
      await processUpload(supabase, uploadId);
      return new Response(JSON.stringify({ success: true, processed: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Otherwise, process all pending uploads
    const { data: pendingUploads, error } = await supabase
      .from('uploads')
      .select('id, file_name, file_size, original_file_content, user_id')
      .eq('processing_status', 'uploaded')
      .eq('upload_type', 'cv')
      .is('extracted_text', null)
      .limit(5); // Process up to 5 at a time

    if (error) {
      throw new Error(`Failed to fetch pending uploads: ${error.message}`);
    }

    if (!pendingUploads || pendingUploads.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0, message: 'No pending uploads' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Processing ${pendingUploads.length} pending uploads`);

    // Process each upload
    let processed = 0;
    for (const upload of pendingUploads) {
      try {
        await processUpload(supabase, upload.id);
        processed++;
      } catch (error) {
        console.error(`Failed to process upload ${upload.id}:`, error);
        // Continue with next upload
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed,
      total: pendingUploads.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Background processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

async function processUpload(supabase: any, uploadId: string) {
  console.log(`Starting background processing for upload: ${uploadId}`);

  try {
    // Mark as processing
    await supabase.rpc('update_processing_status', {
      upload_id: uploadId,
      new_status: 'processing'
    });

    // Get upload details
    const { data: upload, error: fetchError } = await supabase
      .from('uploads')
      .select('original_file_content, file_name, file_size, user_id')
      .eq('id', uploadId)
      .single();

    if (fetchError || !upload) {
      throw new Error(`Failed to fetch upload: ${fetchError?.message}`);
    }

    if (!upload.original_file_content) {
      throw new Error('No file content available for processing');
    }

    // Check if Adobe API is enabled and get debug setting
    const { data: settings } = await supabase
      .from('site_settings')
      .select('adobe_api_enabled, monthly_adobe_limit, debug_mode')
      .single();

    if (!settings?.adobe_api_enabled) {
      throw new Error('Adobe PDF Services API is not enabled');
    }

    // Use debug setting from site settings (default to true if not set)
    const debug = settings?.debug_mode ?? true;

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

    // Get user_id for file naming
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', upload.user_id)
      .single();

    const userId = profile?.user_id || 'unknown';

    // Convert BYTEA to base64 for Adobe processing
    const uint8Array = new Uint8Array(upload.original_file_content);
    const base64String = btoa(String.fromCharCode(...uint8Array));

    // Process with Adobe API
    const accessToken = await getAdobeAccessToken(credentials);
    const extractResult = await extractTextWithAdobe(accessToken, base64String, upload.file_name, credentials, debug, userId);

    // Update with success
    await supabase.rpc('update_processing_status', {
      upload_id: uploadId,
      new_status: 'completed',
      extracted_text_content: extractResult.extractedText
    });

    console.log(`Successfully processed upload ${uploadId}: ${extractResult.extractedText.split(/\s+/).length} words extracted`);

  } catch (error: any) {
    console.error(`Failed to process upload ${uploadId}:`, error);
    
    // Mark as failed
    await supabase.rpc('update_processing_status', {
      upload_id: uploadId,
      new_status: 'failed',
      error_message_content: error.message
    });
    
    throw error;
  }
}

async function getAdobeAccessToken(credentials: AdobeCredentials): Promise<string> {
  const tokenUrl = 'https://ims-na1.adobelogin.com/ims/token/v3';
  
  console.log(`Requesting Adobe access token with client_id: ${credentials.client_id.substring(0, 8)}...`);
  
  const formData = new URLSearchParams();
  formData.append('client_id', credentials.client_id);
  formData.append('client_secret', credentials.client_secret_encrypted);
  formData.append('grant_type', 'client_credentials');
  formData.append('scope', 'openid,AdobeID,DCAPI');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Adobe token request failed: ${response.status} - ${errorText}`);
    throw new Error(`Failed to get Adobe access token: ${errorText}`);
  }

  const tokenData = await response.json();
  console.log('Adobe access token obtained successfully');
  return tokenData.access_token;
}

async function extractTextWithAdobe(
  accessToken: string, 
  fileData: string, 
  fileName: string, 
  credentials: AdobeCredentials, 
  debug: boolean = false,
  userId: string = 'unknown'
): Promise<{ extractedText: string; debugUrl?: string; textUrl?: string }> {
  console.log(`Starting Adobe PDF extraction for file: ${fileName}`);
  
  // Step 1: Get presigned URL and assetID
  const assetsUrl = 'https://pdf-services.adobe.io/assets';
  
  console.log(`Step 1: Getting presigned URL from Adobe...`);
  
  const presignedResponse = await fetch(assetsUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': credentials.client_id,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mediaType: "application/pdf"
    }),
  });

  console.log(`Presigned URL response status: ${presignedResponse.status}`);

  if (!presignedResponse.ok) {
    const errorText = await presignedResponse.text();
    console.error(`Adobe presigned URL request failed: ${presignedResponse.status} - ${errorText}`);
    throw new Error(`Failed to get presigned URL: ${errorText}`);
  }

  const presignedData = await presignedResponse.json();
  const { uploadUri, assetID } = presignedData;
  console.log(`Step 1 complete - Asset ID: ${assetID}`);
  
  // Step 2: Upload file to presigned URL
  console.log(`Step 2: Uploading file to presigned URL...`);
  
  const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
  console.log(`Converted to ${binaryData.length} bytes for upload`);
  
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
    elementsToExtract: ['text'] // Only extract text, no tables or figures
  };

  console.log(`Step 3: Creating extraction job with payload:`, extractPayload);

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

  if (!jobLocation) {
    throw new Error('No job location returned from Adobe');
  }

  console.log(`Extraction job created, polling for completion at: ${jobLocation}`);

  // Poll for job completion
  let jobComplete = false;
  let attempts = 0;
  const maxAttempts = 30;

  while (!jobComplete && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
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
      
      const resultUrl = statusData.content.downloadUri;
      console.log('Job completed, downloading results...');
      
      const resultResponse = await fetch(resultUrl);
      
      if (!resultResponse.ok) {
        console.error(`Adobe result download failed: ${resultResponse.status}`);
        throw new Error('Failed to download extraction result');
      }

      // Adobe returns a ZIP file containing structuredData.json
      const zipBuffer = await resultResponse.arrayBuffer();
      console.log(`Downloaded ZIP file: ${zipBuffer.byteLength} bytes`);
      
      // Extract and parse the structured data from the ZIP
      const extractedText = await extractTextFromZip(zipBuffer);

      // Apply text formatting (post-processing)
      let formattingResult;
      try {
        formattingResult = await formatExtractedText(extractedText, fileName);
        console.log(`Text formatting completed - Applied: ${formattingResult.formattingApplied}, Well-structured: ${formattingResult.isWellStructured}`);
      } catch (error) {
        console.log('Non-critical: Text formatting failed:', error.message);
        // Create fallback result
        formattingResult = {
          rawText: extractedText,
          formattedText: extractedText,
          documentJson: { version: '1.0', sections: [] },
          isWellStructured: false,
          wordCount: extractedText.split(/\s+/).length,
          formattingApplied: false
        };
      }

      // Save ZIP and both raw/formatted text files with proper states
      const savedFiles = await saveFilesToStorage(zipBuffer, formattingResult, fileName, userId, uploadId);
      console.log(`Files saved - ZIP: ${savedFiles.zipUrl ? 'yes' : 'no'}, Raw Text: ${savedFiles.textUrl ? 'yes' : 'no'}, Formatted Text: ${savedFiles.formattedTextUrl ? 'yes' : 'no'}`);

      const finalText = formattingResult.formattingApplied ? formattingResult.formattedText : formattingResult.rawText;
      console.log(`Text extraction completed, extracted ${formattingResult.wordCount} words`);
      return { 
        extractedText: finalText.trim(),
        debugUrl: savedFiles.zipUrl,
        textUrl: savedFiles.formattedTextUrl || savedFiles.textUrl,
        rawTextUrl: savedFiles.textUrl,
        formattingApplied: formattingResult.formattingApplied,
        isWellStructured: formattingResult.isWellStructured
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
    // Import fflate for reliable ZIP extraction
    const { unzipSync } = await import("https://esm.sh/fflate@0.8.2");
    
    // Convert ArrayBuffer to Uint8Array
    const zipData = new Uint8Array(zipBuffer);
    
    // Extract the ZIP file using fflate
    const extractedFiles = unzipSync(zipData);
    
    // Look for structuredData.json in the extracted files
    const structuredDataFile = Object.entries(extractedFiles).find(([fileName]) => 
      fileName === 'structuredData.json' || fileName.endsWith('/structuredData.json')
    );
    
    if (!structuredDataFile) {
      console.error('Available files in ZIP:', Object.keys(extractedFiles));
      throw new Error('structuredData.json not found in Adobe response ZIP');
    }
    
    // Parse the JSON content
    const jsonContent = new TextDecoder().decode(structuredDataFile[1]);
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
    throw new Error(`We're unable to process this PDF file. Please try with a different PDF or contact support if the problem persists. (Error: ${error.message})`);
  }
}

async function saveFilesToStorage(
  zipBuffer: ArrayBuffer, 
  formattingResult: { rawText: string; formattedText: string; formattingApplied: boolean },
  originalFileName: string, 
  userId: string,
  uploadId?: string
): Promise<{ zipUrl?: string; textUrl?: string; formattedTextUrl?: string }> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const results: { zipUrl?: string; textUrl?: string; formattedTextUrl?: string } = {};
    
    // Save ZIP file with adobe-response state
    const zipFileName = generateAdobeResponseFileName(userId, originalFileName);
    const { error: zipError } = await supabase.storage
      .from('adobe-debug-files')
      .upload(zipFileName, zipBuffer, {
        contentType: 'application/zip',
        upsert: true
      });

    if (!zipError) {
      // Track in database with state
      await supabase.from('adobe_debug_files').insert({
        user_id: userId,
        file_name: zipFileName,
        original_filename: originalFileName,
        file_type: 'zip',
        file_size: zipBuffer.byteLength,
        storage_path: zipFileName,
        state: 'adobe-response',
        processing_stage: 'downloaded',
        job_description_upload_id: uploadId ? uploadId : null
      });
      
      const { data: zipUrlData } = supabase.storage
        .from('adobe-debug-files')
        .getPublicUrl(zipFileName);
      results.zipUrl = zipUrlData.publicUrl;
    }
    
    // Save raw extracted text with extracted state
    const rawTextFileName = generateExtractedTextFileName(userId, originalFileName);
    const rawTextBuffer = new TextEncoder().encode(formattingResult.rawText);
    const { error: rawTextError } = await supabase.storage
      .from('adobe-debug-files')
      .upload(rawTextFileName, rawTextBuffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (!rawTextError) {
      // Track in database with state
      await supabase.from('adobe_debug_files').insert({
        user_id: userId,
        file_name: rawTextFileName,
        original_filename: originalFileName,
        file_type: 'txt',
        file_size: rawTextBuffer.byteLength,
        storage_path: rawTextFileName,
        state: 'extracted',
        processing_stage: 'extracted',
        job_description_upload_id: uploadId ? uploadId : null
      });
      
      const { data: textUrlData } = supabase.storage
        .from('adobe-debug-files')
        .getPublicUrl(rawTextFileName);
      results.textUrl = textUrlData.publicUrl;
    }

    // Save formatted text if different from raw with formatted state
    if (formattingResult.formattingApplied && formattingResult.formattedText !== formattingResult.rawText) {
      const formattedTextFileName = generateFormattedTextFileName(userId, originalFileName);
      const formattedTextBuffer = new TextEncoder().encode(formattingResult.formattedText);
      const { error: formattedTextError } = await supabase.storage
        .from('adobe-debug-files')
        .upload(formattedTextFileName, formattedTextBuffer, {
          contentType: 'text/plain',
          upsert: true
        });

      if (!formattedTextError) {
        // Track in database with state
        await supabase.from('adobe_debug_files').insert({
          user_id: userId,
          file_name: formattedTextFileName,
          original_filename: originalFileName,
          file_type: 'txt',
          file_size: formattedTextBuffer.byteLength,
          storage_path: formattedTextFileName,
          state: 'formatted',
          processing_stage: 'formatted',
          job_description_upload_id: uploadId ? uploadId : null
        });
        
        const { data: formattedTextUrlData } = supabase.storage
          .from('adobe-debug-files')
          .getPublicUrl(formattedTextFileName);
        results.formattedTextUrl = formattedTextUrlData.publicUrl;
      }
    }
    
    // Cleanup old files (keep max 100 of each type)
    await supabase.rpc('cleanup_adobe_debug_files');

    return results;
  } catch (error) {
    console.error('Error saving files to storage:', error);
    return {};
  }
}

serve(handler);
