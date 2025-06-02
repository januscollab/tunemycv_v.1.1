
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Wand2 } from 'lucide-react';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import AdvancedGenerationOptions from '@/components/cover-letter/AdvancedGenerationOptions';
import EditableCoverLetter from '@/components/cover-letter/EditableCoverLetter';
import NoAnalysisModal from '@/components/cover-letter/NoAnalysisModal';
import { useCoverLetter } from '@/hooks/useCoverLetter';

const CoverLetter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    analyses,
    selectedAnalysisId,
    setSelectedAnalysisId,
    companyName,
    setCompanyName,
    jobTitle,
    setJobTitle,
    tone,
    setTone,
    length,
    setLength,
    coverLetter,
    isGenerating,
    hasGenerated,
    showNoAnalysisModal,
    setShowNoAnalysisModal,
    generateCoverLetter,
    resetForm
  } = useCoverLetter();

  useEffect(() => {
    if (user && analyses.length === 0) {
      setShowNoAnalysisModal(true);
    }
  }, [user, analyses.length, setShowNoAnalysisModal]);

  const handleGenerate = async () => {
    if (!selectedAnalysisId) {
      setShowNoAnalysisModal(true);
      return;
    }
    await generateCoverLetter();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header with Logo for logged out users */}
          <div className="mb-12 bg-white rounded-lg border border-border p-8">
            <div className="flex flex-col md:flex-row items-center text-left">
              <img 
                src="/lovable-uploads/9c0fa345-67f1-4945-aec9-6e428b4de6b2.png" 
                alt="TuneMyCV Logo" 
                className="h-16 w-auto mb-4 md:mb-0 md:mr-6 flex-shrink-0"
              />
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-earth mb-4 font-display">Generate Cover Letter</h1>
                <p className="text-lg text-earth/70 font-normal">
                  Create tailored cover letters that highlight your strengths and align perfectly with specific job requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <ServiceExplanation
              title="AI Cover Letter Generator"
              subtitle="Create compelling cover letters that get noticed"
              icon={<Wand2 className="h-8 w-8 text-zapier-orange" />}
              benefits={[
                "Personalized content based on your CV analysis",
                "Industry-specific language and keywords",
                "Professional tone and structure",
                "Multiple style options available",
                "Instant generation and editing"
              ]}
              features={[
                "Select from your analyzed CVs",
                "Choose company and role details",
                "Pick your preferred tone and length",
                "Generate and customize your letter",
                "Download in multiple formats"
              ]}
            />
            
            <div className="flex justify-center">
              <EmbeddedAuth
                title="Sign in to Continue"
                description="Create an account to generate personalized cover letters"
                icon={<FileText className="h-5 w-5 text-zapier-orange mr-2" />}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-earth mb-4 font-display">Generate Cover Letter</h1>
          <p className="text-lg text-earth/70">
            Create personalized cover letters based on your CV analysis
          </p>
        </div>

        {!hasGenerated ? (
          <div className="grid lg:grid-cols-2 gap-8">
            <ServiceExplanation
              title="AI Cover Letter Generator"
              subtitle="Create compelling cover letters that get noticed"
              icon={<Wand2 className="h-8 w-8 text-zapier-orange" />}
              benefits={[
                "Personalized content based on your CV analysis",
                "Industry-specific language and keywords",
                "Professional tone and structure",
                "Multiple style options available",
                "Instant generation and editing"
              ]}
              features={[
                "Select from your analyzed CVs",
                "Choose company and role details",
                "Pick your preferred tone and length",
                "Generate and customize your letter",
                "Download in multiple formats"
              ]}
              compact
            />

            <div className="space-y-6">
              <AnalysisSelector
                analyses={analyses}
                selectedAnalysisId={selectedAnalysisId}
                onSelect={setSelectedAnalysisId}
              />

              <AdvancedGenerationOptions
                companyName={companyName}
                setCompanyName={setCompanyName}
                jobTitle={jobTitle}
                setJobTitle={setJobTitle}
                tone={tone}
                setTone={setTone}
                length={length}
                setLength={setLength}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                canGenerate={!!selectedAnalysisId && !!companyName && !!jobTitle}
              />
            </div>
          </div>
        ) : (
          <EditableCoverLetter
            coverLetter={coverLetter}
            companyName={companyName}
            jobTitle={jobTitle}
            onReset={resetForm}
          />
        )}

        <NoAnalysisModal
          isOpen={showNoAnalysisModal}
          onClose={() => setShowNoAnalysisModal(false)}
          onAnalyze={() => navigate('/analyze')}
        />
      </div>
    </div>
  );
};

export default CoverLetter;
