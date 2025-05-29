
import React, { useState } from 'react';
import { Upload, FileText, Briefcase, Check, X, Eye, BarChart3, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile, formatFileSize } from '@/utils/fileUtils';
import AnalysisResults from '@/components/analysis/AnalysisResults';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

const AnalyzeCV = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    cv?: UploadedFile;
    jobDescription?: UploadedFile;
  }>({});
  const [jobTitle, setJobTitle] = useState('');
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

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

    toast({ title: 'Success', description: 'Job description added successfully!' });
  };

  const removeFile = (type: 'cv' | 'jobDescription') => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };

  const performAnalysis = async () => {
    if (!uploadedFiles.cv || !uploadedFiles.jobDescription) {
      toast({ title: 'Error', description: 'Please upload both CV and job description', variant: 'destructive' });
      return;
    }

    try {
      setAnalyzing(true);

      // Save files to database first
      const { data: cvUpload, error: cvError } = await supabase
        .from('uploads')
        .insert({
          user_id: user?.id,
          file_name: uploadedFiles.cv.file.name,
          file_type: uploadedFiles.cv.file.type,
          file_size: uploadedFiles.cv.file.size,
          upload_type: 'cv',
          extracted_text: uploadedFiles.cv.extractedText,
          job_title: jobTitle || null
        })
        .select()
        .single();

      if (cvError) throw cvError;

      const { data: jobUpload, error: jobError } = await supabase
        .from('uploads')
        .insert({
          user_id: user?.id,
          file_name: uploadedFiles.jobDescription.file.name,
          file_type: uploadedFiles.jobDescription.file.type,
          file_size: uploadedFiles.jobDescription.file.size,
          upload_type: 'job_description',
          extracted_text: uploadedFiles.jobDescription.extractedText,
          job_title: jobTitle || null
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Perform basic analysis
      const cvText = uploadedFiles.cv.extractedText.toLowerCase();
      const jobText = uploadedFiles.jobDescription.extractedText.toLowerCase();

      // Extract key terms from job description
      const jobWords = jobText.split(/\W+/).filter(word => word.length > 3);
      const keyTerms = [...new Set(jobWords)].slice(0, 20);

      // Find matching terms in CV
      const matchingTerms = keyTerms.filter(term => cvText.includes(term));
      const missingTerms = keyTerms.filter(term => !cvText.includes(term));

      // Calculate compatibility score
      const compatibilityScore = Math.round((matchingTerms.length / keyTerms.length) * 100);

      // Extract job title and company if not provided
      const extractedJobTitle = jobTitle || extractJobTitleFromText(uploadedFiles.jobDescription.extractedText);
      const extractedCompany = extractCompanyFromText(uploadedFiles.jobDescription.extractedText);

      // Generate analysis results
      const analysisData = {
        user_id: user?.id,
        cv_upload_id: cvUpload.id,
        job_description_upload_id: jobUpload.id,
        job_title: extractedJobTitle,
        company_name: extractedCompany,
        compatibility_score: compatibilityScore,
        keywords_found: matchingTerms.slice(0, 10),
        keywords_missing: missingTerms.slice(0, 10),
        strengths: generateStrengths(matchingTerms, compatibilityScore),
        weaknesses: generateWeaknesses(missingTerms, compatibilityScore),
        recommendations: generateRecommendations(missingTerms, compatibilityScore),
        executive_summary: generateExecutiveSummary(compatibilityScore, extractedJobTitle)
      };

      // Save analysis results
      const { data: analysisResult, error: analysisError } = await supabase
        .from('analysis_results')
        .insert(analysisData)
        .select()
        .single();

      if (analysisError) throw analysisError;

      setAnalysisResult(analysisResult);
      toast({ title: 'Success', description: 'Analysis completed successfully!' });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: 'Error', description: 'Failed to analyze CV', variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const extractJobTitleFromText = (text: string): string => {
    const lines = text.split('\n').filter(line => line.trim());
    for (const line of lines.slice(0, 10)) {
      if (line.toLowerCase().includes('position') || 
          line.toLowerCase().includes('role') || 
          line.toLowerCase().includes('job title')) {
        return line.trim();
      }
    }
    return lines[0]?.trim() || 'Position';
  };

  const extractCompanyFromText = (text: string): string => {
    const lines = text.split('\n').filter(line => line.trim());
    for (const line of lines.slice(0, 5)) {
      if (line.toLowerCase().includes('company') || 
          line.toLowerCase().includes('corporation') || 
          line.toLowerCase().includes('inc') ||
          line.toLowerCase().includes('ltd')) {
        return line.trim();
      }
    }
    return 'Company';
  };

  const generateStrengths = (matchingTerms: string[], score: number): string[] => {
    const strengths = [];
    if (score >= 70) strengths.push('Strong keyword alignment with job requirements');
    if (matchingTerms.length >= 5) strengths.push('Good technical skill coverage');
    if (score >= 60) strengths.push('Relevant experience highlighted');
    return strengths.slice(0, 3);
  };

  const generateWeaknesses = (missingTerms: string[], score: number): string[] => {
    const weaknesses = [];
    if (score < 50) weaknesses.push('Low keyword match with job requirements');
    if (missingTerms.length >= 10) weaknesses.push('Missing key technical skills');
    if (score < 30) weaknesses.push('Limited alignment with job description');
    return weaknesses.slice(0, 3);
  };

  const generateRecommendations = (missingTerms: string[], score: number): string[] => {
    const recommendations = [];
    if (score < 70) recommendations.push('Include more relevant keywords from the job description');
    if (missingTerms.length >= 5) recommendations.push(`Consider adding experience with: ${missingTerms.slice(0, 3).join(', ')}`);
    recommendations.push('Tailor your CV more specifically to this role');
    return recommendations.slice(0, 3);
  };

  const generateExecutiveSummary = (score: number, jobTitle: string): string => {
    if (score >= 70) {
      return `Your CV shows strong alignment with the ${jobTitle} position. You have good keyword coverage and relevant experience that matches the job requirements.`;
    } else if (score >= 40) {
      return `Your CV has moderate alignment with the ${jobTitle} position. There are areas for improvement to better match the job requirements.`;
    } else {
      return `Your CV currently has limited alignment with the ${jobTitle} position. Significant improvements are needed to match the job requirements.`;
    }
  };

  const canAnalyze = uploadedFiles.cv && uploadedFiles.jobDescription;

  if (analysisResult) {
    return <AnalysisResults result={analysisResult} onStartNew={() => setAnalysisResult(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Analyze Your CV</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your CV and job description to get instant compatibility analysis with actionable recommendations.
          </p>
        </div>

        <div className="space-y-6">
          {/* Job Title */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Title (Optional)</h3>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* CV Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Your CV</h3>
            <p className="text-sm text-gray-600 mb-4">Supported formats: PDF, DOCX (Max 5MB)</p>
            
            {!uploadedFiles.cv ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">Click to upload</span>
                  <span className="text-gray-600"> or drag and drop your CV</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cv')}
                    disabled={uploading}
                  />
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{uploadedFiles.cv.file.name}</p>
                    <p className="text-sm text-green-700">{formatFileSize(uploadedFiles.cv.file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPreview(showPreview === 'cv' ? null : 'cv')}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-md"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeFile('cv')}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Job Description Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
            <p className="text-sm text-gray-600 mb-4">Upload a file (PDF, DOCX, TXT) or paste the text directly</p>
            
            <div className="space-y-4">
              {!uploadedFiles.jobDescription ? (
                <>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">Click to upload</span>
                      <span className="text-gray-600"> job description file</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'job_description')}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  
                  <div className="text-center text-gray-500">or</div>
                  
                  <JobDescriptionTextInput onSubmit={handleJobDescriptionText} disabled={uploading} />
                </>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{uploadedFiles.jobDescription.file.name}</p>
                      <p className="text-sm text-green-700">{formatFileSize(uploadedFiles.jobDescription.file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowPreview(showPreview === 'jobDescription' ? null : 'jobDescription')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-md"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFile('jobDescription')}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preview: {showPreview === 'cv' ? 'CV' : 'Job Description'}
              </h3>
              <div className="bg-gray-50 rounded-md p-4 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {showPreview === 'cv' ? uploadedFiles.cv?.extractedText : uploadedFiles.jobDescription?.extractedText}
                </pre>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={performAnalysis}
              disabled={!canAnalyze || analyzing}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                canAnalyze && !analyzing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {analyzing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing CV...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analyze CV Compatibility</span>
                </div>
              )}
            </button>
            {!canAnalyze && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Please upload both CV and job description to proceed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Job Description Text Input Component
const JobDescriptionTextInput: React.FC<{ onSubmit: (text: string) => void; disabled: boolean }> = ({ onSubmit, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    onSubmit(text);
    setText('');
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the job description here..."
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || disabled}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        Add Job Description
      </button>
    </div>
  );
};

export default AnalyzeCV;
