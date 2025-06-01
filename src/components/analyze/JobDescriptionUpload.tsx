
import React, { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
import { useToast } from '@/hooks/use-toast';
import JobDescriptionTextInput from './JobDescriptionTextInput';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'job_description';
}

interface JobDescriptionUploadProps {
  onJobDescriptionSet: (file: UploadedFile) => void;
  uploadedFile?: UploadedFile;
  disabled?: boolean;
}

const JobDescriptionUpload: React.FC<JobDescriptionUploadProps> = ({
  onJobDescriptionSet,
  uploadedFile,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const jobDescTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const handleFileUpload = async (file: File) => {
    const errors = validateFile(file, jobDescTypes, maxSize);
    
    if (errors.length > 0) {
      toast({ title: 'Upload Error', description: errors.join('. '), variant: 'destructive' });
      return;
    }

    try {
      setUploading(true);
      const extractedText = await extractTextFromFile(file);
      
      const uploadedFileData: UploadedFile = {
        file,
        extractedText,
        type: 'job_description'
      };

      onJobDescriptionSet(uploadedFileData);
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
    const uploadedFileData: UploadedFile = {
      file: textFile,
      extractedText: text,
      type: 'job_description'
    };

    onJobDescriptionSet(uploadedFileData);
    toast({ title: 'Success', description: 'Job description added successfully!' });
  };

  const removeFile = () => {
    // Reset to empty state - parent should handle this
    onJobDescriptionSet(undefined as any);
  };

  if (uploadedFile) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">{uploadedFile.file.name}</p>
            <p className="text-sm text-green-700">Job description ready</p>
          </div>
        </div>
        <button
          onClick={removeFile}
          className="p-2 text-red-600 hover:bg-red-100 rounded-md"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File Upload Option */}
      <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center">
        <Upload className="mx-auto h-8 w-8 text-blueberry/60 dark:text-apple-core/60 mb-2" />
        <label className="cursor-pointer">
          <span className="text-apricot hover:text-apricot/80 font-medium">Upload Job Description</span>
          <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mt-1">PDF, DOCX, TXT - max 5MB</p>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            disabled={uploading || disabled}
          />
        </label>
        {uploading && (
          <div className="mt-2 text-sm text-blue-600">Processing file...</div>
        )}
      </div>
      
      <div className="text-center text-blueberry/60 dark:text-apple-core/60">or</div>
      
      <JobDescriptionTextInput onSubmit={handleJobDescriptionText} disabled={uploading || disabled} />
    </div>
  );
};

export default JobDescriptionUpload;
