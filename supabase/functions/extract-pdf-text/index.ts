import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractPDFRequest {
  fileData: string; // base64 encoded PDF
  fileName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileData, fileName }: ExtractPDFRequest = await req.json()

    if (!fileData || !fileName) {
      throw new Error('File data and file name are required')
    }

    // Decode base64 to get PDF buffer
    const pdfBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0))
    
    // Simple text extraction using basic PDF parsing
    // This is a fallback method - more robust than client-side for some cases
    let extractedText = ''
    
    try {
      // Convert buffer to text representation for basic text extraction
      const textDecoder = new TextDecoder('utf-8', { fatal: false })
      const rawText = textDecoder.decode(pdfBuffer)
      
      // Extract readable text between stream objects and clean it up
      const textMatches = rawText.match(/BT\s*(.*?)\s*ET/gs) || []
      const streamMatches = rawText.match(/stream\s*(.*?)\s*endstream/gs) || []
      
      // Combine text from different extraction methods
      const allMatches = [...textMatches, ...streamMatches]
      
      for (const match of allMatches) {
        // Basic text cleaning and extraction
        const cleanMatch = match
          .replace(/BT|ET|stream|endstream/g, '')
          .replace(/[()]/g, '')
          .replace(/Tj|TJ|Td|TD|Tm|T\*/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s\-.,!?@#$%^&*()+={}[\]:;"'<>\/\\|`~]/g, '')
          .trim()
        
        if (cleanMatch.length > 3) { // Only add meaningful text
          extractedText += cleanMatch + ' '
        }
      }
      
      // If no text found using streams, try simple string extraction
      if (extractedText.trim().length === 0) {
        // Look for readable ASCII text in the PDF
        const asciiText = rawText.replace(/[^\x20-\x7E\n\r\t]/g, '')
        const words = asciiText.match(/[a-zA-Z]{2,}/g) || []
        
        if (words.length > 10) {
          extractedText = words.join(' ')
        }
      }
      
    } catch (error) {
      console.error('PDF text extraction error:', error)
      throw new Error('Failed to extract text from PDF file')
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,!?@#$%^&*()+={}[\]:;"'<>\/\\|`~]/g, ' ')
      .trim()
    
    if (extractedText.length < 10) {
      throw new Error('Could not extract readable text from this PDF. The file may be image-based or corrupted.')
    }
    
    console.log(`Successfully extracted ${extractedText.split(' ').length} words from ${fileName}`)
    
    return new Response(
      JSON.stringify({
        success: true,
        extractedText,
        fileName,
        wordCount: extractedText.split(' ').length,
        processingMethod: 'server-side-fallback'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
    
  } catch (error) {
    console.error('Server-side PDF extraction failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to extract text from PDF',
        processingMethod: 'server-side-fallback'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})