
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  cvText: string;
  jobDescriptionText: string;
  jobTitle?: string;
  userId: string;
}

interface AIAnalysisResult {
  compatibilityScore: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  executiveSummary: string;
  skillsGapAnalysis: {
    category: string;
    missing: string[];
    suggestions: string[];
  }[];
  atsOptimization: string[];
  interviewPrep: string[];
}

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

    console.log('Starting AI analysis for user:', userId);

    // Check and deduct user credits
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (creditsError || !userCredits || userCredits.credits < 1) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits for AI analysis' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the AI prompt
    const prompt = `
You are an expert CV analysis assistant. Analyze the following CV against the job description and provide a comprehensive analysis.

CV Content:
${cvText}

Job Description:
${jobDescriptionText}

Job Title: ${jobTitle || 'Not specified'}

Please provide a detailed analysis in the following JSON format (ensure it's valid JSON):
{
  "compatibilityScore": number (0-100),
  "keywordsFound": ["keyword1", "keyword2", ...],
  "keywordsMissing": ["missing1", "missing2", ...],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "executiveSummary": "Brief 2-3 sentence summary",
  "skillsGapAnalysis": [
    {
      "category": "Technical Skills",
      "missing": ["skill1", "skill2"],
      "suggestions": ["Learn X", "Practice Y"]
    }
  ],
  "atsOptimization": ["tip1", "tip2", "tip3"],
  "interviewPrep": ["prep1", "prep2", "prep3"]
}

Focus on:
1. Compatibility scoring based on skills, experience, and requirements match
2. Identify specific keywords from job description that are present/missing in CV
3. Provide actionable recommendations for improvement
4. Skills gap analysis by category (technical, soft skills, experience)
5. ATS optimization tips
6. Interview preparation suggestions based on gaps identified

Be specific and actionable in your recommendations.
`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert CV analyst. Always respond with valid JSON only, no additional text or formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponseText = openAIData.choices[0].message.content;
    
    console.log('Raw AI response:', aiResponseText);

    // Parse AI response
    let analysisResult: AIAnalysisResult;
    try {
      analysisResult = JSON.parse(aiResponseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Deduct credit after successful analysis
    const { error: creditUpdateError } = await supabase
      .from('user_credits')
      .update({ credits: userCredits.credits - 1 })
      .eq('user_id', userId);

    if (creditUpdateError) {
      console.error('Failed to update credits:', creditUpdateError);
    }

    console.log('AI analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        creditsRemaining: userCredits.credits - 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback: true // Indicates frontend should use basic analysis
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
