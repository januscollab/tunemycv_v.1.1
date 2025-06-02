
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
import { FileText, History, MessageSquare } from 'lucide-react';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import { UploadedFile } from '@/types/fileTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalysisHistoryTab from '@/components/profile/AnalysisHistoryTab';

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
  const [activeTab, setActiveTab] = useState('analysis');

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

  // Switch to current report tab when analysis completes
  React.useEffect(() => {
    if (analysisResult && !analyzing) {
      setActiveTab('report');
    }
  }, [analysisResult, analyzing]);

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
    setActiveTab('analysis');
  };

  const canAnalyze = uploadedFiles.jobDescription; // Only job description is required now
  const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

  // Logged-out user experience
  if (!user) {
    const analyzeExplanation = {
      title: '',
      subtitle: '',
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
      <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-start mb-8">
            <FileText className="h-12 w-12 text-zapier-orange mr-6 mt-2" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-earth dark:text-white mb-4">
                Analyze Your CV
              </h1>
              <p className="text-xl text-earth/70 dark:text-white/70 max-w-3xl font-normal">
                Get comprehensive compatibility analysis with actionable recommendations to improve your job application success.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px] mt-12">
            <div className="flex items-start">
              <ServiceExplanation
                title={analyzeExplanation.title}
                subtitle={analyzeExplanation.subtitle}
                benefits={analyzeExplanation.benefits}
                features={analyzeExplanation.features}
                icon={<FileText className="h-8 w-8 text-zapier-orange" />}
                compact={true}
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <EmbeddedAuth
                    title="Login to Get Started"
                    description="CV analysis requires an account to ensure personalized results and save your analysis history."
                    icon={<FileText className="h-6 w-6 text-zapier-orange mr-2" />}
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
    <div className={`min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 ${analyzing ? 'pointer-events-none' : ''}`}>
      {/* Loading overlay */}
      {analyzing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-blueberry/90 rounded-lg p-6 text-center max-w-md">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-apricot mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">Analyzing Your CV</h3>
            <p className="text-blueberry/70 dark:text-apple-core/80 min-h-[1.5rem] transition-opacity duration-500 text-sm">
              {currentLoadingMessage}
            </p>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start mb-3">
            <FileText className="h-8 w-8 text-zapier-orange mr-3 mt-1" />
            <div>
              <h1 className="text-3xl font-bold text-earth dark:text-white">
                Analyze Your CV
              </h1>
              <p className="text-lg text-earth/70 dark:text-white/70 max-w-2xl mt-1">
                Upload your CV and job description to get comprehensive compatibility analysis with actionable recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Section */}
          <div className="lg:col-span-3">
            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="analysis" className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>CV Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="interview-prep" className="flex items-center space-x-2 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  <span>Interview Prep</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2 text-sm">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>

              {/* CV Analysis Tab */}
              <TabsContent value="analysis" className="mt-0">
                <div className="space-y-5">
                  {/* Job Title */}
                  <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-5 border border-apple-core/20 dark:border-citrus/20">
                    <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">Job Title</h3>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Senior Software Engineer (auto-extracted from job description)"
                      className="w-full px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core text-sm hover:border-zapier-orange/50 transition-colors"
                      disabled={analyzing}
                    />
                    <p className="text-xs text-blueberry/60 dark:text-apple-core/70 mt-2">
                      Job title will be automatically extracted from the job description if not provided.
                    </p>
                  </div>

                  {/* Job Description Input - Required */}
                  <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-5 border border-apple-core/20 dark:border-citrus/20">
                    <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">
                      Job Description <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-blueberry/60 dark:text-apple-core/70 mb-3">
                      Upload a file (PDF, DOCX, TXT) or paste the text directly
                    </p>
                    
                    <JobDescriptionInput
                      onJobDescriptionSet={handleJobDescriptionSet}
                      uploadedFile={uploadedFiles.jobDescription}
                      disabled={uploading || analyzing}
                    />
                  </div>

                  {/* CV Selection - Optional */}
                  <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-5 border border-apple-core/20 dark:border-citrus/20">
                    <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">
                      Your CV
                    </h3>
                    
                    <CVSelector
                      onCVSelect={handleCVSelect}
                      selectedCV={uploadedFiles.cv}
                      uploading={uploading || analyzing}
                    />
                  </div>

                  {/* Analyze Button */}
                  <AnalyzeButton
                    onAnalyze={handleAnalysis}
                    canAnalyze={canAnalyze}
                    analyzing={analyzing}
                    hasCreditsForAI={hasCreditsForAI}
                  />
                </div>
              </TabsContent>

              {/* Interview Prep Tab */}
              <TabsContent value="interview-prep" className="mt-0">
                <div className="bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-8 border border-apple-core/20 dark:border-citrus/20 text-center">
                  <MessageSquare className="h-12 w-12 text-blueberry/30 dark:text-apple-core/50 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">Interview Prep Coming Soon!</h3>
                  <p className="text-blueberry/60 dark:text-apple-core/70 mb-4 text-sm">
                    We're working on an exciting new feature that will help you prepare for interviews with personalized questions and expert guidance.
                  </p>
                  <div className="inline-block bg-zapier-orange/10 text-zapier-orange px-4 py-2 rounded-full text-sm font-medium">
                    Coming Soon
                  </div>
                </div>
              </TabsContent>

              {/* Analysis History Tab */}
              <TabsContent value="history" className="mt-0">
                <AnalysisHistoryTab credits={userCredits?.credits || 0} memberSince="" />
              </TabsContent>
            </Tabs>
          </div>

          {/* Credits Panel - Reduced Width */}
          <div className="lg:col-span-1">
            <CreditsPanel
              credits={userCredits?.credits || 0}
              hasCreditsForAI={hasCreditsForAI}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeCV;
