
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract the PDF URL from query parameters
    const url = new URL(req.url);
    const pdfUrl = url.searchParams.get('url');
    
    if (!pdfUrl) {
      return new Response('Missing PDF URL parameter', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log('Proxying PDF URL:', pdfUrl);

    // Fetch the PDF from the original URL
    const pdfResponse = await fetch(pdfUrl);
    
    if (!pdfResponse.ok) {
      console.error('Failed to fetch PDF:', pdfResponse.status, pdfResponse.statusText);
      return new Response('Failed to fetch PDF', { 
        status: pdfResponse.status,
        headers: corsHeaders 
      });
    }

    // Get the PDF content
    const pdfContent = await pdfResponse.arrayBuffer();
    
    // Return the PDF with proper CORS headers
    return new Response(pdfContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Length': pdfContent.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error in pdf-proxy function:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
