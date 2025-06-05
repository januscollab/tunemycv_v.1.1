import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Brain, Check } from 'lucide-react';

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

interface SoftSkillsSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (skills: SoftSkillsData) => void;
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

const SoftSkillsSurveyModal: React.FC<SoftSkillsSurveyModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [skills, setSkills] = useState<SoftSkillsData>({
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

  const handleSkillChange = (skill: keyof SoftSkillsData, value: number[]) => {
    setSkills(prev => ({ ...prev, [skill]: value[0] }));
  };

  const handleSubmit = () => {
    onSubmit(skills);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blueberry dark:text-citrus">
            <Brain className="h-6 w-6 mr-2 text-zapier-orange" />
            Soft Skills Assessment
          </DialogTitle>
          <DialogDescription>
            Rate yourself on the following soft skills from 1 (beginner) to 10 (expert). This will help personalize your CV analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {Object.entries(skillDefinitions).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-blueberry dark:text-white">
                  {label}
                </label>
                <span className="text-sm text-blueberry/60 dark:text-white/60 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {skills[key as keyof SoftSkillsData]}/10
                </span>
              </div>
              <Slider
                value={[skills[key as keyof SoftSkillsData]]}
                onValueChange={(value) => handleSkillChange(key as keyof SoftSkillsData, value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-blueberry/40 dark:text-white/40">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-zapier-orange hover:bg-zapier-orange/90 text-white flex items-center space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>Save Skills Profile</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SoftSkillsSurveyModal;