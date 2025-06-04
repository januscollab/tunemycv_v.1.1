import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CoverLetterRequest, GenerationResult, UserCredits } from './types.ts'

export async function saveCoverLetter(
  supabaseClient: SupabaseClient,
  userId: string,
  request: CoverLetterRequest,
  content: string
) {
  const { data: coverLetterData, error: coverLetterError } = await supabaseClient
    .from('cover_letters')
    .insert({
      user_id: userId,
      analysis_result_id: request.analysisResultId || null,
      job_title: request.jobTitle,
      company_name: request.companyName,
      content: content,
      template_id: request.tone,
      generation_parameters: {
        length: request.length,
        tone: request.tone,
        hasJobDescription: !!request.jobDescription,
        hasCvText: !!request.cvText
      },
      credits_used: 1,
      work_experience_highlights: request.workExperienceHighlights || null,
      custom_hook_opener: request.customHookOpener || null,
      personal_values: request.personalValues || null,
      include_linkedin_url: request.includeLinkedInUrl || false
    })
    .select()
    .single()

  if (coverLetterError) {
    throw new Error(`Failed to save cover letter: ${coverLetterError.message}`)
  }

  return coverLetterData
}

export async function logOperation(
  supabaseClient: SupabaseClient,
  userId: string,
  coverLetterId: string,
  systemPrompt: string,
  userPrompt: string,
  result: GenerationResult
) {
  await supabaseClient
    .from('analysis_logs')
    .insert({
      user_id: userId,
      cover_letter_id: coverLetterId,
      operation_type: 'cover_letter_generation',
      openai_model: 'gpt-4o-mini',
      prompt_text: `${systemPrompt}\n\n${userPrompt}`,
      response_text: result.content,
      status: 'success',
      processing_time_ms: result.processingTime,
      tokens_used: result.tokensUsed,
      cost_estimate: result.costEstimate
    })
}

export async function deductCredit(
  supabaseClient: SupabaseClient,
  userId: string,
  currentCredits: UserCredits
) {
  await supabaseClient
    .from('user_credits')
    .update({ credits: currentCredits.credits - 1 })
    .eq('user_id', userId)
}