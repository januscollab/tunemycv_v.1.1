import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Settings, Users, Zap, MessageSquare, Target, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkStyleData {
  autonomy_vs_structure: string;
  team_vs_solo: string;
  pace_preference: string;
  feedback_style: string;
  innovation_vs_proven: string;
  risk_tolerance: string;
}

const WorkStylePreferencesSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workStyle, setWorkStyle] = useState<WorkStyleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialWorkStyle, setInitialWorkStyle] = useState<WorkStyleData | null>(null);

  const defaultWorkStyle: WorkStyleData = {
    autonomy_vs_structure: '',
    team_vs_solo: '',
    pace_preference: '',
    feedback_style: '',
    innovation_vs_proven: '',
    risk_tolerance: ''
  };

  useEffect(() => {
    if (user) {
      loadWorkStylePreferences();
    }
  }, [user]);

  const loadWorkStylePreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('work_style_preferences')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.work_style_preferences && typeof data.work_style_preferences === 'object') {
        const loadedStyle = data.work_style_preferences as unknown as WorkStyleData;
        setWorkStyle(loadedStyle);
        setInitialWorkStyle(loadedStyle);
      } else {
        setWorkStyle(defaultWorkStyle);
        setInitialWorkStyle(defaultWorkStyle);
      }
    } catch (error) {
      console.error('Error loading work style preferences:', error);
      setWorkStyle(defaultWorkStyle);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save with debounce - only if work style actually changed
  useEffect(() => {
    if (!workStyle || loading || !initialWorkStyle) return;

    // Only save if work style actually changed
    if (JSON.stringify(workStyle) === JSON.stringify(initialWorkStyle)) return;

    const timeoutId = setTimeout(() => {
      saveWorkStylePreferences();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [workStyle, loading, initialWorkStyle]);

  const saveWorkStylePreferences = async () => {
    if (!workStyle) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          work_style_preferences: workStyle as any,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving work style preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save work style preferences',
        variant: 'destructive'
      });
    }
  };

  const handlePreferenceChange = (category: keyof WorkStyleData, value: string) => {
    setWorkStyle(prev => prev ? { ...prev, [category]: value } : null);
  };

  const questions = [
    {
      key: 'autonomy_vs_structure' as keyof WorkStyleData,
      title: 'Work Structure',
      icon: <Settings className="h-5 w-5" />,
      question: 'Do you prefer clear processes or freedom to experiment?',
      options: [
        { value: 'structure', label: 'Clear processes and guidelines' },
        { value: 'balanced', label: 'Mix of both' },
        { value: 'autonomy', label: 'Freedom to experiment and innovate' }
      ]
    },
    {
      key: 'team_vs_solo' as keyof WorkStyleData,
      title: 'Collaboration Style',
      icon: <Users className="h-5 w-5" />,
      question: 'Do you enjoy collaborative work or working independently?',
      options: [
        { value: 'team', label: 'Collaborative team environments' },
        { value: 'balanced', label: 'Mix of both' },
        { value: 'solo', label: 'Independent work' }
      ]
    },
    {
      key: 'pace_preference' as keyof WorkStyleData,
      title: 'Work Pace',
      icon: <Zap className="h-5 w-5" />,
      question: 'Do you thrive in high-pressure, fast-paced environments?',
      options: [
        { value: 'fast', label: 'High-pressure, fast-paced' },
        { value: 'moderate', label: 'Steady, moderate pace' },
        { value: 'calm', label: 'Calm, thoughtful pace' }
      ]
    },
    {
      key: 'feedback_style' as keyof WorkStyleData,
      title: 'Feedback Preference',
      icon: <MessageSquare className="h-5 w-5" />,
      question: 'Do you like regular feedback or prefer autonomy?',
      options: [
        { value: 'frequent', label: 'Regular, frequent feedback' },
        { value: 'periodic', label: 'Periodic check-ins' },
        { value: 'minimal', label: 'Minimal supervision, high autonomy' }
      ]
    },
    {
      key: 'innovation_vs_proven' as keyof WorkStyleData,
      title: 'Approach Style',
      icon: <Lightbulb className="h-5 w-5" />,
      question: 'Do you prefer innovative approaches or proven methods?',
      options: [
        { value: 'innovative', label: 'Cutting-edge, innovative approaches' },
        { value: 'balanced', label: 'Mix of innovation and proven methods' },
        { value: 'proven', label: 'Established, proven methodologies' }
      ]
    },
    {
      key: 'risk_tolerance' as keyof WorkStyleData,
      title: 'Risk Tolerance',
      icon: <Target className="h-5 w-5" />,
      question: 'How comfortable are you with taking calculated risks?',
      options: [
        { value: 'high', label: 'Very comfortable with risks' },
        { value: 'moderate', label: 'Moderately comfortable' },
        { value: 'low', label: 'Prefer low-risk, stable environments' }
      ]
    }
  ];

  if (loading) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-surface rounded-lg border border-gray-200 dark:border-border p-6">
      <div className="flex items-center mb-6">
        <Settings className="h-5 w-5 text-gray-500 dark:text-apple-core/60 mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Work Style Preferences</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-apple-core/60 mb-6">
        Help us understand your preferred working style to better match you with company cultures
      </p>

      {!workStyle ? (
        <div className="text-center py-6">
          <Settings className="h-12 w-12 text-zapier-orange mx-auto mb-4" />
          <p className="text-gray-500 dark:text-apple-core/60 mb-4">
            No work style preferences found. Complete this assessment to improve your job matching.
          </p>
          <button 
            onClick={() => setWorkStyle(defaultWorkStyle)}
            className="px-4 py-2 bg-zapier-orange text-white rounded-md hover:bg-zapier-orange/90 transition-colors"
          >
            Start Assessment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((question) => (
            <div key={question.key} className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-zapier-orange">{question.icon}</div>
                <h4 className="font-medium text-gray-900 dark:text-apple-core/90 text-sm">
                  {question.title}
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-apple-core/70 mb-3">
                {question.question}
              </p>
              
              <RadioGroup
                value={workStyle[question.key]}
                onValueChange={(value) => handlePreferenceChange(question.key, value)}
                className="space-y-1"
              >
                {question.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.value} 
                      id={`${question.key}-${option.value}`}
                      className="text-zapier-orange h-3 w-3"
                    />
                    <Label 
                      htmlFor={`${question.key}-${option.value}`}
                      className="text-xs text-gray-700 dark:text-apple-core/80 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkStylePreferencesSection;