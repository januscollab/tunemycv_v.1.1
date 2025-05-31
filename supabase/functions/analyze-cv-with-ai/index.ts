
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

    console.log('Starting enhanced AI analysis with quality validation for user:', userId);

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

    // Enhanced comprehensive AI prompt with strict quality requirements
    const prompt = `
You are a senior career consultant with 20+ years of experience and deep knowledge of companies and industries. You must provide EVIDENCE-BASED analysis with ZERO contradictions.

STRICT QUALITY REQUIREMENTS:
1. READ THE ENTIRE CV THOROUGHLY before making ANY claims
2. EVERY strength/weakness MUST include EXACT CV quotes as evidence
3. NEVER contradict CV content (e.g., don't claim "lacks telecom experience" if CV shows telecom roles)
4. NEVER give generic advice like "take courses" or "attend conferences"
5. ALL recommendations must be SPECIFIC to the candidate's actual background
6. Flag ANY contradictions between your analysis and CV content
7. Minimum 20% score unless CV is completely irrelevant
8. Ensure overall score aligns with breakdown scores (within 15 points)

CV TO ANALYZE:
${cvText}

JOB DESCRIPTION:
${jobDescriptionText}

POSITION: ${jobTitle || 'Not specified'}

EVIDENCE VALIDATION CHECKLIST:
✓ Every strength claim backed by CV quote
✓ Every weakness verified against CV content
✓ No contradictions with listed experience
✓ No generic recommendations
✓ Industry experience accurately assessed
✓ Company background properly evaluated
✓ Score reflects actual content analysis

RESPONSE STRUCTURE - JSON ONLY:
{
  "compatibilityScore": 0-100,
  "companyName": "Company name from job description",
  "position": "Job title",
  "executiveSummary": {
    "overview": "Evidence-based overview with CV references explaining score",
    "strengths": [
      {
        "title": "Specific strength with evidence",
        "description": "Detailed explanation with company/industry context",
        "relevance": 0-100,
        "evidence": "EXACT QUOTE from CV proving this strength - MANDATORY"
      }
    ],
    "weaknesses": [
      {
        "title": "Verified weakness based on CV gaps",
        "description": "Evidence-based explanation of missing elements",
        "impact": 0-100,
        "recommendation": "Specific action based on candidate's background",
        "evidence": "Specific CV content showing this gap - MANDATORY"
      }
    ]
  },
  "compatibilityBreakdown": {
    "technicalSkills": {
      "score": 0-100,
      "present": ["Skills with CV evidence"],
      "missing": ["Required skills not found in CV"],
      "analysis": "Evidence-based technical assessment"
    },
    "experience": {
      "score": 0-100,
      "relevantExperience": ["Experience with CV context"],
      "missingExperience": ["Required experience not in CV"],
      "analysis": "Detailed experience evaluation with evidence"
    },
    "education": {
      "score": 0-100,
      "relevantQualifications": ["Education from CV"],
      "missingQualifications": ["Required education not listed"],
      "analysis": "Educational background assessment"
    },
    "softSkills": {
      "score": 0-100,
      "present": ["Soft skills demonstrated in CV"],
      "missing": ["Soft skills not evidenced"],
      "analysis": "Soft skills evaluation with CV evidence"
    },
    "industryKnowledge": {
      "score": 0-100,
      "present": ["Industry knowledge with CV proof"],
      "missing": ["Industry gaps not covered in CV"],
      "analysis": "Industry knowledge assessment with company evidence"
    }
  },
  "keywordAnalysis": {
    "totalKeywords": 20-30,
    "matchedKeywords": 0-30,
    "keywordMatchPercentage": 0-100,
    "keywords": [
      {
        "keyword": "Specific job requirement keyword",
        "found": true/false,
        "importance": "high/medium/low",
        "occurrences": 0,
        "context": "Where/how it appears in CV or job description",
        "suggestion": "Specific integration strategy based on candidate's experience"
      }
    ]
  },
  "priorityRecommendations": [
    {
      "title": "Specific actionable recommendation",
      "description": "Detailed explanation based on CV analysis",
      "priority": "high/medium/low",
      "impact": "Expected outcome with evidence",
      "sampleText": "CV-specific text example",
      "specificAction": "Exact implementation steps"
    }
  ],
  "skillsGapAnalysis": {
    "criticalGaps": [
      {
        "skill": "Missing skill verified against CV",
        "importance": "high/medium/low",
        "description": "Why critical for this specific role",
        "bridgingStrategy": "Specific strategy using candidate's background"
      }
    ],
    "developmentAreas": [
      {
        "area": "Development area based on CV analysis",
        "description": "Context-specific opportunity",
        "relevance": "Direct relevance to role",
        "actionPlan": "Specific plan with timeline"
      }
    ]
  },
  "companyIntelligence": {
    "candidateCompanies": [
      {
        "name": "Company from CV",
        "industry": "Industry classification",
        "relevance": 0-100,
        "marketPosition": "Market position assessment",
        "industryContext": "Relevance to target role"
      }
    ],
    "industryProgression": "Candidate's industry journey analysis",
    "marketKnowledge": "Market knowledge depth assessment",
    "competitiveAdvantage": "Unique advantages from background"
  }
}

FINAL VALIDATION:
- Does every strength have CV evidence?
- Are there any contradictions with CV content?
- Is advice specific to this candidate?
- Does score reflect breakdown averages?
- Are all claims backed by CV content?
`;

    console.log('Calling OpenAI API with enhanced quality validation prompt...');

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
                content: 'You are a senior career consultant with deep industry knowledge. Provide ONLY evidence-based analysis with exact CV quotes. NEVER contradict CV content. NEVER give generic advice. Every claim must be supported by specific CV evidence.'
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
    
    console.log('Enhanced OpenAI response with quality validation received, length:', aiResponseText.length);

    // Parse and validate AI response
    let analysisResult: EnhancedAIAnalysisResult;
    try {
      const parsedResult = cleanAndParseJSON(aiResponseText);
      analysisResult = validateEnhancedAnalysisResult(parsedResult);
      console.log('AI response successfully parsed and validated with quality checks');
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

    console.log('Enhanced AI analysis with quality validation completed successfully');

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
