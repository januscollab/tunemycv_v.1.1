
import React, { useEffect } from 'react';
import { Linkedin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface AdvancedOptionsData {
  workExperienceHighlights: string;
  customHookOpener: string;
  personalValues: string;
  includeLinkedInUrl: boolean;
}

interface AdvancedGenerationOptionsProps {
  value: AdvancedOptionsData;
  onChange: (data: AdvancedOptionsData) => void;
}

const AdvancedGenerationOptions: React.FC<AdvancedGenerationOptionsProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Load LinkedIn preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('includeLinkedInUrl');
    if (savedPreference !== null) {
      onChange({
        ...value,
        includeLinkedInUrl: JSON.parse(savedPreference)
      });
    }
  }, []);

  // Save LinkedIn preference to localStorage
  useEffect(() => {
    localStorage.setItem('includeLinkedInUrl', JSON.stringify(value.includeLinkedInUrl));
  }, [value.includeLinkedInUrl]);

  const handleChange = (field: keyof AdvancedOptionsData, newValue: string | boolean) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-zapier-orange/5 hover:bg-zapier-orange/10 dark:bg-zapier-orange/5 dark:hover:bg-zapier-orange/10 rounded-lg transition-colors">
          <span className="text-caption font-medium text-black dark:text-black">Advanced Options</span>
          <ChevronDown className={`h-4 w-4 text-orange-600 dark:text-orange-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-3">
          <div>
            <Label htmlFor="workHighlights" className="text-caption font-medium">
              Key Work Experience Highlights
            </Label>
            <Textarea
              id="workHighlights"
              placeholder="Mention specific achievements, metrics, or experiences you want emphasized in your cover letter..."
              value={value.workExperienceHighlights}
              onChange={(e) => handleChange('workExperienceHighlights', e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="customHook" className="text-caption font-medium">
              Custom Opening Hook
            </Label>
            <Textarea
              id="customHook"
              placeholder="Write a personalized opening line or mention how you discovered the company/role..."
              value={value.customHookOpener}
              onChange={(e) => handleChange('customHookOpener', e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="personalValues" className="text-caption font-medium">
              Personal Values & Motivations
            </Label>
            <Textarea
              id="personalValues"
              placeholder="Describe what motivates you professionally or values that align with the company culture..."
              value={value.personalValues}
              onChange={(e) => handleChange('personalValues', e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>

        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default AdvancedGenerationOptions;
