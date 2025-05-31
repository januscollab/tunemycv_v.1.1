
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
      evidence: string;
    }>;
    weaknesses: Array<{
      title: string;
      description: string;
      impact: number;
      recommendation: string;
      evidence: string;
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
    specificAction: string;
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
  companyIntelligence: {
    candidateCompanies: Array<{
      name: string;
      industry: string;
      relevance: number;
      marketPosition: string;
      industryContext: string;
    }>;
    industryProgression: string;
    marketKnowledge: string;
    competitiveAdvantage: string;
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
    'skillsGapAnalysis', 'companyIntelligence'
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
  
  // Score validation - check against breakdown scores
  if (result.compatibilityBreakdown) {
    const breakdown = result.compatibilityBreakdown;
    const scores = [
      breakdown.technicalSkills?.score,
      breakdown.experience?.score,
      breakdown.education?.score,
      breakdown.softSkills?.score,
      breakdown.industryKnowledge?.score
    ].filter(score => score !== undefined && score !== null);

    if (scores.length > 0) {
      const averageBreakdown = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const scoreDifference = Math.abs(result.compatibilityScore - averageBreakdown);
      
      // If overall score is 0 but breakdown average is >0, or difference is >20 points
      if ((result.compatibilityScore === 0 && averageBreakdown > 0) || scoreDifference > 20) {
        console.warn('Score validation failed, using breakdown average:', {
          original: result.compatibilityScore,
          calculated: Math.round(averageBreakdown)
        });
        result.compatibilityScore = Math.round(averageBreakdown);
        result.scoreAdjusted = true;
      }
    }
  }
  
  // Set defaults for missing nested structures
  if (!result.executiveSummary.strengths) result.executiveSummary.strengths = [];
  if (!result.executiveSummary.weaknesses) result.executiveSummary.weaknesses = [];
  if (!result.keywordAnalysis.keywords) result.keywordAnalysis.keywords = [];
  if (!result.priorityRecommendations) result.priorityRecommendations = [];
  if (!result.skillsGapAnalysis.criticalGaps) result.skillsGapAnalysis.criticalGaps = [];
  if (!result.skillsGapAnalysis.developmentAreas) result.skillsGapAnalysis.developmentAreas = [];
  if (!result.companyIntelligence) result.companyIntelligence = {
    candidateCompanies: [],
    industryProgression: '',
    marketKnowledge: '',
    competitiveAdvantage: ''
  };
  
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

    console.log('Starting enhanced AI analysis with company intelligence for user:', userId);

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

    // Enhanced comprehensive AI prompt with company and industry intelligence
    const prompt = `
You are a senior career consultant and CV optimization expert with deep knowledge of companies and industries. Analyze the CV against the job description with comprehensive company and industry intelligence.

CRITICAL REQUIREMENTS:
1. Extract and analyze EVERY company mentioned in the CV with industry context
2. Provide evidence-based analysis - cite specific CV content for ALL claims
3. NEVER make generic recommendations - all advice must be specific and actionable
4. Research industry context and company market positions
5. Ensure score consistency: overall score within 10 points of breakdown average
6. Flag any contradictions between your analysis and CV content
7. Minimum 20% score unless CV is completely irrelevant

CV TO ANALYZE:
${cvText}

JOB DESCRIPTION:
${jobDescriptionText}

POSITION: ${jobTitle || 'Not specified'}

COMPANY & INDUSTRY ANALYSIS REQUIREMENTS:
1. Extract ALL companies from CV with years of experience at each
2. Research each company's industry, market position, and relevance
3. Analyze industry progression and transferable knowledge
4. Assess market knowledge depth and competitive intelligence
5. Evaluate professional network implications
6. Consider industry evolution and emerging trends

EVIDENCE REQUIREMENTS:
- Every strength must include specific CV quotes as evidence
- Every weakness must cite exact missing elements from CV
- All recommendations must be based on actual gaps, not assumptions
- Industry claims must reference specific company experiences

RESPONSE STRUCTURE - JSON ONLY:
{
  "compatibilityScore": 0-100,
  "companyName": "Company name from job description",
  "position": "Job title",
  "executiveSummary": {
    "overview": "Evidence-based overview explaining score with specific CV references",
    "strengths": [
      {
        "title": "Specific strength based on CV evidence",
        "description": "Detailed explanation with company/industry context",
        "relevance": 0-100,
        "evidence": "Exact quote or reference from CV supporting this claim"
      }
    ],
    "weaknesses": [
      {
        "title": "Specific gap identified in CV",
        "description": "Explanation with evidence of what's missing",
        "impact": 0-100,
        "recommendation": "Specific, actionable strategy (not generic advice)",
        "evidence": "Specific CV content showing this gap"
      }
    ]
  },
  "compatibilityBreakdown": {
    "technicalSkills": {
      "score": 0-100,
      "present": ["Skills with company/context where used"],
      "missing": ["Specific technical requirements from job description"],
      "analysis": "Company-contextualized technical skills assessment"
    },
    "experience": {
      "score": 0-100,
      "relevantExperience": ["Experience with company/industry context"],
      "missingExperience": ["Specific experience gaps from job description"],
      "analysis": "Industry-weighted experience analysis"
    },
    "education": {
      "score": 0-100,
      "relevantQualifications": ["Qualifications with relevance context"],
      "missingQualifications": ["Specific educational requirements missing"],
      "analysis": "Educational background with industry requirements"
    },
    "softSkills": {
      "score": 0-100,
      "present": ["Soft skills with evidence from CV"],
      "missing": ["Soft skills required but not demonstrated"],
      "analysis": "Soft skills assessment with company culture fit"
    },
    "industryKnowledge": {
      "score": 0-100,
      "present": ["Industry knowledge areas with company evidence"],
      "missing": ["Industry knowledge gaps for target role"],
      "analysis": "Deep industry knowledge assessment based on company progression"
    }
  },
  "keywordAnalysis": {
    "totalKeywords": 20-30,
    "matchedKeywords": 0-30,
    "keywordMatchPercentage": 0-100,
    "keywords": [
      {
        "keyword": "Specific keyword from job description",
        "found": true/false,
        "importance": "high/medium/low",
        "occurrences": 0,
        "context": "Industry/company context for this keyword",
        "suggestion": "Specific way to incorporate based on candidate's background"
      }
    ]
  },
  "priorityRecommendations": [
    {
      "title": "Specific, actionable recommendation",
      "description": "Detailed explanation based on analysis",
      "priority": "high/medium/low",
      "impact": "Specific expected outcome",
      "sampleText": "Industry-specific text example",
      "specificAction": "Exact steps to implement this recommendation"
    }
  ],
  "skillsGapAnalysis": {
    "criticalGaps": [
      {
        "skill": "Specific skill missing with evidence",
        "importance": "high/medium/low",
        "description": "Why this matters for this specific role/company",
        "bridgingStrategy": "Specific strategy based on candidate's background"
      }
    ],
    "developmentAreas": [
      {
        "area": "Specific development area",
        "description": "Context-specific development opportunity",
        "relevance": "Direct relevance to role and industry",
        "actionPlan": "Specific development plan with timeline"
      }
    ]
  },
  "companyIntelligence": {
    "candidateCompanies": [
      {
        "name": "Company name from CV",
        "industry": "Specific industry classification",
        "relevance": 0-100,
        "marketPosition": "Market position and reputation",
        "industryContext": "How this experience relates to target role"
      }
    ],
    "industryProgression": "Analysis of candidate's industry journey and trajectory",
    "marketKnowledge": "Assessment of market knowledge depth across industries",
    "competitiveAdvantage": "Unique advantages from company/industry background"
  }
}

QUALITY CHECKS:
1. NO generic advice like "take courses" or "attend conferences"
2. ALL recommendations must be specific to the candidate's background
3. Evidence field must contain actual CV content
4. Industry analysis must reference specific companies
5. Score must reflect actual content analysis, not assumptions
`;

    console.log('Calling OpenAI API with enhanced company intelligence prompt...');

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
                content: 'You are a senior career consultant with deep company and industry intelligence. Provide evidence-based analysis only. Every claim must be supported by specific CV content. Never give generic advice. Research companies and industries thoroughly.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.1,
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
    
    console.log('Enhanced OpenAI response with company intelligence received, length:', aiResponseText.length);

    // Parse and validate AI response
    let analysisResult: EnhancedAIAnalysisResult;
    try {
      const parsedResult = cleanAndParseJSON(aiResponseText);
      analysisResult = validateEnhancedAnalysisResult(parsedResult);
      console.log('AI response successfully parsed and validated with company intelligence');
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

    console.log('Enhanced AI analysis with company intelligence completed successfully');

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
