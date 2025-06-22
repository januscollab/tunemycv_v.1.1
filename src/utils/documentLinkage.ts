import { supabase } from '@/integrations/supabase/client';

export interface DocumentLinkage {
  hasLinkedCoverLetter: boolean;
  hasLinkedInterviewPrep: boolean;
  linkedCoverLetterId?: string;
  linkedInterviewPrepId?: string;
}

export interface LinkedDocument {
  id: string;
  type: 'cover_letter' | 'interview_prep';
  title: string;
  created_at: string;
}

/**
 * Get linkage information for an analysis result
 */
export async function getAnalysisLinkage(analysisId: string): Promise<DocumentLinkage> {
  try {
    const { data: analysis } = await supabase
      .from('analysis_results')
      .select('linked_cover_letter_id, linked_interview_prep_id')
      .eq('id', analysisId)
      .single();

    // Also check if documents reference this analysis directly
    const { data: coverLetters } = await supabase
      .from('cover_letters')
      .select('id')
      .eq('analysis_result_id', analysisId)
      .limit(1);

    const { data: interviewPrep } = await supabase
      .from('interview_prep')
      .select('id')
      .eq('analysis_result_id', analysisId)
      .limit(1);

    return {
      hasLinkedCoverLetter: !!(analysis?.linked_cover_letter_id || coverLetters?.length),
      hasLinkedInterviewPrep: !!(analysis?.linked_interview_prep_id || interviewPrep?.length),
      linkedCoverLetterId: analysis?.linked_cover_letter_id || coverLetters?.[0]?.id,
      linkedInterviewPrepId: analysis?.linked_interview_prep_id || interviewPrep?.[0]?.id,
    };
  } catch (error) {
    console.error('Error getting analysis linkage:', error);
    return {
      hasLinkedCoverLetter: false,
      hasLinkedInterviewPrep: false,
    };
  }
}

/**
 * Get all linked documents for an analysis
 */
export async function getLinkedDocuments(analysisId: string): Promise<LinkedDocument[]> {
  try {
    const documents: LinkedDocument[] = [];

    // Get linked cover letters
    const { data: coverLetters } = await supabase
      .from('cover_letters')
      .select('id, job_title, company_name, created_at')
      .eq('analysis_result_id', analysisId);

    if (coverLetters) {
      documents.push(...coverLetters.map(cl => ({
        id: cl.id,
        type: 'cover_letter' as const,
        title: `${cl.job_title} - ${cl.company_name}`,
        created_at: cl.created_at
      })));
    }

    // Get linked interview prep
    const { data: interviewPrep } = await supabase
      .from('interview_prep')
      .select('id, job_title, company_name, created_at')
      .eq('analysis_result_id', analysisId);

    if (interviewPrep) {
      documents.push(...interviewPrep.map(ip => ({
        id: ip.id,
        type: 'interview_prep' as const,
        title: `${ip.job_title} - ${ip.company_name}`,
        created_at: ip.created_at
      })));
    }

    return documents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error getting linked documents:', error);
    return [];
  }
}

/**
 * Create bidirectional linkage between documents
 */
export async function establishLinkage(
  analysisId: string,
  documentId: string,
  documentType: 'cover_letter' | 'interview_prep'
): Promise<boolean> {
  try {
    // Update analysis_results with the new linkage
    const analysisUpdate = documentType === 'cover_letter' 
      ? { linked_cover_letter_id: documentId }
      : { linked_interview_prep_id: documentId };

    await supabase
      .from('analysis_results')
      .update(analysisUpdate)
      .eq('id', analysisId);

    // If this is an interview prep, also link it to any existing cover letter
    if (documentType === 'interview_prep') {
      const { data: existingCoverLetter } = await supabase
        .from('cover_letters')
        .select('id')
        .eq('analysis_result_id', analysisId)
        .single();

      if (existingCoverLetter) {
        // Link interview prep to cover letter
        await supabase
          .from('interview_prep')
          .update({ linked_cover_letter_id: existingCoverLetter.id })
          .eq('id', documentId);

        // Link cover letter to interview prep
        await supabase
          .from('cover_letters')
          .update({ linked_interview_prep_id: documentId })
          .eq('id', existingCoverLetter.id);
      }
    }

    // If this is a cover letter, also link it to any existing interview prep
    if (documentType === 'cover_letter') {
      const { data: existingInterviewPrep } = await supabase
        .from('interview_prep')
        .select('id')
        .eq('analysis_result_id', analysisId)
        .single();

      if (existingInterviewPrep) {
        // Link cover letter to interview prep
        await supabase
          .from('cover_letters')
          .update({ linked_interview_prep_id: existingInterviewPrep.id })
          .eq('id', documentId);

        // Link interview prep to cover letter
        await supabase
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