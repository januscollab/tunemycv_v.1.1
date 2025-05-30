
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import JobDescriptionTextInput from './JobDescriptionTextInput';

interface UploadedFile {
  file: File;
  extractedText: string;
  type: 'cv' | 'job_description';
}

interface JobDescriptionUploadProps {
  uploadedFile?: UploadedFile;
  onFileUpload: (file: File) => void;
  onTextSubmit: (text: string) => void;
  onRemoveFile: () => void;
  uploading: boolean;
}

const JobDescriptionUpload: React.FC<JobDescriptionUploadProps> = ({
  uploadedFile,
  onFileUpload,
  onTextSubmit,
  onRemoveFile,
  uploading
}) => {
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-4">Job Description</h3>
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">Upload a file (PDF, DOCX, TXT) or paste the text directly</p>
      
      <div className="space-y-4">
        {!uploadedFile ? (
          <>
            <div className="border-2 border-dashed border-apple-core/30 dark:border-citrus/30 rounded-lg p-6 text-center">
              <label className="cursor-pointer">
                <span className="text-apricot hover:text-apricot/80 font-medium">Click to upload</span>
                <span className="text-blueberry/70 dark:text-apple-core/70"> or drag and drop your job description file</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            </div>
            
            <div className="text-center text-blueberry/60 dark:text-apple-core/60">or</div>
            
            <JobDescriptionTextInput onSubmit={onTextSubmit} disabled={uploading} />
          </>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">{uploadedFile.file.name}</p>
                <p className="text-sm text-green-700">Job description ready</p>
              </div>
            </div>
            <button
              onClick={onRemoveFile}
              className="p-2 text-red-600 hover:bg-red-100 rounded-md"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDescriptionUpload;
