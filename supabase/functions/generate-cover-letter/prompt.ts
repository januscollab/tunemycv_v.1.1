import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CoverLetterRequest, CoverLetterTemplate, ContactInfo } from './types.ts'

export async function fetchCoverLetterTemplate(
  supabaseClient: SupabaseClient,
  tone: string
): Promise<string> {
  const { data: templateData } = await supabaseClient
    .from('cover_letter_templates')
    .select('template_prompt')
    .eq('id', tone)
    .single()

  return templateData?.template_prompt || 'Write a professional cover letter with a formal tone.'
}

export function buildLengthInstruction(length: string): string {
  switch (length) {
    case 'short':
      return 'Keep the cover letter brief and impactful, around 150-200 words. Focus on the most essential points.'
    case 'concise':
      return 'Write a concise cover letter, around 250-300 words. Balance brevity with comprehensive coverage.'
    case 'standard':
      return 'Write a standard-length cover letter, around 350-400 words. Provide thorough coverage of qualifications.'
    case 'detailed':
      return 'Write a detailed cover letter, around 450-500 words. Include comprehensive examples and thorough explanations.'
    default:
      return 'Write a concise cover letter, around 250-300 words.'
  }
}

export function buildAdvancedOptionsText(
  request: CoverLetterRequest,
  contactInfo: ContactInfo
): string {
  let advancedOptionsText = ''
  
  if (request.workExperienceHighlights) {
    advancedOptionsText += `\nKey work experience highlights to emphasize: ${request.workExperienceHighlights}`
  }
  if (request.customHookOpener) {
    advancedOptionsText += `\nCustom opening approach: ${request.customHookOpener}`
  }
  if (request.personalValues) {
    advancedOptionsText += `\nPersonal values and motivations: ${request.personalValues}`
  }
  if (contactInfo.linkedInUrl) {
    advancedOptionsText += `\nInclude LinkedIn profile: ${contactInfo.linkedInUrl}`
  }

  return advancedOptionsText
}

export function buildSystemPrompt(
  templatePrompt: string,
  lengthInstruction: string,
  contactHeader: string,
  companyName: string,
  advancedOptionsText: string
): string {
  return `You are an expert cover letter writer. ${templatePrompt} ${lengthInstruction}

IMPORTANT FORMATTING REQUIREMENTS:
- Start with the date and company information
- Write a compelling cover letter body with proper salutation (Dear Hiring Manager, etc.)
- Highlight relevant experience and skills
- Show genuine enthusiasm for the role
- Include a professional opening and closing
- Be well-structured with clear paragraphs
- Match the requested length and tone precisely
- Do NOT include the candidate's name in the salutation or closing signature
- ALWAYS end with "Sincerely," followed by a blank line, then the complete contact information footer:

PLACEHOLDER FORMATTING:
- If you need to use placeholder text (e.g., for company names, job titles, or other specific information), enclose them in square brackets like [Company Name], [Job Title], [Department Name]
- This helps users easily identify what needs to be customized

${contactHeader}

${advancedOptionsText ? `\nAdditional personalization requirements:${advancedOptionsText}` : ''}

Format the response as a complete, ready-to-send cover letter with proper formatting. The contact information should appear as the very last element after "Sincerely," and should not be duplicated elsewhere in the letter.`
}

export function buildUserPrompt(request: CoverLetterRequest): string {
  return `Write a cover letter for the following position:

Job Title: ${request.jobTitle}
Company: ${request.companyName}
${request.jobDescription ? `Job Description: ${request.jobDescription}` : ''}
${request.cvText ? `My CV/Resume content: ${request.cvText}` : ''}

Please create a compelling cover letter that matches my background to this specific role and demonstrates why I'm the ideal candidate.`
}