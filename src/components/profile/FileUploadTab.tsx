
import React, { useState } from 'react';
import { Upload, FileText, Briefcase, Check, X, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFile, extractTextFromFile, formatFileSize } from '@/utils/fileUtils';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

const FileUploadTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    cv?: UploadedFile;
    jobDescription?: UploadedFile;
  }>({});
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [showPreview, setShowPreview] = useState<string | null>(null);

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

  const handleJobDescriptionText = () => {
    if (!jobDescriptionText.trim()) {
      toast({ title: 'Error', description: 'Please enter job description text', variant: 'destructive' });
      return;
    }

    const textFile = new File([jobDescriptionText], 'job-description.txt', { type: 'text/plain' });
    const uploadedFile: UploadedFile = {
      file: textFile,
      extractedText: jobDescriptionText,
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

  const saveToDatabase = async () => {
    if (!uploadedFiles.cv || !uploadedFiles.jobDescription) {
      toast({ title: 'Error', description: 'Please upload both CV and job description', variant: 'destructive' });
      return;
    }

    try {
      setUploading(true);

      // Save CV
      const { error: cvError } = await supabase
        .from('uploads')
        .insert({
          user_id: user?.id,
          file_name: uploadedFiles.cv.file.name,
          file_type: uploadedFiles.cv.file.type,
          file_size: uploadedFiles.cv.file.size,
          upload_type: 'cv',
          extracted_text: uploadedFiles.cv.extractedText,
          job_title: jobTitle || null
        });

      if (cvError) throw cvError;

      // Save job description
      const { error: jobError } = await supabase
        .from('uploads')
        .insert({
          user_id: user?.id,
          file_name: uploadedFiles.jobDescription.file.name,
          file_type: uploadedFiles.jobDescription.file.type,
          file_size: uploadedFiles.jobDescription.file.size,
          upload_type: 'job_description',
          extracted_text: uploadedFiles.jobDescription.extractedText,
          job_title: jobTitle || null
        });

      if (jobError) throw jobError;

      toast({ title: 'Success', description: 'Files saved successfully! Ready for analysis.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save files', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const canAnalyze = uploadedFiles.cv && uploadedFiles.jobDescription;

  return (
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
              
              <div>
                <textarea
                  value={jobDescriptionText}
                  onChange={(e) => setJobDescriptionText(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleJobDescriptionText}
                  disabled={!jobDescriptionText.trim() || uploading}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Add Job Description
                </button>
              </div>
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
          onClick={saveToDatabase}
          disabled={!canAnalyze || uploading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            canAnalyze && !uploading
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Analyze Compatibility'
          )}
        </button>
        {!canAnalyze && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Please upload both CV and job description to proceed
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUploadTab;
