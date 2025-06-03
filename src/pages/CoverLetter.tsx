
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import CoverLetterLoggedOut from '@/components/cover-letter/CoverLetterLoggedOut';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import AdvancedGenerationOptions from '@/components/cover-letter/AdvancedGenerationOptions';
import EditableCoverLetter from '@/components/cover-letter/EditableCoverLetter';
import NoAnalysisModal from '@/components/cover-letter/NoAnalysisModal';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import { useCoverLetter } from '@/hooks/useCoverLetter';
import { AnalysisData } from '@/types/fileTypes';

const CoverLetter = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [showNoAnalysisModal, setShowNoAnalysisModal] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');

  const {
    coverLetter,
    isGenerating,
    generationOptions,
    updateGenerationOptions,
    generateCoverLetter,
    updateCoverLetterInDB,
    downloadCoverLetter
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

  // Loading messages for generation
  const loadingMessages = [
    "Crafting your personalized cover letter...",
    "Analyzing your CV and job requirements...",
    "Writing compelling content that highlights your strengths...",
    "Optimizing for ATS compatibility...",
    "Adding the perfect finishing touches...",
    "Almost ready to impress recruiters..."
  ];

  // Handle pre-selected analysis from navigation state
  useEffect(() => {
    const state = location.state as { selectedAnalysisId?: string } | null;
    if (state?.selectedAnalysisId) {
      setSelectedAnalysisId(state.selectedAnalysisId);
    }
  }, [location.state]);

  // Switch to edit tab when cover letter is generated
  useEffect(() => {
    if (coverLetter && !isGenerating) {
      setActiveTab('edit');
    }
  }, [coverLetter, isGenerating]);

  // Rotate loading messages during generation
  useEffect(() => {
    if (isGenerating) {
      let messageIndex = 0;
      setCurrentLoadingMessage(loadingMessages[0]);
      
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setCurrentLoadingMessage(loadingMessages[messageIndex]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerate = async (selectedAnalysis: AnalysisData | null) => {
    if (!selectedAnalysis) {
      setShowNoAnalysisModal(true);
      return;
    }

    await generateCoverLetter(selectedAnalysis, generationOptions);
  };

  const handleUseManualInput = () => {
    console.log('Manual input selected');
  };

  const handleSaveCoverLetter = async (newContent: string) => {
    if (coverLetter?.id) {
      await updateCoverLetterInDB(coverLetter.id, newContent);
    }
  };

  // Logged-out user experience
  if (!user) {
    return <CoverLetterLoggedOut />;
  }

  const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 ${isGenerating ? 'pointer-events-none' : ''}`}>
      {/* Loading overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-blueberry/90 rounded-lg p-6 text-center max-w-md">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-apricot mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">Generating Cover Letter</h3>
            <p className="text-blueberry/70 dark:text-apple-core/80 min-h-[1.5rem] transition-opacity duration-500 text-sm">
              {currentLoadingMessage}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start">
            <Users className="h-8 w-8 text-zapier-orange mr-3 mt-1" />
            <div>
              <h1 className="text-3xl font-bold text-earth dark:text-white mb-2">
                Cover Letter Generator
              </h1>
              <p className="text-lg text-earth/70 dark:text-white/70 max-w-2xl">
                Generate personalized, compelling cover letters based on your CV analysis results. 
                Our AI crafts tailored content that highlights your strengths and aligns with job requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Section */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="generate" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Generate Cover Letter</span>
                </TabsTrigger>
                <TabsTrigger value="edit" className="flex items-center space-x-2" disabled={!coverLetter}>
                  <Users className="h-4 w-4" />
                  <span>Edit & Download</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="mt-0">
                <div className="space-y-6">
                  {/* Analysis Selection */}
                  <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-5 border border-apple-core/20 dark:border-citrus/20">
                    <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">
                      Select CV Analysis
                    </h3>
                    <p className="text-sm text-blueberry/60 dark:text-apple-core/70 mb-4">
                      Choose from your previous CV analyses to generate a personalized cover letter
                    </p>
                    
                    <AnalysisSelector
                      onAnalysisSelect={setSelectedAnalysisId}
                      selectedAnalysisId={selectedAnalysisId}
                      onGenerate={handleGenerate}
                      disabled={isGenerating}
                    />
                  </div>
                  
                  {/* Advanced Options */}
                  <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-5 border border-apple-core/20 dark:border-citrus/20">
                    <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">
                      Customize Your Cover Letter
                    </h3>
                    
                    <AdvancedGenerationOptions
                      value={generationOptions}
                      onChange={updateGenerationOptions}
                      isGenerating={isGenerating}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="edit" className="mt-0">
                {coverLetter && (
                  <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-5 border border-apple-core/20 dark:border-citrus/20">
                    <EditableCoverLetter
                      content={coverLetter.content || coverLetter}
                      onSave={handleSaveCoverLetter}
                      onDownload={downloadCoverLetter}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Credits Panel */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <CreditsPanel
                credits={userCredits?.credits || 0}
                hasCreditsForAI={hasCreditsForAI}
              />
              
              <div className="sticky top-8">
                <ServiceExplanation
                  title="Cover Letter Features"
                  subtitle=""
                  benefits={[
                    'AI-powered personalization based on your CV analysis',
                    'Professional tone and structure optimized for ATS',
                    'Customizable writing style and focus areas',
                    'Direct download in multiple formats'
                  ]}
                  features={[
                    'Select from your existing CV analyses',
                    'Choose writing style and tone preferences',
                    'AI generates tailored content highlighting your strengths',
                    'Edit and refine before downloading'
                  ]}
                  icon={<Users className="h-8 w-8 text-zapier-orange" />}
                  compact={true}
                />
              </div>
            </div>
          </div>
        </div>

        <NoAnalysisModal
          isOpen={showNoAnalysisModal}
          onClose={() => setShowNoAnalysisModal(false)}
          onUseManualInput={handleUseManualInput}
        />
      </div>
    </div>
  );
};

export default CoverLetter;
