// This file exists to prevent deployment errors when the shared directory
// is mistakenly treated as an Edge Function during deployment.
// 
// The shared directory contains utility modules that should be imported
// by other Edge Functions, not deployed as a standalone function.
//
// If you're seeing this deployed as a function, please check your
// deployment configuration to exclude the 'shared' directory.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  return new Response(
    JSON.stringify({
      error: 'This is a shared utility directory, not a deployable Edge Function',
      message: 'The shared directory contains utility modules for other Edge Functions',
      availableModules: [
        'adobe-text-formatter.ts',
        'fileNaming.ts', 
        'security.ts'
      ]
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
});