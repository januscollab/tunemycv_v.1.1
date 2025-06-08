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
        const extractResult = await processWithAdobe(
          upload.original_file_content,
          upload.file_name,
          credentials,
          false
        );

        // Update with success
        await supabase.rpc('update_processing_status', {
          upload_id: upload.id,
          new_status: 'completed',
          extracted_text_content: extractResult.extractedText
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
  credentials: AdobeCredentials,
  debug: boolean = false
): Promise<{ extractedText: string; debugUrl?: string }> {
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
    getCharBounds: false,
    includeStyling: false,
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

      return { 
        extractedText: extractedText.trim(),
        debugUrl 
      };
      
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