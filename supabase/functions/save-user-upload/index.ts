import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { generateUserUploadFileName } from "../shared/fileNaming.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaveUploadRequest {
  fileContent: string; // base64 encoded
  fileName: string;
  fileType: string;
  uploadType: 'cv' | 'job_description';
  userId: string;
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
    const requestBody: SaveUploadRequest = await req.json();
    const { fileContent, fileName, fileType, uploadType, userId } = requestBody;

    // Get user_id for file naming
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', userId)
      .single();

    const userIdForNaming = profile?.user_id || 'unknown';

    // Convert base64 to binary
    const binaryData = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));

    // Generate standardized filename for user upload
    const debugFileName = generateUserUploadFileName(userIdForNaming, fileName);

    // Save to debug storage
    const { error: storageError } = await supabase.storage
      .from('adobe-debug-files')
      .upload(debugFileName, binaryData, {
        contentType: fileType,
        upsert: true
      });

    if (!storageError) {
      // Track in database with uploaded-by-user state
      await supabase.from('adobe_debug_files').insert({
        user_id: userIdForNaming,
        file_name: debugFileName,
        original_filename: fileName,
        file_type: fileType.split('/')[1] || 'unknown',
        file_size: binaryData.byteLength,
        storage_path: debugFileName,
        state: 'uploaded-by-user',
        processing_stage: 'uploaded'
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      fileName: debugFileName,
      message: 'File saved successfully with debug tracking'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Save upload error:', error);
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