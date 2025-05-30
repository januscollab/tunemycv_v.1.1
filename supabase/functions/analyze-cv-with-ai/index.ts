
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

    // Enhanced comprehensive AI prompt with structured output and multi-item requirements
    const prompt = `
Analyze the following CV against the job description with extreme precision and provide a COMPREHENSIVE, multi-faceted analysis. You are an expert career consultant with 15+ years of experience across multiple industries.

CRITICAL REQUIREMENTS FOR COMPREHENSIVE ANALYSIS:
1. RESPOND ONLY WITH VALID JSON in the exact structure specified below.
2. PROVIDE MULTIPLE ITEMS (3-7) for all key analysis sections - this is essential for thorough analysis.
3. Be thorough, specific, and actionable in ALL recommendations.
4. Extract the company name from the job description if available.
5. Consider industry standards, ATS compatibility, and current recruitment best practices.
6. Identify ALL relevant keywords from the job description comprehensively.
7. Ensure all numerical scores are justified with specific evidence.
8. For each gap identified, provide specific strategies and examples.
9. Include concrete sample text for CV improvements.
10. Maintain professional career consulting depth throughout.

COMPREHENSIVE ANALYSIS REQUIREMENTS:
- Executive Summary: Provide 3-5 key strengths AND 3-5 key weaknesses with detailed analysis
- Priority Recommendations: List 5-7 actionable recommendations ranked by impact
- Skills Gap Analysis: Identify 3-5 critical gaps AND 3-5 development areas
- Interview Prep: Generate 5-7 likely questions with comprehensive preparation guidance
- Keyword Analysis: Analyze ALL relevant keywords comprehensively (typically 10-20+ keywords)
- ATS Optimization: Provide multiple format and content improvement suggestions

CV:
${cvText}

Job Description:
${jobDescriptionText}

Position (if provided):
${jobTitle || 'Not specified'}

Respond with valid JSON in the following structure (ENSURE MULTIPLE ITEMS IN ALL ARRAYS):
{
  "compatibilityScore": 0-100,
  "companyName": "Extracted company name from job description",
  "position": "Properly formatted job title",
  "executiveSummary": {
    "overview": "Comprehensive 3-4 sentence summary of overall compatibility and key findings",
    "strengths": [
      {
        "title": "First key strength title",
        "description": "Detailed explanation with specific evidence from CV and job requirements",
        "relevance": 0-100
      },
      {
        "title": "Second key strength title",
        "description": "Detailed explanation with specific evidence from CV and job requirements",
        "relevance": 0-100
      },
      {
        "title": "Third key strength title",
        "description": "Detailed explanation with specific evidence from CV and job requirements",
        "relevance": 0-100
      },
      {
        "title": "Fourth key strength title",
        "description": "Detailed explanation with specific evidence from CV and job requirements",
        "relevance": 0-100
      }
    ],
    "weaknesses": [
      {
        "title": "First key weakness/gap title",
        "description": "Detailed explanation with specific evidence and impact analysis",
        "impact": 0-100,
        "recommendation": "Specific, actionable strategy to address this weakness"
      },
      {
        "title": "Second key weakness/gap title", 
        "description": "Detailed explanation with specific evidence and impact analysis",
        "impact": 0-100,
        "recommendation": "Specific, actionable strategy to address this weakness"
      },
      {
        "title": "Third key weakness/gap title",
        "description": "Detailed explanation with specific evidence and impact analysis", 
        "impact": 0-100,
        "recommendation": "Specific, actionable strategy to address this weakness"
      },
      {
        "title": "Fourth key weakness/gap title",
        "description": "Detailed explanation with specific evidence and impact analysis",
        "impact": 0-100,
        "recommendation": "Specific, actionable strategy to address this weakness"
      }
    ]
  },
  "compatibilityBreakdown": {
    "technicalSkills": {
      "score": 0-100,
      "present": ["Comprehensive list of technical skills found in CV that match job requirements"],
      "missing": ["Comprehensive list of technical skills required in job description but missing from CV"],
      "analysis": "Detailed multi-paragraph analysis of technical skills match with specific examples"
    },
    "experience": {
      "score": 0-100,
      "relevantExperience": ["Comprehensive list of relevant experience points from CV"],
      "missingExperience": ["Comprehensive list of experience requirements from job description not evidenced in CV"],
      "analysis": "Detailed multi-paragraph analysis of experience match with specific examples"
    },
    "education": {
      "score": 0-100,
      "relevantQualifications": ["Comprehensive list of relevant qualifications from CV"],
      "missingQualifications": ["Comprehensive list of qualification requirements from job description not evidenced in CV"],
      "analysis": "Detailed analysis of education and qualification match"
    },
    "softSkills": {
      "score": 0-100,
      "present": ["Comprehensive list of soft skills found in CV that match job requirements"],
      "missing": ["Comprehensive list of soft skills required in job description but missing from CV"],
      "analysis": "Detailed analysis of soft skills match with behavioral examples"
    },
    "industryKnowledge": {
      "score": 0-100,
      "present": ["Comprehensive list of industry knowledge areas found in CV that match job requirements"],
      "missing": ["Comprehensive list of industry knowledge areas required in job description but missing from CV"],
      "analysis": "Detailed analysis of industry knowledge match with specific context"
    }
  },
  "keywordAnalysis": {
    "totalKeywords": 0,
    "matchedKeywords": 0,
    "keywordMatchPercentage": 0-100,
    "keywords": [
      {
        "keyword": "First important keyword from job description",
        "found": true/false,
        "importance": "high/medium/low",
        "occurrences": 0,
        "context": "Context of how keyword is used in job description",
        "suggestion": "Specific suggestion for including or better utilizing this keyword"
      }
    ]
  },
  "priorityRecommendations": [
    {
      "title": "Highest priority recommendation title",
      "description": "Comprehensive explanation of why this is critical and how to implement",
      "priority": "high",
      "impact": "Detailed description of expected impact on application success",
      "sampleText": "Specific example text that could be used in the CV"
    },
    {
      "title": "Second priority recommendation title",
      "description": "Comprehensive explanation of why this is important and how to implement",
      "priority": "high/medium",
      "impact": "Detailed description of expected impact on application success",
      "sampleText": "Specific example text that could be used in the CV"
    },
    {
      "title": "Third priority recommendation title",
      "description": "Comprehensive explanation of the recommendation and implementation strategy",
      "priority": "medium",
      "impact": "Detailed description of expected impact on application success",
      "sampleText": "Specific example text that could be used in the CV"
    },
    {
      "title": "Fourth priority recommendation title",
      "description": "Comprehensive explanation of the recommendation and implementation strategy",
      "priority": "medium",
      "impact": "Detailed description of expected impact on application success",
      "sampleText": "Specific example text that could be used in the CV"
    },
    {
      "title": "Fifth priority recommendation title",
      "description": "Comprehensive explanation of the recommendation and implementation strategy",
      "priority": "medium/low",
      "impact": "Detailed description of expected impact on application success",
      "sampleText": "Specific example text that could be used in the CV"
    }
  ],
  "skillsGapAnalysis": {
    "criticalGaps": [
      {
        "skill": "First critical missing skill or competency",
        "importance": "high/medium/low",
        "description": "Detailed explanation of why this skill is critical for the role",
        "bridgingStrategy": "Comprehensive strategy to address or compensate for this gap"
      },
      {
        "skill": "Second critical missing skill or competency",
        "importance": "high/medium/low", 
        "description": "Detailed explanation of why this skill is critical for the role",
        "bridgingStrategy": "Comprehensive strategy to address or compensate for this gap"
      },
      {
        "skill": "Third critical missing skill or competency",
        "importance": "high/medium/low",
        "description": "Detailed explanation of why this skill is critical for the role", 
        "bridgingStrategy": "Comprehensive strategy to address or compensate for this gap"
      }
    ],
    "developmentAreas": [
      {
        "area": "First development area for career growth",
        "description": "Comprehensive description of this development opportunity",
        "relevance": "Detailed explanation of why this area is relevant to the role and career progression",
        "actionPlan": "Specific, actionable steps to develop in this area"
      },
      {
        "area": "Second development area for career growth",
        "description": "Comprehensive description of this development opportunity",
        "relevance": "Detailed explanation of why this area is relevant to the role and career progression",
        "actionPlan": "Specific, actionable steps to develop in this area"
      },
      {
        "area": "Third development area for career growth",
        "description": "Comprehensive description of this development opportunity",
        "relevance": "Detailed explanation of why this area is relevant to the role and career progression",
        "actionPlan": "Specific, actionable steps to develop in this area"
      }
    ]
  },
  "atsOptimization": {
    "overallScore": 0-100,
    "formatIssues": [
      {
        "issue": "Description of format issue that affects ATS scanning",
        "impact": "How this impacts ATS scanning and ranking",
        "fix": "Specific instructions on how to fix this issue"
      }
    ],
    "contentIssues": [
      {
        "issue": "Description of content issue that affects ATS performance",
        "impact": "How this impacts ATS scanning and ranking",
        "fix": "Specific instructions on how to fix this issue"
      }
    ],
    "keywordDensity": {
      "analysis": "Comprehensive analysis of keyword density and distribution",
      "recommendation": "Specific recommendations for improving keyword optimization"
    },
    "sectionRecommendations": {
      "missing": ["List of recommended sections missing from CV"],
      "improvements": ["List of specific recommendations for existing sections"]
    }
  },
  "interviewPrep": {
    "likelyQuestions": [
      {
        "question": "First likely interview question based on CV gaps or job requirements",
        "rationale": "Detailed explanation of why this question might be asked",
        "preparationTips": "Comprehensive guidance on how to prepare and structure the answer"
      },
      {
        "question": "Second likely interview question based on CV gaps or job requirements",
        "rationale": "Detailed explanation of why this question might be asked",
        "preparationTips": "Comprehensive guidance on how to prepare and structure the answer"
      },
      {
        "question": "Third likely interview question based on CV gaps or job requirements",
        "rationale": "Detailed explanation of why this question might be asked",
        "preparationTips": "Comprehensive guidance on how to prepare and structure the answer"
      },
      {
        "question": "Fourth likely interview question based on CV gaps or job requirements",
        "rationale": "Detailed explanation of why this question might be asked",
        "preparationTips": "Comprehensive guidance on how to prepare and structure the answer"
      },
      {
        "question": "Fifth likely interview question based on CV gaps or job requirements",
        "rationale": "Detailed explanation of why this question might be asked",
        "preparationTips": "Comprehensive guidance on how to prepare and structure the answer"
      }
    ],
    "strengthsToEmphasize": [
      {
        "strength": "First key strength to highlight in interview",
        "relevance": "Why this strength is particularly relevant to the position",
        "talkingPoints": ["Specific talking point 1", "Specific talking point 2", "Specific talking point 3"]
      },
      {
        "strength": "Second key strength to highlight in interview",
        "relevance": "Why this strength is particularly relevant to the position",
        "talkingPoints": ["Specific talking point 1", "Specific talking point 2", "Specific talking point 3"]
      },
      {
        "strength": "Third key strength to highlight in interview",
        "relevance": "Why this strength is particularly relevant to the position",
        "talkingPoints": ["Specific talking point 1", "Specific talking point 2", "Specific talking point 3"]
      }
    ],
    "weaknessesToAddress": [
      {
        "weakness": "First potential weakness or concern to proactively address",
        "strategy": "Comprehensive strategy for addressing this weakness in interview",
        "talkingPoints": ["Specific talking point 1", "Specific talking point 2", "Specific talking point 3"]
      },
      {
        "weakness": "Second potential weakness or concern to proactively address",
        "strategy": "Comprehensive strategy for addressing this weakness in interview", 
        "talkingPoints": ["Specific talking point 1", "Specific talking point 2", "Specific talking point 3"]
      }
    ]
  }
}

CRITICAL FINAL INSTRUCTIONS:
- Respond ONLY with valid JSON. No markdown formatting, explanations, or additional text.
- Ensure ALL arrays contain multiple items (3-7 items as specified) for comprehensive analysis.
- Provide thorough, professional analysis suitable for senior career development consulting.
- Focus on actionable insights with specific, measurable recommendations.
- Consider industry standards, ATS compatibility, and market expectations comprehensively.
- Be specific and concrete in all recommendations - avoid generic advice.
- Extract company name accurately and format job title professionally.
- Ensure each analysis section provides substantial professional value with detailed evidence and examples.
`;

    console.log('Calling OpenAI API with enhanced comprehensive multi-item prompt...');

    // Call OpenAI API with retry logic and increased token limit
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
                content: 'You are an expert CV analysis consultant with deep expertise in recruitment, ATS systems, and career development. Your task is to analyze a candidate\'s CV against a specific job description and provide detailed, actionable insights to help the candidate improve their chances of success. You have 15+ years of experience in talent acquisition across multiple industries and understand both the technical aspects of ATS systems and the human elements of the hiring process. Your analysis is known for being thorough, comprehensive, and highly actionable with multiple detailed recommendations in each category. You ALWAYS provide 3-7 items in key analysis sections for comprehensive coverage. Always respond with valid JSON only, no additional text or formatting.'
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
    
    console.log('Enhanced comprehensive OpenAI response received, length:', aiResponseText.length);

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

    console.log('Enhanced comprehensive AI analysis with multi-item results completed successfully');

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
