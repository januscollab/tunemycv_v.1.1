// Version: 2.1 - Force redeployment to activate naming fixes
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
    console.log('Step 1: Parsing job description request...');
    const requestBody: SaveJobDescriptionRequest = await req.json();
    const { content, jobTitle, companyName, userId, uploadId } = requestBody;
    
    console.log(`Step 2: Processing job description for user ${userId}, title: ${jobTitle}, company: ${companyName}`);
    
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Job description content is empty');
    }
    
    if (content.length > 500000) { // 500KB text limit
      throw new Error('Job description content is too large (500KB limit)');
    }

    // Get user_id for file naming
    console.log('Step 3: Fetching user profile for naming...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile lookup failed:', profileError);
      throw new Error(`Failed to lookup user profile: ${profileError.message}`);
    }

    const userIdForNaming = profile?.user_id || 'unknown';
    console.log(`Step 4: Using user_id for naming: ${userIdForNaming}`);

    // Create filename based on job details
    const baseFileName = jobTitle && companyName 
      ? `${jobTitle}_${companyName}_JD.txt`
      : `Job_Description_${Date.now()}.txt`;
    console.log(`Step 5: Generated base filename: ${baseFileName}`);

    // Generate standardized filename for job description
    const debugFileName = generateUserUploadFileName(userIdForNaming, baseFileName);
    console.log(`Step 6: Generated debug filename: ${debugFileName}`);

    // Convert content to binary
    console.log('Step 7: Converting content to binary...');
    const textBuffer = new TextEncoder().encode(content);
    console.log(`Step 8: Text encoding successful - ${textBuffer.byteLength} bytes`);
    
    // Validate encoded content
    if (textBuffer.byteLength === 0) {
      throw new Error('Encoded content is empty');
    }

    // Save to debug storage
    console.log('Step 9: Uploading to storage...');
    const { data: storageData, error: storageError } = await supabase.storage
      .from('adobe-debug-files')
      .upload(debugFileName, textBuffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (storageError) {
      console.error('Storage upload failed:', storageError);
      throw new Error(`Storage upload failed: ${storageError.message}`);
    }

    console.log('Step 10: Storage upload successful, inserting database record...');
    
    // Track in database with uploaded-by-user state
    const { error: dbError } = await supabase.from('adobe_debug_files').insert({
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

    if (dbError) {
      console.error('Database insert failed:', dbError);
      
      // Attempt to clean up storage file since DB insert failed
      try {
        await supabase.storage.from('adobe-debug-files').remove([debugFileName]);
        console.log('Cleaned up storage file after database failure');
      } catch (cleanupError) {
        console.error('Failed to cleanup storage file:', cleanupError);
      }
      
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    console.log('Step 11: Database record inserted successfully');
    console.log(`Job description upload completed: ${debugFileName} (${textBuffer.byteLength} bytes)`);

    return new Response(JSON.stringify({ 
      success: true, 
      fileName: debugFileName,
      fileSize: textBuffer.byteLength,
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