
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

// Security validation functions
const validateAndSanitizeText = (text: string, maxLength: number, fieldName: string): string => {
  if (!text || typeof text !== 'string') {
    throw new Error(`${fieldName} is required and must be a string`);
  }
  
  // Remove potential XSS and injection patterns
  const sanitized = text
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script references
    .replace(/eval\s*\(/gi, '') // Remove eval calls
    .replace(/function\s*\(/gi, ''); // Remove function declarations
  
  if (sanitized.length === 0) {
    throw new Error(`${fieldName} cannot be empty after sanitization`);
  }
  
  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
  
  if (sanitized.length < 50) {
    throw new Error(`${fieldName} must be at least 50 characters long`);
  }
  
  return sanitized;
};

const detectPromptInjection = (text: string): boolean => {
  const suspiciousPatterns = [
    /ignore\s+(previous|above|all)\s+instructions/gi,
    /you\s+are\s+(now|a)\s+(different|new)/gi,
    /roleplay\s+as/gi,
    /pretend\s+(to\s+be|you\s+are)/gi,
    /act\s+as\s+(if|though)/gi,
    /system\s*:\s*/gi,
    /assistant\s*:\s*/gi,
    /human\s*:\s*/gi,
    /\[system\]/gi,
    /\[assistant\]/gi,
    /override\s+your/gi,
    /jailbreak/gi,
    /tell\s+me\s+how\s+to/gi,
    /create\s+(malicious|harmful)/gi
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(text));
};

const validateJobTitle = (jobTitle?: string): string => {
  if (!jobTitle) return 'Not specified';
  
  const sanitized = jobTitle
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 100); // Limit job title length
    
  return sanitized || 'Not specified';
};

const checkRateLimit = async (supabase: any, userId: string): Promise<void> => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const { data: recentAnalyses, error } = await supabase
    .from('analysis_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('operation_type', 'cv_analysis')
    .gte('created_at', oneHourAgo.toISOString())
    .limit(10);
    
  if (error) {
    console.error('Rate limit check error:', error);
    throw new Error('Unable to verify rate limits');
  }
  
  if (recentAnalyses && recentAnalyses.length >= 10) {
    throw new Error('Rate limit exceeded: Maximum 10 analyses per hour');
  }
};

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

// Function to log analysis interaction
const logAnalysisInteraction = async (
  supabase: any,
  data: {
    userId: string;
    cvUploadId?: string;
    jobDescriptionUploadId?: string;
    prompt: string;
    response: string;
    model: string;
    processingTime: number;
    tokensUsed?: number;
    status: 'success' | 'error';
    errorMessage?: string;
    responseMetadata?: any;
    analysisResultId?: string;
  }
) => {
  try {
    const { error } = await supabase
      .from('analysis_logs')
      .insert({
        user_id: data.userId,
        cv_upload_id: data.cvUploadId,
        job_description_upload_id: data.jobDescriptionUploadId,
        openai_model: data.model,
        prompt_text: data.prompt,
        response_text: data.response,
        response_metadata: data.responseMetadata || {},
        processing_time_ms: data.processingTime,
        tokens_used: data.tokensUsed,
        status: data.status,
        error_message: data.errorMessage,
        analysis_result_id: data.analysisResultId
      });

    if (error) {
      console.error('Failed to log analysis interaction:', error);
    } else {
      console.log('Analysis interaction logged successfully');
    }
  } catch (error) {
    console.error('Error logging analysis interaction:', error);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let requestData: AnalysisRequest;
  let prompt = '';
  let aiResponse = '';
  let tokensUsed = 0;
  let cvUploadId: string | undefined;
  let jobDescriptionUploadId: string | undefined;

  try {
    requestData = await req.json();
    const { cvText, jobDescriptionText, jobTitle, userId } = requestData;

    console.log('Starting enhanced AI analysis for user:', userId);

    // Security validations
    console.log('Performing security validations...');
    
    // Validate required fields
    if (!userId || typeof userId !== 'string') {
      throw new Error('Valid user ID is required');
    }
    
    // Check rate limiting first
    await checkRateLimit(supabase, userId);
    
    // Validate and sanitize input texts
    const sanitizedCvText = validateAndSanitizeText(cvText, 50000, 'CV text');
    const sanitizedJobDescription = validateAndSanitizeText(jobDescriptionText, 20000, 'Job description');
    const sanitizedJobTitle = validateJobTitle(jobTitle);
    
    // Check for prompt injection attempts
    if (detectPromptInjection(sanitizedCvText)) {
      console.warn('Potential prompt injection detected in CV text');
      throw new Error('Invalid content detected in CV text');
    }
    
    if (detectPromptInjection(sanitizedJobDescription)) {
      console.warn('Potential prompt injection detected in job description');
      throw new Error('Invalid content detected in job description');
    }
    
    console.log('Security validations passed successfully');

    // Get upload IDs for logging
    const { data: cvUploads } = await supabase
      .from('uploads')
      .select('id')
      .eq('user_id', userId)
      .eq('upload_type', 'cv')
      .order('created_at', { ascending: false })
      .limit(1);

    const { data: jobUploads } = await supabase
      .from('uploads')
      .select('id')
      .eq('user_id', userId)
      .eq('upload_type', 'job_description')
      .order('created_at', { ascending: false })
      .limit(1);

    cvUploadId = cvUploads?.[0]?.id;
    jobDescriptionUploadId = jobUploads?.[0]?.id;

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

    // Create comprehensive AI prompt
    prompt = `
You are a senior career consultant and CV optimization expert. Analyze the CV against the job description and provide detailed insights.

CRITICAL REQUIREMENTS:
1. Provide 3-7 detailed items for each analysis section
2. Be thorough and comprehensive - this is professional career consulting
3. Respond ONLY with valid JSON in the exact structure below
4. Extract 15-25+ relevant keywords from the job description

CV TO ANALYZE:
${sanitizedCvText}

JOB DESCRIPTION:
${sanitizedJobDescription}

POSITION: ${sanitizedJobTitle}

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
      "analysis": "Detailed analysis of technical alignment"
    },
    "experience": {
      "score": 0-100,
      "relevantExperience": ["Relevant experience from CV"],
      "missingExperience": ["Required experience missing"],
      "analysis": "Analysis of experience match"
    },
    "education": {
      "score": 0-100,
      "relevantQualifications": ["Relevant qualifications"],
      "missingQualifications": ["Missing qualifications"],
      "analysis": "Educational background analysis"
    },
    "softSkills": {
      "score": 0-100,
      "present": ["Soft skills demonstrated"],
      "missing": ["Required soft skills missing"],
      "analysis": "Soft skills assessment"
    },
    "industryKnowledge": {
      "score": 0-100,
      "present": ["Industry knowledge areas"],
      "missing": ["Missing industry knowledge"],
      "analysis": "Industry expertise analysis"
    }
  },
  "keywordAnalysis": {
    "totalKeywords": 15-25,
    "matchedKeywords": 0-25,
    "keywordMatchPercentage": 0-100,
    "keywords": [
      {
        "keyword": "Keyword from job description",
        "found": true/false,
        "importance": "high/medium/low",
        "occurrences": 0,
        "context": "Context and importance",
        "suggestion": "How to incorporate/optimize"
      }
    ]
  },
  "priorityRecommendations": [
    {
      "title": "Recommendation title",
      "description": "Comprehensive explanation and rationale",
      "priority": "high/medium/low",
      "impact": "Expected impact description",
      "sampleText": "Ready-to-use text example"
    }
  ],
  "skillsGapAnalysis": {
    "criticalGaps": [
      {
        "skill": "Critical skill missing",
        "importance": "high/medium/low",
        "description": "Why this skill is essential",
        "bridgingStrategy": "How to acquire this skill"
      }
    ],
    "developmentAreas": [
      {
        "area": "Development area",
        "description": "Development opportunity explanation",
        "relevance": "Relevance to role success",
        "actionPlan": "Specific development plan"
      }
    ]
  }
}

INSTRUCTIONS:
- RESPOND ONLY WITH VALID JSON
- PROVIDE 3-7 ITEMS for strengths, weaknesses, recommendations, critical gaps, and development areas
- EXTRACT 15-25+ KEYWORDS with strategic importance
- FOCUS ON ACTIONABLE INSIGHTS with specific evidence
- MAINTAIN PROFESSIONAL TONE while being honest about gaps
`;

    console.log('Calling OpenAI API with comprehensive prompt...');

    // Call OpenAI API with retry logic
    let openAIResponse;
    let attempts = 0;
    const maxAttempts = 2;
    const model = 'gpt-4o';

    while (attempts < maxAttempts) {
      try {
        openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are a senior career consultant providing comprehensive CV analysis. Always respond with valid JSON only, no additional text.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.2,
            max_tokens: 6000,
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
    aiResponse = openAIData.choices[0].message.content;
    tokensUsed = openAIData.usage?.total_tokens || 0;
    
    console.log('Enhanced OpenAI response received, length:', aiResponse.length);

    // Parse and validate AI response
    let analysisResult: EnhancedAIAnalysisResult;
    try {
      const parsedResult = cleanAndParseJSON(aiResponse);
      analysisResult = validateEnhancedAnalysisResult(parsedResult);
      console.log('AI response successfully parsed and validated');
    } catch (parseError) {
      console.error('Failed to parse/validate AI response:', parseError);
      
      // Log the failed attempt
      await logAnalysisInteraction(supabase, {
        userId,
        cvUploadId,
        jobDescriptionUploadId,
        prompt,
        response: aiResponse,
        model,
        processingTime: Date.now() - startTime,
        tokensUsed,
        status: 'error',
        errorMessage: `Parse error: ${parseError.message}`,
        responseMetadata: { parseError: true, rawResponse: aiResponse.substring(0, 1000) }
      });
      
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

    // Log successful analysis
    await logAnalysisInteraction(supabase, {
      userId,
      cvUploadId,
      jobDescriptionUploadId,
      prompt,
      response: aiResponse,
      model,
      processingTime: Date.now() - startTime,
      tokensUsed,
      status: 'success',
      responseMetadata: {
        compatibilityScore: analysisResult.compatibilityScore,
        companyName: analysisResult.companyName,
        keywordMatchPercentage: analysisResult.keywordAnalysis?.keywordMatchPercentage || 0
      }
    });

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
    
    // Log the error
    if (requestData?.userId) {
      await logAnalysisInteraction(supabase, {
        userId: requestData.userId,
        cvUploadId,
        jobDescriptionUploadId,
        prompt,
        response: aiResponse || 'No response received',
        model: 'gpt-4o',
        processingTime: Date.now() - startTime,
        tokensUsed,
        status: 'error',
        errorMessage: error.message,
        responseMetadata: { errorType: error.constructor.name }
      });
    }
    
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
