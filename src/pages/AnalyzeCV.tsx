
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, History, FileText } from 'lucide-react';
import CVSelector from '@/components/analyze/CVSelector';
import JobDescriptionInput from '@/components/analyze/JobDescriptionInput';
import AnalyzeButton from '@/components/analyze/AnalyzeButton';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import AnalysisListItem from '@/components/profile/analysis/AnalysisListItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalysisState } from '@/hooks/useAnalysisState';
import { useAnalysisExecution } from '@/hooks/analysis/useAnalysisExecution';
import EmbeddedAuth from '@/components/auth/EmbeddedAuth';
import ServiceExplanation from '@/components/common/ServiceExplanation';
import { UploadedFile } from '@/types/fileTypes';

const AnalyzeCV = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analyze');
  const [selectedCVFile, setSelectedCVFile] = useState<UploadedFile | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<UploadedFile | null>(null);
  
  const {
    analysisResult,
    setAnalysisResult
  } = useAnalysisState();

  const { executeAnalysis, isAnalyzing } = useAnalysisExecution();

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

  // Fetch analysis history
  const { data: analysisHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['analysis-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const credits = userCredits?.credits || 0;
  const hasCreditsForAI = credits > 0;

  const handleCVSelect = (uploadedFile: UploadedFile) => {
    setSelectedCVFile(uploadedFile);
  };

  const handleJobDescriptionSet = (uploadedFile: UploadedFile) => {
    setJobDescriptionFile(uploadedFile);
  };

  const handleAnalyze = async () => {
    if (!selectedCVFile || !jobDescriptionFile) return;
    
    const result = await executeAnalysis({
      selectedCVId: null,
      selectedFile: selectedCVFile,
      jobDescriptionFile: jobDescriptionFile,
      jobDescriptionText: jobDescriptionFile.extractedText,
      inputMethod: 'upload',
      jobDescription: jobDescriptionFile.extractedText
    });

    if (result) {
      setAnalysisResult(result);
      setActiveTab('results');
      refetchHistory();
    }
  };

  const handleViewAnalysis = (analysis: any) => {
    setAnalysisResult(analysis);
    setActiveTab('results');
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    try {
      const { error } = await supabase
        .from('analysis_results')
        .delete()
        .eq('id', analysisId);

      if (error) throw error;
      refetchHistory();
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  };

  const handleCreateCoverLetter = (analysis: any) => {
    // Navigate to cover letter page with analysis data
    navigate('/cover-letter', { 
      state: { 
        analysisId: analysis.id,
        jobTitle: analysis.job_title,
        companyName: analysis.company_name
      } 
    });
  };

  const handleInterviewPrep = (analysis: any) => {
    // Placeholder for interview prep functionality
    console.log('Interview prep for:', analysis);
  };

  if (!user) {
    const analysisExplanation = {
      title: '',
      subtitle: '',
      benefits: [
        'AI-powered compatibility scoring that shows how well your CV matches job requirements',
        'Detailed keyword analysis highlighting missing terms that could improve your chances',
        'Personalized recommendations to optimize your CV for Applicant Tracking Systems (ATS)'
      ],
      features: [
        'Upload your CV in PDF, Word, or text format for instant analysis',
        'Paste or upload job descriptions to compare against your experience',
        'Get actionable insights with specific suggestions for improvement'
      ]
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="mb-8">
            <div className="flex items-start">
              <Search className="h-12 w-12 text-zapier-orange mr-6 mt-0" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-earth dark:text-white mb-4">
                  Analyze Your CV
                </h1>
                <p className="text-xl text-earth/70 dark:text-white/70 max-w-3xl font-normal">
                  Get AI-powered insights on how well your CV matches job requirements and discover optimization opportunities.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px] mt-12">
            <div className="flex items-start">
              <ServiceExplanation
                title={analysisExplanation.title}
                subtitle={analysisExplanation.subtitle}
                benefits={analysisExplanation.benefits}
                features={analysisExplanation.features}
                icon={<Search className="h-8 w-8 text-zapier-orange" />}
                compact={true}
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <EmbeddedAuth
                    title="Login to Get Started"
                    description="CV analysis requires an account to ensure personalized results and save your analysis history."
                    icon={<Search className="h-6 w-6 text-zapier-orange mr-2" />}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-[80%] mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-earth dark:text-white mb-4">
            Analyze Your CV
          </h1>
          <p className="text-xl text-earth/70 dark:text-white/70">
            Get AI-powered insights and optimize your CV for better job matches
          </p>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="analyze" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Analyze New</span>
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center space-x-2" disabled={!analysisResult}>
                  <FileText className="h-4 w-4" />
                  <span>Current Result</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analyze" className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <CVSelector
                    onCVSelect={handleCVSelect}
                    selectedCV={selectedCVFile}
                    uploading={isAnalyzing}
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <JobDescriptionInput
                    onJobDescriptionSet={handleJobDescriptionSet}
                    uploadedFile={jobDescriptionFile}
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="flex justify-center">
                  <AnalyzeButton
                    onAnalyze={handleAnalyze}
                    canAnalyze={!!selectedCVFile && !!jobDescriptionFile && hasCreditsForAI}
                    analyzing={isAnalyzing}
                    hasCreditsForAI={hasCreditsForAI}
                  />
                </div>
              </TabsContent>

              <TabsContent value="results">
                {analysisResult && (
                  <AnalysisResults analysisResult={analysisResult} />
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {analysisHistory && analysisHistory.length > 0 ? (
                  analysisHistory.map((analysis) => (
                    <AnalysisListItem
                      key={analysis.id}
                      analysis={analysis}
                      onViewDetails={handleViewAnalysis}
                      onDelete={handleDeleteAnalysis}
                      onCreateCoverLetter={handleCreateCoverLetter}
                      onInterviewPrep={handleInterviewPrep}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No analysis history found. Start by analyzing your first CV!
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Credits Panel */}
          <div className="w-[220px]">
            <CreditsPanel credits={credits} hasCreditsForAI={hasCreditsForAI} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeCV;
