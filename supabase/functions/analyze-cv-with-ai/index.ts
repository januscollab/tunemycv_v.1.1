
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced content validation
const validateContent = (content: string, maxLength: number): { isValid: boolean; error?: string } => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Content is required and must be text' };
  }
  
  if (content.length > maxLength) {
    return { isValid: false, error: `Content exceeds maximum length of ${maxLength} characters` };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /<iframe[\s\S]*?>/gi,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      return { isValid: false, error: 'Content contains potentially malicious code' };
    }
  }
  
  return { isValid: true };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { cvText, jobDescription } = await req.json();

    // Enhanced input validation
    const cvValidation = validateContent(cvText, 50000); // 50KB limit
    if (!cvValidation.isValid) {
      return new Response(JSON.stringify({ error: `CV validation failed: ${cvValidation.error}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jobValidation = validateContent(jobDescription, 25000); // 25KB limit
    if (!jobValidation.isValid) {
      return new Response(JSON.stringify({ error: `Job description validation failed: ${jobValidation.error}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check combined content length
    if (cvText.length + jobDescription.length > 60000) {
      return new Response(JSON.stringify({ error: 'Combined content exceeds maximum analysis limit' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user credits
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (creditsError || !userCredits || userCredits.credits < 1) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Proceed with OpenAI analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert CV analyzer and career counselor. Analyze the CV against the job description and provide detailed insights in JSON format.'
          },
          {
            role: 'user',
            content: `Please analyze this CV against the job description and provide a detailed analysis.

CV Content:
${cvText}

Job Description:
${jobDescription}

Please provide your analysis in JSON format with the following structure:
{
  "compatibility_score": number (0-100),
  "executive_summary": "string",
  "strengths": ["array of strings"],
  "weaknesses": ["array of strings"],
  "recommendations": ["array of strings"],
  "keywords_found": [{"keyword": "string", "relevance": "high|medium|low"}],
  "keywords_missing": [{"keyword": "string", "importance": "high|medium|low"}]
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisResult = data.choices[0].message.content;

    // Parse the JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(analysisResult);
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'Failed to parse analysis result' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits in a transaction
    const { error: deductError } = await supabase
      .from('user_credits')
      .update({ credits: userCredits.credits - 1 })
      .eq('user_id', user.id);

    if (deductError) {
      console.error('Failed to deduct credits:', deductError);
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-cv-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
