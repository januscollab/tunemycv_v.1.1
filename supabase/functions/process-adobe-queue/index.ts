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
    console.log('Starting background Adobe PDF processing queue...');

    // Check if Adobe API is enabled
    const { data: settings } = await supabase
      .from('site_settings')
      .select('adobe_api_enabled, monthly_adobe_limit')
      .single();

    if (!settings?.adobe_api_enabled) {
      console.log('Adobe API is not enabled, skipping processing');
      return new Response(JSON.stringify({ message: 'Adobe API not enabled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get Adobe credentials
    const { data: credentials, error: credError } = await supabase
      .from('adobe_credentials')
      .select('client_id, client_secret_encrypted, organization_id')
      .eq('is_active', true)
      .single();

    if (credError || !credentials) {
      console.error('Adobe API credentials not configured:', credError);
      return new Response(JSON.stringify({ error: 'Adobe credentials not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get pending uploads (PDFs that need processing)
    const { data: pendingUploads, error: uploadError } = await supabase
      .from('uploads')
      .select('id, user_id, file_name, file_size, original_file_content')
      .eq('processing_status', 'uploaded')
      .eq('upload_type', 'cv')
      .in('file_type', ['application/pdf'])
      .not('original_file_content', 'is', null)
      .order('created_at', { ascending: true })
      .limit(5); // Process 5 at a time

    if (uploadError) {
      console.error('Error fetching pending uploads:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to fetch pending uploads' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!pendingUploads || pendingUploads.length === 0) {
      console.log('No pending uploads found');
      return new Response(JSON.stringify({ message: 'No pending uploads' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Found ${pendingUploads.length} pending uploads to process`);

    // Process each upload
    const results = [];
    for (const upload of pendingUploads) {
      try {
        console.log(`Processing upload ${upload.id}: ${upload.file_name}`);
        
        // Update status to processing
        await supabase.rpc('update_processing_status', {
          upload_id: upload.id,
          new_status: 'processing'
        });

        // Check usage limits
        const usageCheck = await supabase.rpc('increment_adobe_usage');
        if (!usageCheck.data) {
          console.log(`Usage limit exceeded for upload ${upload.id}`);
          await supabase.rpc('update_processing_status', {
            upload_id: upload.id,
            new_status: 'failed',
            error_message_content: 'Monthly Adobe usage limit exceeded'
          });
          continue;
        }

        // Process with Adobe API
        const extractedText = await processWithAdobe(
          upload.original_file_content,
          upload.file_name,
          credentials
        );

        // Update with success
        await supabase.rpc('update_processing_status', {
          upload_id: upload.id,
          new_status: 'completed',
          extracted_text_content: extractedText
        });

        console.log(`Successfully processed upload ${upload.id}`);
        results.push({ id: upload.id, status: 'completed' });

      } catch (error) {
        console.error(`Failed to process upload ${upload.id}:`, error);
        
        await supabase.rpc('update_processing_status', {
          upload_id: upload.id,
          new_status: 'failed',
          error_message_content: error.message
        });

        results.push({ id: upload.id, status: 'failed', error: error.message });
      }
    }

    return new Response(JSON.stringify({
      message: `Processed ${results.length} uploads`,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Background processing error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

async function processWithAdobe(
  fileContent: ArrayBuffer,
  fileName: string,
  credentials: AdobeCredentials
): Promise<string> {
  // Get Adobe access token
  const accessToken = await getAdobeAccessToken(credentials);

  // Convert BYTEA to Uint8Array for Adobe processing
  const binaryData = new Uint8Array(fileContent);
  
  console.log(`Processing ${fileName} with Adobe API (${binaryData.length} bytes)`);

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

  if (!presignedResponse.ok) {
    const errorText = await presignedResponse.text();
    throw new Error(`Failed to get presigned URL: ${errorText}`);
  }

  const presignedData = await presignedResponse.json();
  const { uploadUri, assetID } = presignedData;
  console.log(`Step 1 complete - Asset ID: ${assetID}`);
  
  // Step 2: Upload file to presigned URL
  console.log(`Step 2: Uploading file to presigned URL...`);
  
  const fileUploadResponse = await fetch(uploadUri, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf'
    },
    body: binaryData,
  });

  if (!fileUploadResponse.ok) {
    const errorText = await fileUploadResponse.text();
    throw new Error(`Failed to upload file to presigned URL: ${errorText}`);
  }

  console.log(`Step 2 complete - File uploaded successfully`);

  // Step 3: Create extraction job
  const extractUrl = 'https://pdf-services.adobe.io/operation/extractpdf';
  
  const extractPayload = {
    assetID: assetID,
    elementsToExtract: ['text', 'tables'],
    tableOutputFormat: 'xlsx',
    renditionsToExtract: ['tables', 'figures']
  };

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
  
  // Log raw response before trying to parse JSON
  const rawResponseText = await extractResponse.text();
  console.log(`[${new Date().toISOString()}] Raw extraction response (first 500 chars):`, rawResponseText.substring(0, 500));
  
  if (!extractResponse.ok) {
    console.error(`[${new Date().toISOString()}] Adobe extraction job creation failed: ${extractResponse.status}`);
    console.error(`[${new Date().toISOString()}] Full error response:`, rawResponseText);
    throw new Error(`Failed to create extraction job: ${extractResponse.status} - ${rawResponseText.substring(0, 200)}`);
  }

  // Check if response is actually JSON
  const contentType = extractResponse.headers.get('content-type');
  console.log(`[${new Date().toISOString()}] Response Content-Type: ${contentType}`);
  
  if (!contentType || !contentType.includes('application/json')) {
    console.error(`[${new Date().toISOString()}] Expected JSON response but got: ${contentType}`);
    throw new Error(`Adobe returned non-JSON response: ${contentType}. Response: ${rawResponseText.substring(0, 200)}`);
  }

  const jobLocation = extractResponse.headers.get('location');
  if (!jobLocation) {
    throw new Error('No job location returned from Adobe');
  }

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;

    const statusResponse = await fetch(jobLocation, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': credentials.client_id,
      },
    });

    if (!statusResponse.ok) {
      throw new Error('Failed to check job status');
    }

    const statusData = await statusResponse.json();
    
    if (statusData.status === 'done') {
      const resultResponse = await fetch(statusData.asset.downloadUri);
      if (!resultResponse.ok) {
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

      return extractedText.trim();
      
    } else if (statusData.status === 'failed') {
      throw new Error(`Adobe extraction job failed: ${statusData.error || 'Unknown error'}`);
    }
  }

  throw new Error('Adobe extraction job timed out');
}

async function getAdobeAccessToken(credentials: AdobeCredentials): Promise<string> {
  const tokenUrl = 'https://ims-na1.adobelogin.com/ims/token/v3';
  
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
    throw new Error(`Failed to get Adobe access token: ${errorText}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

serve(handler);