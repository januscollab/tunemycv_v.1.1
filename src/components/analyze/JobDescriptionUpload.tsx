
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { DragDropZone } from '@/components/ui/drag-drop-zone';
import { validateFile, extractTextFromFile } from '@/utils/fileUtils';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types/fileTypes';
import JobDescriptionTextInput from './JobDescriptionTextInput';

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
      <DragDropZone
        onDrop={(files) => handleFileUpload(files[0])}
        accept=".pdf,.docx,.txt"
        maxSize={maxSize}
        disabled={uploading || disabled}
        placeholder={uploading ? "Processing file..." : "Upload Job Description"}
        description="PDF, DOCX, TXT • Max 5MB"
        className="border-apple-core/30 dark:border-citrus/30"
      />
      
      <div className="text-center text-blueberry/60 dark:text-apple-core/60">or</div>
      
      <JobDescriptionTextInput onSubmit={handleJobDescriptionText} disabled={uploading || disabled} />
    </div>
  );
};

export default JobDescriptionUpload;
