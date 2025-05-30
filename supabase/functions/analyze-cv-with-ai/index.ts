
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
  compatibilityBreakdown: {
    category: string;
    score: number;
    weight: number;
    feedback: string;
  }[];
  keywordAnalysis: {
    keyword: string;
    importance: 'High' | 'Medium' | 'Low';
    present: 'Yes' | 'No' | 'Partial';
    context: string;
  }[];
  priorityRecommendations: {
    title: string;
    priority: number;
    actionItems: string[];
    example: string;
  }[];
}

// Function to clean and parse AI response
const cleanAndParseJSON = (response: string): any => {
  console.log('Raw AI response:', response);
  
  // Remove markdown code blocks if present
  let cleanedResponse = response.trim();
  
  // Remove ```json and ``` markers
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/^```json\s*/, '');
  }
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
  }
  if (cleanedResponse.endsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/\s*```$/, '');
  }
  
  console.log('Cleaned response:', cleanedResponse);
  
  try {
    return JSON.parse(cleanedResponse);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
  }
};

// Function to validate the parsed analysis result
const validateAnalysisResult = (result: any): AIAnalysisResult => {
  const requiredFields = [
    'compatibilityScore', 'keywordsFound', 'keywordsMissing', 
    'strengths', 'weaknesses', 'recommendations', 'executiveSummary'
  ];
  
  for (const field of requiredFields) {
    if (!(field in result)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Ensure arrays are actually arrays
  const arrayFields = ['keywordsFound', 'keywordsMissing', 'strengths', 'weaknesses', 'recommendations'];
  for (const field of arrayFields) {
    if (!Array.isArray(result[field])) {
      console.warn(`Converting ${field} to array`);
      result[field] = [];
    }
  }
  
  // Ensure compatibility score is a number
  if (typeof result.compatibilityScore !== 'number') {
    result.compatibilityScore = parseInt(result.compatibilityScore) || 0;
  }
  
  // Set defaults for optional AI fields
  result.skillsGapAnalysis = result.skillsGapAnalysis || [];
  result.atsOptimization = result.atsOptimization || [];
  result.interviewPrep = result.interviewPrep || [];
  result.compatibilityBreakdown = result.compatibilityBreakdown || [];
  result.keywordAnalysis = result.keywordAnalysis || [];
  result.priorityRecommendations = result.priorityRecommendations || [];
  
  return result as AIAnalysisResult;
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

    console.log('Starting comprehensive AI analysis for user:', userId);

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

    // Enhanced AI prompt for comprehensive analysis
    const prompt = `
You are an expert CV analysis consultant. Analyze this CV against the job description and provide a comprehensive evaluation.

CV Content:
${cvText}

Job Description:
${jobDescriptionText}

Position: ${jobTitle || 'Not specified'}

IMPORTANT: Respond ONLY with valid JSON. Do not include markdown formatting or additional text.

Provide your analysis in this exact JSON format:
{
  "compatibilityScore": number (0-100),
  "keywordsFound": ["keyword1", "keyword2"],
  "keywordsMissing": ["missing1", "missing2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "executiveSummary": "2-3 sentence professional summary with match level and overall assessment",
  "compatibilityBreakdown": [
    {
      "category": "Technical Skills",
      "score": number (1-10),
      "weight": number (percentage),
      "feedback": "specific assessment"
    },
    {
      "category": "Experience Level",
      "score": number (1-10),
      "weight": number (percentage),
      "feedback": "specific assessment"
    },
    {
      "category": "Industry Knowledge",
      "score": number (1-10),
      "weight": number (percentage),
      "feedback": "specific assessment"
    },
    {
      "category": "Soft Skills",
      "score": number (1-10),
      "weight": number (percentage),
      "feedback": "specific assessment"
    }
  ],
  "keywordAnalysis": [
    {
      "keyword": "specific skill/term",
      "importance": "High|Medium|Low",
      "present": "Yes|No|Partial",
      "context": "where found or why missing"
    }
  ],
  "priorityRecommendations": [
    {
      "title": "Priority recommendation title",
      "priority": number (1-4),
      "actionItems": ["specific action 1", "specific action 2"],
      "example": "Example implementation text"
    }
  ],
  "skillsGapAnalysis": [
    {
      "category": "Technical Skills",
      "missing": ["skill1", "skill2"],
      "suggestions": ["Learn X through Y", "Gain experience in Z"]
    }
  ],
  "atsOptimization": ["tip1", "tip2", "tip3"],
  "interviewPrep": ["prep1", "prep2", "prep3"]
}

Analysis Guidelines:
1. Executive Summary: Include overall compatibility percentage, match level (excellent/good/moderate/needs improvement), brief strengths/gaps summary, and position context
2. Compatibility Breakdown: Ensure weights add to 100%. Score categories: Technical Skills (30%), Experience Level (25%), Industry Knowledge (25%), Soft Skills (20%)
3. Keyword Analysis: Focus on both technical and soft skills. Mark importance based on job requirements frequency/emphasis
4. Priority Recommendations: Order by impact. Include specific, actionable steps with examples
5. Be specific and actionable in all feedback
6. Consider ATS compatibility and industry standards
7. Focus on both content and formatting improvements
`;

    console.log('Calling OpenAI API with enhanced prompt...');

    // Call OpenAI API with retry logic
    let openAIResponse;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: 'You are an expert CV consultant. Always respond with valid JSON only, no additional text or formatting. Never use markdown code blocks.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 3000,
          }),
        });

        if (openAIResponse.ok) {
          break;
        } else {
          console.error(`OpenAI API error (attempt ${attempts + 1}):`, openAIResponse.status);
          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error(`OpenAI API error: ${openAIResponse.status}`);
          }
        }
      } catch (error) {
        console.error(`OpenAI request failed (attempt ${attempts + 1}):`, error);
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
      }
    }

    const openAIData = await openAIResponse.json();
    const aiResponseText = openAIData.choices[0].message.content;
    
    console.log('OpenAI response received, length:', aiResponseText.length);

    // Parse and validate AI response
    let analysisResult: AIAnalysisResult;
    try {
      const parsedResult = cleanAndParseJSON(aiResponseText);
      analysisResult = validateAnalysisResult(parsedResult);
      console.log('AI response successfully parsed and validated');
    } catch (parseError) {
      console.error('Failed to parse/validate AI response:', parseError);
      throw new Error(`Invalid AI response format: ${parseError.message}`);
    }

    // Deduct credit after successful analysis
    const { error: creditUpdateError } = await supabase
      .from('user_credits')
      .update({ credits: userCredits.credits - 1 })
      .eq('user_id', userId);

    if (creditUpdateError) {
      console.error('Failed to update credits:', creditUpdateError);
    }

    console.log('Comprehensive AI analysis completed successfully');

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
