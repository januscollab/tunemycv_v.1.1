
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { extractJobTitleFromText } from '@/utils/analysisUtils';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import CVSelector from '@/components/analyze/CVSelector';
import JobDescriptionInput from '@/components/analyze/JobDescriptionInput';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import AnalyzeButton from '@/components/analyze/AnalyzeButton';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText } from 'lucide-react';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import { UploadedFile } from '@/types/fileTypes';

const AnalyzeCV = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    cv?: UploadedFile;
    jobDescription?: UploadedFile;
  }>({});
  const [jobTitle, setJobTitle] = useState('');
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');

  const { analyzing, analysisResult, setAnalysisResult, performAnalysis } = useAnalysis();

  // Humorous loading messages
  const loadingMessages = [
    "Deconstructing your CV...",
    "Decoding job description secrets...",
    "Feeding the analysis gremlins...",
    "Teaching robots to read between the lines...",
    "Matching your skills with cosmic precision...",
    "Calculating your career compatibility...",
    "Unleashing the keyword detectives...",
    "Analyzing with the power of a thousand spreadsheets...",
    "Consulting the CV oracle...",
    "Performing digital alchemy on your resume..."
  ];

  // Rotate loading messages
  React.useEffect(() => {
    if (analyzing) {
      let messageIndex = 0;
      setCurrentLoadingMessage(loadingMessages[0]);
      
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setCurrentLoadingMessage(loadingMessages[messageIndex]);
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [analyzing]);

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

  const handleCVSelect = (uploadedFile: UploadedFile) => {
    setUploadedFiles(prev => ({
      ...prev,
      cv: uploadedFile
    }));
    toast({ title: 'Success', description: 'CV selected successfully!' });
  };

  const handleJobDescriptionSet = (uploadedFile: UploadedFile) => {
    setUploadedFiles(prev => ({
      ...prev,
      jobDescription: uploadedFile
    }));

    // Auto-extract job title from job description
    if (!jobTitle) {
      const extractedJobTitle = extractJobTitleFromText(uploadedFile.extractedText);
      setJobTitle(extractedJobTitle);
    }
  };

  const handleAnalysis = () => {
    // Validate that we have at least a job description
    if (!uploadedFiles.jobDescription) {
      toast({ 
        title: 'Missing Information', 
        description: 'Please provide a job description to analyze.', 
        variant: 'destructive' 
      });
      return;
    }

    // Show warning if no CV is uploaded
    if (!uploadedFiles.cv) {
      toast({ 
        title: 'No CV Uploaded', 
        description: 'Analysis will be performed on job description only. Upload a CV for comprehensive analysis.', 
      });
    }

    // Create options object with default values for temporary analysis
    const options = {
      saveCV: false,
      saveJobDescription: false,
      cvSource: 'new' as const,
      existingCVId: undefined
    };

    performAnalysis(uploadedFiles, jobTitle, true, userCredits, options);
  };

  const handleStartNew = () => {
    setAnalysisResult(null);
    setUploadedFiles({});
    setJobTitle('');
  };

  const canAnalyze = uploadedFiles.jobDescription; // Only job description is required now
  const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

  if (analysisResult) {
    return <AnalysisResults result={analysisResult} onStartNew={handleStartNew} />;
  }

  // Logged-out user experience
  if (!user) {
    const analyzeExplanation = {
      title: 'Analyze Your CV',
      subtitle: 'Get comprehensive compatibility analysis with actionable recommendations to improve your job application success.',
      benefits: [
        'Advanced AI-powered analysis that evaluates your CV against specific job requirements',
        'Detailed compatibility scoring to understand how well you match the role',
        'Keyword optimization recommendations to improve ATS compatibility'
      ],
      features: [
        'Upload your CV in PDF, DOCX, or TXT format for instant analysis',
        'Paste or upload the job description you\'re targeting',
        'Our AI analyzes compatibility, keywords, and alignment between your experience and the role'
      ]
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
            <div className="flex items-start">
              <ServiceExplanation
                title={analyzeExplanation.title}
                subtitle={analyzeExplanation.subtitle}
                benefits={analyzeExplanation.benefits}
                features={analyzeExplanation.features}
                icon={<FileText className="h-8 w-8 text-apricot mr-2" />}
                compact={true}
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <EmbeddedAuth
                    title="Login to Get Started"
                    description="CV analysis requires an account to ensure personalized results and save your analysis history."
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
    <div className={`min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 ${analyzing ? 'pointer-events-none' : ''}`}>
      {analyzing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-blueberry/90 rounded-lg p-8 text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apricot mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">Analyzing Your CV</h3>
            <p className="text-blueberry/70 dark:text-apple-core/80 min-h-[2rem] transition-opacity duration-500">
              {currentLoadingMessage}
            </p>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Analysis Section */}
        <div className="lg:col-span-3">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4">
              <FileText className="h-10 w-10 text-apricot inline mr-3" />
              Analyze Your CV
            </h1>
            <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-2xl mx-auto">
              Upload your CV and job description to get comprehensive compatibility analysis with actionable recommendations.
            </p>
          </div>

          <div className="space-y-6">
            {/* Job Title */}
            <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
              <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Job Title</h3>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer (auto-extracted from job description)"
                className="w-full px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-apricot focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core"
                disabled={analyzing}
              />
              <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-2">
                Job title will be automatically extracted from the job description if not provided.
              </p>
            </div>

            {/* Job Description Input - Required */}
            <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
              <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">
                Job Description <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
                Upload a file (PDF, DOCX, TXT) or paste the text directly
              </p>
              
              <JobDescriptionInput
                onJobDescriptionSet={handleJobDescriptionSet}
                uploadedFile={uploadedFiles.jobDescription}
                disabled={uploading || analyzing}
              />
            </div>

            {/* CV Selection - Optional */}
            <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
              <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">
                Your CV <span className="text-sm font-normal text-blueberry/70 dark:text-apple-core/80">(Optional)</span>
              </h3>
              <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
                Upload your CV for comprehensive analysis. Without a CV, we'll provide general insights about the job requirements.
              </p>
              
              <CVSelector
                onCVSelect={handleCVSelect}
                selectedCV={uploadedFiles.cv}
                uploading={uploading || analyzing}
              />
            </div>

            {/* Analyze Button */}
            <AnalyzeButton
              onAnalyze={handleAnalysis}
              canAnalyze={!!canAnalyze}
              analyzing={analyzing}
              hasCreditsForAI={hasCreditsForAI}
            />
          </div>
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

export default AnalyzeCV;
