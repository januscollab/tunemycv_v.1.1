import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { UserProfile, ContactInfo } from './types.ts'

export async function fetchUserProfile(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data: profileData } = await supabaseClient
    .from('profiles')
    .select('first_name, last_name, email, phone_number, country_code, linkedin_url, personal_website_url')
    .eq('id', userId)
    .single()
  
  return profileData
}

export function formatContactInfo(
  profile: UserProfile | null,
  includeLinkedInUrl?: boolean
): ContactInfo {
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile?.first_name 
      ? profile.first_name 
      : '[Your Name]'
  
  const phoneNumber = profile?.phone_number 
    ? `${profile.country_code || ''}${profile.phone_number}` 
    : '[Your Phone Number]'
  
  const email = profile?.email || '[Your Email Address]'
  const linkedInUrl = (includeLinkedInUrl && profile?.linkedin_url) ? profile.linkedin_url : ''
  const websiteUrl = profile?.personal_website_url || ''

  return {
    fullName,
    phoneNumber,
    email,
    linkedInUrl,
    websiteUrl
  }
}

export function buildContactHeader(contactInfo: ContactInfo): string {
  let contactHeader = `${contactInfo.fullName}\n${contactInfo.phoneNumber}\n${contactInfo.email}`
  if (contactInfo.linkedInUrl) contactHeader += `\n${contactInfo.linkedInUrl}`
  if (contactInfo.websiteUrl) contactHeader += `\n${contactInfo.websiteUrl}`
  return contactHeader
}