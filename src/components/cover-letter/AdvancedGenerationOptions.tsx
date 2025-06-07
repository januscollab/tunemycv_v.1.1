
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
      <CollapsibleTrigger className="w-full flex items-start space-x-3 p-4 bg-card border border-card-border rounded-lg hover:bg-accent/20 transition-all duration-normal group">
        <div className="w-8 h-8 bg-zapier-orange/20 rounded-lg flex items-center justify-center flex-shrink-0">
          {isOpen ? <ChevronUp className="h-4 w-4 text-zapier-orange" /> : <ChevronDown className="h-4 w-4 text-zapier-orange" />}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">
            Generation Settings (Optional)
          </h3>
          <p className="text-sm text-blueberry/70 dark:text-apple-core/80 leading-relaxed">
            Customize your cover letter generation with advanced options for a more personalized result.
          </p>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4 space-y-4 p-4 bg-card/50 border border-card-border rounded-lg">
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
