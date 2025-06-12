import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GenerateCoverLetterParams {
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
  cvText?: string;
  tone: string;
  length: string;
  analysisResultId?: string;
  workExperienceHighlights?: string;
  customHookOpener?: string;
  personalValues?: string;
  includeLinkedInUrl?: boolean;
}

interface GenerateFromAnalysisParams {
  analysisResultId: string;
  tone: string;
  length: string;
  workExperienceHighlights?: string;
  customHookOpener?: string;
  personalValues?: string;
  includeLinkedInUrl?: boolean;
}

interface RegenerateCoverLetterParams {
  coverLetterId: string;
  tone: string;
  length: string;
}

export const useCoverLetter = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('concise');
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showNoAnalysisModal, setShowNoAnalysisModal] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setSelectedAnalysisId('');
    setCompanyName('');
    setJobTitle('');
    setTone('professional');
    setLength('concise');
    setCoverLetter(null);
    setHasGenerated(false);
  };

  const generateCoverLetter = async (params: GenerateCoverLetterParams) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: params
      });

      if (error) throw error;

      setCoverLetter(data);
      setHasGenerated(true);

      toast({
        title: 'Cover Letter Generated!',
        description: 'Your cover letter has been created successfully.',
      });

      return data;
    } catch (error: any) {
      console.error('Cover letter generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate cover letter. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromAnalysis = async (params: GenerateFromAnalysisParams) => {
    setIsGenerating(true);
    try {
      // Get analysis data
      const { data: analysisData, error: analysisError } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('id', params.analysisResultId)
        .single();

      if (analysisError) throw analysisError;

      // Generate cover letter using analysis data
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          jobTitle: analysisData.job_title,
          companyName: analysisData.company_name,
          jobDescription: analysisData.job_description_extracted_text,
          cvText: analysisData.cv_extracted_text,
          tone: params.tone,
          length: params.length,
          analysisResultId: params.analysisResultId,
          workExperienceHighlights: params.workExperienceHighlights,
          customHookOpener: params.customHookOpener,
          personalValues: params.personalValues,
          includeLinkedInUrl: params.includeLinkedInUrl
        }
      });

      if (error) throw error;

      setCoverLetter(data);
      setHasGenerated(true);

      toast({
        title: 'Cover Letter Generated!',
        description: 'Your cover letter has been created from your analysis.',
      });

      return data;
    } catch (error: any) {
      console.error('Cover letter generation from analysis error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate cover letter from analysis. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateCoverLetter = async (params: RegenerateCoverLetterParams) => {
    setIsRegenerating(true);
    try {
      // Get the original cover letter data
      const { data: originalData, error: fetchError } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('id', params.coverLetterId)
        .single();

      if (fetchError) throw fetchError;

      // Check regeneration count for credit calculation - now 2 free regenerations
      const isFreeregeneration = originalData.regeneration_count < 2;
      
      if (!isFreeregeneration) {
        // Check credits for paid regeneration
        const { data: creditsData } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', originalData.user_id)
          .single();

        if (!creditsData || creditsData.credits < 1) {
          throw new Error('Insufficient credits for regeneration');
        }
      }

      // Generate new content with updated parameters
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          jobTitle: originalData.job_title,
          companyName: originalData.company_name,
          tone: params.tone,
          length: params.length,
          analysisResultId: originalData.analysis_result_id,
          workExperienceHighlights: originalData.work_experience_highlights,
          customHookOpener: originalData.custom_hook_opener,
          personalValues: originalData.personal_values,
          includeLinkedInUrl: originalData.include_linkedin_url
        }
      });

      if (error) throw error;

      // Safely handle generation_parameters - ensure it's an object and cast to Json
      const existingParams = originalData.generation_parameters || {};
      const updatedParams = typeof existingParams === 'object' && existingParams !== null 
        ? { ...existingParams as Record<string, any>, length: params.length, tone: params.tone }
        : { length: params.length, tone: params.tone };

      // Update the original cover letter with new content and increment regeneration count
      const { error: updateError } = await supabase
        .from('cover_letters')
        .update({
          content: data.content,
          template_id: params.tone,
          generation_parameters: updatedParams as any,
          regeneration_count: originalData.regeneration_count + 1,
          credits_used: originalData.credits_used + (isFreeregeneration ? 0 : 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.coverLetterId);

      if (updateError) throw updateError;

      toast({
        title: 'Cover Letter Regenerated!',
        description: isFreeregeneration 
          ? 'Your cover letter has been regenerated (free regeneration).'
          : 'Your cover letter has been regenerated (1 credit used).',
      });

      return { 
        content: data.content, 
        id: params.coverLetterId,
        regeneration_count: originalData.regeneration_count + 1
      };
    } catch (error: any) {
      console.error('Cover letter regeneration error:', error);
      toast({
        title: 'Regeneration Failed',
        description: error.message || 'Failed to regenerate cover letter. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsRegenerating(false);
    }
  };

  const getCoverLetters = async () => {
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cover letters:', error);
      throw error;
    }

    return data;
  };

  const updateCoverLetter = async (id: string, content: string) => {
    console.log('[useCoverLetter] updateCoverLetter called:', {
      id,
      contentType: typeof content,
      isJSON: content.startsWith('{'),
      contentLength: content.length
    });

    const { error } = await supabase
      .from('cover_letters')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('[useCoverLetter] Error updating cover letter:', error);
      throw error;
    }

    console.log('[useCoverLetter] Cover letter updated successfully');
    toast({
      title: 'Cover Letter Updated',
      description: 'Your changes have been saved successfully.',
    });
  };

  const deleteCoverLetter = async (id: string) => {
    const { error } = await supabase
      .from('cover_letters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting cover letter:', error);
      throw error;
    }

    toast({
      title: 'Cover Letter Deleted',
      description: 'The cover letter has been removed.',
    });
  };

  return {
    generateCoverLetter,
    generateFromAnalysis,
    regenerateCoverLetter,
    getCoverLetters,
    updateCoverLetter,
    deleteCoverLetter,
    isGenerating,
    isRegenerating,
    analyses,
    selectedAnalysisId,
    setSelectedAnalysisId,
    companyName,
    setCompanyName,
    jobTitle,
    setJobTitle,
    tone,
    setTone,
    length,
    setLength,
    coverLetter,
    hasGenerated,
    showNoAnalysisModal,
    setShowNoAnalysisModal,
    resetForm
  };
};
