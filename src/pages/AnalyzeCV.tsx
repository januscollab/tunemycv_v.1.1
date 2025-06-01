
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText } from 'lucide-react';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CVAnalysisTab from '@/components/analyze/tabs/CVAnalysisTab';
import CurrentReportTab from '@/components/analyze/tabs/CurrentReportTab';
import AnalysisHistoryTab from '@/components/analyze/tabs/AnalysisHistoryTab';
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

  const handleAnalysis = () => {
    if (!uploadedFiles.jobDescription) {
      toast({ 
        title: 'Missing Information', 
        description: 'Please provide a job description to analyze.', 
        variant: 'destructive' 
      });
      return;
    }

    if (!uploadedFiles.cv) {
      toast({ 
        title: 'No CV Uploaded', 
        description: 'Analysis will be performed on job description only. Upload a CV for comprehensive analysis.', 
      });
    }

    const options = {
      saveCV: false,
      saveJobDescription: false,
      cvSource: 'new' as const,
      existingCVId: undefined
    };

    performAnalysis(uploadedFiles, jobTitle, true, userCredits, options);
  };

  // Switch to Current Report tab when analysis completes
  React.useEffect(() => {
    if (analysisResult && !analyzing) {
      setActiveTab('report');
    }
  }, [analysisResult, analyzing]);

  const handleAnalysisSelect = (analysis: any) => {
    setAnalysisResult(analysis);
    setActiveTab('report');
  };

  const handleStartNew = () => {
    setAnalysisResult(null);
    setUploadedFiles({});
    setJobTitle('');
    setActiveTab('analysis');
  };

  const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

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
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[600px]">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-blueberry/90 rounded-lg p-6 md:p-8 text-center max-w-md w-full">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-apricot mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">Analyzing Your CV</h3>
            <p className="text-blueberry/70 dark:text-apple-core/80 min-h-[2rem] transition-opacity duration-500 text-sm md:text-base">
              {currentLoadingMessage}
            </p>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Main Analysis Section */}
        <div className="lg:col-span-3">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-blueberry dark:text-citrus mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 md:h-10 md:w-10 text-apricot mr-3" />
              Analyze Your CV
            </h1>
            <p className="text-lg md:text-xl text-blueberry/80 dark:text-apple-core max-w-2xl mx-auto px-4">
              Upload your CV and job description to get comprehensive compatibility analysis with actionable recommendations.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis">CV Analysis</TabsTrigger>
              <TabsTrigger value="report">Current Report</TabsTrigger>
              <TabsTrigger value="history">Analysis History</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-6">
              <CVAnalysisTab
                uploading={uploading}
                analyzing={analyzing}
                uploadedFiles={uploadedFiles}
                jobTitle={jobTitle}
                setJobTitle={setJobTitle}
                setUploadedFiles={setUploadedFiles}
                hasCreditsForAI={hasCreditsForAI}
                onAnalysis={handleAnalysis}
              />
            </TabsContent>

            <TabsContent value="report" className="space-y-6">
              <CurrentReportTab
                analysisResult={analysisResult}
                onStartNew={handleStartNew}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <AnalysisHistoryTab onAnalysisSelect={handleAnalysisSelect} />
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

export default AnalyzeCV;
