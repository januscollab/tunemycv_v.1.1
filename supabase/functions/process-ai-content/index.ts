
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIContentRequest {
  selectedText: string;
  action: {
    type: 'rephrase' | 'improve' | 'adjust_length' | 'role_specific';
    subType?: string;
  };
  context?: string;
  temperature?: number;
}

function generatePrompt(selectedText: string, action: AIContentRequest['action']): string {
  const baseContext = `You are a professional writing assistant. Your task is to modify the given text according to the specific instructions. Return ONLY the modified text without any explanations, quotes, or additional commentary.

Original text: "${selectedText}"

Instructions:`;

  switch (action.type) {
    case 'rephrase':
      switch (action.subType) {
        case 'professional':
          return `${baseContext} Transform this text to use formal, polished business language. Make it sound more professional and authoritative while maintaining the core meaning.`;
        case 'conversational':
          return `${baseContext} Simplify and humanize the tone. Make it sound more casual, approachable, and conversational while keeping the key information.`;
        case 'creative':
          return `${baseContext} Add flair, storytelling elements, or creative language. Make it more engaging and unique while preserving the main message.`;
        case 'structured':
          return `${baseContext} Improve sentence order, flow, and logical structure. Reorganize for better clarity and coherence.`;
        default:
          return `${baseContext} Rephrase this text to improve clarity and readability while maintaining the original meaning.`;
      }
    
    case 'improve':
      return `${baseContext} Refine grammar, remove ambiguity, and improve overall clarity. Fix any grammatical errors and make the text more precise and well-written.`;
    
    case 'adjust_length':
      switch (action.subType) {
        case 'longer':
          return `${baseContext} Expand this content with more detail, examples, or supporting information. Make it significantly longer while staying relevant.`;
        case 'shorter':
          return `${baseContext} Trim this content to its core message. Remove unnecessary words and make it more concise while preserving the key points.`;
        case 'summarize':
          return `${baseContext} Provide a 1-2 sentence summary that captures the essence of this text.`;
        case 'expand_example':
          return `${baseContext} Add a real-world example, case study, or specific result to illustrate the point being made.`;
        default:
          return `${baseContext} Adjust the length appropriately to improve readability.`;
      }
    
    case 'role_specific':
      return `${baseContext} Tailor the tone and keywords to be more specific to a professional job role. Use industry-appropriate language and terminology that would resonate with hiring managers.`;
    
    default:
      return `${baseContext} Improve this text for better clarity and impact.`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { selectedText, action, context, temperature = 0.7 }: AIContentRequest = await req.json();

    if (!selectedText || selectedText.trim().length < 10) {
      throw new Error('Selected text must be at least 10 characters long');
    }

    // Ensure temperature is within valid range (0.0 to 2.0)
    const validTemperature = Math.max(0.0, Math.min(2.0, temperature));

    console.log(`Processing AI content with temperature: ${validTemperature}`);

    const prompt = generatePrompt(selectedText, action);

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
            content: 'You are a professional writing assistant. Always return ONLY the modified text without explanations, quotes, or commentary.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: validTemperature,
        max_tokens: Math.max(selectedText.length * 2, 500),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let generatedText = data.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      throw new Error('No content generated from OpenAI');
    }

    // Remove surrounding quotes if present
    if ((generatedText.startsWith('"') && generatedText.endsWith('"')) ||
        (generatedText.startsWith("'") && generatedText.endsWith("'"))) {
      generatedText = generatedText.slice(1, -1);
    }

    return new Response(JSON.stringify({ 
      originalText: selectedText,
      processedText: generatedText,
      action,
      temperature: validTemperature
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-ai-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred processing your request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
