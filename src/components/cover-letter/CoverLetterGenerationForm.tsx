
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Sparkles } from 'lucide-react';
import AdvancedGenerationOptions from './AdvancedGenerationOptions';
import { useCoverLetter } from '@/hooks/useCoverLetter';

interface AdvancedOptionsData {
  workExperienceHighlights: string;
  customHookOpener: string;
  personalValues: string;
  includeLinkedInUrl: boolean;
}

interface CoverLetterGenerationFormProps {
  selectedAnalysisId: string;
  hasCreditsForAI: boolean;
  onGenerated: () => void;
}

const CoverLetterGenerationForm: React.FC<CoverLetterGenerationFormProps> = ({
  selectedAnalysisId,
  hasCreditsForAI,
  onGenerated
}) => {
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('standard');
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptionsData>({
    workExperienceHighlights: '',
    customHookOpener: '',
    personalValues: '',
    includeLinkedInUrl: false
  });

  const { generateFromAnalysis, isGenerating } = useCoverLetter();

  const handleGenerate = async () => {
    if (!selectedAnalysisId || !hasCreditsForAI) return;

    try {
      await generateFromAnalysis({
        analysisResultId: selectedAnalysisId,
        tone,
        length,
        workExperienceHighlights: advancedOptions.workExperienceHighlights,
        customHookOpener: advancedOptions.customHookOpener,
        personalValues: advancedOptions.personalValues,
        includeLinkedInUrl: advancedOptions.includeLinkedInUrl
      });
      onGenerated();
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const canGenerate = selectedAnalysisId && hasCreditsForAI && !isGenerating;

  return (
    <div className="space-y-6">
      <Card className="border-apple-core/20 dark:border-citrus/20">
        <CardHeader>
          <CardTitle className="flex items-center text-blueberry dark:text-citrus">
            <Sparkles className="h-5 w-5 mr-2 text-apricot" />
            Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tone" className="text-sm font-medium">
                Writing Tone
              </Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="confident">Confident</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="length" className="text-sm font-medium">
                Cover Letter Length
              </Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (150-200 words)</SelectItem>
                  <SelectItem value="concise">Concise (250-300 words)</SelectItem>
                  <SelectItem value="standard">Standard (350-400 words)</SelectItem>
                  <SelectItem value="detailed">Detailed (450-500 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <AdvancedGenerationOptions
            value={advancedOptions}
            onChange={setAdvancedOptions}
          />

          <div className="pt-4">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full bg-apricot hover:bg-apricot/90 text-white"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Cover Letter...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Cover Letter (1 Credit)
                </>
              )}
            </Button>
          </div>

          {!hasCreditsForAI && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              Insufficient credits. You need at least 1 credit to generate a cover letter.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoverLetterGenerationForm;
