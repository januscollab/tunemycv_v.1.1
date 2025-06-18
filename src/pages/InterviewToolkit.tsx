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
import { FileText, History, MessageSquare, Target, Calendar, Building, CheckCircle, FileUp, Search, Clock, Eye, Users, Upload, BarChart3, Zap } from 'lucide-react';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import { UploadedFile } from '@/types/fileTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CaptureInput } from '@/components/ui/capture-input';
import { CategoryDocumentHistory } from '@/components/ui/category-document-history';

import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import StepIndicator from '@/components/ui/step-indicator';


const InterviewToolkit = () => {
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
  const initialTab = tabFromUrl || 'interview-prep';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Handle pre-loaded analysis from navigation state
  const navigationState = location.state as { analysis?: any; source?: string; targetTab?: string } | null;
  const [preloadedAnalysis, setPreloadedAnalysis] = useState(navigationState?.analysis || null);
  const [viewedAnalysis, setViewedAnalysis] = useState(navigationState?.analysis || null);

  const { analyzing, analysisResult, setAnalysisResult, performAnalysis } = useAnalysis();

  // Humorous loading messages
  const loadingMessages = [
    "Preparing your interview strategy...",
    "Researching company insights...",
    "Generating winning answers...",
    "Teaching robots to interview like pros...",
    "Crafting your competitive edge...",
    "Calculating confidence boosters...",
    "Unleashing the interview ninjas...",
    "Analyzing with the power of a thousand interviews...",
    "Consulting the interview oracle...",
    "Performing digital magic on your prep..."
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
    setActiveTab('interview-prep');
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

  const canAnalyze = !!uploadedFiles.jobDescription;
  const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

  // Logged-out user experience - use the exact InterviewPrepLoggedOut component
  if (!user) {
    return <InterviewPrepLoggedOut />;
  }

  // Interview prep steps for step indicator
  const interviewSteps = [
    {
      id: 'setup',
      title: 'Setup Details',
      description: 'Enter job and company information',
      icon: <Building className="w-4 h-4" />
    },
    {
      id: 'generate',
      title: 'Generate Prep',
      description: 'Create personalized materials',
      icon: <MessageSquare className="w-4 h-4" />
    },
    {
      id: 'review',
      title: 'Review & Download',
      description: 'Study your prep materials',
      icon: <Eye className="w-4 h-4" />
    }
  ];

  const getCurrentStep = () => {
    if (viewedAnalysis || analysisResult) return 'review';
    if (interviewJobDescription || selectedAnalysisId) return 'generate';
    return 'setup';
  };

  const getCompletedSteps = () => {
    const completed = [];
    if (interviewJobDescription || selectedAnalysisId) completed.push('setup');
    if (viewedAnalysis || analysisResult) {
      completed.push('generate', 'review');
    }
    return completed;
  };

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/3 dark:from-primary/10 dark:via-background dark:to-primary/5 ${analyzing ? 'pointer-events-none' : ''}`}>
      {/* Loading overlay */}
      {analyzing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-blueberry/90 rounded-lg p-6 text-center max-w-md">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-apricot mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">Preparing Interview Toolkit</h3>
            <p className="text-blueberry/70 dark:text-apple-core/80 min-h-[1.5rem] transition-opacity duration-500 text-sm">
              {currentLoadingMessage}
            </p>
          </div>
        </div>
      )}
      
      <div className="max-w-wider mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs />
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start">
            <MessageSquare className="h-10 w-10 text-zapier-orange mr-4 mt-1" />
            <div>
              <h1 className="text-display font-bold text-foreground">
                Interview Toolkit
              </h1>
              <p className="text-lg text-earth/70 dark:text-white/70 max-w-2xl mt-1">
                Generate personalized interview preparation notes with company insights, strategic questions, and professional tips to ace your next interview.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main Content Section */}
          <div>
            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="interview-prep" className="flex items-center space-x-2 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  <span>Interview Prep</span>
                </TabsTrigger>
                <TabsTrigger value="view-analysis" className="flex items-center space-x-2 text-sm">
                  <Eye className="h-4 w-4" />
                  <span>View Interview Notes</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2 text-sm">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>

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
                        <CaptureInput
                          label="Job Title *"
                          value={interviewJobTitle}
                          onChange={(e) => setInterviewJobTitle(e.target.value)}
                          placeholder="e.g., Senior Software Engineer (auto-extracted from job description)"
                          required
                        />
                        
                        {/* Company Name */}
                        <CaptureInput
                          label="Company Name *"
                          value={interviewCompanyName}
                          onChange={(e) => setInterviewCompanyName(e.target.value)}
                          placeholder="e.g., Tech Corp Inc."
                          required
                        />
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


                  {/* Generate Button */}
                  <div className="bg-card rounded-lg shadow-sm p-5 border border-card-border transition-all duration-normal hover:shadow-md">
                    <div className="text-center">
                      <button
                        onClick={handleGenerateInterviewPrep}
                        disabled={true}
                        className="w-full py-4 px-6 rounded-lg text-lg font-semibold transition-all duration-normal bg-muted text-muted-foreground cursor-not-allowed"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <MessageSquare className="h-5 w-5" />
                          <span>Generate Interview Prep Notes</span>
                        </div>
                      </button>
                      
                      <p className="text-sm text-muted-foreground mt-3 transition-colors duration-normal">
                        Coming soon - Comprehensive interview preparation materials
                      </p>
                    </div>
                  </div>
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
                      <MessageSquare className="h-12 w-12 text-zapier-orange mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2 font-normal">
                        No interview notes generated yet.
                      </p>
                      <p className="text-sm font-normal text-gray-500">
                        Generate personalized interview preparation notes in the <Button variant="link" onClick={() => setActiveTab('interview-prep')} className="text-zapier-orange hover:text-zapier-orange/80 p-0 h-auto font-normal text-sm">Interview Prep</Button> tab or view previous notes in <Button variant="link" onClick={() => setActiveTab('history')} className="text-zapier-orange hover:text-zapier-orange/80 p-0 h-auto font-normal text-sm">History</Button>.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Interview Notes History Tab */}
              <TabsContent value="history" className="mt-0">
                <CategoryDocumentHistory
                  header={{
                    title: "Interview Notes History",
                    totalCount: 0,
                    itemsPerPage: 10,
                    onItemsPerPageChange: () => {},
                    showPagination: false,
                    showFilter: false
                  }}
                  documents={[]}
                  loading={false}
                  emptyState={{
                    title: "No interview notes yet",
                    description: "Your generated interview preparation notes will appear here once you create them.",
                    icon: <MessageSquare className="h-12 w-12" />
                  }}
                />
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
      </div>

    </>
  );
};

export default InterviewToolkit;