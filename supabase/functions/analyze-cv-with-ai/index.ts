
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AnalysisRequest } from './types.ts';
import { callOpenAIAnalysis } from './openai.ts';
import { checkAndDeductCredits } from './credits.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { cvText, jobDescriptionText, jobTitle, userId }: AnalysisRequest = await req.json();

    console.log('Starting enhanced comprehensive AI analysis for user:', userId);

    // Check and deduct user credits
    const creditResult = await checkAndDeductCredits(userId, supabase);
    if (!creditResult.success) {
      return new Response(
        JSON.stringify({ error: creditResult.error }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenAI for analysis
    const analysisResult = await callOpenAIAnalysis(cvText, jobDescriptionText, jobTitle, openAIApiKey);

    console.log('Enhanced comprehensive AI analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        creditsRemaining: creditResult.remainingCredits
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhanced comprehensive AI analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback: true // Indicates frontend should use comprehensive algorithmic analysis
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
