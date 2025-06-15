import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import { 
  authenticateUser, 
  validateInput, 
  logSecurityEvent, 
  getSecureErrorResponse,
  checkRateLimit 
} from '../shared/security.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CoverLetterRequest {
  jobTitle: string
  companyName: string
  jobDescription?: string
  cvText?: string
  tone: string
  length: string
  analysisResultId?: string
  workExperienceHighlights?: string
  customHookOpener?: string
  personalValues?: string
  includeLinkedInUrl?: boolean
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

    // Security: Rate limiting (5 requests per minute per user)
    if (!checkRateLimit(user.id, 5, 60000)) {
      throw new Error('Rate limit exceeded')
    }

    // Security: Parse and validate request data
    const rawRequest = await req.json()
    const request: CoverLetterRequest = {
      jobTitle: validateInput(rawRequest.jobTitle, 'job title', 200),
      companyName: validateInput(rawRequest.companyName, 'company name', 200),
      jobDescription: rawRequest.jobDescription ? validateInput(rawRequest.jobDescription, 'job description', 20000) : undefined,
      cvText: rawRequest.cvText ? validateInput(rawRequest.cvText, 'CV text', 50000) : undefined,
      tone: validateInput(rawRequest.tone, 'tone', 50),
      length: validateInput(rawRequest.length, 'length', 50),
      analysisResultId: rawRequest.analysisResultId,
      workExperienceHighlights: rawRequest.workExperienceHighlights ? validateInput(rawRequest.workExperienceHighlights, 'work experience highlights', 2000) : undefined,
      customHookOpener: rawRequest.customHookOpener ? validateInput(rawRequest.customHookOpener, 'custom hook opener', 1000) : undefined,
      personalValues: rawRequest.personalValues ? validateInput(rawRequest.personalValues, 'personal values', 1000) : undefined,
      includeLinkedInUrl: Boolean(rawRequest.includeLinkedInUrl)
    }

    // Validate user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    if (creditsError || !creditsData || creditsData.credits < 1) {
      throw new Error('Insufficient credits')
    }

    // Get user profile for contact info
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Build contact header with all available information
    let contactHeader = ''
    let contactDetails = {
      name: '',
      phone: '',
      email: '',
      linkedin: '',
      portfolio: ''
    }

    if (profileData) {
      // Build structured contact info
      const name = profileData.first_name && profileData.last_name 
        ? `${profileData.first_name} ${profileData.last_name}` 
        : profileData.first_name || ''
      
      contactDetails.name = name
      contactDetails.phone = profileData.phone_number || ''
      contactDetails.email = profileData.email || ''
      contactDetails.linkedin = (request.includeLinkedInUrl && profileData.linkedin_url) ? profileData.linkedin_url : ''
      contactDetails.portfolio = profileData.personal_website_url || ''

      // Build contact header for signature
      const parts = []
      if (name) parts.push(name)
      if (profileData.phone_number) parts.push(profileData.phone_number)
      if (profileData.email) parts.push(profileData.email)
      if (request.includeLinkedInUrl && profileData.linkedin_url) parts.push(profileData.linkedin_url)
      if (profileData.personal_website_url) parts.push(profileData.personal_website_url)
      
      contactHeader = parts.join(' | ')
    }

    // Build length instruction
    let lengthInstruction = 'Write a concise cover letter (3 paragraphs, around 200-300 words).'
    if (request.length === 'brief') {
      lengthInstruction = 'Keep the cover letter concise (2-3 paragraphs, around 150-200 words).'
    } else if (request.length === 'standard') {
      lengthInstruction = 'Write a standard length cover letter (3-4 paragraphs, around 250-350 words).'
    } else if (request.length === 'detailed') {
      lengthInstruction = 'Write a comprehensive cover letter (4-5 paragraphs, around 400-500 words).'
    }

    // Build system prompt with contact information instructions
    const systemPrompt = `Write a professional cover letter that is engaging, specific, and tailored to the job requirements. 
    Use a confident but humble tone, highlight relevant achievements with specific examples, and show genuine interest in the company and role.
    Avoid generic phrases and focus on value proposition.
    Write in first person using "I" statements throughout.
    Do not use quotation marks anywhere in the response.

    ${lengthInstruction}

    Company: ${request.companyName}

    CONTACT INFORMATION TO USE:
    ${contactDetails.name ? `- Name: ${contactDetails.name}` : '- Name: [Your Name]'}
    ${contactDetails.phone ? `- Phone: ${contactDetails.phone}` : '- Phone: [Your Phone Number]'}
    ${contactDetails.email ? `- Email: ${contactDetails.email}` : '- Email: [Your Email Address]'}
    ${contactDetails.linkedin ? `- LinkedIn: ${contactDetails.linkedin}` : ''}
    ${contactDetails.portfolio ? `- Portfolio: ${contactDetails.portfolio}` : ''}

    IMPORTANT FORMATTING:
    - Include company name and address if available
    - Add a blank line, then "Dear Hiring Manager," (ensure there's a space after the company section)
    - Write the cover letter body with proper paragraphs separated by blank lines
    - Each paragraph should be on its own line with a blank line between paragraphs
    - End with "Sincerely," followed by a blank line
    - Include the contact information footer with all available details: ${contactHeader || 'Use the contact information provided above'}
    - Do NOT include the candidate's name in the signature area unless it's already in the contact footer
    - Ensure proper line spacing throughout the document

    PLACEHOLDER RULES:
    - Replace [Your Name] with actual name if available: ${contactDetails.name || '[Your Name]'}
    - Replace [Your Phone Number] with actual phone if available: ${contactDetails.phone || '[Your Phone Number]'}
    - Replace [Your Email Address] with actual email if available: ${contactDetails.email || '[Your Email Address]'}
    - Include LinkedIn URL in contact footer if provided: ${contactDetails.linkedin || ''}
    - Include portfolio URL in contact footer if provided: ${contactDetails.portfolio || ''}

    ${request.workExperienceHighlights ? `Key experience to highlight: ${request.workExperienceHighlights}` : ''}
    ${request.customHookOpener ? `Use this opening approach: ${request.customHookOpener}` : ''}
    ${request.personalValues ? `Incorporate these personal values: ${request.personalValues}` : ''}

    Important: Return only the cover letter content without any additional commentary or formatting markers. Use actual contact information when available, only use placeholders for missing information.`

    // Build user prompt
    const userPrompt = `Job Title: ${request.jobTitle}
Company: ${request.companyName}

${request.jobDescription ? `Job Description:\n${request.jobDescription}\n\n` : ''}

${request.cvText ? `My CV/Resume:\n${request.cvText}` : ''}`

    // Get site settings for OpenAI API key
    const { data: siteSettings, error: settingsError } = await supabaseClient
      .from('site_settings')
      .select('openai_api_key_encrypted')
      .limit(1)
      .single()

    if (settingsError || !siteSettings?.openai_api_key_encrypted) {
      throw new Error('OpenAI API key not configured. Please contact administrator.')
    }

    // Generate cover letter with AI
    const startTime = Date.now()
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${siteSettings.openai_api_key_encrypted}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 2000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content generated from OpenAI')
    }

    const processingTime = Date.now() - startTime
    const tokensUsed = openaiData.usage?.total_tokens || 0

    // Save to database
    const { data: coverLetterData, error: saveError } = await supabaseClient
      .from('cover_letters')
      .insert({
        user_id: user.id,
        job_title: request.jobTitle,
        company_name: request.companyName,
        content: content,
        template_id: request.tone,
        generation_parameters: {
          tone: request.tone,
          length: request.length,
          includeLinkedInUrl: request.includeLinkedInUrl
        },
        analysis_result_id: request.analysisResultId,
        work_experience_highlights: request.workExperienceHighlights,
        custom_hook_opener: request.customHookOpener,
        personal_values: request.personalValues,
        include_linkedin_url: request.includeLinkedInUrl,
        credits_used: 1,
        regeneration_count: 0
      })
      .select()
      .single()

    if (saveError) {
      throw new Error(`Failed to save cover letter: ${saveError.message}`)
    }

    // Log the operation
    await supabaseClient
      .from('cover_letter_logs')
      .insert({
        user_id: user.id,
        cover_letter_id: coverLetterData.id,
        system_prompt: systemPrompt,
        user_prompt: userPrompt,
        processing_time_ms: processingTime,
        tokens_used: tokensUsed,
        cost_estimate: (tokensUsed / 1000) * 0.0001
      })

    // Deduct credit
    await supabaseClient
      .from('user_credits')
      .update({ credits: creditsData.credits - 1 })
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        coverLetter: coverLetterData,
        content: content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    // Enhanced error logging for debugging
    console.error('[generate-cover-letter] Error occurred:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userId: user?.id,
      hasSupabaseClient: !!supabaseClient
    })
    
    // Security: Log security events for suspicious activities
    if (user && supabaseClient) {
      if (error.message === 'Rate limit exceeded') {
        await logSecurityEvent(supabaseClient, 'rate_limit_exceeded', {
          endpoint: 'generate-cover-letter',
          user_agent: req.headers.get('user-agent')
        }, user.id, 'warning')
      } else if (error.message.includes('Invalid') && error.message.includes('content detected')) {
        await logSecurityEvent(supabaseClient, 'malicious_input_detected', {
          endpoint: 'generate-cover-letter',
          error: error.message,
          user_agent: req.headers.get('user-agent')
        }, user.id, 'high')
      }
      
      // Log all errors for debugging
      try {
        await logSecurityEvent(supabaseClient, 'function_error', {
          endpoint: 'generate-cover-letter',
          error: error.message,
          stack: error.stack,
          user_agent: req.headers.get('user-agent')
        }, user.id, 'info')
      } catch (logError) {
        console.error('[generate-cover-letter] Failed to log error:', logError)
      }
    }
    
    const errorResponse = getSecureErrorResponse(error, 'generate-cover-letter')
    
    return new Response(
      JSON.stringify({ 
        error: errorResponse.message,
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: errorResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})