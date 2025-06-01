
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Linkedin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [isOpen, setIsOpen] = useState(false);

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <span className="font-medium text-left">Advanced Generation Options (Optional)</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4 space-y-2 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border">
        <div>
          <Label htmlFor="workHighlights" className="text-sm font-medium">
            Key Work Experience Highlights
          </Label>
          <Textarea
            id="workHighlights"
            placeholder="Mention specific achievements, metrics, or experiences you want emphasized in your cover letter..."
            value={value.workExperienceHighlights}
            onChange={(e) => handleChange('workExperienceHighlights', e.target.value)}
            rows={1}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="customHook" className="text-sm font-medium">
            Custom Opening Hook
          </Label>
          <Textarea
            id="customHook"
            placeholder="Write a personalized opening line or mention how you discovered the company/role..."
            value={value.customHookOpener}
            onChange={(e) => handleChange('customHookOpener', e.target.value)}
            rows={1}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="personalValues" className="text-sm font-medium">
            Personal Values & Motivations
          </Label>
          <Textarea
            id="personalValues"
            placeholder="Describe what motivates you professionally or values that align with the company culture..."
            value={value.personalValues}
            onChange={(e) => handleChange('personalValues', e.target.value)}
            rows={1}
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <Checkbox
            id="includeLinkedIn"
            checked={value.includeLinkedInUrl}
            onCheckedChange={(checked) => handleChange('includeLinkedInUrl', Boolean(checked))}
          />
          <Label htmlFor="includeLinkedIn" className="text-sm font-medium flex items-center">
            <Linkedin className="h-4 w-4 mr-1" />
            Include my LinkedIn profile URL in the cover letter
          </Label>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AdvancedGenerationOptions;
