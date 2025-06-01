
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCoverLetter } from '@/hooks/useCoverLetter';
import { useUserData } from '@/hooks/useUserData';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';

const CoverLetter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { credits } = useUserData();
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [tone, setTone] = useState('professional');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const {
    generating,
    generatedLetter,
    generateCoverLetter,
    downloadCoverLetter,
    regenerateCoverLetter
  } = useCoverLetter();

  // Switch to review tab when cover letter is generated
  useEffect(() => {
    if (generatedLetter && !generating) {
      setActiveTab('review');
    }
  }, [generatedLetter, generating]);

  const handleGenerate = async () => {
    if (!selectedAnalysisId) {
      toast({
        title: 'Analysis Required',
        description: 'Please select an analysis from your history to generate a cover letter.',
        variant: 'destructive'
      });
      return;
    }

    if (credits < 1) {
      toast({
        title: 'Insufficient Credits',
        description: 'You need at least 1 credit to generate a cover letter.',
        variant: 'destructive'
      });
      return;
    }

    await generateCoverLetter(selectedAnalysisId, tone, additionalInfo);
  };

  const handleCopy = async () => {
    if (generatedLetter) {
      await navigator.clipboard.writeText(generatedLetter.content);
      toast({
        title: 'Copied',
        description: 'Cover letter copied to clipboard'
      });
    }
  };

  const handleRegenerate = async () => {
    if (generatedLetter) {
      await regenerateCoverLetter(generatedLetter.id, tone, additionalInfo);
    }
  };

  // Logged-out user experience
  if (!user) {
    const coverLetterExplanation = {
      title: 'Generate Cover Letters',
      subtitle: 'Create personalized, compelling cover letters using your CV analysis results.',
      benefits: [
        'AI-powered cover letters tailored to specific job requirements and your experience',
        'Multiple tone options (professional, enthusiastic, creative) to match company culture',
        'Integration with your CV analysis for highly relevant and targeted content'
      ],
      features: [
        'Select from your previous CV analyses to generate targeted cover letters',
        'Customize tone and add additional information to personalize your letter',
        'Download as PDF or copy to clipboard for easy application submission'
      ]
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[600px]">
            <div className="flex items-start">
              <ServiceExplanation
                title={coverLetterExplanation.title}
                subtitle={coverLetterExplanation.subtitle}
                benefits={coverLetterExplanation.benefits}
                features={coverLetterExplanation.features}
                icon={<FileText className="h-8 w-8 text-apricot mr-2" />}
                compact={true}
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <EmbeddedAuth
                    title="Login to Get Started"
                    description="Cover letter generation requires an account and previous CV analysis results."
                    icon={<FileText className="h-6 w-6 text-apricot mr-2" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 ${generating ? 'pointer-events-none' : ''}`}>
      {generating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-blueberry/90 rounded-lg p-6 md:p-8 text-center max-w-md w-full">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-apricot mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">Generating Cover Letter</h3>
            <p className="text-blueberry/70 dark:text-apple-core/80 text-sm md:text-base">
              Creating your personalized cover letter...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-blueberry dark:text-citrus mb-4 flex items-center justify-center">
            <FileText className="h-8 w-8 md:h-10 md:w-10 text-apricot mr-3" />
            Generate Cover Letter
          </h1>
          <p className="text-lg md:text-xl text-blueberry/80 dark:text-apple-core max-w-2xl mx-auto px-4">
            Create personalized cover letters based on your CV analysis results
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="review">Review & Download</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-4 md:p-6 border border-apple-core/20 dark:border-citrus/20">
              <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Select Analysis</h3>
              <AnalysisSelector
                onAnalysisSelect={setSelectedAnalysisId}
                selectedAnalysisId={selectedAnalysisId}
                disabled={generating}
              />
            </div>

            <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-4 md:p-6 border border-apple-core/20 dark:border-citrus/20">
              <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Tone & Style</h3>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-apricot focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core"
                disabled={generating}
              >
                <option value="professional">Professional</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="creative">Creative</option>
                <option value="formal">Formal</option>
              </select>
            </div>

            <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-4 md:p-6 border border-apple-core/20 dark:border-citrus/20">
              <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Additional Information</h3>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Add any specific points you'd like to highlight or company-specific information..."
                className="w-full px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-apricot focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core h-32 resize-none"
                disabled={generating}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedAnalysisId || generating || credits < 1}
              className="w-full bg-apricot hover:bg-apricot/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {generating ? 'Generating...' : 'Generate Cover Letter'}
            </Button>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            {generatedLetter ? (
              <>
                <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-blueberry dark:text-citrus">
                      Cover Letter for {generatedLetter.job_title} at {generatedLetter.company_name}
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleRegenerate}
                        variant="outline"
                        size="sm"
                        disabled={generating}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        onClick={() => downloadCoverLetter(generatedLetter.id)}
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-blueberry dark:text-apple-core leading-relaxed">
                      {generatedLetter.content}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-apple-core/40 dark:text-citrus/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-2">
                  No Cover Letter Generated
                </h3>
                <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">
                  Generate a cover letter first to review and download it here.
                </p>
                <Button
                  onClick={() => setActiveTab('generate')}
                  variant="outline"
                >
                  Go to Generate Tab
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CoverLetter;
