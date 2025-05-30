
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const checkAndDeductCredits = async (
  userId: string,
  supabase: any
): Promise<{ success: boolean; remainingCredits?: number; error?: string }> => {
  console.log('Checking and deducting user credits for user:', userId);

  // Check user credits
  const { data: userCredits, error: creditsError } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .single();

  if (creditsError || !userCredits || userCredits.credits < 1) {
    return { 
      success: false, 
      error: 'Insufficient credits for AI analysis' 
    };
  }

  // Deduct credit
  const { error: creditUpdateError } = await supabase
    .from('user_credits')
    .update({ credits: userCredits.credits - 1 })
    .eq('user_id', userId);

  if (creditUpdateError) {
    console.error('Failed to update credits:', creditUpdateError);
    return { 
      success: false, 
      error: 'Failed to update credits' 
    };
  }

  return { 
    success: true, 
    remainingCredits: userCredits.credits - 1 
  };
};
