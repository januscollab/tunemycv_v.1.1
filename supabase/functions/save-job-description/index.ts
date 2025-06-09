import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { generateUserUploadFileName } from "../shared/fileNaming.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaveJobDescriptionRequest {
  content: string;
  jobTitle?: string;
  companyName?: string;
  userId: string;
  uploadId?: string;
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
    const requestBody: SaveJobDescriptionRequest = await req.json();
    const { content, jobTitle, companyName, userId, uploadId } = requestBody;

    // Get user_id for file naming
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', userId)
      .single();

    const userIdForNaming = profile?.user_id || 'unknown';

    // Create filename based on job details
    const baseFileName = jobTitle && companyName 
      ? `${jobTitle}_${companyName}_JD.txt`
      : `Job_Description_${Date.now()}.txt`;

    // Generate standardized filename for job description
    const debugFileName = generateUserUploadFileName(userIdForNaming, baseFileName);

    // Convert content to binary
    const textBuffer = new TextEncoder().encode(content);

    // Save to debug storage
    const { error: storageError } = await supabase.storage
      .from('adobe-debug-files')
      .upload(debugFileName, textBuffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (!storageError) {
      // Track in database with uploaded-by-user state
      await supabase.from('adobe_debug_files').insert({
        user_id: userIdForNaming,
        file_name: debugFileName,
        original_filename: baseFileName,
        file_type: 'txt',
        file_size: textBuffer.byteLength,
        storage_path: debugFileName,
        state: 'uploaded-by-user',
        processing_stage: 'uploaded',
        job_description_upload_id: uploadId || null
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      fileName: debugFileName,
      message: 'Job description saved successfully with debug tracking'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Save job description error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);