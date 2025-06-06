import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    const fileType = file.type;
    const fileName = file.name;
    const fileSize = file.size;
    
    console.log(`Processing file: ${fileName}, type: ${fileType}, size: ${fileSize}`);

    let extractedText = '';
    let metadata = {
      fileName,
      fileType,
      fileSize,
      extractionMethod: '',
      pageCount: 0,
      wordCount: 0
    };

    if (fileType === 'application/pdf') {
      // Extract text from PDF
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      try {
        // Use pdf-parse library for text extraction
        const { default: pdfParse } = await import('https://esm.sh/pdf-parse@1.1.1');
        const pdfData = await pdfParse(uint8Array);
        
        extractedText = pdfData.text;
        metadata.extractionMethod = 'pdf-parse';
        metadata.pageCount = pdfData.numpages;
        metadata.wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
        
        console.log(`PDF extraction successful: ${metadata.pageCount} pages, ${metadata.wordCount} words`);
      } catch (pdfError) {
        console.error('PDF extraction failed:', pdfError);
        throw new Error(`Failed to extract text from PDF: ${pdfError.message}`);
      }
      
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Extract text from DOCX
      const arrayBuffer = await file.arrayBuffer();
      
      try {
        // Use mammoth library for DOCX text extraction
        const { default: mammoth } = await import('https://esm.sh/mammoth@1.6.0');
        const result = await mammoth.extractRawText({ arrayBuffer });
        
        extractedText = result.value;
        metadata.extractionMethod = 'mammoth';
        metadata.wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
        
        console.log(`DOCX extraction successful: ${metadata.wordCount} words`);
        
        if (result.messages && result.messages.length > 0) {
          console.log('DOCX extraction warnings:', result.messages);
        }
      } catch (docxError) {
        console.error('DOCX extraction failed:', docxError);
        throw new Error(`Failed to extract text from DOCX: ${docxError.message}`);
      }
      
    } else if (fileType === 'text/plain') {
      // Handle plain text files
      extractedText = await file.text();
      metadata.extractionMethod = 'direct-text';
      metadata.wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
      
    } else {
      throw new Error(`Unsupported file type: ${fileType}. Supported types: PDF, DOCX, TXT`);
    }

    // Validate extracted content
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text content could be extracted from the file');
    }

    if (extractedText.length > 500000) { // 500KB text limit
      console.log(`Text content truncated from ${extractedText.length} to 500000 characters`);
      extractedText = extractedText.substring(0, 500000);
      metadata.wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
    }

    // Clean up the extracted text
    const cleanedText = extractedText
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
      .trim();

    const response = {
      success: true,
      extractedText: cleanedText,
      metadata,
      timestamp: new Date().toISOString()
    };

    console.log(`Text extraction completed successfully for ${fileName}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-document-text function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});