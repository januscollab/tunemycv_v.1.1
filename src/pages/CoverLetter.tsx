
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import CoverLetterLoggedOut from '@/components/cover-letter/CoverLetterLoggedOut';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import AdvancedGenerationOptions from '@/components/cover-letter/AdvancedGenerationOptions';
import EditableCoverLetter from '@/components/cover-letter/EditableCoverLetter';
import NoAnalysisModal from '@/components/cover-letter/NoAnalysisModal';
import { useCoverLetter } from '@/hooks/useCoverLetter';
import { AnalysisData } from '@/types/fileTypes';

const CoverLetter = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [showNoAnalysisModal, setShowNoAnalysisModal] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  const {
    coverLetter,
    isGenerating,
    generationOptions,
    updateGenerationOptions,
    generateCoverLetter,
    updateCoverLetter,
    downloadCoverLetter
  } = useCoverLetter();

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

  const handleGenerate = async (selectedAnalysis: AnalysisData | null) => {
    if (!selectedAnalysis) {
      setShowNoAnalysisModal(true);
      return;
    }

    await generateCoverLetter(selectedAnalysis, generationOptions);
  };

  // Logged-out user experience
  if (!user) {
    return <CoverLetterLoggedOut />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-start">
            <Users className="h-12 w-12 text-zapier-orange mr-6 mt-0" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-earth dark:text-white mb-4">
                Cover Letter Generator
              </h1>
              <p className="text-xl text-earth/70 dark:text-white/70 max-w-3xl font-normal">
                Generate personalized, compelling cover letters based on your CV analysis results. 
                Our AI crafts tailored content that highlights your strengths and aligns with job requirements.
              </p>
            </div>
          </div>
        </div>

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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <AnalysisSelector
                  onAnalysisSelect={setSelectedAnalysisId}
                  selectedAnalysisId={selectedAnalysisId}
                  onGenerate={handleGenerate}
                />
                
                <AdvancedGenerationOptions
                  options={generationOptions}
                  onOptionsChange={updateGenerationOptions}
                  isGenerating={isGenerating}
                />
              </div>
              
              <div className="lg:col-span-2">
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
          </TabsContent>

          <TabsContent value="edit" className="mt-0">
            {coverLetter && (
              <EditableCoverLetter
                initialContent={coverLetter}
                onContentChange={updateCoverLetter}
                onDownload={downloadCoverLetter}
              />
            )}
          </TabsContent>
        </Tabs>

        <NoAnalysisModal
          isOpen={showNoAnalysisModal}
          onClose={() => setShowNoAnalysisModal(false)}
        />
      </div>
    </div>
  );
};

export default CoverLetter;
