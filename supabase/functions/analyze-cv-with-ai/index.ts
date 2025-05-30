
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
You are a senior career consultant and CV optimization expert with 15+ years of experience in talent acquisition, career coaching, and industry analysis. Your task is to provide a COMPREHENSIVE, DETAILED analysis of the candidate's CV against the job description.

CRITICAL ANALYSIS REQUIREMENTS:
1. PROVIDE MULTIPLE DETAILED ITEMS for each analysis section (minimum 3-5, maximum 7 per section)
2. BE THOROUGH AND COMPREHENSIVE - this is professional career consulting, not a brief summary
3. ANALYZE DEEPLY using industry standards and current market expectations
4. PROVIDE SPECIFIC, ACTIONABLE RECOMMENDATIONS with concrete examples
5. CONSIDER ATS optimization, industry trends, and competitive positioning
6. EXTRACT ALL RELEVANT KEYWORDS without limitation (aim for 15-25+ keywords)
7. RESPOND ONLY WITH VALID JSON in the exact structure specified below

ANALYSIS DEPTH REQUIREMENTS:
- Executive Summary: Provide 3-5 key strengths AND 3-5 key weaknesses/improvement areas
- Priority Recommendations: Provide 5-7 ranked, actionable recommendations
- Skills Gap Analysis: Identify 3-5 critical gaps AND 3-5 development areas
- Interview Preparation: Provide 5-7 likely questions, 3-5 strengths to emphasize, 3-5 weaknesses to address
- Keyword Analysis: Extract 15-25+ relevant keywords from the job description

CV TO ANALYZE:
${cvText}

JOB DESCRIPTION TO MATCH AGAINST:
${jobDescriptionText}

POSITION (if provided):
${jobTitle || 'Not specified'}

