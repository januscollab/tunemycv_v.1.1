import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InterviewPrepRequest {
  analysisResultId?: string;
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
  includes: {
    companyProfile: boolean;
    recentPressReleases: boolean;
    interviewTips: boolean;
    getNoticedQuestions: boolean;
  };
}

export const useInterviewPrep = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInterviewPrep = async (request: InterviewPrepRequest) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-prep', {
        body: request
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate interview prep');
      }

      toast({
        title: 'Success!',
        description: 'Interview preparation notes generated successfully.',
      });

      return {
        success: true,
        interviewPrep: data.interviewPrep,
        content: data.content
      };

    } catch (error: any) {
      console.error('Interview prep generation failed:', error);
      
      const errorMessage = error.message || 'Failed to generate interview prep';
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const getInterviewPrep = async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('interview_prep')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch interview prep:', error);
      throw error;
    }
  };

  const getInterviewPreps = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('interview_prep')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch interview preps:', error);
      throw error;
    }
  };

  const deleteInterviewPrep = async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('interview_prep')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Interview prep deleted successfully.',
      });

      return true;
    } catch (error) {
      console.error('Failed to delete interview prep:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete interview prep.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    generateInterviewPrep,
    getInterviewPrep,
    getInterviewPreps,
    deleteInterviewPrep,
    isGenerating
  };
};