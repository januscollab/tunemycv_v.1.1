import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Brain } from 'lucide-react';
import { useSoftSkills } from '@/hooks/useSoftSkills';

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

const skillDefinitions = {
  communication: 'Communication',
  leadership: 'Leadership',
  teamwork: 'Teamwork & Collaboration',
  problem_solving: 'Problem Solving',
  adaptability: 'Adaptability',
  time_management: 'Time Management',
  creativity: 'Creativity & Innovation',
  emotional_intelligence: 'Emotional Intelligence',
  critical_thinking: 'Critical Thinking',
  conflict_resolution: 'Conflict Resolution'
};

const SoftSkillsSection: React.FC = () => {
  const { softSkills, loading, saveSoftSkills } = useSoftSkills();
  const [currentSkills, setCurrentSkills] = useState<SoftSkillsData | null>(null);

  const defaultSkills: SoftSkillsData = {
    communication: 5,
    leadership: 5,
    teamwork: 5,
    problem_solving: 5,
    adaptability: 5,
    time_management: 5,
    creativity: 5,
    emotional_intelligence: 5,
    critical_thinking: 5,
    conflict_resolution: 5
  };

  // Initialize current skills
  useEffect(() => {
    setCurrentSkills(softSkills || defaultSkills);
  }, [softSkills]);

  // Auto-save with debounce
  useEffect(() => {
    if (!currentSkills) return;
    
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(currentSkills) !== JSON.stringify(softSkills || defaultSkills)) {
        saveSoftSkills(currentSkills);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentSkills, saveSoftSkills, softSkills]);

  const handleSkillChange = (skill: keyof SoftSkillsData, value: number[]) => {
    setCurrentSkills(prev => ({ ...prev!, [skill]: value[0] }));
  };

  const handleCreateProfile = () => {
    setCurrentSkills(defaultSkills);
  };

  if (loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-citrus">
          <Brain className="h-5 w-5 mr-2 text-gray-500 dark:text-apple-core/60" />
          Soft Skills Assessment
        </CardTitle>
        <CardDescription>
          Your soft skills assessment used to enhance CV analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!currentSkills ? (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-zapier-orange mx-auto mb-4" />
            <p className="text-gray-500 dark:text-apple-core/60 mb-4">
              No soft skills assessment found. Complete the assessment to improve your CV analysis.
            </p>
            <button 
              onClick={handleCreateProfile}
              className="px-4 py-2 bg-zapier-orange text-white rounded-md hover:bg-zapier-orange/90 transition-colors"
            >
              Create Skills Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(skillDefinitions).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-apple-core/80">
                    {label}
                  </label>
                  <span className="text-sm text-gray-500 dark:text-apple-core/60 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {currentSkills[key as keyof SoftSkillsData]}/10
                  </span>
                </div>
                <Slider
                  value={[currentSkills[key as keyof SoftSkillsData]]}
                  onValueChange={(value) => handleSkillChange(key as keyof SoftSkillsData, value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 dark:text-apple-core/50">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SoftSkillsSection;