RESPOND WITH COMPREHENSIVE ANALYSIS IN THIS EXACT JSON STRUCTURE:
{
  "compatibilityScore": 0-100,
  "companyName": "Extracted company name from job description",
  "position": "Properly formatted job title",
  "executiveSummary": {
    "overview": "Comprehensive 3-4 sentence overview of overall compatibility and positioning",
    "strengths": [
      {
        "title": "Specific strength title with concrete evidence",
        "description": "Detailed 2-3 sentence explanation with specific examples from CV and relevance to job requirements",
        "relevance": 0-100
      },
      {
        "title": "Second key strength with market positioning",
        "description": "Detailed explanation showing competitive advantage and alignment with role",
        "relevance": 0-100
      },
      {
        "title": "Third strength highlighting unique value proposition",
        "description": "Specific examples and quantifiable achievements that differentiate the candidate",
        "relevance": 0-100
      }
      // Continue for 3-5 total strengths
    ],
    "weaknesses": [
      {
        "title": "Critical gap or weakness title",
        "description": "Detailed explanation of why this is a concern and specific evidence from analysis",
        "impact": 0-100,
        "recommendation": "Specific, actionable strategy to address this weakness with timeline and steps"
      },
      {
        "title": "Second key improvement area",
        "description": "Thorough analysis of the gap and its implications for job success",
        "impact": 0-100,
        "recommendation": "Concrete action plan with specific resources or approaches"
      },
      {
        "title": "Third development priority",
        "description": "Detailed assessment of missing elements and their importance",
        "impact": 0-100,
        "recommendation": "Strategic approach to bridging this gap with measurable outcomes"
      }
      // Continue for 3-5 total weaknesses
    ]
  },
  "compatibilityBreakdown": {
    "technicalSkills": {
      "score": 0-100,
      "present": ["Comprehensive list of technical skills found in CV that match job requirements"],
      "missing": ["Detailed list of technical skills required in job description but missing from CV"],
      "analysis": "In-depth analysis of technical skills alignment with specific examples and market context"
    },
    "experience": {
      "score": 0-100,
      "relevantExperience": ["Detailed list of relevant experience points from CV with quantifiable achievements"],
      "missingExperience": ["Specific experience requirements from job description not evidenced in CV"],
      "analysis": "Comprehensive analysis of experience match including industry relevance and career progression"
    },
    "education": {
      "score": 0-100,
      "relevantQualifications": ["Complete list of relevant qualifications, certifications, and educational achievements"],
      "missingQualifications": ["Educational or certification requirements from job description not met"],
      "analysis": "Thorough evaluation of educational background and its alignment with role requirements"
    },
    "softSkills": {
      "score": 0-100,
      "present": ["Comprehensive list of soft skills demonstrated in CV that match job requirements"],
      "missing": ["Soft skills required in job description but not evidenced in CV"],
      "analysis": "Detailed assessment of soft skills demonstration and leadership capabilities"
    },
    "industryKnowledge": {
      "score": 0-100,
      "present": ["Industry knowledge areas and sector expertise evidenced in CV"],
      "missing": ["Industry knowledge requirements from job description not demonstrated"],
      "analysis": "In-depth analysis of industry expertise and market understanding"
    }
  },
  "keywordAnalysis": {
    "totalKeywords": 15-25,
    "matchedKeywords": 0-25,
    "keywordMatchPercentage": 0-100,
    "keywords": [
      {
        "keyword": "Specific keyword from job description",
        "found": true/false,
        "importance": "high/medium/low",
        "occurrences": 0,
        "context": "Detailed context of how keyword is used in job description and its strategic importance",
        "suggestion": "Specific recommendation for incorporating or optimizing this keyword with sample text"
      }
      // Continue for 15-25+ keywords
    ]
  },
  "priorityRecommendations": [
    {
      "title": "High-impact recommendation title",
      "description": "Comprehensive explanation of the recommendation with strategic rationale and expected outcomes",
      "priority": "high/medium/low",
      "impact": "Detailed description of expected impact on application success and career positioning",
      "sampleText": "Specific, ready-to-use text example that could be incorporated into CV"
    },
    {
      "title": "Second priority enhancement",
      "description": "Thorough explanation of implementation strategy and competitive advantage gained",
      "priority": "high/medium/low",
      "impact": "Quantifiable benefits and improved positioning in candidate pool",
      "sampleText": "Concrete example text with industry-specific language and achievements"
    }
    // Continue for 5-7 total recommendations
  ],
  "skillsGapAnalysis": {
    "criticalGaps": [
      {
        "skill": "Specific critical skill missing",
        "importance": "high/medium/low",
        "description": "Detailed explanation of why this skill is essential for role success and industry standards",
        "bridgingStrategy": "Comprehensive strategy to acquire this skill including timeline, resources, and certification paths"
      },
      {
        "skill": "Second critical competency gap",
        "importance": "high/medium/low",
        "description": "Thorough analysis of skill importance and competitive implications",
        "bridgingStrategy": "Specific action plan with measurable milestones and learning resources"
      }
      // Continue for 3-5 critical gaps
    ],
    "developmentAreas": [
      {
        "area": "Professional development priority",
        "description": "Comprehensive explanation of development opportunity and career impact",
        "relevance": "Detailed relevance to role success and long-term career growth",
        "actionPlan": "Step-by-step development plan with specific actions, timeline, and success metrics"
      },
      {
        "area": "Second growth opportunity",
        "description": "In-depth analysis of development potential and strategic value",
        "relevance": "Connection to role requirements and industry advancement",
        "actionPlan": "Detailed roadmap for skill development with practical next steps"
      }
      // Continue for 3-5 development areas
    ]
  },
  "atsOptimization": {
    "overallScore": 0-100,
    "formatIssues": [
      {
        "issue": "Specific formatting problem",
        "impact": "Detailed explanation of how this impacts ATS parsing and candidate ranking",
        "fix": "Step-by-step solution to resolve this formatting issue"
      }
      // Multiple format issues if present
    ],
    "contentIssues": [
      {
        "issue": "Content optimization opportunity",
        "impact": "Comprehensive impact analysis on ATS performance and recruiter engagement",
        "fix": "Detailed solution with specific content recommendations"
      }
      // Multiple content issues with solutions
    ],
    "keywordDensity": {
      "analysis": "Thorough analysis of keyword optimization and ATS ranking factors",
      "recommendation": "Specific strategy for improving keyword density and search visibility"
    },
    "sectionRecommendations": {
      "missing": ["Essential CV sections missing that impact ATS performance"],
      "improvements": ["Detailed recommendations for optimizing existing sections for better ATS compatibility"]
    }
  },
  "interviewPrep": {
    "likelyQuestions": [
      {
        "question": "Specific interview question based on job requirements and CV analysis",
        "rationale": "Detailed explanation of why this question will likely be asked and its strategic importance",
        "preparationTips": "Comprehensive preparation strategy with key talking points and examples to highlight"
      },
      {
        "question": "Second high-probability interview question",
        "rationale": "Analysis of interviewer concerns and evaluation criteria driving this question",
        "preparationTips": "Specific preparation approach with storytelling framework and quantifiable examples"
      }
      // Continue for 5-7 likely questions
    ],
    "strengthsToEmphasize": [
      {
        "strength": "Key competitive advantage to highlight",
        "relevance": "Detailed explanation of strategic importance to role success",
        "talkingPoints": ["Specific talking point 1 with quantifiable achievement", "Talking point 2 with industry context", "Talking point 3 with competitive differentiation"]
      },
      {
        "strength": "Second critical strength for interview focus",
        "relevance": "Comprehensive analysis of value proposition and market positioning",
        "talkingPoints": ["Multiple specific examples and achievements", "Industry-relevant context and comparisons", "Future potential and growth trajectory"]
      }
      // Continue for 3-5 strengths
    ],
    "weaknessesToAddress": [
      {
        "weakness": "Potential concern or gap to address proactively",
        "strategy": "Comprehensive strategy for addressing this weakness including reframing approach",
        "talkingPoints": ["Specific approach to acknowledge and redirect", "Concrete steps taken to address the gap", "Positive spin highlighting learning and growth"]
      },
      {
        "weakness": "Second area requiring strategic positioning",
        "strategy": "Detailed approach to minimize impact and demonstrate proactive development",
        "talkingPoints": ["Multiple strategic responses", "Evidence of continuous improvement", "Relevance to role requirements and success factors"]
      }
      // Continue for 3-5 potential weaknesses
    ]
  }
}

FINAL CRITICAL INSTRUCTIONS:
- RESPOND ONLY WITH VALID JSON - no markdown, explanations, or additional text
- PROVIDE COMPREHENSIVE, PROFESSIONAL-GRADE ANALYSIS suitable for senior career consulting
- INCLUDE MULTIPLE DETAILED ITEMS for each array section (3-7 items as specified)
- FOCUS ON ACTIONABLE INSIGHTS with specific, measurable recommendations
- CONSIDER CURRENT INDUSTRY STANDARDS, ATS SYSTEMS, and COMPETITIVE MARKET POSITIONING
- EXTRACT COMPREHENSIVE KEYWORD LIST (15-25+ keywords) with strategic importance
- PROVIDE SPECIFIC EVIDENCE from CV and job description for all assessments
- MAINTAIN PROFESSIONAL TONE while being honest about gaps and opportunities
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
                content: 'You are a senior career consultant and CV optimization expert with 15+ years of experience in talent acquisition, career coaching, and industry analysis. Your analysis is known for being thorough, comprehensive, and highly actionable. You provide detailed, multi-faceted analysis that matches professional career consulting standards. You always provide multiple detailed items for each analysis section to ensure comprehensive coverage. Always respond with valid JSON only, no additional text or formatting.'
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
