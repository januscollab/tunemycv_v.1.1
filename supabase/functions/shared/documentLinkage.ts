import { SupabaseClient, createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Create bidirectional linkage between documents
 */
export async function establishLinkage(
  analysisId: string,
  documentId: string,
  documentType: 'cover_letter' | 'interview_prep'
): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Update analysis_results with the new linkage
    const analysisUpdate = documentType === 'cover_letter' 
      ? { linked_cover_letter_id: documentId }
      : { linked_interview_prep_id: documentId };

    await supabaseClient
      .from('analysis_results')
      .update(analysisUpdate)
      .eq('id', analysisId);

    // If this is an interview prep, also link it to any existing cover letter
    if (documentType === 'interview_prep') {
      const { data: existingCoverLetter } = await supabaseClient
        .from('cover_letters')
        .select('id')
        .eq('analysis_result_id', analysisId)
        .single();

      if (existingCoverLetter) {
        // Link interview prep to cover letter
        await supabaseClient
          .from('interview_prep')
          .update({ linked_cover_letter_id: existingCoverLetter.id })
          .eq('id', documentId);

        // Link cover letter to interview prep
        await supabaseClient
          .from('cover_letters')
          .update({ linked_interview_prep_id: documentId })
          .eq('id', existingCoverLetter.id);
      }
    }

    // If this is a cover letter, also link it to any existing interview prep
    if (documentType === 'cover_letter') {
      const { data: existingInterviewPrep } = await supabaseClient
        .from('interview_prep')
        .select('id')
        .eq('analysis_result_id', analysisId)
        .single();

      if (existingInterviewPrep) {
        // Link cover letter to interview prep
        await supabaseClient
          .from('cover_letters')
          .update({ linked_interview_prep_id: existingInterviewPrep.id })
          .eq('id', documentId);

        // Link interview prep to cover letter
        await supabaseClient
          .from('interview_prep')
          .update({ linked_cover_letter_id: documentId })
          .eq('id', existingInterviewPrep.id);
      }
    }

    return true;
  } catch (error) {
    console.error('Error establishing linkage:', error);
    return false;
  }
}