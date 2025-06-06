import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { extractJobTitleFromText } from '@/utils/analysisUtils';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import CVSelector from '@/components/analyze/CVSelector';
import JobDescriptionUpload from '@/components/analyze/JobDescriptionUpload';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import AnalyzeButton from '@/components/analyze/AnalyzeButton';
import InterviewPrepAnalysisSelector from '@/components/analyze/InterviewPrepAnalysisSelector';
import InterviewPrepModal from '@/components/analyze/InterviewPrepModal';
import InterviewPrepLoggedOut from '@/components/analyze/InterviewPrepLoggedOut';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import PersonalizationSurveyModal from '@/components/analyze/PersonalizationSurveyModal';
import SoftSkillsSurveyPanel from '@/components/analyze/SoftSkillsSurveyPanel';
import SoftSkillsSurveyModal from '@/components/analyze/SoftSkillsSurveyModal';
import { useSoftSkills } from '@/hooks/useSoftSkills';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, History, MessageSquare, Target, Calendar, Building, CheckCircle, FileUp, Search, Clock, Eye, Users, Upload, BarChart3 } from 'lucide-react';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import { UploadedFile } from '@/types/fileTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AnalysisHistoryTab from '@/components/profile/AnalysisHistoryTab';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import StepIndicator from '@/components/ui/step-indicator';
import QuickActions from '@/components/common/QuickActions';

