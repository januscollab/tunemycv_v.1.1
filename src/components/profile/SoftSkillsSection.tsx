import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Brain, Save, Edit } from 'lucide-react';
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
  const [editingSkills, setEditingSkills] = useState<SoftSkillsData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const currentSkills = editingSkills || softSkills || defaultSkills;

  const handleEdit = () => {
    setEditingSkills(softSkills || defaultSkills);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditingSkills(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (editingSkills) {
      await saveSoftSkills(editingSkills);
      setEditingSkills(null);
      setIsEditing(false);
    }
  };

  const handleSkillChange = (skill: keyof SoftSkillsData, value: number[]) => {
    if (editingSkills) {
      setEditingSkills(prev => ({ ...prev!, [skill]: value[0] }));
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-blueberry dark:text-citrus">
          <Brain className="h-5 w-5 mr-2 text-zapier-orange" />
          Soft Skills Profile
        </CardTitle>
        <CardDescription>
          Your soft skills assessment used to enhance CV analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!softSkills && !isEditing ? (
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-zapier-orange mx-auto mb-4" />
            <p className="text-blueberry/60 dark:text-white/60 mb-4">
              No soft skills profile found. Complete the assessment to improve your CV analysis.
            </p>
            <Button onClick={handleEdit} className="bg-zapier-orange hover:bg-zapier-orange/90 text-white">
              Create Skills Profile
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {Object.entries(skillDefinitions).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-blueberry dark:text-white">
                      {label}
                    </label>
                    <span className="text-sm text-blueberry/60 dark:text-white/60 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {currentSkills[key as keyof SoftSkillsData]}/10
                    </span>
                  </div>
                  <Slider
                    value={[currentSkills[key as keyof SoftSkillsData]]}
                    onValueChange={isEditing ? (value) => handleSkillChange(key as keyof SoftSkillsData, value) : undefined}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                    disabled={!isEditing}
                  />
                  <div className="flex justify-between text-xs text-blueberry/40 dark:text-white/40">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-zapier-orange hover:bg-zapier-orange/90 text-white flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Skills</span>
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SoftSkillsSection;