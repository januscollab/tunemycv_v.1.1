
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
}

interface GenerateFromAnalysisParams {
  analysisResultId: string;
  tone: string;
  length: string;
}

interface RegenerateCoverLetterParams {
  coverLetterId: string;
  tone: string;
  length: string;
}

interface GeneratedLetter {
  id: string;
  content: string;
  job_title: string;
  company_name: string;
  regeneration_count?: number;
}

export const useCoverLetter = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);
  const { toast } = useToast();

  const generateCoverLetter = async (analysisResultId: string, tone: string, additionalInfo: string = '') => {
    setIsGenerating(true);
    try {
      // Get analysis data
      const { data: analysisData, error: analysisError } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('id', analysisResultId)
        .single();

      if (analysisError) throw analysisError;

      // Generate cover letter using analysis data
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          jobTitle: analysisData.job_title,
          companyName: analysisData.company_name,
          jobDescription: analysisData.job_description_extracted_text,
          cvText: analysisData.cv_extracted_text,
          tone: tone,
          length: 'medium',
          analysisResultId: analysisResultId
        }
      });

      if (error) throw error;

      const newLetter: GeneratedLetter = {
        id: data.id,
        content: data.content,
        job_title: analysisData.job_title,
        company_name: analysisData.company_name,
        regeneration_count: 0
      };

      setGeneratedLetter(newLetter);

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

  const regenerateCoverLetter = async (coverLetterId: string, tone: string, additionalInfo: string = '') => {
    setIsRegenerating(true);
    try {
      // Get the original cover letter data
      const { data: originalData, error: fetchError } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('id', coverLetterId)
        .single();

      if (fetchError) throw fetchError;

      // Check regeneration count for credit calculation
      const isFreeregeneration = originalData.regeneration_count < 5;
      
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
          tone: tone,
          length: 'medium',
          analysisResultId: originalData.analysis_result_id
        }
      });

      if (error) throw error;

      // Safely handle generation_parameters - ensure it's an object and cast to Json
      const existingParams = originalData.generation_parameters || {};
      const updatedParams = typeof existingParams === 'object' && existingParams !== null 
        ? { ...existingParams as Record<string, any>, length: 'medium', tone: tone }
        : { length: 'medium', tone: tone };

      // Update the original cover letter with new content and increment regeneration count
      const { error: updateError } = await supabase
        .from('cover_letters')
        .update({
          content: data.content,
          template_id: tone,
          generation_parameters: updatedParams as any,
          regeneration_count: originalData.regeneration_count + 1,
          credits_used: originalData.credits_used + (isFreeregeneration ? 0 : 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', coverLetterId);

      if (updateError) throw updateError;

      const updatedLetter: GeneratedLetter = {
        id: coverLetterId,
        content: data.content,
        job_title: originalData.job_title,
        company_name: originalData.company_name,
        regeneration_count: originalData.regeneration_count + 1
      };

      setGeneratedLetter(updatedLetter);

      toast({
        title: 'Cover Letter Regenerated!',
        description: isFreeregeneration 
          ? 'Your cover letter has been regenerated (free regeneration).'
          : 'Your cover letter has been regenerated (1 credit used).',
      });

      return { 
        content: data.content, 
        id: coverLetterId,
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

  const downloadCoverLetter = async (coverLetterId: string) => {
    try {
      if (!generatedLetter) {
        throw new Error('No cover letter to download');
      }

      // Create a simple text file download
      const content = generatedLetter.content;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cover-letter-${generatedLetter.job_title}-${generatedLetter.company_name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download Complete',
        description: 'Cover letter has been downloaded.',
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download cover letter.',
        variant: 'destructive',
      });
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
    regenerateCoverLetter,
    downloadCoverLetter,
    getCoverLetters,
    deleteCoverLetter,
    generating: isGenerating,
    generatedLetter,
    isGenerating,
    isRegenerating
  };
};
