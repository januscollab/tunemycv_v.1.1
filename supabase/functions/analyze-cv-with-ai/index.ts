
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

    // Enhanced comprehensive AI prompt - removed keyword limits
    const prompt = `
You are an expert CV analysis consultant with deep expertise in recruitment, ATS systems, and career development. Analyze this CV against the job description and provide a comprehensive evaluation report.

CV Content:
${cvText}

Job Description:
${jobDescriptionText}

Position: ${jobTitle || 'Not specified'}

CRITICAL INSTRUCTIONS:
- Respond ONLY with valid JSON. No markdown formatting, explanations, or additional text outside the JSON.
- Provide a thorough, professional analysis suitable for career development.
- Focus on actionable insights and specific recommendations.
- Consider industry standards, ATS compatibility, and market expectations.
- Return ALL relevant keywords found and missing - do not limit the number of keywords.
- Provide comprehensive keyword analysis covering technical skills, soft skills, industry terms, and job-specific terminology.

Required JSON structure:
{
  "compatibilityScore": number (0-100),
  "executiveSummary": "Professional 3-4 sentence summary including overall compatibility percentage, match level (excellent/good/moderate/needs improvement), brief strengths/gaps overview, and position-specific context",
  "strengths": ["strength1", "strength2", "strength3", "strength4", "strength5", "strength6"],
  "weaknesses": ["area1", "area2", "area3", "area4", "area5", "area6"],
  "compatibilityBreakdown": [
    {
      "category": "Technical Skills & Experience",
      "score": number (1-10),
      "weight": 35,
      "feedback": "Detailed assessment of technical capabilities and relevant experience"
    },
    {
      "category": "Leadership & Management",
      "score": number (1-10),
      "weight": 25,
      "feedback": "Assessment of leadership experience and management capabilities"
    },
    {
      "category": "Industry Knowledge",
      "score": number (1-10),
      "weight": 25,
      "feedback": "Evaluation of sector-specific knowledge and understanding"
    },
    {
      "category": "Communication & Soft Skills",
      "score": number (1-10),
      "weight": 15,
      "feedback": "Assessment of interpersonal and communication abilities"
    }
  ],
  "keywordAnalysis": [
    {
      "keyword": "specific technical or soft skill term",
      "importance": "High|Medium|Low",
      "present": "Yes|No|Partial",
      "context": "Where found in CV or why it's missing and important"
    }
  ],
  "keywordsFound": ["ALL found keywords - include technical skills, soft skills, industry terms, certifications, methodologies, tools, frameworks, etc."],
  "keywordsMissing": ["ALL missing important keywords from job description - include technical skills, soft skills, industry terms, certifications, methodologies, tools, frameworks, etc."],
  "priorityRecommendations": [
    {
      "title": "High-impact recommendation title",
      "priority": 1,
      "actionItems": ["Specific action 1", "Specific action 2", "Specific action 3"],
      "example": "Concrete example of how to implement this recommendation"
    },
    {
      "title": "Important improvement area",
      "priority": 2,
      "actionItems": ["Specific action 1", "Specific action 2"],
      "example": "Practical implementation example"
    },
    {
      "title": "Additional enhancement",
      "priority": 3,
      "actionItems": ["Specific action 1", "Specific action 2"],
      "example": "Implementation guidance"
    },
    {
      "title": "ATS Optimization",
      "priority": 4,
      "actionItems": ["Specific action 1", "Specific action 2"],
      "example": "Implementation guidance"
    }
  ],
  "skillsGapAnalysis": [
    {
      "category": "Technical Skills",
      "missing": ["skill1", "skill2", "skill3", "skill4"],
      "suggestions": ["Learn X through online courses", "Gain experience by volunteering for Y projects", "Complete certification in Z"]
    },
    {
      "category": "Certifications",
      "missing": ["cert1", "cert2", "cert3"],
      "suggestions": ["Pursue certification in X", "Complete training in Y", "Attend workshop on Z"]
    },
    {
      "category": "Soft Skills",
      "missing": ["skill1", "skill2"],
      "suggestions": ["Develop X through practice", "Improve Y through training"]
    }
  ],
  "atsOptimization": [
    "Use exact keywords from job description throughout CV",
    "Add comprehensive technical skills section with all relevant technologies",
    "Include quantifiable achievements with specific metrics",
    "Optimize section headers for ATS scanning (Skills, Experience, Education)",
    "Use industry-standard terminology and acronyms",
    "Add relevant certifications and training clearly",
    "Format consistently for machine readability"
  ],
  "interviewPrep": [
    "Prepare specific examples demonstrating X experience with quantifiable results",
    "Research company's Y initiatives and recent developments",
    "Practice explaining Z technical concepts in business terms",
    "Prepare thoughtful questions about team structure, growth opportunities, and challenges",
    "Review industry trends and how they impact this role",
    "Prepare STAR method examples for key competencies",
    "Research interviewer backgrounds and company culture"
  ],
  "recommendations": ["Overall comprehensive recommendation 1", "Overall comprehensive recommendation 2", "Overall comprehensive recommendation 3", "Overall comprehensive recommendation 4", "Overall comprehensive recommendation 5"]
}

Analysis Guidelines:
1. **Comprehensive Keyword Analysis**: Include ALL relevant keywords from the job description - technical skills, soft skills, industry terminology, tools, frameworks, methodologies, certifications, etc. Do not limit the number.
2. **Executive Summary**: Include specific compatibility percentage, clear match level assessment, concise strengths/gaps summary, and role-specific context
3. **Compatibility Breakdown**: Ensure weights total 100%. Provide detailed, actionable feedback for each category
4. **Priority Recommendations**: Order by potential impact. Include specific, measurable action items with practical examples
5. **Skills Gap Analysis**: Identify ALL missing skills across multiple categories and provide concrete learning pathways
6. **ATS Optimization**: Focus on comprehensive formatting and keyword optimization strategies
7. **Interview Prep**: Provide role-specific preparation strategies with actionable steps
8. **Be comprehensive and actionable**: Provide detailed analysis covering all aspects. Tailor all feedback to the specific role and industry
9. **Consider career level**: Adjust expectations and recommendations based on seniority level indicated in job description
10. **Industry context**: Factor in industry-specific requirements and current market standards

Ensure all feedback is professional, constructive, and focused on helping the candidate significantly improve their application success rate.
`;

    console.log('Calling OpenAI API with enhanced comprehensive prompt...');

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
                content: 'You are an expert CV consultant and career advisor. Always respond with valid JSON only, no additional text or formatting. Never use markdown code blocks. Provide comprehensive, actionable analysis with complete keyword coverage.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.2,
            max_tokens: 4000,
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
    console.error('Error in comprehensive AI analysis:', error);
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
