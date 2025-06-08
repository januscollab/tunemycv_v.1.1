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
    const { fileData, fileName, fileSize } = requestBody;
    
    // Get user ID from JWT if available
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
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
    const extractedText = await extractTextWithAdobe(accessToken, fileData, fileName);

    const processingTime = Date.now() - startTime;
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;

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

    return new Response(JSON.stringify({
      success: true,
      extractedText,
      wordCount,
      processingTime
    }), {
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
  
  const formData = new URLSearchParams();
  formData.append('client_id', credentials.client_id);
  formData.append('client_secret', credentials.client_secret_encrypted); // TODO: Decrypt this
  formData.append('grant_type', 'client_credentials');
  formData.append('scope', 'openid,AdobeID,document_generation,document_services');

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

async function extractTextWithAdobe(accessToken: string, fileData: string, fileName: string): Promise<string> {
  // Upload file to Adobe
  const uploadUrl = 'https://pdf-services.adobe.io/assets';
  
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': Deno.env.get('ADOBE_CLIENT_ID') || '',
      'Content-Type': 'application/pdf',
    },
    body: Uint8Array.from(atob(fileData), c => c.charCodeAt(0)),
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Failed to upload file to Adobe: ${errorText}`);
  }

  const uploadData = await uploadResponse.json();
  const assetId = uploadData.assetID;

  // Create extraction job
  const extractUrl = 'https://pdf-services.adobe.io/operation/extractpdf';
  
  const extractPayload = {
    assetID: assetId,
    elementsToExtract: ['text'],
    elementsToExtractRenditions: [],
    tableOutputFormat: 'csv',
    renditionsToExtract: []
  };

  const extractResponse = await fetch(extractUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': Deno.env.get('ADOBE_CLIENT_ID') || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(extractPayload),
  });

  if (!extractResponse.ok) {
    const errorText = await extractResponse.text();
    throw new Error(`Failed to create extraction job: ${errorText}`);
  }

  const extractData = await extractResponse.json();
  const jobLocation = extractResponse.headers.get('location');

  if (!jobLocation) {
    throw new Error('No job location returned from Adobe');
  }

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
        'X-API-Key': Deno.env.get('ADOBE_CLIENT_ID') || '',
      },
    });

    if (!statusResponse.ok) {
      throw new Error('Failed to check job status');
    }

    const statusData = await statusResponse.json();
    
    if (statusData.status === 'done') {
      jobComplete = true;
      
      // Download the result
      const resultUrl = statusData.asset.downloadUri;
      const resultResponse = await fetch(resultUrl);
      
      if (!resultResponse.ok) {
        throw new Error('Failed to download extraction result');
      }

      const resultData = await resultResponse.json();
      
      // Extract text from the structured result
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

serve(handler);