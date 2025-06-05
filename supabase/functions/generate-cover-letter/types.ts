export interface CoverLetterRequest {
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

export interface UserProfile {
  first_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  country_code?: string
  linkedin_url?: string
  personal_website_url?: string
}

export interface ContactInfo {
  fullName: string
  phoneNumber: string
  email: string
  linkedInUrl: string
  websiteUrl: string
}

export interface CoverLetterTemplate {
  template_prompt?: string
}

export interface UserCredits {
  credits: number
}

export interface GenerationResult {
  content: string
  tokensUsed: number
  processingTime: number
  costEstimate: number
}