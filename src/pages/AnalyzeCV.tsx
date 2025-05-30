
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
import { extractJobTitleFromText } from '@/utils/analysisUtils';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import JobTitleSection from '@/components/analyze/JobTitleSection';
import JobDescriptionSection from '@/components/analyze/JobDescriptionSection';
import CVUploadSection from '@/components/analyze/CVUploadSection';
import CreditsPanel from '@/components/analyze/CreditsPanel';
import AnalyzeButton from '@/components/analyze/AnalyzeButton';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

const AnalyzeCV = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    cv?: UploadedFile;
    jobDescription?: UploadedFile;
  }>({});
  const [jobTitle, setJobTitle] = useState('');

  const { analyzing, analysisResult, setAnalysisResult, performAnalysis } = useAnalysis();

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

  const jobDescTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const handleCVSelect = (uploadedFile: UploadedFile) => {
    setUploadedFiles(prev => ({
      ...prev,
      cv: uploadedFile
    }));
  };

  const handleFileUpload = async (file: File, type: 'job_description') => {
    const errors = validateFile(file, jobDescTypes, maxSize);
    
    if (errors.length > 0) {
      toast({ title: 'Upload Error', description: errors.join('. '), variant: 'destructive' });
      return;
    }

    try {
      setUploading(true);
      const extractedText = await extractTextFromFile(file);
      
      const uploadedFile: UploadedFile = {
        file,
        extractedText,
        type
      };

      setUploadedFiles(prev => ({
        ...prev,
        jobDescription: uploadedFile
      }));

      // Auto-extract job title from job description
      if (!jobTitle) {
        const extractedJobTitle = extractJobTitleFromText(extractedText);
        setJobTitle(extractedJobTitle);
      }

      toast({ title: 'Success', description: 'Job description uploaded successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process file', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleJobDescriptionText = (text: string) => {
    if (!text.trim()) {
      toast({ title: 'Error', description: 'Please enter job description text', variant: 'destructive' });
      return;
    }

    const textFile = new File([text], 'job-description.txt', { type: 'text/plain' });
    const uploadedFile: UploadedFile = {
      file: textFile,
      extractedText: text,
      type: 'job_description'
    };

    setUploadedFiles(prev => ({
      ...prev,
      jobDescription: uploadedFile
    }));

    // Auto-extract job title from job description
    if (!jobTitle) {
      const extractedJobTitle = extractJobTitleFromText(text);
      setJobTitle(extractedJobTitle);
    }

    toast({ title: 'Success', description: 'Job description added successfully!' });
  };

  const removeFile = (type: 'cv' | 'jobDescription') => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };

  const handleAnalysis = () => {
    performAnalysis(uploadedFiles, jobTitle, true, userCredits);
  };

  const canAnalyze = uploadedFiles.cv && uploadedFiles.jobDescription;
  const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

  if (analysisResult) {
    return <AnalysisResults result={analysisResult} onStartNew={() => setAnalysisResult(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Analysis Section */}
        <div className="lg:col-span-3">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4">Analyze Your CV</h1>
            <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-2xl mx-auto">
              Upload your CV and job description to get instant compatibility analysis with actionable recommendations.
            </p>
          </div>

          <div className="space-y-6">
            <JobTitleSection jobTitle={jobTitle} setJobTitle={setJobTitle} />
            <CVUploadSection
              onCVSelect={handleCVSelect}
              selectedCV={uploadedFiles.cv}
              uploading={uploading}
            />
            <JobDescriptionSection
              uploadedFiles={uploadedFiles}
              uploading={uploading}
              handleFileUpload={handleFileUpload}
              handleJobDescriptionText={handleJobDescriptionText}
              removeFile={removeFile}
            />
            <AnalyzeButton
              onAnalyze={handleAnalysis}
              canAnalyze={!!canAnalyze}
              analyzing={analyzing}
              useAI={true}
              hasCreditsForAI={hasCreditsForAI}
            />
          </div>
        </div>

        {/* Credits Panel */}
        <div className="lg:col-span-1">
          <CreditsPanel
            credits={userCredits?.credits || 0}
            useAI={true}
            setUseAI={() => {}}
            hasCreditsForAI={hasCreditsForAI}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyzeCV;
