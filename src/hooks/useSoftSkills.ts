import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SoftSkillsData extends Record<string, number> {
  communication: number;
  leadership: number;
  teamwork: number;
  problem_solving: number;
  adaptability: number;
  time_management: number;
  creativity: number;
  emotional_intelligence: number;
  critical_thinking: number;
  conflict_resolution: number;
}

interface SurveyPreferences {
  soft_skills_dismissed: boolean;
}

export const useSoftSkills = () => {
  const { user } = useAuth();
  const [softSkills, setSoftSkills] = useState<SoftSkillsData | null>(null);
  const [surveyPreferences, setSurveyPreferences] = useState<SurveyPreferences>({ soft_skills_dismissed: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSoftSkillsData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSoftSkillsData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('soft_skills, survey_preferences')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching soft skills:', error);
        return;
      }

      if (data) {
        const skillsData = data.soft_skills as unknown as SoftSkillsData | null;
        const prefsData = data.survey_preferences as unknown as SurveyPreferences | null;
        
        setSoftSkills(skillsData && Object.keys(skillsData).length > 0 ? skillsData : null);
        setSurveyPreferences(prefsData || { soft_skills_dismissed: false });
      }
    } catch (error) {
      console.error('Error fetching soft skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSoftSkills = async (skills: SoftSkillsData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ soft_skills: skills })
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to save soft skills');
        console.error('Error saving soft skills:', error);
        return;
      }

      setSoftSkills(skills);
      toast.success('Soft skills profile saved successfully');
    } catch (error) {
      toast.error('An error occurred while saving soft skills');
      console.error('Error saving soft skills:', error);
    }
  };

  const dismissSurvey = async () => {
    if (!user) return;

    try {
      const newPreferences = { ...surveyPreferences, soft_skills_dismissed: true };
      
      const { error } = await supabase
        .from('profiles')
        .update({ survey_preferences: newPreferences })
        .eq('id', user.id);

      if (error) {
        console.error('Error dismissing survey:', error);
        return;
      }

      setSurveyPreferences(newPreferences);
    } catch (error) {
      console.error('Error dismissing survey:', error);
    }
  };

  const shouldShowSurvey = () => {
    return !loading && !softSkills && !surveyPreferences.soft_skills_dismissed;
  };

  return {
    softSkills,
    loading,
    saveSoftSkills,
    dismissSurvey,
    shouldShowSurvey
  };
};