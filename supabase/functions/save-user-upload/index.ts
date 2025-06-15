// Version: 2.2 - Security enhancements
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { generateUserUploadFileName } from "../shared/fileNaming.ts";
import { 
  validateInput, 
  validateFileName,
  logSecurityEvent, 
  getSecureErrorResponse,
  checkRateLimit 
} from '../shared/security.ts';

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
    console.log('Step 1: Parsing and validating request...');
    const rawRequest = await req.json();
    
    // Security: Validate and sanitize request data
    const requestBody: SaveUploadRequest = {
      fileContent: validateInput(rawRequest.fileContent, 'file content', 100 * 1024 * 1024), // 100MB base64 limit
      fileName: validateFileName(rawRequest.fileName),
      fileType: validateInput(rawRequest.fileType, 'file type', 100),
      uploadType: rawRequest.uploadType === 'cv' || rawRequest.uploadType === 'job_description' ? rawRequest.uploadType : (() => {
        throw new Error('Invalid upload type')
      })(),
      userId: validateInput(rawRequest.userId, 'user ID', 100)
    };
    
    const { fileContent, fileName, fileType, uploadType, userId } = requestBody;
    
    // Security: Rate limiting (10 uploads per minute per user)
    if (!checkRateLimit(userId, 10, 60000)) {
      throw new Error('Rate limit exceeded')
    }
    
    console.log(`Step 2: Processing ${uploadType} upload for user ${userId}, file: ${fileName}, type: ${fileType}`);

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

    // Validate and convert base64 to binary
    console.log('Step 5: Converting base64 to binary...');
    if (!fileContent || fileContent.length === 0) {
      throw new Error('File content is empty or invalid');
    }
    
    try {
      const binaryData = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
      console.log(`Step 6: Binary conversion successful - ${binaryData.byteLength} bytes`);
      
      // Validate file size
      if (binaryData.byteLength === 0) {
        throw new Error('Converted file is empty');
      }
      
      if (binaryData.byteLength > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('File size exceeds 50MB limit');
      }

      // Generate standardized filename for user upload
      const debugFileName = generateUserUploadFileName(userIdForNaming, fileName);
      console.log(`Step 7: Generated debug filename: ${debugFileName}`);

      // Save to debug storage
      console.log('Step 8: Uploading to storage...');
      const { data: storageData, error: storageError } = await supabase.storage
        .from('adobe-debug-files')
        .upload(debugFileName, binaryData, {
          contentType: fileType,
          upsert: true
        });

      if (storageError) {
        console.error('Storage upload failed:', storageError);
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      console.log('Step 9: Storage upload successful, inserting database record...');
      
      // Track in database with uploaded-by-user state
      const { error: dbError } = await supabase.from('adobe_debug_files').insert({
        user_id: userIdForNaming,
        file_name: debugFileName,
        original_filename: fileName,
        file_type: fileType.split('/')[1] || 'unknown',
        file_size: binaryData.byteLength,
        storage_path: debugFileName,
        state: 'uploaded-by-user',
        processing_stage: 'uploaded'
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

      console.log('Step 10: Database record inserted successfully');
      console.log(`Upload completed successfully: ${debugFileName} (${binaryData.byteLength} bytes)`);

      return new Response(JSON.stringify({ 
        success: true, 
        fileName: debugFileName,
        fileSize: binaryData.byteLength,
        message: 'File saved successfully with debug tracking'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
      
    } catch (conversionError) {
      console.error('Base64 conversion failed:', conversionError);
      throw new Error(`Invalid base64 content: ${conversionError instanceof Error ? conversionError.message : 'Unknown conversion error'}`);
    }

  } catch (error: any) {
    // Security: Log security events for suspicious activities
    if (error.message === 'Rate limit exceeded') {
      await logSecurityEvent(supabase, 'rate_limit_exceeded', {
        endpoint: 'save-user-upload',
        user_agent: req.headers.get('user-agent'),
        user_id: rawRequest?.userId
      }, rawRequest?.userId, 'warning')
    } else if (error.message.includes('Invalid') && error.message.includes('content detected')) {
      await logSecurityEvent(supabase, 'malicious_file_upload_detected', {
        endpoint: 'save-user-upload',
        error: error.message,
        user_agent: req.headers.get('user-agent'),
        user_id: rawRequest?.userId
      }, rawRequest?.userId, 'high')
    }
    
    const errorResponse = getSecureErrorResponse(error, 'save-user-upload')
    
    return new Response(JSON.stringify({
      success: false,
      error: errorResponse.message
    }), {
      status: errorResponse.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);