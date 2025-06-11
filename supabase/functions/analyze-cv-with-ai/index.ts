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

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request
    const request: AnalysisRequest = await req.json()

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
    
    const errorMessage = error.message === 'Unauthorized' ? 'Unauthorized' :
                        error.message === 'Insufficient credits' ? 'Insufficient credits' :
                        error.message

    const statusCode = error.message === 'Unauthorized' ? 401 :
                      error.message === 'Insufficient credits' ? 400 :
                      500

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})