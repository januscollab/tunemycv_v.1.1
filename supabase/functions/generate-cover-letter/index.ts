
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { CoverLetterRequest } from './types.ts'
import { authenticateUser } from './auth.ts'
import { validateUserCredits } from './validation.ts'
import { fetchUserProfile, formatContactInfo, buildContactHeader } from './profile.ts'
import { 
  fetchCoverLetterTemplate, 
  buildLengthInstruction, 
  buildAdvancedOptionsText, 
  buildSystemPrompt, 
  buildUserPrompt 
} from './prompt.ts'
import { generateCoverLetterWithAI } from './ai.ts'
import { saveCoverLetter, logOperation, deductCredit } from './database.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const { user, supabaseClient } = await authenticateUser(req)

    // Parse request data
    const request: CoverLetterRequest = await req.json()

    // Validate user credits
    const creditsData = await validateUserCredits(supabaseClient, user.id)

    // Get user profile and format contact info
    const profileData = await fetchUserProfile(supabaseClient, user.id)
    const contactInfo = formatContactInfo(profileData, request.includeLinkedInUrl)
    const contactHeader = buildContactHeader(contactInfo)

    // Get template and build prompts
    const templatePrompt = await fetchCoverLetterTemplate(supabaseClient, request.tone)
    const lengthInstruction = buildLengthInstruction(request.length)
    const advancedOptionsText = buildAdvancedOptionsText(request, contactInfo)
    
    const systemPrompt = buildSystemPrompt(
      templatePrompt,
      lengthInstruction,
      contactHeader,
      request.companyName,
      advancedOptionsText
    )
    const userPrompt = buildUserPrompt(request)

    // Generate cover letter with AI
    const result = await generateCoverLetterWithAI(systemPrompt, userPrompt)

    // Save to database
    const coverLetterData = await saveCoverLetter(supabaseClient, user.id, request, result.content)

    // Log the operation
    await logOperation(supabaseClient, user.id, coverLetterData.id, systemPrompt, userPrompt, result)

    // Deduct credit
    await deductCredit(supabaseClient, user.id, creditsData)

    return new Response(
      JSON.stringify({
        success: true,
        coverLetter: coverLetterData,
        content: result.content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Cover letter generation error:', error)
    
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
