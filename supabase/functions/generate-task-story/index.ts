import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyInfo, existingTitle, existingDescription, context } = await req.json();

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's OpenAI API key
    const { data: settings, error: settingsError } = await supabase
      .from('user_devsuite_settings')
      .select('openai_api_key_encrypted, preferred_model')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.openai_api_key_encrypted) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = settings.openai_api_key_encrypted;
    const model = settings.preferred_model || 'gpt-4';

    // Generate story using OpenAI
    const prompt = `You are an expert Agile coach helping to transform user input into proper agile user stories.

User Input/Requirements: ${storyInfo}
Context/Sprint: ${context}
${existingTitle ? `Current Title: ${existingTitle}` : ''}
${existingDescription ? `Current Description: ${existingDescription}` : ''}

Please generate TWO things:
1. A proper user story TITLE in the exact format: "As a [user type], I want [goal], so that [benefit]"
2. A detailed DESCRIPTION with acceptance criteria

Guidelines:
- The title MUST follow the standard agile format exactly
- The description should include specific, testable acceptance criteria
- Include technical considerations if applicable
- Make it actionable and measurable
- Focus on progress tracking (how will we know it's done?)

Respond with a JSON object containing exactly these two fields:
{
  "title": "As a [user], I want [goal], so that [benefit]",
  "description": "Detailed story description with acceptance criteria..."
}

Important: Respond ONLY with valid JSON, no additional text or formatting.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are an expert Agile coach. Always respond with valid JSON containing title and description fields.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const data = await openAIResponse.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    // Try to parse JSON response
    let result;
    try {
      result = JSON.parse(content);
      if (!result.title || !result.description) {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      // Fallback: create structured response from raw content
      const lines = content.split('\n').filter(line => line.trim());
      const titleLine = lines.find(line => line.toLowerCase().includes('as a')) || 
                       `As a user, I want ${storyInfo}, so that I can achieve my goals`;
      
      result = {
        title: titleLine,
        description: content
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-task-story function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});