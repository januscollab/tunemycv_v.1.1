
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

interface EnhancedAIAnalysisResult {
  compatibilityScore: number;
  companyName: string;
  position: string;
  executiveSummary: {
    overview: string;
    strengths: Array<{
      title: string;
      description: string;
      relevance: number;
    }>;
    weaknesses: Array<{
      title: string;
      description: string;
      impact: number;
      recommendation: string;
    }>;
  };
  compatibilityBreakdown: {
    technicalSkills: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
    };
    experience: {
      score: number;
      relevantExperience: string[];
      missingExperience: string[];
      analysis: string;
    };
    education: {
      score: number;
      relevantQualifications: string[];
      missingQualifications: string[];
      analysis: string;
    };
    softSkills: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
    };
    industryKnowledge: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
    };
  };
  keywordAnalysis: {
    totalKeywords: number;
    matchedKeywords: number;
    keywordMatchPercentage: number;
    keywords: Array<{
      keyword: string;
      found: boolean;
      importance: 'high' | 'medium' | 'low';
      occurrences: number;
      context: string;
      suggestion: string;
    }>;
  };
  priorityRecommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    sampleText: string;
  }>;
  skillsGapAnalysis: {
    criticalGaps: Array<{
      skill: string;
      importance: 'high' | 'medium' | 'low';
      description: string;
      bridgingStrategy: string;
    }>;
    developmentAreas: Array<{
      area: string;
      description: string;
      relevance: string;
      actionPlan: string;
    }>;
  };
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
const validateEnhancedAnalysisResult = (result: any): EnhancedAIAnalysisResult => {
  const requiredFields = [
    'compatibilityScore', 'companyName', 'position', 'executiveSummary',
    'compatibilityBreakdown', 'keywordAnalysis', 'priorityRecommendations',
    'skillsGapAnalysis'
  ];
  
  for (const field of requiredFields) {
    if (!(field in result)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Ensure compatibility score is a number
  if (typeof result.compatibilityScore !== 'number') {
    result.compatibilityScore = parseInt(result.compatibilityScore) || 0;
  }
  
  // Set defaults for missing nested structures
  if (!result.executiveSummary.strengths) result.executiveSummary.strengths = [];
  if (!result.executiveSummary.weaknesses) result.executiveSummary.weaknesses = [];
  if (!result.keywordAnalysis.keywords) result.keywordAnalysis.keywords = [];
  if (!result.priorityRecommendations) result.priorityRecommendations = [];
  if (!result.skillsGapAnalysis.criticalGaps) result.skillsGapAnalysis.criticalGaps = [];
  if (!result.skillsGapAnalysis.developmentAreas) result.skillsGapAnalysis.developmentAreas = [];
  
  return result as EnhancedAIAnalysisResult;
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

    console.log('Starting enhanced AI analysis for user:', userId);

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

    // Enhanced comprehensive AI prompt with CV improvement suggestions and learning resources
    const prompt = `
You are a senior career consultant and CV optimization expert. Analyze the CV against the job description and provide detailed insights with specific improvement suggestions and learning resources.

CRITICAL REQUIREMENTS:
1. Provide 3-7 detailed items for each analysis section
2. Include specific CV improvement text suggestions for missing items
3. Generate actual learning resources with real URLs when possible
4. Extract 20-30 relevant keywords from the job description
5. Respond ONLY with valid JSON in the exact structure below

CV TO ANALYZE:
${cvText}

JOB DESCRIPTION:
${jobDescriptionText}

POSITION: ${jobTitle || 'Not specified'}

RESPOND WITH ANALYSIS IN THIS EXACT JSON STRUCTURE:
{
  "compatibilityScore": 0-100,
  "companyName": "Company name from job description",
  "position": "Job title",
  "executiveSummary": {
    "overview": "3-4 sentence overview of compatibility",
    "strengths": [
      {
        "title": "Strength title",
        "description": "Detailed 2-3 sentence explanation with specific examples",
        "relevance": 0-100
      }
    ],
    "weaknesses": [
      {
        "title": "Weakness/gap title",
        "description": "Detailed explanation with evidence",
        "impact": 0-100,
        "recommendation": "Specific actionable strategy to address"
      }
    ]
  },
  "compatibilityBreakdown": {
    "technicalSkills": {
      "score": 0-100,
      "present": ["Technical skills found in CV"],
      "missing": ["Required technical skills missing"],
      "analysis": "Detailed analysis of technical alignment",
      "suggestions": ["Specific text to add to CV for each missing skill"]
    },
    "experience": {
      "score": 0-100,
      "relevantExperience": ["Relevant experience from CV"],
      "missingExperience": ["Required experience missing"],
      "analysis": "Analysis of experience match",
      "suggestions": ["Specific experience descriptions to add to CV"]
    },
    "education": {
      "score": 0-100,
      "relevantQualifications": ["Relevant qualifications"],
      "missingQualifications": ["Missing qualifications"],
      "analysis": "Educational background analysis",
      "suggestions": ["How to present education/certifications in CV"]
    },
    "softSkills": {
      "score": 0-100,
      "present": ["Soft skills demonstrated"],
      "missing": ["Required soft skills missing"],
      "analysis": "Soft skills assessment",
      "suggestions": ["Examples of how to demonstrate soft skills in CV"]
    },
    "industryKnowledge": {
      "score": 0-100,
      "present": ["Industry knowledge areas"],
      "missing": ["Missing industry knowledge"],
      "analysis": "Industry expertise analysis",
      "suggestions": ["Industry-specific terms and knowledge to include"]
    }
  },
  "keywordAnalysis": {
    "totalKeywords": 20-30,
    "matchedKeywords": 0-30,
    "keywordMatchPercentage": 0-100,
    "keywords": [
      {
        "keyword": "Keyword from job description",
        "found": true/false,
        "importance": "high/medium/low",
        "occurrences": 0,
        "context": "Why this keyword is important for the role",
        "suggestion": "Specific advice on how to incorporate or optimize this keyword"
      }
    ]
  },
  "priorityRecommendations": [
    {
      "title": "Recommendation title",
      "description": "Comprehensive explanation and rationale",
      "priority": "high/medium/low",
      "impact": "Expected impact description",
      "sampleText": "Ready-to-use text example for CV"
    }
  ],
  "skillsGapAnalysis": {
    "criticalGaps": [
      {
        "skill": "Critical skill missing",
        "importance": "high/medium/low",
        "description": "Why this skill is essential",
        "bridgingStrategy": "How to acquire this skill",
        "learningResources": [
          {
            "title": "Course or resource name",
            "provider": "Platform or institution",
            "url": "Actual URL when possible",
            "type": "course/certification/documentation/book",
            "duration": "Time estimate",
            "level": "beginner/intermediate/advanced"
          }
        ]
      }
    ],
    "developmentAreas": [
      {
        "area": "Development area",
        "description": "Development opportunity explanation",
        "relevance": "Relevance to role success",
        "actionPlan": "Specific development plan",
        "learningResources": [
          {
            "title": "Learning resource",
            "provider": "Provider name",
            "url": "Resource URL",
            "type": "course/certification/documentation/book",
            "duration": "Estimated duration",
            "level": "difficulty level"
          }
        ]
      }
    ]
  }
}

SPECIFIC INSTRUCTIONS:
- RESPOND ONLY WITH VALID JSON
- PROVIDE 3-7 ITEMS for strengths, weaknesses, recommendations, critical gaps, and development areas
- EXTRACT 20-30+ KEYWORDS with strategic importance (include both found and missing)
- INCLUDE SPECIFIC CV TEXT SUGGESTIONS for missing items
- PROVIDE REAL LEARNING RESOURCES with actual URLs when possible (Coursera, LinkedIn Learning, AWS, Google, Microsoft, etc.)
- FOCUS ON ACTIONABLE INSIGHTS with specific evidence
- MAINTAIN PROFESSIONAL TONE while being honest about gaps
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
                content: 'You are a senior career consultant providing comprehensive CV analysis with specific improvement suggestions and learning resources. Always respond with valid JSON only, no additional text.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.2,
            max_tokens: 8000,
            response_format: { type: "json_object" }
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
    
    console.log('Enhanced OpenAI response received, length:', aiResponseText.length);

    // Parse and validate AI response
    let analysisResult: EnhancedAIAnalysisResult;
    try {
      const parsedResult = cleanAndParseJSON(aiResponseText);
      analysisResult = validateEnhancedAnalysisResult(parsedResult);
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

    console.log('Enhanced AI analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        creditsRemaining: userCredits.credits - 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhanced AI analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback: true
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
