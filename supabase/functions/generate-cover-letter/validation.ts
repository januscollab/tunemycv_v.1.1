import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { UserCredits } from './types.ts'

export async function validateUserCredits(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<UserCredits> {
  const { data: creditsData, error: creditsError } = await supabaseClient
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .single()

  if (creditsError || !creditsData || creditsData.credits < 1) {
    throw new Error('Insufficient credits')
  }

  return creditsData
}