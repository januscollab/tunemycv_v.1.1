import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisRequest {
  cvText: string;
  jobDescription: string;
  jobTitle: string;
  userId: string;
}

// Security: Input validation and sanitization
const validateInput = (input: any, fieldName: string, maxLength: number = 50000): string => {
  if (!input || typeof input !== 'string') {
    throw new Error(`Invalid ${fieldName}: must be a non-empty string`)
  }
  
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    throw new Error(`${fieldName} cannot be empty`)
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} too long: maximum ${maxLength} characters allowed`)
  }
  
  // Check for potential XSS patterns
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(trimmed))) {
    throw new Error(`Invalid content detected in ${fieldName}`)
  }
  
  return trimmed
}

// Security: Authenticate user and get Supabase client
const authenticateUser = async (req: Request) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  )

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  return { user, supabaseClient }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let user: any = null
  let supabaseClient: any = null

  try {
    // Security: Authenticate user first
    const authResult = await authenticateUser(req)
    user = authResult.user
    supabaseClient = authResult.supabaseClient

    // Security: Parse and validate request
    const rawRequest = await req.json()
    const request: AnalysisRequest = {
      cvText: validateInput(rawRequest.cvText, 'CV text', 50000),
      jobDescription: validateInput(rawRequest.jobDescription, 'job description', 20000),
      jobTitle: validateInput(rawRequest.jobTitle, 'job title', 200),
      userId: rawRequest.userId
    }

    // Security: Verify user ID matches authenticated user
    if (request.userId !== user.id) {
      throw new Error('User ID mismatch')
    }

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    if (creditsError || !creditsData || creditsData.credits < 1) {
      throw new Error('Insufficient credits')
    }

    // Generate AI analysis using OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert CV analysis AI. Analyze the provided CV against the job description and return a comprehensive analysis in JSON format with the following structure:
            {
              "compatibilityScore": number (0-100),
              "position": "job title",
              "companyName": "extracted company name",
              "executiveSummary": {
                "overview": "brief overview",
                "strengths": [{"title": "strength", "description": "detail"}],
                "weaknesses": [{"title": "weakness", "description": "detail"}]
              },
              "keywordAnalysis": {
                "keywords": [{"keyword": "term", "found": boolean, "importance": "high/medium/low"}]
              },
              "compatibilityBreakdown": {
                "technical": {"score": number, "details": "explanation"},
                "experience": {"score": number, "details": "explanation"},
                "education": {"score": number, "details": "explanation"}
              },
              "priorityRecommendations": [{"title": "recommendation", "description": "detail", "priority": "high/medium/low"}],
              "skillsGapAnalysis": {
                "missing": ["skill1", "skill2"],
                "present": ["skill1", "skill2"],
                "recommendations": ["recommendation1", "recommendation2"]
              }
            }`
          },
          {
            role: 'user',
            content: `Job Title: ${request.jobTitle}\n\nJob Description:\n${request.jobDescription}\n\nCV Content:\n${request.cvText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    const analysisContent = openaiData.choices[0]?.message?.content

    if (!analysisContent) {
      throw new Error('No analysis generated from AI')
    }

    // Parse JSON response
    let analysis
    try {
      analysis = JSON.parse(analysisContent)
    } catch (parseError) {
      throw new Error('Failed to parse AI analysis response')
    }

    // Deduct credit
    await supabaseClient
      .from('user_credits')
      .update({ credits: creditsData.credits - 1 })
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        creditsRemaining: creditsData.credits - 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('CV analysis error:', error)
    
    // Security: Log security events for unauthorized access attempts
    if (user && supabaseClient && (error.message === 'Unauthorized' || error.message === 'User ID mismatch')) {
      try {
        await supabaseClient.rpc('log_security_event', {
          event_type: 'unauthorized_access_attempt',
          event_details: {
            endpoint: 'analyze-cv-with-ai',
            error: error.message,
            user_agent: req.headers.get('user-agent')
          },
          target_user_id: user?.id,
          severity: 'warning'
        })
      } catch (logError) {
        console.error('Failed to log security event:', logError)
      }
    }
    
    // Security: Sanitize error messages to prevent information disclosure
    const getErrorResponse = (err: any) => {
      if (err.message === 'Unauthorized' || err.message === 'Missing or invalid authorization header') {
        return { message: 'Unauthorized', status: 401 }
      }
      if (err.message === 'Insufficient credits') {
        return { message: 'Insufficient credits', status: 400 }
      }
      if (err.message === 'User ID mismatch') {
        return { message: 'Invalid request', status: 400 }
      }
      if (err.message && err.message.includes('Invalid') && err.message.includes('content detected')) {
        return { message: 'Invalid input detected', status: 400 }
      }
      if (err.message && err.message.includes('too long')) {
        return { message: 'Input exceeds maximum length', status: 400 }
      }
      // Generic error for unexpected issues
      return { message: 'An error occurred processing your request', status: 500 }
    }

    const errorResponse = getErrorResponse(error)
    
    return new Response(
      JSON.stringify({ error: errorResponse.message }),
      { status: errorResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})