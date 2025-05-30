
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
  atsOptimization: {
    overallScore: number;
    formatIssues: Array<{
      issue: string;
      impact: string;
      fix: string;
    }>;
    contentIssues: Array<{
      issue: string;
      impact: string;
      fix: string;
    }>;
    keywordDensity: {
      analysis: string;
      recommendation: string;
    };
    sectionRecommendations: {
      missing: string[];
      improvements: string[];
    };
  };
  interviewPrep: {
    likelyQuestions: Array<{
      question: string;
      rationale: string;
      preparationTips: string;
    }>;
    strengthsToEmphasize: Array<{
      strength: string;
      relevance: string;
      talkingPoints: string[];
    }>;
    weaknessesToAddress: Array<{
      weakness: string;
      strategy: string;
      talkingPoints: string[];
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
    'skillsGapAnalysis', 'atsOptimization', 'interviewPrep'
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

    console.log('Starting enhanced comprehensive AI analysis for user:', userId);

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

    // Enhanced comprehensive AI prompt with structured output
    const prompt = `
Analyze the following CV against the job description with extreme precision and attention to detail. Follow these specific guidelines:

1. RESPOND ONLY WITH VALID JSON in the exact structure specified below.
2. Extract the company name from the job description if available.
3. Provide a thorough, professional analysis focusing on actionable insights.
4. Consider industry standards, ATS compatibility, and current recruitment best practices.
5. Identify ALL relevant keywords from the job description without limitation.
6. Format the job title properly, capitalizing appropriate words.
7. Ensure all numerical scores are justified with specific evidence from the CV and job description.
8. Be specific and concrete in all recommendations - avoid generic advice.
9. For each gap identified, provide a specific example of how the candidate could address it.
10. Include sample text that could be used to update the CV for improved matching.
11. Maintain a constructive, professional tone throughout the analysis.
12. Do not fabricate or assume information not present in the provided documents.

CV:
${cvText}

Job Description:
${jobDescriptionText}

Position (if provided):
${jobTitle || 'Not specified'}

Respond with valid JSON in the following structure:
{
  "compatibilityScore": 0-100,
  "companyName": "Extracted company name from job description",
  "position": "Properly formatted job title",
  "executiveSummary": {
    "overview": "Brief 2-3 sentence summary of overall compatibility",
    "strengths": [
      {
        "title": "Key strength title",
        "description": "Detailed explanation with evidence from CV and job description",
        "relevance": 0-100
      }
    ],
    "weaknesses": [
      {
        "title": "Key weakness/gap title",
        "description": "Detailed explanation with evidence from CV and job description",
        "impact": 0-100,
        "recommendation": "Specific action to address this weakness"
      }
    ]
  },
  "compatibilityBreakdown": {
    "technicalSkills": {
      "score": 0-100,
      "present": ["List of technical skills found in CV that match job requirements"],
      "missing": ["List of technical skills required in job description but missing from CV"],
      "analysis": "Detailed analysis of technical skills match"
    },
    "experience": {
      "score": 0-100,
      "relevantExperience": ["List of relevant experience points from CV"],
      "missingExperience": ["List of experience requirements from job description not evidenced in CV"],
      "analysis": "Detailed analysis of experience match"
    },
    "education": {
      "score": 0-100,
      "relevantQualifications": ["List of relevant qualifications from CV"],
      "missingQualifications": ["List of qualification requirements from job description not evidenced in CV"],
      "analysis": "Detailed analysis of education and qualification match"
    },
    "softSkills": {
      "score": 0-100,
      "present": ["List of soft skills found in CV that match job requirements"],
      "missing": ["List of soft skills required in job description but missing from CV"],
      "analysis": "Detailed analysis of soft skills match"
    },
    "industryKnowledge": {
      "score": 0-100,
      "present": ["List of industry knowledge areas found in CV that match job requirements"],
      "missing": ["List of industry knowledge areas required in job description but missing from CV"],
      "analysis": "Detailed analysis of industry knowledge match"
    }
  },
  "keywordAnalysis": {
    "totalKeywords": 0,
    "matchedKeywords": 0,
    "keywordMatchPercentage": 0-100,
    "keywords": [
      {
        "keyword": "Actual keyword from job description",
        "found": true/false,
        "importance": "high/medium/low",
        "occurrences": 0,
        "context": "Brief context of how the keyword is used in the job description",
        "suggestion": "Suggestion for including or better utilizing this keyword"
      }
    ]
  },
  "priorityRecommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation of the recommendation",
      "priority": "high/medium/low",
      "impact": "Description of the expected impact of this change",
      "sampleText": "Example text that could be used in the CV"
    }
  ],
  "skillsGapAnalysis": {
    "criticalGaps": [
      {
        "skill": "Name of critical missing skill",
        "importance": "high/medium/low",
        "description": "Why this skill is important for the role",
        "bridgingStrategy": "Specific strategy to address or compensate for this gap"
      }
    ],
    "developmentAreas": [
      {
        "area": "Name of development area",
        "description": "Description of this development area",
        "relevance": "Why this area is relevant to the role",
        "actionPlan": "Specific actions to develop in this area"
      }
    ]
  },
  "atsOptimization": {
    "overallScore": 0-100,
    "formatIssues": [
      {
        "issue": "Description of format issue",
        "impact": "How this impacts ATS scanning",
        "fix": "How to fix this issue"
      }
    ],
    "contentIssues": [
      {
        "issue": "Description of content issue",
        "impact": "How this impacts ATS scanning",
        "fix": "How to fix this issue"
      }
    ],
    "keywordDensity": {
      "analysis": "Analysis of keyword density",
      "recommendation": "Recommendation for improving keyword density"
    },
    "sectionRecommendations": {
      "missing": ["List of recommended sections missing from CV"],
      "improvements": ["List of recommendations for existing sections"]
    }
  },
  "interviewPrep": {
    "likelyQuestions": [
      {
        "question": "Likely interview question based on job description and CV gaps",
        "rationale": "Why this question might be asked",
        "preparationTips": "How to prepare for this question"
      }
    ],
    "strengthsToEmphasize": [
      {
        "strength": "Strength to emphasize in interview",
        "relevance": "Why this is relevant to the position",
        "talkingPoints": ["Key talking points for this strength"]
      }
    ],
    "weaknessesToAddress": [
      {
        "weakness": "Potential weakness to address",
        "strategy": "Strategy for addressing this weakness",
        "talkingPoints": ["Key talking points for addressing this weakness"]
      }
    ]
  }
}

CRITICAL INSTRUCTIONS:
- Respond ONLY with valid JSON. No markdown formatting, explanations, or additional text outside the JSON.
- Provide a thorough, professional analysis suitable for career development.
- Focus on actionable insights and specific recommendations.
- Consider industry standards, ATS compatibility, and market expectations.
- Be comprehensive in your keyword analysis and include all relevant terms.
- Provide specific, measurable recommendations with concrete examples.
- Extract company name accurately from the job description.
- Format job title properly by removing any prefixes and making it user-readable.
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
                content: 'You are an expert CV analysis consultant with deep expertise in recruitment, ATS systems, and career development. Your task is to analyze a candidate\'s CV against a specific job description and provide detailed, actionable insights to help the candidate improve their chances of success. You have 15+ years of experience in talent acquisition across multiple industries and understand both the technical aspects of ATS systems and the human elements of the hiring process. Your analysis is known for being thorough, honest, and highly actionable. Always respond with valid JSON only, no additional text or formatting.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.2,
            max_tokens: 4000,
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
      console.log('Enhanced AI response successfully parsed and validated');
    } catch (parseError) {
      console.error('Failed to parse/validate enhanced AI response:', parseError);
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

    console.log('Enhanced comprehensive AI analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        creditsRemaining: userCredits.credits - 1
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
