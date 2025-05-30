
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
import { extractJobTitleFromText } from '@/utils/analysisUtils';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import FileUploadSection from '@/components/analyze/FileUploadSection';
import JobDescriptionTextInput from '@/components/analyze/JobDescriptionTextInput';
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
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(true);

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

  const cvTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const jobDescTypes = [...cvTypes, 'text/plain'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const handleFileUpload = async (file: File, type: 'cv' | 'job_description') => {
    const allowedTypes = type === 'cv' ? cvTypes : jobDescTypes;
    const errors = validateFile(file, allowedTypes, maxSize);
    
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
        [type === 'cv' ? 'cv' : 'jobDescription']: uploadedFile
      }));

      // Auto-extract job title from job description
      if (type === 'job_description' && !jobTitle) {
        const extractedJobTitle = extractJobTitleFromText(extractedText);
        setJobTitle(extractedJobTitle);
      }

      toast({ title: 'Success', description: `${type === 'cv' ? 'CV' : 'Job description'} uploaded successfully!` });
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

  const togglePreview = (type: 'cv' | 'job_description') => {
    const previewKey = type === 'cv' ? 'cv' : 'jobDescription';
    setShowPreview(showPreview === previewKey ? null : previewKey);
  };

  const handleAnalysis = () => {
    performAnalysis(uploadedFiles, jobTitle, useAI, userCredits);
  };

  const canAnalyze = uploadedFiles.cv && uploadedFiles.jobDescription;
  const hasCreditsForAI = userCredits?.credits && userCredits.credits > 0;

  if (analysisResult) {
    return <AnalysisResults result={analysisResult} onStartNew={() => setAnalysisResult(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Analysis Section */}
        <div className="lg:col-span-3">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Analyze Your CV</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your CV and job description to get instant compatibility analysis with actionable recommendations.
            </p>
          </div>

          <div className="space-y-6">
            {/* Job Title */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Title</h3>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer (auto-extracted from job description)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Job title will be automatically extracted from the job description if not provided.
              </p>
            </div>

            {/* CV Upload */}
            <FileUploadSection
              type="cv"
              uploadedFile={uploadedFiles.cv}
              onFileUpload={handleFileUpload}
              onRemoveFile={() => removeFile('cv')}
              onTogglePreview={() => togglePreview('cv')}
              showPreview={showPreview === 'cv'}
              uploading={uploading}
            />

            {/* Job Description Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
              <p className="text-sm text-gray-600 mb-4">Upload a file (PDF, DOCX, TXT) or paste the text directly</p>
              
              <div className="space-y-4">
                {!uploadedFiles.jobDescription ? (
                  <>
                    <FileUploadSection
                      type="job_description"
                      uploadedFile={uploadedFiles.jobDescription}
                      onFileUpload={handleFileUpload}
                      onRemoveFile={() => removeFile('jobDescription')}
                      onTogglePreview={() => togglePreview('job_description')}
                      showPreview={showPreview === 'jobDescription'}
                      uploading={uploading}
                    />
                    
                    <div className="text-center text-gray-500">or</div>
                    
                    <JobDescriptionTextInput onSubmit={handleJobDescriptionText} disabled={uploading} />
                  </>
                ) : (
                  <FileUploadSection
                    type="job_description"
                    uploadedFile={uploadedFiles.jobDescription}
                    onFileUpload={handleFileUpload}
                    onRemoveFile={() => removeFile('jobDescription')}
                    onTogglePreview={() => togglePreview('job_description')}
                    showPreview={showPreview === 'jobDescription'}
                    uploading={uploading}
                  />
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <AnalyzeButton
              onAnalyze={handleAnalysis}
              canAnalyze={!!canAnalyze}
              analyzing={analyzing}
              useAI={useAI}
              hasCreditsForAI={hasCreditsForAI}
            />
          </div>
        </div>

        {/* Credits and Analysis Type Panel */}
        <div className="lg:col-span-1">
          <CreditsPanel
            credits={userCredits?.credits || 0}
            useAI={useAI}
            setUseAI={setUseAI}
            hasCreditsForAI={hasCreditsForAI}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyzeCV;