const AnalyzeCV = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    cv?: UploadedFile;
    jobDescription?: UploadedFile;
  }>({});
  const [jobTitle, setJobTitle] = useState('');
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');
  
  // Interview Prep states
  const [interviewPrepMethod, setInterviewPrepMethod] = useState<'input' | 'analysis'>('input');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [interviewPrepIncludes, setInterviewPrepIncludes] = useState({
    companyProfile: false,
    recentPressReleases: false,
    interviewTips: false,
    getNoticedQuestions: false
  });
  const [interviewJobTitle, setInterviewJobTitle] = useState('');
  const [interviewCompanyName, setInterviewCompanyName] = useState('');
  const [interviewJobDescription, setInterviewJobDescription] = useState<UploadedFile | undefined>();
  const [showInterviewPrepModal, setShowInterviewPrepModal] = useState(false);
  
  // Personalization survey states
  const [showPersonalizationSurvey, setShowPersonalizationSurvey] = useState(false);
  const [surveyResponses, setSurveyResponses] = useState<any>(null);
  
  // Soft skills survey states
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const { saveSoftSkills, dismissSurvey, shouldShowSurvey } = useSoftSkills();
  
  // Get initial tab from URL parameter or location state
  const urlParams = new URLSearchParams(location.search);
  const tabFromUrl = urlParams.get('tab');
  const initialTab = tabFromUrl || 'analysis';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Handle pre-loaded analysis from navigation state
  const navigationState = location.state as { analysis?: any; source?: string; targetTab?: string } | null;
  const [preloadedAnalysis, setPreloadedAnalysis] = useState(navigationState?.analysis || null);
  const [viewedAnalysis, setViewedAnalysis] = useState(navigationState?.analysis || null);

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

  // Switch to view-analysis tab when analysis completes and sync states
  React.useEffect(() => {
    if (analysisResult && !analyzing) {
      setViewedAnalysis(analysisResult);
      setActiveTab('view-analysis');
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

  // Update the tab when URL changes
  React.useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Handle navigation state for viewing analysis
  React.useEffect(() => {
    if (navigationState?.targetTab) {
      setActiveTab(navigationState.targetTab);
      if (navigationState.analysis) {
        setViewedAnalysis(navigationState.analysis);
      }
    }
  }, [navigationState]);

  // Load analysis by ID from URL parameters
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const analysisId = params.get('analysisId');
    
    if (activeTab === 'view-analysis' && analysisId && user && !viewedAnalysis) {
      loadAnalysisById(analysisId);
    }
  }, [activeTab, location.search, user, viewedAnalysis]);

  const loadAnalysisById = async (analysisId: string) => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('id', analysisId)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      if (data) {
        setViewedAnalysis(data);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast({
        title: "Error",
        description: "Failed to load analysis details",
        variant: "destructive",
      });
    }
  };

  // Clear URL state after it's been processed
  React.useEffect(() => {
    if (navigationState) {
      // Clear the navigation state by replacing the current history entry
      navigate(location.pathname + location.search, { replace: true });
    }
  }, []);

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

  const handleInterviewJobDescriptionSet = (uploadedFile: UploadedFile) => {
    setInterviewJobDescription(uploadedFile);

    // Auto-extract job title from job description
    if (!interviewJobTitle) {
      const extractedJobTitle = extractJobTitleFromText(uploadedFile.extractedText);
      setInterviewJobTitle(extractedJobTitle);
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
    setPreloadedAnalysis(null);
    setViewedAnalysis(null);
    setActiveTab('analysis');
    setSurveyResponses(null);
  };

  const handleSurveySubmit = (responses: any) => {
    setSurveyResponses(responses);
    // Here you could save the responses to enhance the analysis
    console.log('Survey responses:', responses);
  };

  const handleDeselectAnalysis = () => {
    setPreloadedAnalysis(null);
  };

  const handleInterviewPrepIncludeChange = (key: string, checked: boolean) => {
    setInterviewPrepIncludes(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleGenerateInterviewPrep = () => {
    // Validation logic
    const hasSelectedInclusions = Object.values(interviewPrepIncludes).some(Boolean);
    
    if (!hasSelectedInclusions) {
      toast({
        title: 'Selection Required',
        description: 'Please select at least one item to include in your interview prep.',
        variant: 'destructive'
      });
      return;
    }

    if (interviewPrepMethod === 'input') {
      if (!interviewJobDescription) {
        toast({
          title: 'Missing Job Description',
          description: 'Please provide a job description.',
          variant: 'destructive'
        });
        return;
      }
      
      if (!interviewJobTitle.trim()) {
        toast({
          title: 'Missing Job Title',
          description: 'Please provide a job title.',
          variant: 'destructive'
        });
        return;
      }
      
      if (!interviewCompanyName.trim()) {
        toast({
          title: 'Missing Company Name',
          description: 'Please provide a company name.',
          variant: 'destructive'
        });
        return;
      }
    }

    if (interviewPrepMethod === 'analysis' && !selectedAnalysisId) {
      toast({
        title: 'Missing Analysis Selection',
        description: 'Please select an existing analysis.',
        variant: 'destructive'
      });
      return;
    }

    // Show the work-in-progress modal
    setShowInterviewPrepModal(true);
  };

  const canAnalyze = !!uploadedFiles.jobDescription; // Fixed: properly check if job description exists
  const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

  // Special case: Show Interview Prep logged-out experience if user is not authenticated and on interview-prep tab
  if (!user && activeTab === 'interview-prep') {
    return <InterviewPrepLoggedOut />;
  }

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
        <div className="max-w-5xl mx-auto px-4 py-12">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px] mt-12 w-4/5 mx-auto">
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

  // Analysis steps for step indicator
  const analysisSteps = [
    {
      id: 'upload',
      title: 'Upload Files',
      description: 'Upload CV and job description',
      icon: <Upload className="w-4 h-4" />
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Process compatibility and keywords',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'results',
      title: 'View Results',
      description: 'Review recommendations',
      icon: <Eye className="w-4 h-4" />
    }
  ];

  const getCurrentStep = () => {
    if (viewedAnalysis || analysisResult) return 'results';
    if (uploadedFiles.cv || uploadedFiles.jobDescription) return 'analyze';
    return 'upload';
  };

  const getCompletedSteps = () => {
    const completed = [];
    if (uploadedFiles.cv || uploadedFiles.jobDescription) completed.push('upload');
    if (viewedAnalysis || analysisResult) {
      completed.push('analyze', 'results');
    }
    return completed;
  };

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
      
      <div className="max-w-wider mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs />
        
        {/* Step Indicator for Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="mb-8">
            <StepIndicator
              steps={analysisSteps}
              currentStep={getCurrentStep()}
              completedSteps={getCompletedSteps()}
              className="max-w-2xl mx-auto"
            />
          </div>
        )}
        {/* Header Section */}
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-earth dark:text-white">
              Analyze Your CV & Interview Prep
            </h1>
            <p className="text-lg text-earth/70 dark:text-white/70 max-w-2xl mt-1">
              Upload your CV and job description to get comprehensive compatibility analysis with actionable recommendations.
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main Content Section */}
          <div>
            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="analysis" className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Analyze CV</span>
                </TabsTrigger>
                <TabsTrigger value="view-analysis" className="flex items-center space-x-2 text-sm">
                  <Eye className="h-4 w-4" />
                  <span>View Analysis</span>
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
                    
                    <JobDescriptionUpload
                      onJobDescriptionSet={handleJobDescriptionSet}
                      uploadedFile={uploadedFiles.jobDescription}
                      disabled={uploading || analyzing}
                    />
                  </div>

                  {/* CV Selection - Optional */}
                  <CVSelector
                    onCVSelect={handleCVSelect}
                    selectedCV={uploadedFiles.cv}
                    uploading={uploading || analyzing}
                  />

                  {/* Let's Get Personal Section */}
                  <div className="bg-gradient-to-br from-zapier-orange/5 via-white to-apricot/5 dark:from-zapier-orange/10 dark:via-blueberry/10 dark:to-apricot/10 rounded-lg shadow-sm p-5 border border-zapier-orange/20 dark:border-zapier-orange/30">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-8 h-8 bg-zapier-orange/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-zapier-orange" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">
                          Let's Get Personal (Optional)
                        </h3>
                        <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4 leading-relaxed">
                          Every role is unique. Share additional insights about your motivation and goals to enhance your CV analysis with our Advanced Recruitment Models.
                        </p>
                        
                        {surveyResponses ? (
                          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Survey completed! Your responses will enhance the analysis.
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPersonalizationSurvey(true)}
                              className="text-green-600 hover:text-green-700 ml-auto"
                            >
                              Retake Survey
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setShowPersonalizationSurvey(true)}
                            variant="outline"
                            className="border-zapier-orange text-zapier-orange hover:bg-zapier-orange hover:text-white transition-all duration-200"
                            disabled={uploading || analyzing}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Take Survey
                          </Button>
                        )}
                      </div>
                    </div>
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

              {/* View Analysis Tab */}
              <TabsContent value="view-analysis" className="mt-0">
                {viewedAnalysis ? (
                  <AnalysisResults 
                    result={viewedAnalysis} 
                    onStartNew={handleStartNew}
                    readOnly={true}
                  />
                ) : (
                  <Card className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="text-center py-8">
                      <FileText className="h-12 w-12 text-zapier-orange mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2 font-normal">
                        No analysis generated yet.
                      </p>
                      <p className="text-sm font-normal text-gray-500">
                        Create one in the <Button variant="link" onClick={() => setActiveTab('analysis')} className="text-zapier-orange hover:text-zapier-orange/80 p-0 h-auto font-normal text-sm">Analyze CV</Button> tab or view previous analysis in <Button variant="link" onClick={() => setActiveTab('history')} className="text-zapier-orange hover:text-zapier-orange/80 p-0 h-auto font-normal text-sm">History</Button>.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Interview Prep Tab */}
              <TabsContent value="interview-prep" className="mt-0">
                <div className="space-y-6">
                  {/* Coming Soon Banner */}
                  <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      This feature is coming soon! We're working hard to bring you comprehensive interview preparation tools.
                    </AlertDescription>
                  </Alert>

                  {/* Generation Method Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-blueberry dark:text-citrus">
                        Generate Interview Prep Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => setInterviewPrepMethod('input')}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            interviewPrepMethod === 'input'
                              ? 'border-zapier-orange bg-zapier-orange/10'
                              : 'border-gray-200 hover:border-zapier-orange/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <FileUp className={`h-5 w-5 ${
                              interviewPrepMethod === 'input' ? 'text-zapier-orange' : 'text-gray-500'
                            }`} />
                            <div className="text-left">
                              <h3 className="font-semibold text-blueberry dark:text-citrus">Generate From Input</h3>
                              <p className="text-sm text-blueberry/70 dark:text-apple-core/80">Enter job details manually</p>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => setInterviewPrepMethod('analysis')}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            interviewPrepMethod === 'analysis'
                              ? 'border-zapier-orange bg-zapier-orange/10'
                              : 'border-gray-200 hover:border-zapier-orange/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Search className={`h-5 w-5 ${
                              interviewPrepMethod === 'analysis' ? 'text-zapier-orange' : 'text-gray-500'
                            }`} />
                            <div className="text-left">
                              <h3 className="font-semibold text-blueberry dark:text-citrus">Generate from Existing Analysis</h3>
                              <p className="text-sm text-blueberry/70 dark:text-apple-core/80">Use a previous CV analysis</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Job Details Section */}
                  {interviewPrepMethod === 'input' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-blueberry dark:text-citrus flex items-center">
                          <Building className="h-5 w-5 text-zapier-orange mr-2" />
                          Job Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Job Description Input */}
                        <div>
                          <label className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                            Job Description <span className="text-red-500">*</span>
                          </label>
                          <p className="text-xs text-blueberry/60 dark:text-apple-core/70 mb-3">
                            Upload a file (PDF, DOCX, TXT) or paste the text directly
                          </p>
                          <JobDescriptionUpload
                            onJobDescriptionSet={handleInterviewJobDescriptionSet}
                            uploadedFile={interviewJobDescription}
                            disabled={false}
                          />
                        </div>
                        
                        {/* Job Title */}
                        <div>
                          <label className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                            Job Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={interviewJobTitle}
                            onChange={(e) => setInterviewJobTitle(e.target.value)}
                            placeholder="e.g., Senior Software Engineer (auto-extracted from job description)"
                            className="w-full px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core"
                          />
                        </div>
                        
                        {/* Company Name */}
                        <div>
                          <label className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                            Company Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={interviewCompanyName}
                            onChange={(e) => setInterviewCompanyName(e.target.value)}
                            placeholder="e.g., Tech Corp Inc."
                            className="w-full px-3 py-2 border border-apple-core/30 dark:border-citrus/30 rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange focus:border-transparent bg-white dark:bg-blueberry/10 text-blueberry dark:text-apple-core"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Select Analysis Section */}
                  {interviewPrepMethod === 'analysis' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-blueberry dark:text-citrus flex items-center">
                          <Target className="h-5 w-5 text-zapier-orange mr-2" />
                          Select Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AnalysisSelector
                          onAnalysisSelect={setSelectedAnalysisId}
                          selectedAnalysisId={selectedAnalysisId}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* What should we include Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-blueberry dark:text-citrus flex items-center">
                        <CheckCircle className="h-5 w-5 text-zapier-orange mr-2" />
                        What should we include
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="companyProfile"
                            checked={interviewPrepIncludes.companyProfile}
                            onCheckedChange={(checked) => handleInterviewPrepIncludeChange('companyProfile', checked as boolean)}
                          />
                          <label htmlFor="companyProfile" className="text-sm font-medium text-blueberry dark:text-citrus cursor-pointer">
                            Company Profile
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="recentPressReleases"
                            checked={interviewPrepIncludes.recentPressReleases}
                            onCheckedChange={(checked) => handleInterviewPrepIncludeChange('recentPressReleases', checked as boolean)}
                          />
                          <label htmlFor="recentPressReleases" className="text-sm font-medium text-blueberry dark:text-citrus cursor-pointer">
                            Recent Press Releases
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="interviewTips"
                            checked={interviewPrepIncludes.interviewTips}
                            onCheckedChange={(checked) => handleInterviewPrepIncludeChange('interviewTips', checked as boolean)}
                          />
                          <label htmlFor="interviewTips" className="text-sm font-medium text-blueberry dark:text-citrus cursor-pointer">
                            Interview Tips
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="getNoticedQuestions"
                            checked={interviewPrepIncludes.getNoticedQuestions}
                            onCheckedChange={(checked) => handleInterviewPrepIncludeChange('getNoticedQuestions', checked as boolean)}
                          />
                          <label htmlFor="getNoticedQuestions" className="text-sm font-medium text-blueberry dark:text-citrus cursor-pointer">
                            Get Noticed Questions
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Generate Button Card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-center">
                        <Button
                          onClick={handleGenerateInterviewPrep}
                          className="bg-zapier-orange hover:bg-zapier-orange/90 text-white px-8 py-3 text-lg font-semibold flex items-center space-x-2"
                          size="lg"
                          disabled
                        >
                          <MessageSquare className="h-5 w-5" />
                          <span>Generate Interview Prep Notes</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analysis History Tab */}
              <TabsContent value="history" className="mt-0">
                <AnalysisHistoryTab credits={userCredits?.credits || 0} memberSince="" />
              </TabsContent>
            </Tabs>
          </div>

          {/* Personalization Survey Modal */}
          <PersonalizationSurveyModal
            isOpen={showPersonalizationSurvey}
            onClose={() => setShowPersonalizationSurvey(false)}
            onSubmit={handleSurveySubmit}
          />

          {/* Credits Panel - Fixed Width */}
          <div className="space-y-4">
            <CreditsPanel
              credits={userCredits?.credits || 0}
              hasCreditsForAI={hasCreditsForAI}
            />
            <SoftSkillsSurveyPanel
              onTakeSurvey={() => setShowSurveyModal(true)}
              onDismiss={dismissSurvey}
              isVisible={shouldShowSurvey()}
            />
          </div>
        </div>
      </div>

      {/* Soft Skills Survey Modal */}
      <SoftSkillsSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        onSubmit={saveSoftSkills}
      />

      {/* Interview Prep Modal */}
      <InterviewPrepModal
        isOpen={showInterviewPrepModal}
        onClose={() => setShowInterviewPrepModal(false)}
      />

      {/* Quick Actions */}
      <QuickActions 
        customActions={[
          {
            id: 'new-analysis',
            label: 'Start New Analysis',
            icon: <FileText className="w-5 h-5" />,
            onClick: handleStartNew,
            variant: 'default'
          }
        ]}
      />
    </div>
  );
};

export default AnalyzeCV;
