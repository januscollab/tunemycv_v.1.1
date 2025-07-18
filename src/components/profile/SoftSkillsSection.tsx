import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Brain, Info } from 'lucide-react';
import { useSoftSkills } from '@/hooks/useSoftSkills';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';

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

interface SoftSkillsQualifyingStatements extends Record<string, string> {
  communication: string;
  leadership: string;
  teamwork: string;
  problem_solving: string;
  adaptability: string;
  time_management: string;
  creativity: string;
  emotional_intelligence: string;
  critical_thinking: string;
  conflict_resolution: string;
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

const skillDescriptions = {
  communication: 'Your ability to clearly express ideas, listen effectively, and adapt your communication style to different audiences.',
  leadership: 'Your capacity to inspire, motivate, and guide others toward achieving common goals.',
  teamwork: 'How well you collaborate, support team members, and contribute to group success.',
  problem_solving: 'Your ability to analyze complex situations, identify solutions, and implement effective approaches.',
  adaptability: 'How quickly you adjust to change, learn new skills, and thrive in evolving environments.',
  time_management: 'Your skill in prioritizing tasks, meeting deadlines, and efficiently organizing your workload.',
  creativity: 'Your ability to think outside the box, generate innovative ideas, and approach challenges creatively.',
  emotional_intelligence: 'Your awareness of emotions (yours and others) and ability to manage relationships effectively.',
  critical_thinking: 'Your capacity to analyze information objectively, evaluate evidence, and make logical decisions.',
  conflict_resolution: 'Your ability to address disagreements constructively and find mutually beneficial solutions.'
};

const SoftSkillsSection: React.FC = () => {
  const { softSkills, loading, saveSoftSkills } = useSoftSkills();
  const [currentSkills, setCurrentSkills] = useState<SoftSkillsData | null>(null);
  const [qualifyingStatements, setQualifyingStatements] = useState<SoftSkillsQualifyingStatements>({
    communication: '',
    leadership: '',
    teamwork: '',
    problem_solving: '',
    adaptability: '',
    time_management: '',
    creativity: '',
    emotional_intelligence: '',
    critical_thinking: '',
    conflict_resolution: ''
  });
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const defaultSkills: SoftSkillsData = {
    communication: 0,
    leadership: 0,
    teamwork: 0,
    problem_solving: 0,
    adaptability: 0,
    time_management: 0,
    creativity: 0,
    emotional_intelligence: 0,
    critical_thinking: 0,
    conflict_resolution: 0
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
    setCurrentSkills({
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
    });
  };

  const isAssessmentEmpty = currentSkills && Object.values(currentSkills).every(value => value === 0);

  if (loading) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-surface rounded-lg border border-gray-200 dark:border-border p-6">
        <div className="flex items-center mb-6">
          <Brain className="h-5 w-5 text-gray-500 dark:text-apple-core/60 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-citrus">Soft Skills Assessment</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-apple-core/60 dark:hover:text-apple-core/80 cursor-help ml-2" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-sm">
              <p className="text-sm">
                <strong>Boost Your CV Analysis Accuracy by 40%</strong> - Complete this 2-minute assessment to get personalized insights into how your soft skills match specific roles.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-gray-500 dark:text-apple-core/60 mb-6">
          Your soft skills assessment used to enhance CV analysis
        </p>
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
            {isAssessmentEmpty && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  <strong>Assessment Not Completed:</strong> This assessment is optional but helps improve your compatibility measurements against future roles. Complete it to get more personalized results.
                </p>
              </div>
            )}
            {Object.entries(skillDefinitions).map(([key, label]) => (
              <div key={key} className="space-y-3 border border-gray-200 dark:border-border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="font-medium text-gray-900 dark:text-citrus">
                      {label}
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-apple-core/60 dark:hover:text-apple-core/80 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-sm">
                        <p className="text-sm">
                          {skillDescriptions[key as keyof typeof skillDescriptions]}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    {currentSkills[key as keyof SoftSkillsData] > 0 && (
                      <button
                        onClick={() => setExpandedSkill(expandedSkill === key ? null : key)}
                        className="text-sm text-gray-600 dark:text-apple-core/80 hover:text-gray-800 dark:hover:text-apple-core"
                      >
                        {expandedSkill === key ? "− Hide" : "+ Add"} context/example
                      </button>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-apple-core/60 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {currentSkills[key as keyof SoftSkillsData]}/10
                  </span>
                </div>
                <Slider
                  value={[currentSkills[key as keyof SoftSkillsData]]}
                  onValueChange={(value) => handleSkillChange(key as keyof SoftSkillsData, value)}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 dark:text-apple-core/50">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
                
                {/* Qualifying Statement Section */}
                {expandedSkill === key && currentSkills[key as keyof SoftSkillsData] > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-border">
                    <Textarea
                      value={qualifyingStatements[key as keyof SoftSkillsQualifyingStatements]}
                      onChange={(e) => setQualifyingStatements(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      placeholder={`Describe specific examples of your ${label.toLowerCase()} skills...`}
                      className="w-full text-sm"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default SoftSkillsSection;