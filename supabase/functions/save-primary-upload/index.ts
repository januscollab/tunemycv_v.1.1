import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SavePrimaryUploadRequest {
  fileContent: string; // base64 encoded
  fileName: string;
  fileType: string;
  uploadType: 'cv' | 'job_description';
  userId: string;
  extractedText?: string;
  documentJson?: string; // pretty JSON string
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
    console.log('Step 1: Parsing request body...');
    const requestBody: SavePrimaryUploadRequest = await req.json();
    const { fileContent, fileName, fileType, uploadType, userId, extractedText, documentJson } = requestBody;
    
    console.log(`Step 2: Processing ${uploadType} upload for user ${userId}, file: ${fileName}, type: ${fileType}`);

    // Validate and convert base64 to binary
    console.log('Step 3: Converting base64 to binary...');
    if (!fileContent || fileContent.length === 0) {
      throw new Error('File content is empty or invalid');
    }
    
    const binaryData = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
    console.log(`Step 4: Binary conversion successful - ${binaryData.byteLength} bytes`);
    
    // Validate file size
    if (binaryData.byteLength === 0) {
      throw new Error('Converted file is empty');
    }
    
    if (binaryData.byteLength > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('File size exceeds 50MB limit');
    }

    // Save to main uploads table with extracted content
    console.log('Step 5: Inserting into uploads table...');
    
    // Parse JSON string if provided
    let parsedDocumentJson = null;
    if (documentJson) {
      try {
        parsedDocumentJson = JSON.parse(documentJson);
      } catch (error) {
        console.warn('Failed to parse document JSON, continuing without it:', error);
      }
    }
    
    const { data: uploadData, error: uploadError } = await supabase
      .from('uploads')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_type: fileType,
        file_size: binaryData.byteLength,
        upload_type: uploadType,
        processing_status: extractedText ? 'completed' : 'uploaded',
        original_file_content: binaryData,
        extracted_text: extractedText || null,
        document_content_json: parsedDocumentJson
      })
      .select('id')
      .single();

    if (uploadError) {
      console.error('Upload table insert failed:', uploadError);
      throw new Error(`Failed to save upload record: ${uploadError.message}`);
    }

    console.log(`Step 6: Upload record created successfully with ID: ${uploadData.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      uploadId: uploadData.id,
      fileName: fileName,
      fileSize: binaryData.byteLength,
      message: 'File saved successfully to uploads table'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
      
  } catch (error: any) {
    console.error('Save primary upload error:', error);
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