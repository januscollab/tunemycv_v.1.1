
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import CoverLetterGenerationForm from '@/components/cover-letter/CoverLetterGenerationForm';
import EditableCoverLetter from '@/components/cover-letter/EditableCoverLetter';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import { useCoverLetter } from '@/hooks/useCoverLetter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';

const CoverLetter = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("generate");
  const {
    selectedAnalysis,
    setSelectedAnalysis,
    coverLetterData,
    isGenerating,
    updateCoverLetter
  } = useCoverLetter();

  // Fetch user credits
  const { data: userCredits } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

  const handleGenerated = () => {
    setActiveTab('edit');
  };

  if (!user) {
    const coverLetterExplanation = {
      title: 'Generate Cover Letter',
      subtitle: 'Create personalized, ATS-optimized cover letters based on your CV analysis results.',
      benefits: [
        'AI-powered cover letter generation tailored to specific job requirements',
        'Professional formatting optimized for applicant tracking systems (ATS)',
        'Personalized content that highlights your most relevant skills and experience'
      ],
      features: [
        'Choose from your previous CV analysis results as the foundation',
        'Customize tone, focus areas, and specific requirements',
        'Edit and refine the generated content to match your personal style'
      ]
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
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
    <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4 flex items-center justify-center">
              <FileText className="h-10 w-10 text-apricot mr-3" />
              Generate Cover Letter
            </h1>
            <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-2xl mx-auto">
              Create personalized, ATS-optimized cover letters based on your CV analysis results.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="edit">Edit & Download</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="mt-6">
              <div className="space-y-6">
                <AnalysisSelector
                  selectedAnalysisId={selectedAnalysis}
                  onAnalysisSelect={setSelectedAnalysis}
                  disabled={isGenerating}
                />
                
                {selectedAnalysis ? (
                  <CoverLetterGenerationForm
                    selectedAnalysisId={selectedAnalysis}
                    hasCreditsForAI={hasCreditsForAI}
                    onGenerated={handleGenerated}
                  />
                ) : (
                  <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
                    <p className="text-sm text-blueberry/70 dark:text-apple-core/80">
                      Select an analysis from your history to continue with cover letter generation.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="edit" className="mt-6">
              {coverLetterData ? (
                <EditableCoverLetter
                  content={coverLetterData.content || ''}
                  onSave={(newContent) => updateCoverLetter(coverLetterData.id, newContent)}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-8 border border-apple-core/20 dark:border-citrus/20">
                    <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-4">
                      No Cover Letter Available
                    </h3>
                    <p className="text-blueberry/70 dark:text-apple-core/80 mb-6">
                      Generate a cover letter first to edit and download it.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Credits Panel */}
        <div className="lg:col-span-1">
          <CreditsPanel
            credits={userCredits?.credits || 0}
            hasCreditsForAI={hasCreditsForAI}
          />
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
