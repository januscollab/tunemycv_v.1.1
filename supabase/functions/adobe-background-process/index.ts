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

    // Convert BYTEA to base64 for Adobe processing
    const uint8Array = new Uint8Array(upload.original_file_content);
    const base64String = btoa(String.fromCharCode(...uint8Array));

    // Process with Adobe API
    const accessToken = await getAdobeAccessToken(credentials);
    const extractedText = await extractTextWithAdobe(accessToken, base64String, upload.file_name, credentials);

    // Update with success
    await supabase.rpc('update_processing_status', {
      upload_id: uploadId,
      new_status: 'completed',
      extracted_text_content: extractedText
    });

    console.log(`Successfully processed upload ${uploadId}: ${extractedText.split(/\s+/).length} words extracted`);

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
  const tokenUrl = 'https://ims-na1.adobelogin.com/ims/token';
  
  console.log(`Requesting Adobe access token with client_id: ${credentials.client_id.substring(0, 8)}...`);
  
  const clientSecret = credentials.client_secret_encrypted;
  
  const formData = new URLSearchParams();
  formData.append('client_id', credentials.client_id);
  formData.append('client_secret', clientSecret);
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

async function extractTextWithAdobe(accessToken: string, fileData: string, fileName: string, credentials: AdobeCredentials): Promise<string> {
  console.log(`Starting Adobe PDF extraction for file: ${fileName}`);
  
  const uploadUrl = 'https://pdf-services.adobe.io/assets';
  
  console.log(`Uploading file to Adobe with client_id: ${credentials.client_id.substring(0, 8)}...`);
  
  const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
  
  console.log(`Converted to ${binaryData.length} bytes for upload`);
  
  const uploadHeaders = {
    'Authorization': `Bearer ${accessToken}`,
    'X-API-Key': credentials.client_id,
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${fileName}"`,
  };
  
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: uploadHeaders,
    body: binaryData,
  });

  console.log(`Adobe upload response status: ${uploadResponse.status}`);

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error(`Adobe file upload failed: ${uploadResponse.status} - ${errorText}`);
    throw new Error(`Failed to upload file to Adobe: ${errorText}`);
  }

  const uploadData = await uploadResponse.json();
  const assetId = uploadData.assetID;
  console.log(`File uploaded successfully, asset ID: ${assetId}`);

  // Create extraction job
  const extractUrl = 'https://pdf-services.adobe.io/operation/extractpdf';
  
  const extractPayload = {
    assetID: assetId,
    elementsToExtract: ['text'],
    elementsToExtractRenditions: [],
    tableOutputFormat: 'csv',
    renditionsToExtract: []
  };

  console.log('Creating Adobe extraction job...');
  
  const extractResponse = await fetch(extractUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': credentials.client_id,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(extractPayload),
  });

  if (!extractResponse.ok) {
    const errorText = await extractResponse.text();
    console.error(`Adobe extraction job creation failed: ${extractResponse.status} - ${errorText}`);
    throw new Error(`Failed to create extraction job: ${errorText}`);
  }

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
      
      const resultUrl = statusData.asset.downloadUri;
      console.log('Job completed, downloading results...');
      
      const resultResponse = await fetch(resultUrl);
      
      if (!resultResponse.ok) {
        console.error(`Adobe result download failed: ${resultResponse.status}`);
        throw new Error('Failed to download extraction result');
      }

      const resultData = await resultResponse.json();
      
      let extractedText = '';
      if (resultData.elements) {
        for (const element of resultData.elements) {
          if (element.Text) {
            extractedText += element.Text + ' ';
          }
        }
      }

      console.log(`Text extraction completed, extracted ${extractedText.split(/\s+/).length} words`);
      return extractedText.trim();
      
    } else if (statusData.status === 'failed') {
      console.error(`Adobe extraction job failed: ${JSON.stringify(statusData)}`);
      throw new Error(`Adobe extraction job failed: ${statusData.error || 'Unknown error'}`);
    }
  }

  console.error(`Adobe extraction job timed out after ${maxAttempts} attempts`);
  throw new Error('Adobe extraction job timed out');
}

serve(handler);
