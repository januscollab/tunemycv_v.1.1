import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCoverLetter } from '@/hooks/useCoverLetter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Edit, History, FileText, Download, Eye, Trash2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import JobDescriptionInput from '@/components/analyze/JobDescriptionInput';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import NoAnalysisModal from '@/components/cover-letter/NoAnalysisModal';
import AdvancedGenerationOptions from '@/components/cover-letter/AdvancedGenerationOptions';
import DownloadOptions from '@/components/cover-letter/DownloadOptions';
import EditableCoverLetter from '@/components/cover-letter/EditableCoverLetter';
import { UploadedFile } from '@/types/fileTypes';
import { useLocation, useNavigate } from 'react-router-dom';

interface CoverLetterResult {
  id: string;
  job_title: string;
  company_name: string;
  content: string;
  created_at: string;
  template_id: string;
  analysis_result_id: string | null;
  regeneration_count: number;
}

interface CoverLetterProps {
  coverLetter: CoverLetterResult;
  viewMode: boolean;
}

const CoverLetterLoggedOut = () => {
  const coverLetterExplanation = {
    title: '',
    subtitle: '',
    benefits: [
      'AI-powered cover letter generation tailored to your CV and the job description',
      'Customizable templates and tones to match your personal brand',
      'Optimized content to highlight your key skills and experience'
    ],
    features: [
      'Upload your CV and the job description for instant analysis',
      'Choose from a variety of templates and writing styles',
      'Edit and refine the generated cover letter to perfection'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-start mb-8">
          <Edit className="h-12 w-12 text-zapier-orange mr-6 mt-2" />
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-earth dark:text-white mb-4">
              Generate Your Cover Letter
            </h1>
            <p className="text-xl text-earth/70 dark:text-white/70 max-w-3xl font-normal">
              Create a personalized cover letter that highlights your skills and experience, tailored to the job description.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px] mt-12 w-4/5 mx-auto">
          <div className="flex items-start">
            <ServiceExplanation
              title={coverLetterExplanation.title}
              subtitle={coverLetterExplanation.subtitle}
              benefits={coverLetterExplanation.benefits}
              features={coverLetterExplanation.features}
              icon={<Edit className="h-8 w-8 text-zapier-orange" />}
              compact={true}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <EmbeddedAuth
                  title="Login to Get Started"
                  description="Cover letter generation requires an account to ensure personalized results and save your cover letter history."
                  icon={<Edit className="h-6 w-6 text-zapier-orange mr-2" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedCoverLetter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial tab from URL parameter or location state
  const urlParams = new URLSearchParams(location.search);
  const tabFromUrl = urlParams.get('tab');
  const initialTab = tabFromUrl || 'create';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Handle pre-loaded analysis from navigation state
  const navigationState = location.state as { analysis?: any; coverLetter?: any; viewMode?: boolean; generationMethod?: 'input' | 'analysis'; activeTab?: string } | null;
  const [preloadedAnalysis, setPreloadedAnalysis] = useState(navigationState?.analysis || null);
  const [viewMode, setViewMode] = useState(navigationState?.viewMode || false);

  const {
    generateCoverLetter,
    generateFromAnalysis,
    regenerateCoverLetter,
    getCoverLetters,
    updateCoverLetter,
    deleteCoverLetter,
    isGenerating,
    isRegenerating,
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
    hasGenerated,
    showNoAnalysisModal,
    setShowNoAnalysisModal,
    resetForm
  } = useCoverLetter();
  const [coverLetterHistory, setCoverLetterHistory] = useState<CoverLetterResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [credits, setCredits] = useState<number>(0);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<UploadedFile | null>(null);
  const [cvFile, setCvFile] = useState<UploadedFile | null>(null);
  const [workExperienceHighlights, setWorkExperienceHighlights] = useState('');
  const [customHookOpener, setCustomHookOpener] = useState('');
  const [personalValues, setPersonalValues] = useState('');
  const [includeLinkedInUrl, setIncludeLinkedInUrl] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  useEffect(() => {
    if (userCredits && userCredits.credits !== null) {
      setCredits(userCredits.credits);
    }
  }, [userCredits]);

  // Load cover letter history on mount
  useEffect(() => {
    const fetchCoverLetterHistory = async () => {
      setLoadingHistory(true);
      try {
        const data = await getCoverLetters();
        setCoverLetterHistory(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load cover letter history',
          variant: 'destructive',
        });
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchCoverLetterHistory();
  }, [getCoverLetters, toast]);

  // Handle pre-loaded cover letter from navigation state
  useEffect(() => {
    if (navigationState?.coverLetter) {
      // Load the cover letter into the state
      setCoverLetter(navigationState.coverLetter);
      
      // Set the active tab to 'result'
      setActiveTab('result');
      
      // Set view mode to true
      setViewMode(navigationState.viewMode || false);
    }
  }, [navigationState?.coverLetter, navigationState?.viewMode]);

  // Handle pre-loaded analysis from navigation state
  useEffect(() => {
    if (preloadedAnalysis) {
      // Load the analysis into the state
      setSelectedAnalysisId(preloadedAnalysis.id);
      setCompanyName(preloadedAnalysis.company_name);
      setJobTitle(preloadedAnalysis.job_title);
    }
  }, [preloadedAnalysis]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle job description file upload
  const handleJobDescriptionUpload = (file: UploadedFile) => {
    setJobDescriptionFile(file);
  };

  // Handle CV file upload
  const handleCVUpload = (file: UploadedFile) => {
    setCvFile(file);
  };

  // Handle cover letter generation
  const handleGenerateCoverLetter = async () => {
    if (!jobTitle || !companyName) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both job title and company name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await generateCoverLetter({
        jobTitle,
        companyName,
        jobDescription: jobDescriptionFile?.extractedText,
        cvText: cvFile?.extractedText,
        tone,
        length,
        workExperienceHighlights,
        customHookOpener,
        personalValues,
        includeLinkedInUrl
      });
      setActiveTab('result');
    } catch (error) {
      // Error is already handled in the useCoverLetter hook
    }
  };

  // Handle cover letter generation from analysis
  const handleGenerateFromAnalysis = async () => {
    if (!selectedAnalysisId) {
      toast({
        title: 'Missing Analysis',
        description: 'Please select an analysis to generate a cover letter from.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await generateFromAnalysis({
        analysisResultId: selectedAnalysisId,
        tone,
        length,
        workExperienceHighlights,
        customHookOpener,
        personalValues,
        includeLinkedInUrl
      });
      setActiveTab('result');
    } catch (error) {
      // Error is already handled in the useCoverLetter hook
    }
  };

  // Handle cover letter regeneration
  const handleRegenerateCoverLetter = async (coverLetterId: string) => {
    try {
      const regeneratedLetter = await regenerateCoverLetter({
        coverLetterId,
        tone,
        length,
      });

      // Update the cover letter content in the state
      setCoverLetter(prevLetter => {
        if (!prevLetter) return null;
        return {
          ...prevLetter,
          content: regeneratedLetter.content,
          regeneration_count: regeneratedLetter.regeneration_count
        };
      });
    } catch (error) {
      // Error is already handled in the useCoverLetter hook
    }
  };

  // Handle view cover letter
  const handleViewCoverLetter = (letter: CoverLetterResult) => {
    setCoverLetter(letter);
    setActiveTab('result');
    setViewMode(true);
  };

  // Handle update cover letter
  const handleUpdateCoverLetter = async (content: string) => {
    if (!coverLetter) return;

    try {
      await updateCoverLetter(coverLetter.id, content);
      // Update the cover letter content in the state
      setCoverLetter(prevLetter => {
        if (!prevLetter) return null;
        return {
          ...prevLetter,
          content: content
        };
      });
    } catch (error) {
      // Error is already handled in the useCoverLetter hook
    }
  };

  // Handle delete cover letter
  const handleDeleteCoverLetter = async (id: string) => {
    try {
      await deleteCoverLetter(id);
      setCoverLetterHistory(prev => prev.filter(letter => letter.id !== id));
      if (coverLetter && coverLetter.id === id) {
        setCoverLetter(null);
        setActiveTab('create');
      }
    } catch (error) {
      // Error is already handled in the useCoverLetter hook
    }
  };

  // Clear URL state after it's been processed
  useEffect(() => {
    if (navigationState) {
      // Clear the navigation state by replacing the current history entry
      navigate(location.pathname + location.search, { replace: true });
    }
  }, []);

  const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

  // Logged-out user experience
  if (!user) {
    return <CoverLetterLoggedOut />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-6">
      {/* Loading overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-blueberry/90 rounded-lg p-6 text-center max-w-md">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-apricot mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-2">Generating Your Cover Letter</h3>
            <p className="text-blueberry/70 dark:text-apple-core/80 min-h-[1.5rem] transition-opacity duration-500 text-sm">
              Please wait while we craft the perfect cover letter for you.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-wider mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-start mb-6">
            <Edit className="h-8 w-8 text-zapier-orange mr-3 flex-shrink-0" />
            <div>
              <h1 className="text-3xl font-bold text-earth dark:text-white">
                Generate Cover Letter
              </h1>
              <p className="text-lg text-earth/70 dark:text-white/70 max-w-2xl mt-1">
                Create personalized cover letters using AI or your existing CV analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        {coverLetter && activeTab === 'result' && (
          <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-blueberry/50 border-t border-apple-core/20 dark:border-citrus/20 py-3 px-4">
            <div className="max-w-wider mx-auto flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {new Date(coverLetter.updated_at || coverLetter.created_at).toLocaleDateString()}
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Stop Editing' : 'Edit'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {}}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main Content */}
          <div>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create" className="flex items-center space-x-2 text-sm">
                  <Edit className="h-4 w-4" />
                  <span>Create</span>
                </TabsTrigger>
                <TabsTrigger value="result" className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Current Result</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2 text-sm">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>

              {/* Create Tab */}
              <TabsContent value="create" className="mt-0">
                <div className="space-y-6">
                  {/* Generation Method Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-blueberry dark:text-citrus flex items-center">
                        <Edit className="h-5 w-5 text-zapier-orange mr-2" />
                        Choose Generation Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          className={`justify-start ${preloadedAnalysis ? 'opacity-50 pointer-events-none' : ''}`}
                          onClick={() => {
                            setPreloadedAnalysis(null);
                            resetForm();
                          }}
                          disabled={preloadedAnalysis}
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                              <h3 className="font-medium text-blueberry dark:text-citrus">Manual Input</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Enter job details manually</p>
                            </div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className={`justify-start ${!preloadedAnalysis ? 'opacity-50 pointer-events-none' : ''}`}
                          onClick={handleGenerateFromAnalysis}
                          disabled={!preloadedAnalysis}
                        >
                          <div className="flex items-center space-x-3">
                            <History className="h-5 w-5 text-gray-500" />
                            <div>
                              <h3 className="font-medium text-blueberry dark:text-citrus">Use Existing Analysis</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Generate from a previous CV analysis</p>
                            </div>
                          </div>
                        </Button>
                      </div>
                      {preloadedAnalysis && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Using analysis: {preloadedAnalysis.job_title} at {preloadedAnalysis.company_name}
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setPreloadedAnalysis(null)}
                              className="ml-2"
                            >
                              Change
                            </Button>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Manual Input Form */}
                  {!preloadedAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-blueberry dark:text-citrus flex items-center">
                          <Edit className="h-5 w-5 text-zapier-orange mr-2" />
                          Manual Input
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Job Title */}
                        <div>
                          <Label htmlFor="jobTitle" className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                            Job Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="text"
                            id="jobTitle"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g., Senior Software Engineer"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange focus:border-transparent bg-white dark:bg-gray-800 text-blueberry dark:text-citrus"
                          />
                        </div>

                        {/* Company Name */}
                        <div>
                          <Label htmlFor="companyName" className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                            Company Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="text"
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g., Tech Corp Inc."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zapier-orange focus:border-transparent bg-white dark:bg-gray-800 text-blueberry dark:text-citrus"
                          />
                        </div>

                        {/* Job Description Input */}
                        <div>
                          <Label htmlFor="jobDescription" className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                            Job Description
                          </Label>
                          <JobDescriptionInput
                            onJobDescriptionSet={handleJobDescriptionUpload}
                            uploadedFile={jobDescriptionFile}
                          />
                        </div>

                        {/* CV Upload */}
                        <div>
                          <Label htmlFor="cv" className="block text-sm font-medium text-blueberry dark:text-citrus mb-1">
                            Your CV
                          </Label>
                          <JobDescriptionInput
                            onJobDescriptionSet={handleCVUpload}
                            uploadedFile={cvFile}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Analysis Selection */}
                  {preloadedAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-blueberry dark:text-citrus flex items-center">
                          <History className="h-5 w-5 text-zapier-orange mr-2" />
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

                  {/* Advanced Generation Options */}
                  <AdvancedGenerationOptions
                    tone={tone}
                    setTone={setTone}
                    length={length}
                    setLength={setLength}
                    workExperienceHighlights={workExperienceHighlights}
                    setWorkExperienceHighlights={setWorkExperienceHighlights}
                    customHookOpener={customHookOpener}
                    setCustomHookOpener={setCustomHookOpener}
                    personalValues={personalValues}
                    setPersonalValues={setPersonalValues}
                    includeLinkedInUrl={includeLinkedInUrl}
                    setIncludeLinkedInUrl={setIncludeLinkedInUrl}
                  />

                  {/* Generate Button */}
                  <Button
                    onClick={preloadedAnalysis ? handleGenerateFromAnalysis : handleGenerateCoverLetter}
                    className="w-full bg-zapier-orange hover:bg-zapier-orange/90 text-white"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      'Generate Cover Letter'
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Current Result Tab */}
              <TabsContent value="result" className="mt-0">
                {coverLetter ? (
                  <div className="space-y-6">
                    {/* Download Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-blueberry dark:text-citrus flex items-center">
                          <Download className="h-5 w-5 text-zapier-orange mr-2" />
                          Download & Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                          <DownloadOptions coverLetter={coverLetter} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Editable Cover Letter */}
                    <EditableCoverLetter
                      coverLetter={coverLetter}
                      onUpdate={handleUpdateCoverLetter}
                    />
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Cover Letter Generated
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                        Generate your first cover letter using the Create tab to see it here.
                      </p>
                      <Button
                        onClick={() => setActiveTab('create')}
                        className="bg-zapier-orange hover:bg-zapier-orange/90 text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Create Cover Letter
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-blueberry dark:text-citrus flex items-center">
                      <History className="h-5 w-5 text-zapier-orange mr-2" />
                      Cover Letter History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zapier-orange"></div>
                      </div>
                    ) : coverLetterHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No cover letters generated yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {coverLetterHistory.map((letter) => (
                          <div
                            key={letter.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-zapier-orange/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <FileText className="h-5 w-5 text-zapier-orange" />
                                  <div>
                                    <h4 className="font-medium text-blueberry dark:text-citrus">
                                      {letter.job_title} at {letter.company_name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Created {new Date(letter.created_at).toLocaleDateString()}
                                      {letter.regeneration_count > 0 && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          Regenerated {letter.regeneration_count} time{letter.regeneration_count !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                                  {letter.content.substring(0, 150)}...
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewCoverLetter(letter)}
                                className="text-xs"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCoverLetter(letter.id)}
                                className="text-xs text-red-600 hover:text-red-700 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Credits Panel - Fixed Width */}
          <div>
            <CreditsPanel
              credits={credits}
              hasCreditsForAI={credits > 0}
            />
          </div>
        </div>
      </div>

      {/* No Analysis Modal */}
      <NoAnalysisModal
        isOpen={showNoAnalysisModal}
        onClose={() => setShowNoAnalysisModal(false)}
      />
    </div>
  );
};

const CoverLetter = () => {
  const { user } = useAuth();

  return user ? <AuthenticatedCoverLetter /> : <CoverLetterLoggedOut />;
};

export default CoverLetter;
