import React from 'react';
import { Brain, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SoftSkillsSurveyPanelProps {
  onTakeSurvey: () => void;
  onDismiss: () => void;
  isVisible: boolean;
}

const SoftSkillsSurveyPanel: React.FC<SoftSkillsSurveyPanelProps> = ({ 
  onTakeSurvey, 
  onDismiss, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-white dark:bg-earth/10 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 sticky top-6 mt-4">
      <div className="text-center">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-zapier-orange mr-2" />
            <h3 className="text-subheading font-semibold text-earth dark:text-white">
              Soft Skills Survey
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="text-earth/40 hover:text-earth/60 dark:text-white/40 dark:hover:text-white/60"
            aria-label="Dismiss survey"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-caption text-earth/70 dark:text-white/70 mb-4">
          Help us improve your CV analysis by sharing your soft skills profile
        </p>

        <Button
          onClick={onTakeSurvey}
          className="w-full bg-zapier-orange hover:bg-zapier-orange/90 text-white flex items-center justify-center space-x-2"
        >
          <span>Take 2-Minute Survey</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <p className="text-micro text-earth/50 dark:text-white/50 mt-2">
          This will enhance your analysis results
        </p>
      </div>
    </div>
  );
};

export default SoftSkillsSurveyPanel;