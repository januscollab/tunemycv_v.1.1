
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { 
      jobTitle, 
      companyName, 
      jobDescription, 
      cvText, 
      tone, 
      length, 
      analysisResultId,
      workExperienceHighlights,
      customHookOpener,
      personalValues,
      includeLinkedInUrl
    }: CoverLetterRequest = await req.json()

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    if (creditsError || !creditsData || creditsData.credits < 1) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get LinkedIn URL if needed
    let linkedInUrl = ''
    if (includeLinkedInUrl) {
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('linkedin_url')
        .eq('id', user.id)
        .single()
      
      linkedInUrl = profileData?.linkedin_url || ''
    }

    // Get template prompt
    const { data: templateData } = await supabaseClient
      .from('cover_letter_templates')
      .select('template_prompt')
      .eq('id', tone)
      .single()

    const templatePrompt = templateData?.template_prompt || 'Write a professional cover letter with a formal tone.'

    // Build the prompt with enhanced length instructions
    let lengthInstruction = ''
    switch (length) {
      case 'short':
        lengthInstruction = 'Keep the cover letter brief and impactful, around 150-200 words. Focus on the most essential points.'
        break
      case 'concise':
        lengthInstruction = 'Write a concise cover letter, around 250-300 words. Balance brevity with comprehensive coverage.'
        break
      case 'standard':
        lengthInstruction = 'Write a standard-length cover letter, around 350-400 words. Provide thorough coverage of qualifications.'
        break
      case 'detailed':
        lengthInstruction = 'Write a detailed cover letter, around 450-500 words. Include comprehensive examples and thorough explanations.'
        break
      default:
        lengthInstruction = 'Write a concise cover letter, around 250-300 words.'
    }

    // Build advanced options text
    let advancedOptionsText = ''
    if (workExperienceHighlights) {
      advancedOptionsText += `\nKey work experience highlights to emphasize: ${workExperienceHighlights}`
    }
    if (customHookOpener) {
      advancedOptionsText += `\nCustom opening approach: ${customHookOpener}`
    }
    if (personalValues) {
      advancedOptionsText += `\nPersonal values and motivations: ${personalValues}`
    }
    if (linkedInUrl) {
      advancedOptionsText += `\nInclude LinkedIn profile: ${linkedInUrl}`
    }

    const systemPrompt = `You are an expert cover letter writer. ${templatePrompt} ${lengthInstruction}

The cover letter should:
- Always start with this exact header format:
  "Hiring Manager  
  [Company Name]
  [Company Address]  
  [City, State, Zip]  
  
  Dear Hiring Manager,"
- Be tailored specifically to the job and company
- Highlight relevant experience and skills
- Show genuine enthusiasm for the role
- Include a professional opening and closing
- Be well-structured with clear paragraphs
- Match the requested length and tone precisely
${advancedOptionsText ? `\nAdditional personalization requirements:${advancedOptionsText}` : ''}

Format the response as a complete, ready-to-send cover letter with proper formatting, always starting with the required header format above.`

    const userPrompt = `Write a cover letter for the following position:

Job Title: ${jobTitle}
Company: ${companyName}
${jobDescription ? `Job Description: ${jobDescription}` : ''}
${cvText ? `My CV/Resume content: ${cvText}` : ''}

Please create a compelling cover letter that matches my background to this specific role and demonstrates why I'm the ideal candidate.`

    const startTime = Date.now()

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
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
    const costEstimate = (tokensUsed / 1000) * 0.0001 // Rough estimate for gpt-4o-mini

    // Save cover letter to database
    const { data: coverLetterData, error: coverLetterError } = await supabaseClient
      .from('cover_letters')
      .insert({
        user_id: user.id,
        analysis_result_id: analysisResultId || null,
        job_title: jobTitle,
        company_name: companyName,
        content: content,
        template_id: tone,
        generation_parameters: {
          length,
          tone,
          hasJobDescription: !!jobDescription,
          hasCvText: !!cvText
        },
        credits_used: 1,
        work_experience_highlights: workExperienceHighlights || null,
        custom_hook_opener: customHookOpener || null,
        personal_values: personalValues || null,
        include_linkedin_url: includeLinkedInUrl || false
      })
      .select()
      .single()

    if (coverLetterError) {
      throw new Error(`Failed to save cover letter: ${coverLetterError.message}`)
    }

    // Log the operation
    await supabaseClient
      .from('analysis_logs')
      .insert({
        user_id: user.id,
        cover_letter_id: coverLetterData.id,
        operation_type: 'cover_letter_generation',
        openai_model: 'gpt-4o-mini',
        prompt_text: `${systemPrompt}\n\n${userPrompt}`,
        response_text: content,
        status: 'success',
        processing_time_ms: processingTime,
        tokens_used: tokensUsed,
        cost_estimate: costEstimate
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
    console.error('Cover letter generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
