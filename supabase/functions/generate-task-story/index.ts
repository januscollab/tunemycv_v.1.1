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
    const { title, existingDescription, context } = await req.json();

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
    const prompt = `You are a product manager helping to write user stories for development tasks.

Task Title: ${title}
Context/Sprint: ${context}
${existingDescription ? `Existing Description: ${existingDescription}` : ''}

Please generate a clear, actionable user story or task description following these guidelines:
1. If it's a user-facing feature, use "As a [user type], I want [goal] so that [benefit]" format
2. If it's a technical task, provide clear implementation details and acceptance criteria
3. Include specific acceptance criteria as bullet points
4. Keep it concise but comprehensive
5. Focus on what needs to be delivered
6. Include progress tracking considerations - mention how completion can be measured
7. Add any dependencies or blockers that should be considered
8. Suggest metrics or success criteria where applicable

Format your response to include:
- Clear task description
- Acceptance criteria (bulleted)
- Progress tracking notes
- Any dependencies or considerations

Generate only the story/description text, no additional formatting or explanations.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful product manager assistant that writes clear, actionable user stories and task descriptions.' },
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
    const story = data.choices[0]?.message?.content;

    if (!story) {
      throw new Error('No story generated from OpenAI');
    }

    return new Response(JSON.stringify({ story }), {
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