
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useUploadOrchestrator } from '@/hooks/useUploadOrchestrator';
import { useWelcomeCredits } from '@/hooks/useWelcomeCredits';
import { useCoverLetter } from '@/hooks/useCoverLetter';
import { useProfileData } from '@/hooks/useProfileData';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import FileUploadSection from '@/components/analyze/FileUploadSection';
import AnalyzeButton from '@/components/analyze/AnalyzeButton';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import CoverLetter from '@/pages/CoverLetter';
import InterviewPrep from '@/pages/InterviewPrep';
import EnhancedSecurityHeaders from '@/components/security/EnhancedSecurityHeaders';

const AnalyzeCV: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get state from navigation
  const locationState = location.state as any;
  const analysisFromState = locationState?.analysis;
  const targetTab = locationState?.targetTab || 'analyze';
  const preferPdfView = locationState?.preferPdfView || false;

  // Initialize active tab based on navigation state
  const [activeTab, setActiveTab] = useState(targetTab);
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<{ cv?: any; jobDescription?: any }>({});
  const [jobTitle, setJobTitle] = useState('');
  
  const { 
    analyzing, 
    analysisResult, 
    setAnalysisResult, 
    performAnalysis 
  } = useAnalysis();
  
  const { isProcessing, progress, processFile, cancel, reset } = useUploadOrchestrator();
  const { showWelcomeModal, closeWelcomeModal } = useWelcomeCredits();
  const { getUserDisplayName } = useProfileData();

  // Mock credits data - replace with actual hook when available
  const userCredits = { credits: 10 };
  const refreshCredits = () => {
    // Implement credit refresh logic
  };

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'cv' | 'job_description') => {
    try {
      const result = await processFile(file, { fileType: type });
      if (result.success) {
        setUploadedFiles(prev => ({
          ...prev,
          [type]: {
            file: result.file,
            extractedText: result.extractedText,
            type
          }
        }));
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle file deletion
  const handleDeleteFile = (type: 'cv' | 'job_description') => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };

  // Reset files
  const resetFiles = () => {
    setUploadedFiles({});
    reset();
  };

  // Handle analysis from navigation state
  useEffect(() => {
    if (analysisFromState && targetTab === 'view-analysis') {
      setAnalysisResult(analysisFromState);
      setActiveTab('view-analysis');
    }
  }, [analysisFromState, targetTab, setAnalysisResult]);

  // Clear location state when component unmounts or when starting new analysis
  useEffect(() => {
    return () => {
      if (location.state) {
        navigate('/analyze', { replace: true, state: null });
      }
    };
  }, []);

  const handleStartNewAnalysis = () => {
    setAnalysisResult(null);
    resetFiles();
    setJobTitle('');
    setActiveTab('analyze');
    // Clear any navigation state
    navigate('/analyze', { replace: true, state: null });
    refreshCredits();
  };

  const handleAnalyze = async () => {
    if (!user) {
      toast({ 
        title: 'Authentication Required', 
        description: 'Please log in to analyze your CV',
        variant: 'destructive' 
      });
      return;
    }

    if (!uploadedFiles.cv || !uploadedFiles.jobDescription) {
      toast({ 
        title: 'Missing Files', 
        description: 'Please upload both CV and job description',
        variant: 'destructive' 
      });
      return;
    }

    if (!userCredits || userCredits.credits <= 0) {
      toast({ 
        title: 'No Credits', 
        description: 'You need credits to perform analysis',
        variant: 'destructive' 
      });
      return;
    }

    try {
      await performAnalysis(
        uploadedFiles,
        jobTitle,
        false, // useComprehensive
        userCredits,
        {
          saveCV: true,
          saveJobDescription: true,
          cvSource: 'new'
        }
      );
      
      setActiveTab('results');
      refreshCredits();
    } catch (error) {
      console.error('Analysis failed:', error);
      // Error handling is done in the performAnalysis function
    }
  };

  return (
    <>
      <EnhancedSecurityHeaders />
      <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blueberry dark:text-citrus mb-4">
              CV Analysis Suite
            </h1>
            <p className="text-lg text-blueberry/80 dark:text-apple-core/80 max-w-2xl mx-auto">
              Analyze your CV against job descriptions, generate cover letters, and prepare for interviews
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="analyze">Analyze CV</TabsTrigger>
              <TabsTrigger value="results" disabled={!analysisResult}>
                View Results
              </TabsTrigger>
              <TabsTrigger value="view-analysis" disabled={!analysisResult}>
                View Analysis
              </TabsTrigger>
              <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
              <TabsTrigger value="interview-prep">Interview Prep</TabsTrigger>
            </TabsList>

            {/* Main Analysis Tab */}
            <TabsContent value="analyze">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Documents</CardTitle>
                      <CardDescription>
                        Upload your CV and the job description you're applying for
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <FileUploadSection
                          type="cv"
                          uploadedFile={uploadedFiles.cv}
                          onFileUpload={handleFileUpload}
                          onRemoveFile={handleDeleteFile}
                          onTogglePreview={() => {}}
                          showPreview={false}
                          uploading={isProcessing}
                        />
                        
                        <FileUploadSection
                          type="job_description"
                          uploadedFile={uploadedFiles.jobDescription}
                          onFileUpload={handleFileUpload}
                          onRemoveFile={handleDeleteFile}
                          onTogglePreview={() => {}}
                          showPreview={false}
                          uploading={isProcessing}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Job Title (Optional)</label>
                          <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g., Software Engineer"
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <AnalyzeButton
                        analyzing={analyzing}
                        canAnalyze={Boolean(uploadedFiles.cv && uploadedFiles.jobDescription)}
                        hasCreditsForAI={Boolean(userCredits && userCredits.credits > 0)}
                        onAnalyze={handleAnalyze}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <CreditsPanel 
                    credits={userCredits.credits}
                    hasCreditsForAI={Boolean(userCredits && userCredits.credits > 0)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Analysis Results Tab */}
            <TabsContent value="results">
              {analysisResult ? (
                <AnalysisResults
                  result={analysisResult}
                  onStartNew={handleStartNewAnalysis}
                  readOnly={false}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">
                      No analysis results available. Please analyze a CV first.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* View Analysis Tab - for viewing saved analyses */}
            <TabsContent value="view-analysis">
              {analysisResult ? (
                <AnalysisResults
                  result={analysisResult}
                  onStartNew={handleStartNewAnalysis}
                  readOnly={true}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">
                      No analysis available to view.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Cover Letter Tab */}
            <TabsContent value="cover-letter">
              <CoverLetter />
            </TabsContent>

            {/* Interview Prep Tab */}
            <TabsContent value="interview-prep">
              <InterviewPrep />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AnalyzeCV;
