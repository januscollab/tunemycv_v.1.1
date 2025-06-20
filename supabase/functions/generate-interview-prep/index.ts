import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getSecureErrorResponse, logSecurityEvent } from '../shared/security.ts'
import { establishLinkage } from '../shared/documentLinkage.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InterviewPrepRequest {
  analysisResultId?: string
  jobTitle: string
  companyName: string
  jobDescription?: string
  cvText?: string
  includes: {
    companyProfile: boolean
    recentPressReleases: boolean
    interviewTips: boolean
    getNoticedQuestions: boolean
  }
}

interface GenerationResult {
  content: string
  processingTime: number
  tokensUsed: number
  costEstimate: number
}

const systemPrompt = `You are an expert interview preparation coach with extensive knowledge of corporate culture, hiring practices, and career development. Your role is to create comprehensive, personalized interview preparation materials that help candidates succeed.

FORMATTING REQUIREMENTS:
- Structure content with clear headers and sections
- Use bullet points for lists and key information
- Include specific, actionable advice
- Maintain professional yet encouraging tone

CONTENT REQUIREMENTS:
Based on the user's selections, include relevant sections for:
- Company insights and culture analysis
- Recent news and press releases research
- Strategic interview tips and best practices
- Questions that help candidates get noticed

Always provide practical, implementable advice that demonstrates deep understanding of the role and company.`

export default async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid authorization token')
    }

    console.log('[generate-interview-prep] Request from user:', user.id)

    // Parse request body
    const request: InterviewPrepRequest = await req.json()
    console.log('[generate-interview-prep] Request data:', {
      hasAnalysisId: !!request.analysisResultId,
      jobTitle: request.jobTitle,
      companyName: request.companyName,
      includes: request.includes
    })

    // Validate request
    if (!request.jobTitle?.trim() || !request.companyName?.trim()) {
      throw new Error('Job title and company name are required')
    }

    const hasSelectedInclusions = Object.values(request.includes).some(Boolean)
    if (!hasSelectedInclusions) {
      throw new Error('At least one preparation item must be selected')
    }

    // Check user credits
    const { data: userCredits, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    if (creditsError || !userCredits || userCredits.credits < 1) {
      throw new Error('Insufficient credits')
    }

    // Build user prompt based on selections
    const sections: string[] = []
    
    if (request.includes.companyProfile) {
      sections.push(`COMPANY PROFILE & CULTURE:
Provide comprehensive insights about ${request.companyName}, including:
- Company mission, values, and culture
- Recent business developments and strategic direction
- Industry position and competitive landscape
- Leadership team and organizational structure`)
    }

    if (request.includes.recentPressReleases) {
      sections.push(`RECENT NEWS & DEVELOPMENTS:
Research and summarize recent developments about ${request.companyName}:
- Latest press releases and announcements
- Recent partnerships, acquisitions, or expansions
- Industry trends affecting the company
- Notable achievements or milestones`)
    }

    if (request.includes.interviewTips) {
      sections.push(`STRATEGIC INTERVIEW TIPS:
Provide specific interview advice for the ${request.jobTitle} role:
- Key skills and competencies to highlight
- Common interview questions for this role
- How to demonstrate value and fit
- Body language and presentation tips`)
    }

    if (request.includes.getNoticedQuestions) {
      sections.push(`QUESTIONS TO GET NOTICED:
Suggest thoughtful questions to ask the interviewer:
- Questions about company strategy and future
- Role-specific questions that show deep understanding
- Questions about team dynamics and culture
- Questions that demonstrate genuine interest`)
    }

    const userPrompt = `Generate comprehensive interview preparation notes for:

ROLE: ${request.jobTitle}
COMPANY: ${request.companyName}

${request.jobDescription ? `JOB DESCRIPTION:\n${request.jobDescription}\n` : ''}
${request.cvText ? `CANDIDATE CV:\n${request.cvText}\n` : ''}

REQUESTED SECTIONS:
${sections.join('\n\n')}

Create a well-structured, actionable interview preparation guide that helps the candidate succeed.`

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate interview prep with AI
    console.log('[generate-interview-prep] Generating content...')
    
    const startTime = Date.now()
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content generated from OpenAI')
    }

    console.log('[generate-interview-prep] Generated content length:', content.length)

    const processingTime = Date.now() - startTime
    const tokensUsed = openaiData.usage?.total_tokens || 0

    // Save interview prep to database
    const { data: interviewPrepData, error: saveError } = await supabaseClient
      .from('interview_prep')
      .insert({
        user_id: user.id,
        analysis_result_id: request.analysisResultId || null,
        job_title: request.jobTitle,
        company_name: request.companyName,
        content: content,
        generation_parameters: {
          includes: request.includes,
          hasJobDescription: !!request.jobDescription,
          hasCvText: !!request.cvText
        },
        credits_used: 1
      })
      .select()
      .single()

    if (saveError) {
      throw new Error(`Failed to save interview prep: ${saveError.message}`)
    }

    // Establish linkage if generated from analysis
    if (request.analysisResultId && interviewPrepData) {
      try {
        await establishLinkage(request.analysisResultId, interviewPrepData.id, 'interview_prep')
        console.log('[generate-interview-prep] Linkage established')
      } catch (linkageError) {
        console.error('[generate-interview-prep] Linkage failed:', linkageError)
      }
    }

    // Deduct credit
    await supabaseClient
      .from('user_credits')
      .update({ credits: userCredits.credits - 1 })
      .eq('user_id', user.id)

    // Log operation
    await supabaseClient
      .from('analysis_logs')
      .insert({
        user_id: user.id,
        operation_type: 'interview_prep_generation',
        openai_model: 'gpt-4o-mini',
        prompt_text: `${systemPrompt}\n\n${userPrompt}`,
        response_text: content,
        status: 'success',
        processing_time_ms: processingTime,
        tokens_used: tokensUsed,
        cost_estimate: (tokensUsed * 0.00015) / 1000 // Approximate cost
      })

    console.log('[generate-interview-prep] Successfully generated interview prep')

    return new Response(
      JSON.stringify({
        success: true,
        interviewPrep: interviewPrepData,
        content: content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[generate-interview-prep] Error:', error)
    
    const errorResponse = getSecureErrorResponse(error, 'generate-interview-prep')
    
    return new Response(
      JSON.stringify({ 
        error: errorResponse.message,
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: errorResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}